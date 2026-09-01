import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDashboardIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type JsonRecord = Record<string, unknown>;
function record(value: unknown): JsonRecord { return value && typeof value === "object" ? value as JsonRecord : {}; }
function rows(value: unknown): JsonRecord[] { return Array.isArray(value) ? value.map(record) : []; }
function text(value: unknown, fallback = "") { return typeof value === "string" && value.trim() ? value : fallback; }

export async function POST(_request: Request, context: RouteContext<"/api/admin/courses/[id]/duplicate">) {
  const identity = await getDashboardIdentity();
  if (!identity || identity.role !== "admin") return Response.json({ message: "Unauthorized" }, { status: 403 });
  const { id } = await context.params;
  if (!id || id === "new") return Response.json({ message: "Course not found." }, { status: 400 });

  const supabase = await createClient();
  const { data: source, error: sourceError } = await supabase
    .from("courses")
    .select("id,slug,default_locale,instructor_id,cover_path,course_translations(*),course_sessions(*)")
    .eq("id", id)
    .maybeSingle();
  if (sourceError || !source) return Response.json({ message: "Course not found." }, { status: 404 });

  const newId = `crs_${crypto.randomUUID().replaceAll("-", "").slice(0, 20)}`;
  const sourceSlug = text(source.slug, "course").replace(/[^a-z0-9-]+/gi, "-").replace(/^-+|-+$/g, "") || "course";
  const newSlug = `${sourceSlug}-copy-${Date.now().toString(36)}`.slice(0, 120);
  const coursePayload = {
    id: newId,
    slug: newSlug,
    state: "draft",
    default_locale: text(source.default_locale, "ar"),
    instructor_id: text(source.instructor_id) || null,
    cover_path: text(source.cover_path) || null,
    created_by: identity.id === "preview" ? null : identity.id,
    published_at: null,
    is_featured: false,
  };

  const { error: courseError } = await supabase.from("courses").insert(coursePayload);
  if (courseError) return Response.json({ message: "Unable to copy the course." }, { status: 500 });

  const translations = rows(source.course_translations).map((translation) => ({
    course_id: newId,
    locale: text(translation.locale, text(source.default_locale, "ar")),
    title: text(translation.title, "نسخة من الدورة"),
    hero_heading: text(translation.hero_heading, "افهم السوق. تداول بوضوح."),
    eyebrow: text(translation.eyebrow),
    description: text(translation.description),
    outcomes: translation.outcomes ?? [],
    agenda: translation.agenda ?? [],
    audience: translation.audience ?? [],
    faqs: translation.faqs ?? [],
    seo_title: translation.seo_title ?? null,
    seo_description: translation.seo_description ?? null,
  }));
  if (translations.length) {
    const { error } = await supabase.from("course_translations").insert(translations);
    if (error) {
      await supabase.from("courses").delete().eq("id", newId);
      return Response.json({ message: "Unable to copy course content." }, { status: 500 });
    }
  }

  const sessions = rows(source.course_sessions).map((session) => ({
    course_id: newId,
    starts_at: session.starts_at,
    ends_at: session.ends_at,
    timezone: text(session.timezone, "Africa/Casablanca"),
    delivery_type: text(session.delivery_type, "online"),
    platform: text(session.platform) || null,
    venue_name: text(session.venue_name) || null,
    venue_address: text(session.venue_address) || null,
    meet_space_name: text(session.meet_space_name) || null,
    meet_url: text(session.meet_url) || null,
    google_event_id: null,
    capacity: typeof session.capacity === "number" ? session.capacity : 200,
    registration_open: false,
    waitlist_enabled: session.waitlist_enabled !== false,
  }));
  if (sessions.length) {
    const { error } = await supabase.from("course_sessions").insert(sessions);
    if (error) {
      await supabase.from("courses").delete().eq("id", newId);
      return Response.json({ message: "Unable to copy the course schedule." }, { status: 500 });
    }
  }

  revalidatePath("/admin/courses");
  return Response.json({ ok: true, id: newId });
}