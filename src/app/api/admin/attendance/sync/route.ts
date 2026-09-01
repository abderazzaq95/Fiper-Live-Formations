import { getDashboardIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

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

function participantResourceId(participant: JsonRecord) {
  const resourceName = text(participant.name);
  return resourceName.split("/").filter(Boolean).pop() ?? "";
}

async function participantEmail(participant: JsonRecord, token: string) {
  const personId = participantResourceId(participant);
  if (!personId) return "";
  const params = new URLSearchParams({ personFields: "emailAddresses" });
  params.append("sources", "READ_SOURCE_TYPE_PROFILE");
  params.append("sources", "READ_SOURCE_TYPE_CONTACT");
  params.append("sources", "READ_SOURCE_TYPE_OTHER_CONTACT");
  const response = await fetch(`https://people.googleapis.com/v1/people/${encodeURIComponent(personId)}?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  if (response.status === 404) return "";
  if (response.status === 401 || response.status === 403) throw new Error("Google People API email access is not authorized. Reconnect with contacts.readonly and userinfo.email scopes.");
  if (!response.ok) return "";
  const emails = Array.isArray(data.emailAddresses) ? data.emailAddresses : [];
  const value = emails.map((item: unknown) => text(record(item).value)).find(Boolean) ?? "";
  return normalizeEmail(value);
}

function findRegistrationByEmail(email: string, registrations: JsonRecord[], used: Set<string>) {
  const normalized = normalizeEmail(email);
  if (!normalized) return undefined;
  return registrations.find((registration) => {
    const id = text(registration.id);
    return Boolean(id) && !used.has(id) && normalizeEmail(text(registration.email)) === normalized;
  });
}
async function accessToken() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) throw new Error("Google Meet OAuth is not configured in Vercel.");

  const body = new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" });
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body, cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || typeof data.access_token !== "string") throw new Error("Google authorization failed. Please reconnect the Google account.");
  return data.access_token;
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
async function saveAttendance(supabase: Awaited<ReturnType<typeof createClient>>, registrationId: string, participant: JsonRecord) {
  const joinedAt = text(participant.earliestStartTime);
  if (!joinedAt) return false;
  const leftAt = text(participant.latestEndTime) || null;
  const joinedMs = Date.parse(joinedAt);
  const leftMs = leftAt ? Date.parse(leftAt) : Date.now();
  const durationSeconds = Number.isFinite(joinedMs) && Number.isFinite(leftMs) ? Math.max(0, Math.round((leftMs - joinedMs) / 1000)) : 0;
  const { data: existing, error: existingError } = await supabase.from("attendance_sessions").select("id,manually_overridden").eq("registration_id", registrationId).maybeSingle();
  if (existingError) throw existingError;
  if (existing?.manually_overridden) return false;

  const payload = { registration_id: registrationId, meet_participant_id: text(participant.name), joined_at: joinedAt, left_at: leftAt, duration_seconds: durationSeconds, match_method: "email" };
  if (existing?.id) {
    const { error } = await supabase.from("attendance_sessions").update(payload).eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("attendance_sessions").insert(payload);
    if (error) throw error;
  }
  return true;
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

    const token = await accessToken();
    let synced = 0;
    let conferences = 0;
    for (const [code, group] of groups) {
      const filter = encodeURIComponent(`space.meeting_code = "${code}"`);
      const conferenceData = await meetRequest(`conferenceRecords?pageSize=100&filter=${filter}`, token);
      const records = (Array.isArray(conferenceData.conferenceRecords) ? conferenceData.conferenceRecords : []).map(record).sort((a, b) => Date.parse(text(b.startTime)) - Date.parse(text(a.startTime)));
      const conference = records[0];
      if (!conference?.name) continue;
      conferences += 1;
      const participants = await listParticipants(text(conference.name), token);
      const used = new Set<string>();
      for (const participant of participants) {
        const email = await participantEmail(participant, token);
        const matched = findRegistrationByEmail(email, group, used);
        if (!matched) continue;
        const id = text(matched.id);
        used.add(id);
        if (await saveAttendance(supabase, id, participant)) synced += 1;
      }
    }

    return Response.json({ message: conferences ? `Meet synchronization completed: ${synced} participant record(s) updated.` : "No conference record was found yet. Start the Meet and try again after someone joins.", synced, conferences });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to synchronize Google Meet attendance.";
    return Response.json({ message }, { status: 502 });
  }
}