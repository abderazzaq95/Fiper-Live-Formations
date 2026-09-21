import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDashboardIdentity } from "@/lib/auth";
import { z } from "zod";

const landingContentSchema = z.object({
  hero: z.object({ navAbout: z.string().trim().max(120), navAgenda: z.string().trim().max(120), navInstructor: z.string().trim().max(120), navFaq: z.string().trim().max(120), primaryCta: z.string().trim().max(120), secondaryCta: z.string().trim().max(120), benefitOne: z.string().trim().max(180), benefitTwo: z.string().trim().max(180) }).partial().optional(),
  about: z.object({ eyebrow: z.string().trim().max(180), title: z.string().trim().max(240), description: z.string().trim().max(1000), durationLabel: z.string().trim().max(240) }).partial().optional(),
  audience: z.object({ eyebrow: z.string().trim().max(180), title: z.string().trim().max(240), description: z.string().trim().max(1000), badgeLabel: z.string().trim().max(180), badgeTitle: z.string().trim().max(600), stats: z.array(z.object({ value: z.string().trim().max(60), label: z.string().trim().max(120) })).max(6) }).partial().optional(),
  agenda: z.object({ eyebrow: z.string().trim().max(180), title: z.string().trim().max(240), description: z.string().trim().max(1000) }).partial().optional(),
  instructor: z.object({ eyebrow: z.string().trim().max(180), yearsValue: z.string().trim().max(60), yearsLabel: z.string().trim().max(180), liveValue: z.string().trim().max(60), liveLabel: z.string().trim().max(180) }).partial().optional(),
  faq: z.object({ eyebrow: z.string().trim().max(180), title: z.string().trim().max(240) }).partial().optional(),
  registration: z.object({ eyebrow: z.string().trim().max(180), title: z.string().trim().max(240), description: z.string().trim().max(1000), formTitle: z.string().trim().max(180), formDescription: z.string().trim().max(240) }).partial().optional(),
  footer: z.object({ disclaimer: z.string().trim().max(1000), privacyLabel: z.string().trim().max(120), termsLabel: z.string().trim().max(120) }).partial().optional(),
}).default({});
const updateSchema = z.object({
  title: z.string().trim().min(1).max(180),
  heroHeading: z.string().trim().min(1).max(300).default("افهم السوق. تداول بوضوح."),
  eyebrow: z.string().trim().max(180).default(""),
  description: z.string().trim().max(2000).default(""),
  faqs: z.array(z.object({ question: z.string().trim().min(1).max(300), answer: z.string().trim().min(1).max(2000) })).max(30).default([]),
  outcomes: z.array(z.object({ title: z.string().trim().min(1).max(240), text: z.string().trim().min(1).max(1000) })).max(20).default([]),
  audience: z.array(z.string().trim().min(1).max(300)).max(20).default([]),
  agenda: z.array(z.object({ time: z.string().trim().min(1).max(80), title: z.string().trim().min(1).max(240), text: z.string().trim().min(1).max(1000) })).max(30).default([]),
  landingContent: landingContentSchema,
  publish: z.boolean().default(false),
  slug: z.string().trim().min(1).max(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  timezone: z.enum(["Europe/Berlin", "Europe/Istanbul", "Asia/Qatar", "Asia/Muscat", "Asia/Beirut", "Africa/Casablanca", "Asia/Riyadh", "Asia/Dubai", "Asia/Amman", "Asia/Baghdad"]),
  deliveryType: z.enum(["online", "onsite"]).default("online"),
  platform: z.string().trim().max(120).default(""),
  meetUrl: z.string().trim().max(500).default(""),
  venueName: z.string().trim().max(240).default(""),
  venueAddress: z.string().trim().max(500).default(""),
  mapsUrl: z.string().trim().max(800).default(""),
  capacity: z.number().int().positive().max(100000),
  registrationOpen: z.boolean(),
  waitlistEnabled: z.boolean().default(true),
  instructorName: z.string().trim().min(1).max(120),
  instructorTitle: z.string().trim().max(180).default(""),
  instructorBio: z.string().trim().max(3000).default(""),
});

function canonicalSlug(value: unknown) {
  return typeof value === "string" && /^id\d+$/i.test(value.trim()) ? value.trim().toLowerCase() : "";
}

async function nextCourseSlug(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [{ data: courses }, { data: aliases }] = await Promise.all([
    supabase.from("courses").select("slug"),
    supabase.from("course_slug_aliases").select("slug"),
  ]);
  const max = [...(courses ?? []), ...(aliases ?? [])].reduce((highest, row) => {
    const match = /^id(\d+)$/i.exec(typeof row.slug === "string" ? row.slug : "");
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `id${String(max + 1).padStart(2, "0")}`;
}

async function saveSlugAlias(oldSlug: string, courseId: string) {
  if (!oldSlug || oldSlug === canonicalSlug(oldSlug)) return;
  try {
    await createAdminClient().from("course_slug_aliases").upsert({ slug: oldSlug, course_id: courseId }, { onConflict: "slug" });
  } catch {
    // The alias migration may not be installed yet; the canonical URL still works.
  }
}
function offsetForTimezone(timezone: string) {
  if (["Europe/Istanbul", "Asia/Qatar", "Asia/Beirut", "Asia/Riyadh", "Asia/Amman", "Asia/Baghdad"].includes(timezone)) return "+03:00";
  if (["Asia/Muscat", "Asia/Dubai"].includes(timezone)) return "+04:00";
  if (timezone === "Africa/Casablanca") return "+01:00";
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

async function reschedulePendingReminders(sessionId: string, startsAt: string, timezone: string, meetUrl: string, deliveryType: string) {
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
      if ((deliveryType !== "onsite" && !meetUrl) || !timestamp || timestamp <= now) {
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

async function createCourse(supabase: Awaited<ReturnType<typeof createClient>>, identity: { id: string }, value: z.infer<typeof updateSchema>) {
  const newId = `crs_${crypto.randomUUID().replaceAll("-", "").slice(0, 20)}`;
  const newSlug = await nextCourseSlug(supabase);
  const instructorResult = await supabase.from("instructors").insert({
    name: value.instructorName,
    title: value.instructorTitle,
    bio: value.instructorBio,
  }).select("id").single();
  if (instructorResult.error || !instructorResult.data) throw new Error("instructor_create_failed");

  const cleanup = async () => {
    const admin = createAdminClient();
    await admin.from("courses").delete().eq("id", newId);
    await admin.from("instructors").delete().eq("id", instructorResult.data.id);
  };

  const courseResult = await supabase.from("courses").insert({
    id: newId,
    slug: newSlug,
    state: value.publish ? "published" : "draft",
    default_locale: "ar",
    instructor_id: instructorResult.data.id,
    created_by: identity.id === "preview" ? null : identity.id,
    published_at: value.publish ? new Date().toISOString() : null,
    is_featured: false,
  });
  if (courseResult.error) {
    await cleanup();
    throw new Error(courseResult.error.code === "23505" ? "slug_already_exists" : "course_create_failed");
  }

  const translationResult = await supabase.from("course_translations").insert({
    course_id: newId,
    locale: "ar",
    title: value.title,
    hero_heading: value.heroHeading,
    eyebrow: value.eyebrow,
    description: value.description,
    faqs: value.faqs,
    outcomes: value.outcomes,
    audience: value.audience,
    agenda: value.agenda,
    landing_content: value.landingContent,
  });
  if (translationResult.error) {
    await cleanup();
    throw new Error("content_create_failed");
  }

  const sessionResult = await supabase.from("course_sessions").insert({
    course_id: newId,
    starts_at: toIso(value.date, value.startTime, value.timezone),
    ends_at: toIso(value.date, value.endTime, value.timezone),
    timezone: value.timezone,
    delivery_type: value.deliveryType,
    platform: value.platform || null,
    meet_url: value.meetUrl || null,
    venue_name: value.deliveryType === "onsite" ? value.venueName || null : null,
    venue_address: value.deliveryType === "onsite" ? value.venueAddress || null : null,
    maps_url: value.deliveryType === "onsite" ? value.mapsUrl || null : null,
    capacity: value.capacity,
    registration_open: value.registrationOpen,
    waitlist_enabled: value.waitlistEnabled,
  });
  if (sessionResult.error) {
    await cleanup();
    throw new Error("schedule_create_failed");
  }

  return { id: newId, slug: newSlug };
}
export async function PATCH(request: Request, context: RouteContext<"/api/admin/courses/[id]">) {
  const identity = await getDashboardIdentity();
  if (!identity) return Response.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  if (!id) return Response.json({ message: "Course not found." }, { status: 400 });

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ message: "Invalid request data." }, { status: 400 }); }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ message: "Please check the course fields." }, { status: 422 });

  const value = parsed.data;
  const supabase = await createClient();
  if (id === "new") {
    try {
      const created = await createCourse(supabase, identity, value);
      revalidatePath("/admin/courses");
      return Response.json({ ok: true, ...created }, { status: 201 });
    } catch (error) {
      if (error instanceof Error && error.message === "slug_already_exists") return Response.json({ message: "A course with this URL already exists." }, { status: 409 });
      console.error("course_create_failed", error);
      return Response.json({ message: "Unable to create the course." }, { status: 500 });
    }
  }
  const { data: existing, error: existingError } = await supabase
    .from("courses")
    .select("id,slug,default_locale,instructor_id,course_sessions(id)")
    .eq("id", id)
    .maybeSingle();
  if (existingError || !existing) return Response.json({ message: "Course not found." }, { status: 404 });

  const locale = existing.default_locale ?? "ar";
  const oldSlug = typeof existing.slug === "string" ? existing.slug : "";
  const stableSlug = canonicalSlug(oldSlug) || await nextCourseSlug(supabase);
  if (stableSlug !== oldSlug) await saveSlugAlias(oldSlug, id);
  const now = new Date().toISOString();
  const courseUpdate = { slug: stableSlug, updated_at: now, state: value.publish ? "published" : "draft", published_at: value.publish ? now : null };
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
    outcomes: value.outcomes,
    audience: value.audience,
    agenda: value.agenda,
    landing_content: value.landingContent,
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
    maps_url: value.deliveryType === "onsite" ? value.mapsUrl || null : null,
    capacity: value.capacity,
    registration_open: value.registrationOpen,
    waitlist_enabled: value.waitlistEnabled,
    updated_at: new Date().toISOString(),
  };
  const sessionResult = sessionId
    ? await supabase.from("course_sessions").update(sessionPayload).eq("id", sessionId)
    : await supabase.from("course_sessions").insert(sessionPayload);
  if (sessionResult.error) return Response.json({ message: "Unable to update the course schedule." }, { status: 500 });
  if (sessionId) await reschedulePendingReminders(sessionId, sessionPayload.starts_at, sessionPayload.timezone, sessionPayload.meet_url ?? "", sessionPayload.delivery_type);

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

export async function DELETE(request: Request, context: RouteContext<"/api/admin/courses/[id]">) {
  const identity = await getDashboardIdentity();
  if (!identity) return Response.json({ message: "Unauthorized" }, { status: 401 });
  if (identity.role !== "admin") return Response.json({ message: "Forbidden" }, { status: 403 });

  const { id } = await context.params;
  if (!id || id === "new") return Response.json({ message: "Course not found." }, { status: 400 });

  const admin = createAdminClient();
  try {
    const { data: course, error: courseLookupError } = await admin
      .from("courses")
      .select("id,slug")
      .eq("id", id)
      .maybeSingle();
    if (courseLookupError) throw courseLookupError;
    if (!course) return Response.json({ message: "Course not found." }, { status: 404 });

    const { data: sessions, error: sessionsError } = await admin
      .from("course_sessions")
      .select("id")
      .eq("course_id", id);
    if (sessionsError) throw sessionsError;

    const sessionIds = (sessions ?? []).map((session: { id: string }) => session.id).filter(Boolean);
    if (sessionIds.length) {
      const { data: registrations, error: registrationsError } = await admin
        .from("registrations")
        .select("id")
        .in("session_id", sessionIds);
      if (registrationsError) throw registrationsError;

      const registrationIds = (registrations ?? []).map((registration: { id: string }) => registration.id).filter(Boolean);
      if (registrationIds.length) {
        const { error: outboxError } = await admin.from("outbox_events").delete().in("aggregate_id", registrationIds);
        if (outboxError) throw outboxError;
      }
    }

    const { error: deleteError } = await admin.from("courses").delete().eq("id", id);
    if (deleteError) throw deleteError;

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/courses");
    if (typeof course.slug === "string" && course.slug) revalidatePath("/courses/" + course.slug);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("course_delete_failed", error);
    return Response.json({ message: "Unable to delete the course." }, { status: 500 });
  }
}
