import { z } from "zod";
import { getDashboardIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type JsonRecord = Record<string, unknown>;
type Interval = [number, number];

const bodySchema = z.object({
  sessionId: z.string().trim().min(1).max(80),
  rows: z.array(z.object({
    email: z.string().max(200).optional().default(""),
    name: z.string().max(200).optional().default(""),
    start: z.string().max(60).optional().default(""),
    end: z.string().max(60).optional().default(""),
    seconds: z.number().finite().optional().default(0),
  })).min(1).max(5000),
});

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" ? value as JsonRecord : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: string) {
  return value.trim().toLocaleLowerCase();
}

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

function visitInterval(row: { start: string; end: string; seconds: number }): Interval | null {
  const end = Date.parse(row.end);
  if (!Number.isFinite(end)) return null;
  let start = Date.parse(row.start);
  if (!Number.isFinite(start)) start = end - Math.max(0, row.seconds) * 1000;
  return start <= end ? [start, end] : null;
}

function mergeIntervals(intervals: Interval[]) {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const merged: Interval[] = [];
  for (const [start, end] of sorted) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }
  return merged;
}

export async function POST(request: Request) {
  const identity = await getDashboardIdentity();
  if (!identity) return Response.json({ message: "Unauthorized" }, { status: 401 });
  if (identity.role !== "admin") return Response.json({ message: "Admin access required" }, { status: 403 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ message: "الملف غير صالح أو لا يحتوي على بيانات." }, { status: 422 });
  const { sessionId, rows } = parsed.data;

  try {
    const supabase = await createClient();
    const { data: session, error: sessionError } = await supabase.from("course_sessions").select("id").eq("id", sessionId).maybeSingle();
    if (sessionError || !session) return Response.json({ message: "الجلسة غير موجودة." }, { status: 404 });

    const { data: registrationData, error: registrationError } = await supabase.from("registrations").select("id,full_name,email").eq("session_id", sessionId).range(0, 4999);
    if (registrationError) throw registrationError;
    const registrations = (registrationData ?? []).map(record);

    // One person = one record: rows are grouped by email (or by name when there is no email).
    const people = new Map<string, { email: string; name: string; intervals: Interval[] }>();
    let skipped = 0;
    for (const row of rows) {
      const interval = visitInterval(row);
      if (!interval) { skipped += 1; continue; }
      const email = normalizeEmail(row.email);
      const name = row.name.trim();
      const key = email ? `email:${email}` : name ? `name:${normalizeName(name)}` : "";
      if (!key) { skipped += 1; continue; }
      const person = people.get(key) ?? { email, name, intervals: [] };
      person.intervals.push(interval);
      if (!person.name && name) person.name = name;
      people.set(key, person);
    }
    if (!people.size) return Response.json({ message: "لم يتم العثور على صفوف صالحة في الملف." }, { status: 422 });

    const usedRegistrations = new Set<string>();
    const payloads: JsonRecord[] = [];
    let matchedByEmail = 0;
    let matchedByName = 0;
    let unregistered = 0;
    for (const [key, person] of people) {
      const merged = mergeIntervals(person.intervals);
      const totalSeconds = Math.round(merged.reduce((sum, [start, end]) => sum + (end - start), 0) / 1000);
      let registrationId: string | null = null;
      let matchMethod: "email" | "name" | "unregistered" = "unregistered";
      if (person.email) {
        const found = registrations.find((registration) => !usedRegistrations.has(text(registration.id)) && normalizeEmail(text(registration.email)) === person.email);
        if (found) { registrationId = text(found.id); matchMethod = "email"; }
      }
      if (!registrationId && !person.email && person.name) {
        const candidates = registrations.filter((registration) => !usedRegistrations.has(text(registration.id)) && normalizeName(text(registration.full_name)) === normalizeName(person.name));
        if (candidates.length === 1) { registrationId = text(candidates[0].id); matchMethod = "name"; }
      }
      if (registrationId) usedRegistrations.add(registrationId);
      if (matchMethod === "email") matchedByEmail += 1; else if (matchMethod === "name") matchedByName += 1; else unregistered += 1;
      payloads.push({
        registration_id: registrationId,
        session_id: sessionId,
        participant_name: person.name || null,
        participant_email: person.email || null,
        meet_participant_id: `import:${key}`,
        joined_at: new Date(merged[0][0]).toISOString(),
        left_at: new Date(merged[merged.length - 1][1]).toISOString(),
        duration_seconds: totalSeconds,
        match_method: matchMethod,
      });
    }

    const { data: existingData, error: existingError } = await supabase.from("attendance_sessions").select("id,meet_participant_id,manually_overridden").eq("session_id", sessionId).range(0, 4999);
    if (existingError) throw existingError;
    const existing = (existingData ?? []).map(record);
    const existingById = new Map(existing.map((row) => [text(row.meet_participant_id), row]));

    const toInsert: JsonRecord[] = [];
    for (const payload of payloads) {
      const current = existingById.get(text(payload.meet_participant_id));
      if (!current) { toInsert.push(payload); continue; }
      if (current.manually_overridden) continue;
      const { error } = await supabase.from("attendance_sessions").update(payload).eq("id", text(current.id));
      if (error) throw error;
    }
    for (let index = 0; index < toInsert.length; index += 200) {
      const { error } = await supabase.from("attendance_sessions").insert(toInsert.slice(index, index + 200));
      if (error) throw error;
    }

    // The uploaded list is the source of truth for this session: older synced/imported rows that are not in it are archived (not deleted).
    const importedIds = new Set(payloads.map((payload) => text(payload.meet_participant_id)));
    const staleIds = existing.filter((row) => !row.manually_overridden && !importedIds.has(text(row.meet_participant_id))).map((row) => text(row.id)).filter(Boolean);
    if (staleIds.length) {
      const { error } = await supabase.from("attendance_sessions").update({ match_method: "obsolete" }).in("id", staleIds);
      if (error) throw error;
    }

    return Response.json({
      ok: true,
      people: payloads.length,
      matchedByEmail,
      matchedByName,
      unregistered,
      skipped,
      message: `تم استيراد ${payloads.length} مشارك: ${matchedByEmail} بالبريد، ${matchedByName} بالاسم، ${unregistered} غير مسجلين.`,
    });
  } catch (error) {
    console.error("attendance_import_failed", error);
    const details = record(error);
    return Response.json({ message: error instanceof Error ? error.message : text(details.message) || "تعذر استيراد القائمة." }, { status: 500 });
  }
}
