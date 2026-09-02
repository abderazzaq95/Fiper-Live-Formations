import "server-only";

import { createClient } from "@/lib/supabase/server";

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" ? value as JsonRecord : {};
}

function firstRecord(value: unknown): JsonRecord | undefined {
  if (Array.isArray(value)) return value.find((item): item is JsonRecord => Boolean(item && typeof item === "object"));
  return value && typeof value === "object" ? value as JsonRecord : undefined;
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatTime(value: string | null | undefined, timeZone: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone }).format(new Date(value));
}

function localDateKey(value: string | null | undefined, timeZone: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone }).format(new Date(value));
}

function formatCourseDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeZone: "Europe/Berlin" }).format(new Date(value));
}

export type AttendanceRow = {
  id: string;
  name: string;
  email: string;
  course: string;
  courseDate: string;
  status: "attended" | "absent" | "pending";
  joinedAt: string;
  joinedAtTurkey: string;
  leftAt: string;
  leftAtTurkey: string;
  durationMinutes: number;
  matchMethod: string;
};

export type AttendanceData = {
  rows: AttendanceRow[];
  attended: number;
  absent: number;
  pending: number;
  averageMinutes: number;
  lastSync: string;
};

export async function getDashboardAttendance(): Promise<AttendanceData> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("registrations")
      .select("id,full_name,email,status,course_sessions(starts_at,courses(default_locale,course_translations(locale,title))),attendance_sessions(id,joined_at,left_at,duration_seconds,match_method,created_at)")
      .order("registered_at", { ascending: false });
    if (error || !data) return { rows: [], attended: 0, absent: 0, pending: 0, averageMinutes: 0, lastSync: "—" };

    const rows: AttendanceRow[] = data.map((item) => {
      const row = asRecord(item);
      const attendanceRecords = Array.isArray(row.attendance_sessions) ? row.attendance_sessions.map(asRecord) : [];
      const session = firstRecord(row.course_sessions);
      const courseRecord = firstRecord(session?.courses);
      const startsAt = text(session?.starts_at);
      const courseAttendance = attendanceRecords
        .filter((item) => {
          const joinedAt = text(item.joined_at);
          return !joinedAt || !startsAt || localDateKey(joinedAt, "Europe/Berlin") === localDateKey(startsAt, "Europe/Berlin");
        })
        .sort((a, b) => text(b.joined_at).localeCompare(text(a.joined_at)))[0];
      const durationMinutes = Math.max(0, Math.round((Number(courseAttendance?.duration_seconds) || 0) / 60));
      const joinedAt = text(courseAttendance?.joined_at);
      const translations = Array.isArray(courseRecord?.course_translations) ? courseRecord.course_translations.map(asRecord) : [];
      const courseTranslation = translations.find((item) => text(item.locale) === text(courseRecord?.default_locale, "ar")) ?? translations[0];
      const course = text(courseTranslation?.title, text(courseRecord?.id, "—"));
      const isPending = !joinedAt && durationMinutes === 0 && Boolean(startsAt) && new Date(startsAt).getTime() > Date.now();
      return {
        id: text(row.id), name: text(row.full_name, "—"), email: text(row.email, "—"), course, courseDate: formatCourseDate(startsAt),
        status: joinedAt || durationMinutes > 0 ? "attended" : isPending ? "pending" : "absent",
        joinedAt: formatTime(joinedAt, "Europe/Berlin"), joinedAtTurkey: formatTime(joinedAt, "Europe/Istanbul"),
        leftAt: formatTime(text(courseAttendance?.left_at), "Europe/Berlin"), leftAtTurkey: formatTime(text(courseAttendance?.left_at), "Europe/Istanbul"),
        durationMinutes, matchMethod: text(courseAttendance?.match_method, "pending"),
      } satisfies AttendanceRow;
    });

    const { data: unmatched } = await supabase
      .from("attendance_sessions")
      .select("id,participant_name,participant_email,joined_at,left_at,duration_seconds,match_method,course_sessions(starts_at,courses(default_locale,course_translations(locale,title)))")
      .is("registration_id", null)
      .order("created_at", { ascending: false });
    for (const item of unmatched ?? []) {
      const row = asRecord(item);
      const session = firstRecord(row.course_sessions);
      const courseRecord = firstRecord(session?.courses);
      const translations = Array.isArray(courseRecord?.course_translations) ? courseRecord.course_translations.map(asRecord) : [];
      const courseTranslation = translations.find((translation) => text(translation.locale) === text(courseRecord?.default_locale, "ar")) ?? translations[0];
      const joinedAt = text(row.joined_at);
      const startsAt = text(session?.starts_at);
      if (joinedAt && startsAt && localDateKey(joinedAt, "Europe/Berlin") !== localDateKey(startsAt, "Europe/Berlin")) continue;
      const durationMinutes = Math.max(0, Math.round((Number(row.duration_seconds) || 0) / 60));
      rows.push({
        id: text(row.id), name: text(row.participant_name, "غير مسجل"), email: text(row.participant_email, "غير معروف"),
        course: text(courseTranslation?.title, "—"), courseDate: formatCourseDate(startsAt), status: joinedAt || durationMinutes > 0 ? "attended" : "absent",
        joinedAt: formatTime(joinedAt, "Europe/Berlin"), joinedAtTurkey: formatTime(joinedAt, "Europe/Istanbul"),
        leftAt: formatTime(text(row.left_at), "Europe/Berlin"), leftAtTurkey: formatTime(text(row.left_at), "Europe/Istanbul"),
        durationMinutes, matchMethod: "unregistered",
      });
    }

    const attended = rows.filter((row) => row.status === "attended").length;
    const durations = rows.filter((row) => row.durationMinutes > 0).map((row) => row.durationMinutes);
    const pending = rows.filter((row) => row.status === "pending").length;
    const { data: latest } = await supabase.from("attendance_sessions").select("created_at").order("created_at", { ascending: false }).limit(1).maybeSingle();
    return { rows, attended, absent: rows.filter((row) => row.status === "absent").length, pending, averageMinutes: durations.length ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length) : 0, lastSync: latest?.created_at ? formatDateTime(latest.created_at) : "not synced yet" };
  } catch {
    return { rows: [], attended: 0, absent: 0, pending: 0, averageMinutes: 0, lastSync: "—" };
  }
}
export type DeliveryRow = {
  id: string;
  channel: "email" | "whatsapp";
  template: string;
  provider: string;
  state: string;
  recipient: string;
  time: string;
  failureReason: string;
};

export type DeliveryData = {
  rows: DeliveryRow[];
  emailTotal: number;
  whatsappTotal: number;
  failed: number;
  delivered: number;
};

export async function getDashboardDeliveries(): Promise<DeliveryData> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("message_deliveries")
      .select("id,channel,template_key,provider,state,failure_reason,created_at,registrations(full_name,email)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error || !data) return { rows: [], emailTotal: 0, whatsappTotal: 0, failed: 0, delivered: 0 };
    const rows = data.map((item) => {
      const row = asRecord(item);
      const registration = firstRecord(row.registrations);
      return {
        id: text(row.id),
        channel: text(row.channel) === "whatsapp" ? "whatsapp" : "email",
        template: text(row.template_key, "—"),
        provider: text(row.provider, "—"),
        state: text(row.state, "queued"),
        recipient: text(registration?.full_name, text(registration?.email, "—")),
        time: formatDateTime(text(row.created_at)),
        failureReason: text(row.failure_reason),
      } satisfies DeliveryRow;
    });
    return {
      rows,
      emailTotal: rows.filter((row) => row.channel === "email").length,
      whatsappTotal: rows.filter((row) => row.channel === "whatsapp").length,
      failed: rows.filter((row) => row.state === "failed").length,
      delivered: rows.filter((row) => ["delivered", "read"].includes(row.state)).length,
    };
  } catch {
    return { rows: [], emailTotal: 0, whatsappTotal: 0, failed: 0, delivered: 0 };
  }
}

export type ReportData = {
  total: number;
  confirmed: number;
  attended: number;
  attendanceRate: number;
  sources: Array<{ name: string; value: number; count: number; color: string }>;
};

export async function getDashboardReport(): Promise<ReportData> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("registrations").select("status,source,attendance_sessions(joined_at,duration_seconds)");
    if (error || !data) return { total: 0, confirmed: 0, attended: 0, attendanceRate: 0, sources: [] };
    const rows = data.map(asRecord);
    const total = rows.length;
    const confirmed = rows.filter((row) => ["confirmed", "attended"].includes(text(row.status))).length;
    const attended = rows.filter((row) => {
      const session = firstRecord(row.attendance_sessions);
      return Boolean(session?.joined_at) || Number(session?.duration_seconds) > 0;
    }).length;
    const sourceCounts = new Map<string, number>();
    rows.forEach((row) => {
      const source = text(row.source, "direct");
      sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1);
    });
    const colors = ["bg-[#C32828]", "bg-[#168a65]", "bg-[#1779b5]", "bg-[#7059c8]", "bg-[#a36b00]"];
    const sources = [...sourceCounts.entries()].sort((a, b) => b[1] - a[1]).map(([name, count], index) => ({ name, count, value: total ? Math.round((count / total) * 100) : 0, color: colors[index % colors.length] }));
    return { total, confirmed, attended, attendanceRate: confirmed ? Math.round((attended / confirmed) * 100) : 0, sources };
  } catch {
    return { total: 0, confirmed: 0, attended: 0, attendanceRate: 0, sources: [] };
  }
}

export type RegistrationGrowthPoint = {
  date: string;
  label: string;
  count: number;
};

export async function getDashboardRegistrationGrowth(days = 30): Promise<RegistrationGrowthPoint[]> {
  const safeDays = Math.max(7, Math.min(90, days));
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - safeDays + 1);
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("registrations")
      .select("registered_at")
      .gte("registered_at", start.toISOString())
      .lte("registered_at", end.toISOString())
      .order("registered_at", { ascending: true });
    if (error) return [];
    const totals = new Map<string, number>();
    for (const item of data ?? []) {
      const value = text(asRecord(item).registered_at);
      if (!value) continue;
      const key = new Date(value).toISOString().slice(0, 10);
      totals.set(key, (totals.get(key) ?? 0) + 1);
    }
    let cumulative = 0;
    return Array.from({ length: safeDays }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const key = date.toISOString().slice(0, 10);
      cumulative += totals.get(key) ?? 0;
      return { date: key, label: new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(date).toUpperCase(), count: cumulative };
    });
  } catch {
    return [];
  }
}