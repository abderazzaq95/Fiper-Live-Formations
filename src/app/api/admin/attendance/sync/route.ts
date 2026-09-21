import { getDashboardIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getStoredGoogleConfig } from "@/lib/integrations/google";

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" ? value as JsonRecord : {};
}

function first(value: unknown): JsonRecord | undefined {
  if (Array.isArray(value)) return value.find((item): item is JsonRecord => Boolean(item && typeof item === "object"));
  return value && typeof value === "object" ? value as JsonRecord : undefined;
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function meetingCode(value: string) {
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    if (!url.hostname.toLowerCase().endsWith("meet.google.com")) return "";
    return url.pathname.split("/").filter(Boolean)[0]?.toLowerCase() ?? "";
  } catch {
    return "";
  }
}

function normalizeEmail(value: string) {
  return value.trim().toLocaleLowerCase();
}


function participantDisplayName(participant: JsonRecord) {
  return text(participant.displayName) || text(record(participant.signedinUser).displayName) || text(record(participant.anonymousUser).displayName);
}

function participantResourceId(participant: JsonRecord) {
  const resourceName = text(participant.name);
  return resourceName.split("/").filter(Boolean).pop() ?? "";
}

async function participantEmail(participant: JsonRecord, token: string) {
  const signedInUser = record(participant.signedinUser);
  const directEmail = [
    text(participant.email),
    text(participant.emailAddress),
    text(signedInUser.email),
    text(signedInUser.emailAddress),
  ].map(normalizeEmail).find(Boolean);
  if (directEmail) return directEmail;

  const references = [text(signedInUser.user), participantResourceId(participant)]
    .map((value) => value.split("/").filter(Boolean).pop() ?? "")
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index);
  const params = new URLSearchParams({ personFields: "emailAddresses" });
  params.append("sources", "READ_SOURCE_TYPE_PROFILE");
  params.append("sources", "READ_SOURCE_TYPE_CONTACT");
  params.append("sources", "READ_SOURCE_TYPE_OTHER_CONTACT");
  for (const personId of references) {
    const response = await fetch(`https://people.googleapis.com/v1/people/${encodeURIComponent(personId)}?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) continue;
    const emails = Array.isArray(data.emailAddresses) ? data.emailAddresses : [];
    const value = emails.map((item: unknown) => text(record(item).value)).find(Boolean) ?? "";
    if (value) return normalizeEmail(value);
  }

  // Workspace participants expose a stable user ID in signedInUser.user.
  // Resolve it through the Admin SDK as a fallback when People API profile
  // data is hidden or unavailable.
  const workspaceUserId = text(signedInUser.user)
    .split("/")
    .filter(Boolean)
    .pop();
  if (workspaceUserId) {
    const response = await fetch(`https://admin.googleapis.com/admin/directory/v1/users/${encodeURIComponent(workspaceUserId)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    const value = text(record(data).primaryEmail);
    if (response.ok && value) return normalizeEmail(value);
  }

  return "";
}

function findRegistrationByEmail(email: string, registrations: JsonRecord[], used: Set<string>) {
  const normalized = normalizeEmail(email);
  if (!normalized) return undefined;
  return registrations.find((registration) => {
    const id = text(registration.id);
    return Boolean(id) && !used.has(id) && normalizeEmail(text(registration.email)) === normalized;
  });
}


async function accessToken(supabase: Awaited<ReturnType<typeof createClient>>) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Google Meet OAuth is not configured in Vercel.");

  // Prefer the latest dashboard connection. Keep the deployment-level token
  // only as a fallback for installations that have not connected in-app yet.
  const refreshTokens: string[] = [];
  try {
    const stored = await getStoredGoogleConfig(supabase);
    if (stored.state === "connected" && stored.config?.refreshToken && !refreshTokens.includes(stored.config.refreshToken)) {
      refreshTokens.push(stored.config.refreshToken);
    }
  } catch (error) {
    console.error("google_oauth_stored_config_read_failed", error);
  }
  const configuredToken = process.env.GOOGLE_REFRESH_TOKEN?.trim();
  if (configuredToken && !refreshTokens.includes(configuredToken)) refreshTokens.push(configuredToken);
  if (!refreshTokens.length) throw new Error("Google Meet OAuth is not configured in Vercel.");

  const failures: string[] = [];
  for (const refreshToken of refreshTokens) {
    const body = new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" });
    const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body, cache: "no-store" });
    const data = record(await response.json().catch(() => ({})));
    if (response.ok && typeof data.access_token === "string") return data.access_token;
    failures.push(`${response.status}:${text(data.error) || "unknown"}:${text(data.error_description) || "no_description"}`);
  }
  console.error("google_oauth_refresh_failed", failures.join(","));
  throw new Error("Google authorization failed. Please reconnect the Google account.");
}

async function meetRequest(path: string, token: string) {
  const response = await fetch(`https://meet.googleapis.com/v2/${path}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = text(record(data.error).message);
    throw new Error(detail ? `Google Meet: ${detail}` : "Google Meet API request failed.");
  }
  return record(data);
}

async function listParticipants(conferenceName: string, token: string) {
  const participants: JsonRecord[] = [];
  let pageToken = "";
  do {
    const params = new URLSearchParams({ pageSize: "100" });
    if (pageToken) params.set("pageToken", pageToken);
    const data = await meetRequest(`${conferenceName}/participants?${params.toString()}`, token);
    const rows = Array.isArray(data.participants) ? data.participants : [];
    participants.push(...rows.map(record));
    pageToken = text(data.nextPageToken);
  } while (pageToken);
  return participants;
}

async function latestParticipantVisit(participant: JsonRecord, token: string) {
  const resourceName = text(participant.name);
  if (!resourceName) return participant;
  const visits: JsonRecord[] = [];
  let pageToken = "";
  do {
    const params = new URLSearchParams({ pageSize: "100" });
    if (pageToken) params.set("pageToken", pageToken);
    const data = await meetRequest(`${resourceName}/participantSessions?${params.toString()}`, token);
    const rows = Array.isArray(data.participantSessions) ? data.participantSessions : [];
    visits.push(...rows.map(record));
    pageToken = text(data.nextPageToken);
  } while (pageToken);
  const latest = visits.sort((a, b) => Date.parse(text(b.startTime)) - Date.parse(text(a.startTime)))[0];
  if (!latest) return participant;
  return {
    ...participant,
    earliestStartTime: text(latest.startTime, text(participant.earliestStartTime)),
    latestEndTime: text(latest.endTime, text(participant.latestEndTime)),
  };
}
function reportParameter(event: JsonRecord, name: string) {
  const parameters = Array.isArray(event.parameters) ? event.parameters : [];
  const parameter = parameters.map(record).find((item) => text(item.name) === name);
  if (!parameter) return "";
  return text(parameter.value) || text(parameter.intValue) || text(parameter.boolValue);
}

async function listMeetAuditEvents(code: string, startsAt: string, endsAt: string | null, token: string) {
  const start = new Date(Date.parse(startsAt) - 6 * 60 * 60 * 1000);
  const endMs = endsAt ? Date.parse(endsAt) + 24 * 60 * 60 * 1000 : Date.now();
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(endMs)) return [];
  const events: JsonRecord[] = [];
  let pageToken = "";
  do {
    const params = new URLSearchParams({
      eventName: "call_ended",
      maxResults: "1000",
      startTime: start.toISOString(),
      endTime: new Date(Math.min(endMs, Date.now())).toISOString(),
      filters: `meeting_code==${code}`,
    });
    if (pageToken) params.set("pageToken", pageToken);
    const response = await fetch(
      `https://admin.googleapis.com/admin/reports/v1/activity/users/all/applications/meet?${params.toString()}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
    );
    if (!response.ok) return [];
    const data = record(await response.json().catch(() => ({})));
    const rows = Array.isArray(data.items) ? data.items : [];
    events.push(...rows.map(record));
    pageToken = text(data.nextPageToken);
  } while (pageToken);
  return events;
}

function reportParticipant(activity: JsonRecord) {
  const event = (Array.isArray(activity.events) ? activity.events : [])
    .map(record)
    .find((item) => text(item.name) === "call_ended");
  if (!event) return undefined;
  const identifier = normalizeEmail(reportParameter(event, "identifier"));
  const identifierType = text(reportParameter(event, "identifier_type"));
  const durationSeconds = Number(reportParameter(event, "duration_seconds"));
  const endSeconds = Number(text(record(activity.id).time));
  if (!Number.isFinite(endSeconds) || !Number.isFinite(durationSeconds)) return undefined;
  const leftAt = new Date(endSeconds * 1000).toISOString();
  const joinedAt = new Date((endSeconds - Math.max(0, durationSeconds)) * 1000).toISOString();
  return {
    name: `reports/${reportParameter(event, "endpoint_id") || endSeconds}`,
    displayName: reportParameter(event, "display_name"),
    email: identifierType === "email_address" ? identifier : "",
    earliestStartTime: joinedAt,
    latestEndTime: leftAt,
    durationSeconds: Math.max(0, Math.round(durationSeconds)),
  };
}

function normalizedName(value: string) {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

function reportMatchesParticipant(report: NonNullable<ReturnType<typeof reportParticipant>>, participant: JsonRecord) {
  const reportJoined = Date.parse(report.earliestStartTime);
  const reportLeft = Date.parse(report.latestEndTime);
  const joined = Date.parse(text(participant.earliestStartTime));
  const left = Date.parse(text(participant.latestEndTime));
  if (![reportJoined, reportLeft, joined, left].every(Number.isFinite)) return false;
  return Math.abs(reportJoined - joined) <= 3 * 60 * 1000 && Math.abs(reportLeft - left) <= 3 * 60 * 1000;
}

function participantIdentityKey(participant: JsonRecord, email: string, displayName: string) {
  if (email) return `email:${normalizeEmail(email)}`;
  const signedInUser = text(record(participant.signedinUser).user);
  if (signedInUser) return `user:${signedInUser}`;
  const name = normalizedName(displayName);
  if (name) return `name:${name}`;
  return `participant:${text(participant.name)}`;
}

function joinedTime(participant: JsonRecord) {
  const value = Date.parse(text(participant.earliestStartTime));
  return Number.isFinite(value) ? value : 0;
}
async function saveAttendance(
  supabase: Awaited<ReturnType<typeof createClient>>,
  registrationId: string | null,
  sessionId: string,
  participant: JsonRecord,
  matchMethod: "email" | "unregistered",
  participantName: string,
  participantEmail: string,
) {
  const joinedAt = text(participant.earliestStartTime);
  if (!joinedAt) return false;
  const leftAt = text(participant.latestEndTime) || null;
  const joinedMs = Date.parse(joinedAt);
  const leftMs = leftAt ? Date.parse(leftAt) : Date.now();
  const durationSeconds = Number.isFinite(joinedMs) && Number.isFinite(leftMs) ? Math.max(0, Math.round((leftMs - joinedMs) / 1000)) : 0;
  const existingQuery = supabase.from("attendance_sessions").select("id,manually_overridden").eq("session_id", sessionId).eq("meet_participant_id", text(participant.name));
  const { data: existing, error: existingError } = await existingQuery.maybeSingle();
  if (existingError) throw existingError;
  if (existing?.manually_overridden) return false;

  const payload = { registration_id: registrationId, session_id: sessionId || null, participant_name: participantName || null, participant_email: participantEmail || null, meet_participant_id: text(participant.name), joined_at: joinedAt, left_at: leftAt, duration_seconds: durationSeconds, match_method: matchMethod };
  if (existing?.id) {
    const { error } = await supabase.from("attendance_sessions").update(payload).eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("attendance_sessions").insert(payload);
    if (error) throw error;
  }
  return true;
}

async function removeObsoleteAttendance(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sessionId: string,
  activeParticipantIds: Set<string>,
) {
  if (!sessionId || !activeParticipantIds.size) return 0;
  const { data, error } = await supabase
    .from("attendance_sessions")
    .select("id,meet_participant_id,manually_overridden")
    .eq("session_id", sessionId);
  if (error) throw error;
  const staleIds = (data ?? [])
    .map(record)
    .filter((row) => !row.manually_overridden && !activeParticipantIds.has(text(row.meet_participant_id)))
    .map((row) => text(row.id))
    .filter(Boolean);
  if (!staleIds.length) return 0;
  const { error: deleteError } = await supabase.from("attendance_sessions").delete().in("id", staleIds);
  if (deleteError) throw deleteError;
  return staleIds.length;
}
export async function POST() {
  const identity = await getDashboardIdentity();
  if (!identity) return Response.json({ message: "Unauthorized" }, { status: 401 });
  if (identity.role !== "admin") return Response.json({ message: "Admin access required" }, { status: 403 });

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("registrations").select("id,full_name,email,session_id,course_sessions(id,meet_url,starts_at,ends_at)").order("registered_at", { ascending: false });
    if (error) throw error;
    const registrations = (data ?? []).map(record);
    const groups = new Map<string, JsonRecord[]>();
    for (const registration of registrations) {
      const session = first(registration.course_sessions);
      const code = meetingCode(text(session?.meet_url));
      if (!code) continue;
      const group = groups.get(code) ?? [];
      group.push({ ...registration, session });
      groups.set(code, group);
    }
    if (!groups.size) return Response.json({ message: "No saved Google Meet link was found for the registered courses.", synced: 0, conferences: 0 });

    const token = await accessToken(supabase);
    let synced = 0;
    let conferences = 0;
    for (const [code, group] of groups) {
      const filter = encodeURIComponent(`space.meeting_code = "${code}"`);
      const conferenceData = await meetRequest(`conferenceRecords?pageSize=100&filter=${filter}`, token);
      const records = (Array.isArray(conferenceData.conferenceRecords) ? conferenceData.conferenceRecords : []).map(record).sort((a, b) => Date.parse(text(b.startTime)) - Date.parse(text(a.startTime)));
      const conference = records[0];
      if (!conference?.name) continue;
      conferences += 1;
      const listedParticipants = await listParticipants(text(conference.name), token);
      const participants = await Promise.all(listedParticipants.map((participant) => latestParticipantVisit(participant, token)));
      const session = record(group[0]?.session);
      let auditReports: JsonRecord[] = [];
      try {
        auditReports = await listMeetAuditEvents(code, text(session.starts_at), text(session.ends_at) || null, token);
      } catch {
        auditReports = [];
      }
      const reports = auditReports
        .map(reportParticipant)
        .filter((report): report is NonNullable<ReturnType<typeof reportParticipant>> => Boolean(report));
      const usedReports = new Set<number>();
      const resolvedParticipants = await Promise.all(participants.map(async (participant) => {
        const reportIndex = reports.findIndex((report, index) => !usedReports.has(index) && Boolean(report.email) && reportMatchesParticipant(report, participant));
        if (reportIndex >= 0) usedReports.add(reportIndex);
        const report = reportIndex >= 0 ? reports[reportIndex] : undefined;
        const email = report?.email || await participantEmail(participant, token);
        const name = participantDisplayName(participant) || report?.displayName || "";
        return { participant, email, name };
      }));
      const uniqueParticipants = new Map<string, typeof resolvedParticipants[number]>();
      for (const resolved of resolvedParticipants) {
        const key = participantIdentityKey(resolved.participant, resolved.email, resolved.name);
        const existing = uniqueParticipants.get(key);
        if (!existing || joinedTime(resolved.participant) >= joinedTime(existing.participant)) uniqueParticipants.set(key, resolved);
      }

      const used = new Set<string>();
      const activeParticipantIds = new Set<string>();
      for (const { participant, email, name } of uniqueParticipants.values()) {
        activeParticipantIds.add(text(participant.name));
        const matched = findRegistrationByEmail(email, group, used);
        if (matched) {
          const id = text(matched.id);
          used.add(id);
          if (await saveAttendance(supabase, id, text(session.id), participant, "email", name, email)) synced += 1;
        } else if (await saveAttendance(supabase, null, text(session.id), participant, "unregistered", name, email)) {
          synced += 1;
        }
      }
      for (const [index, report] of reports.entries()) {
        if (usedReports.has(index) || !report.email) continue;
        activeParticipantIds.add(text(report.name));
        const matched = findRegistrationByEmail(report.email, group, used);
        if (matched) {
          const id = text(matched.id);
          used.add(id);
          if (await saveAttendance(supabase, id, text(session.id), report, "email", report.displayName, report.email)) synced += 1;
        } else if (await saveAttendance(supabase, null, text(session.id), report, "unregistered", report.displayName, report.email)) {
          synced += 1;
        }
      }
      await removeObsoleteAttendance(supabase, text(session.id), activeParticipantIds);
    }
    return Response.json({ message: conferences ? `Meet synchronization completed: ${synced} participant record(s) updated.` : "No conference record was found yet. Start the Meet and try again after someone joins.", synced, conferences });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to synchronize Google Meet attendance.";
    return Response.json({ message }, { status: 502 });
  }
}
