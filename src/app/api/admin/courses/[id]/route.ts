import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDashboardIdentity } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().trim().min(1).max(180),
  heroHeading: z.string().trim().min(1).max(300).default("افهم السوق. تداول بوضوح."),
  eyebrow: z.string().trim().max(180).default(""),
  description: z.string().trim().max(2000).default(""),
  faqs: z.array(z.object({ question: z.string().trim().min(1).max(300), answer: z.string().trim().min(1).max(2000) })).max(30).default([]),
  publish: z.boolean().default(false),
  slug: z.string().trim().min(1).max(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  timezone: z.enum(["Europe/Berlin", "Europe/Istanbul", "Asia/Qatar", "Africa/Casablanca", "Asia/Dubai"]),
  deliveryType: z.enum(["online", "onsite"]).default("online"),
  platform: z.string().trim().max(120).default(""),
  meetUrl: z.string().trim().max(500).default(""),
  venueName: z.string().trim().max(240).default(""),
  venueAddress: z.string().trim().max(500).default(""),
  capacity: z.number().int().positive().max(100000),
  registrationOpen: z.boolean(),
  waitlistEnabled: z.boolean().default(true),
  instructorName: z.string().trim().min(1).max(120),
  instructorTitle: z.string().trim().max(180).default(""),
  instructorBio: z.string().trim().max(3000).default(""),
});

function offsetForTimezone(timezone: string) {
  if (timezone === "Europe/Istanbul" || timezone === "Asia/Qatar") return "+03:00";
  if (timezone === "Asia/Dubai") return "+04:00";
  if (timezone === "Europe/Berlin" || timezone === "Europe/Paris") return "+02:00";
  return "+01:00";
}

function localMorningTimestamp(startAtMs: number, timezone: string) {
  const format = new Intl.DateTimeFormat("en-US", { timeZone: timezone || "UTC", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const parts = Object.fromEntries(format.formatToParts(new Date(startAtMs)).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  const naive = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), 9, 0, 0);
  const offsetParts = Object.fromEntries(format.formatToParts(new Date(naive)).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  const localAsUtc = Date.UTC(Number(offsetParts.year), Number(offsetParts.month) - 1, Number(offsetParts.day), Number(offsetParts.hour), Number(offsetParts.minute), Number(offsetParts.second));
  return naive - (localAsUtc - naive);
}

async function reschedulePendingReminders(sessionId: string, startsAt: string, timezone: string, meetUrl: string) {
  try {
    const admin = createAdminClient();
    const { data: registrations } = await admin.from("registrations").select("id").eq("session_id", sessionId).eq("status", "confirmed");
    const registrationIds = (registrations ?? []).map((registration: { id: string }) => registration.id).filter(Boolean);
    if (!registrationIds.length) return;
    const { data: deliveries } = await admin.from("message_deliveries").select("id,template_key,state").in("registration_id", registrationIds).in("state", ["scheduled", "queued"]);
    const startMs = Date.parse(startsAt);
    const now = Date.now();
    const timestamps: Record<string, number> = Number.isFinite(startMs) ? {
      course_reminder_24h: startMs - 24 * 60 * 60 * 1000,
      course_reminder_day: localMorningTimestamp(startMs, timezone),
      meeting_reminder: startMs - 10 * 60 * 1000,
    } : {};
    for (const delivery of deliveries ?? []) {
      const templateKey = String(delivery.template_key ?? "");
      const timestamp = timestamps[templateKey];
      if (!meetUrl || !timestamp || timestamp <= now) {
        await admin.from("message_deliveries").update({ state: "cancelled", failure_reason: "Schedule changed; reminder is no longer due", updated_at: new Date().toISOString() }).eq("id", delivery.id);
        continue;
      }
      await admin.from("message_deliveries").update({ state: "scheduled", scheduled_for: new Date(timestamp).toISOString(), failure_reason: null, updated_at: new Date().toISOString() }).eq("id", delivery.id);
    }
  } catch (error) {
    console.error("reminders_reschedule_failed", error);
  }
}
function toIso(date: string, time: string, timezone: string) {
  return new Date(date + "T" + time + ":00" + offsetForTimezone(timezone)).toISOString();
}

export async function PATCH(request: Request, context: RouteContext<"/api/admin/courses/[id]">) {
  const identity = await getDashboardIdentity();
  if (!identity) return Response.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  if (!id || id === "new") return Response.json({ message: "Creating a new course is not available yet." }, { status: 400 });

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ message: "Invalid request data." }, { status: 400 }); }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ message: "Please check the course fields." }, { status: 422 });

  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase
    .from("courses")
    .select("id,default_locale,instructor_id,course_sessions(id)")
    .eq("id", id)
    .maybeSingle();
  if (existingError || !existing) return Response.json({ message: "Course not found." }, { status: 404 });

  const value = parsed.data;
  const locale = existing.default_locale ?? "ar";
  const now = new Date().toISOString();
  const courseUpdate = { slug: value.slug, updated_at: now, state: value.publish ? "published" : "draft", published_at: value.publish ? now : null };
  const { error: courseError } = await supabase.from("courses").update(courseUpdate).eq("id", id);
  if (courseError) return Response.json({ message: "Unable to update the course." }, { status: 500 });

  const { error: translationError } = await supabase.from("course_translations").upsert({
    course_id: id,
    locale,
    title: value.title,
    hero_heading: value.heroHeading,
    eyebrow: value.eyebrow,
    description: value.description,
    faqs: value.faqs,
  }, { onConflict: "course_id,locale" });
  if (translationError) return Response.json({ message: "Unable to update course content." }, { status: 500 });

  const sessions = Array.isArray(existing.course_sessions) ? existing.course_sessions : [];
  const sessionId = sessions[0]?.id;
  const sessionPayload = {
    course_id: id,
    starts_at: toIso(value.date, value.startTime, value.timezone),
    ends_at: toIso(value.date, value.endTime, value.timezone),
    timezone: value.timezone,
    delivery_type: value.deliveryType,
    platform: value.platform || null,
    meet_url: value.meetUrl || null,
    venue_name: value.deliveryType === "onsite" ? value.venueName || null : null,
    venue_address: value.deliveryType === "onsite" ? value.venueAddress || null : null,
    capacity: value.capacity,
    registration_open: value.registrationOpen,
    waitlist_enabled: value.waitlistEnabled,
    updated_at: new Date().toISOString(),
  };
  const sessionResult = sessionId
    ? await supabase.from("course_sessions").update(sessionPayload).eq("id", sessionId)
    : await supabase.from("course_sessions").insert(sessionPayload);
  if (sessionResult.error) return Response.json({ message: "Unable to update the course schedule." }, { status: 500 });
  if (sessionId) await reschedulePendingReminders(sessionId, sessionPayload.starts_at, sessionPayload.timezone, sessionPayload.meet_url ?? "");

  if (existing.instructor_id) {
    const { error: instructorError } = await supabase.from("instructors").update({
      name: value.instructorName,
      title: value.instructorTitle,
      bio: value.instructorBio,
      updated_at: new Date().toISOString(),
    }).eq("id", existing.instructor_id);
    if (instructorError) return Response.json({ message: "Unable to update instructor details." }, { status: 500 });
  }

  revalidatePath("/");
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${id}`);
  return Response.json({ ok: true });
}