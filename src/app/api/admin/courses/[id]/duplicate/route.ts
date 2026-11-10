import { revalidatePath } from "next/cache";
import { getDashboardIdentity } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type JsonRecord = Record<string, unknown>;
function record(value: unknown): JsonRecord { return value && typeof value === "object" ? value as JsonRecord : {}; }
function rows(value: unknown): JsonRecord[] { return Array.isArray(value) ? value.map(record) : []; }
function text(value: unknown, fallback = "") { return typeof value === "string" && value.trim() ? value : fallback; }
// Copy every column of a row (so newly added columns are never forgotten), minus identity/audit fields.
function copyRow(row: JsonRecord, omit: string[] = []) {
  const skip = new Set(["id", "created_at", "updated_at", ...omit]);
  return Object.fromEntries(Object.entries(row).filter(([key]) => !skip.has(key)));
}

export async function POST(_request: Request, context: RouteContext<"/api/admin/courses/[id]/duplicate">) {
  const identity = await getDashboardIdentity();
  if (!identity || identity.role !== "admin") return Response.json({ message: "Unauthorized" }, { status: 403 });
  const { id } = await context.params;
  if (!id || id === "new") return Response.json({ message: "Course not found." }, { status: 400 });

  const supabase = createAdminClient();
  const { data: source, error: sourceError } = await supabase
    .from("courses")
    .select("*,course_translations(*),course_sessions(*)")
    .eq("id", id)
    .maybeSingle();
  if (sourceError || !source) return Response.json({ message: "Course not found." }, { status: 404 });

  const newId = `crs_${crypto.randomUUID().replaceAll("-", "").slice(0, 20)}`;
  const { data: existingSlugs } = await supabase.from("courses").select("slug");
  const { data: aliases } = await supabase.from("course_slug_aliases").select("slug");
  const nextNumber = [...(existingSlugs ?? []), ...(aliases ?? [])].reduce((max, row) => {
    const match = /^id(\d+)$/i.exec(text((row as JsonRecord).slug));
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0) + 1;
  const newSlug = `id${String(nextNumber).padStart(2, "0")}`;
  let newInstructorId: string | null = null;
  if (source.instructor_id) {
    const { data: instructor, error: instructorLookupError } = await supabase
      .from("instructors")
      .select("*")
      .eq("id", source.instructor_id)
      .maybeSingle();
    if (instructorLookupError || !instructor) {
      console.error("duplicate_course_instructor_lookup_failed", instructorLookupError);
      return Response.json({ message: `Unable to copy the instructor. ${instructorLookupError?.message ?? "Instructor not found."}` }, { status: 500 });
    }

    let instructorCopy = await supabase.from("instructors").insert(copyRow(record(instructor))).select("id").single();
    if (instructorCopy.error) {
      instructorCopy = await supabase.from("instructors").insert({
        name: instructor.name,
        title: instructor.title,
        bio: instructor.bio,
        photo_path: instructor.photo_path,
      }).select("id").single();
    }
    if (instructorCopy.error || !instructorCopy.data) {
      console.error("duplicate_course_instructor_insert_failed", instructorCopy.error);
      return Response.json({ message: `Unable to copy the instructor. ${instructorCopy.error?.message ?? ""}`.trim() }, { status: 500 });
    }
    newInstructorId = instructorCopy.data.id;
  }
  const coursePayload = {
    id: newId,
    slug: newSlug,
    state: "draft",
    default_locale: text(source.default_locale, "ar"),
    instructor_id: newInstructorId,
    // A copied course needs its own cover upload. Reusing the source URL makes
    // unrelated courses display the same image in the public directory.
    cover_path: null,
    created_by: identity.id === "preview" ? null : identity.id,
    published_at: null,
    is_featured: false,
    // Optional catalog columns come from a later migration; only copy them when the database has them.
    ...("level" in source ? { level: source.level ?? null } : {}),
    ...("topic" in source ? { topic: source.topic ?? null } : {}),
  };

  const { error: courseError } = await supabase.from("courses").insert(coursePayload);
  if (courseError) {
    console.error("duplicate_course_insert_failed", courseError);
    if (newInstructorId) await supabase.from("instructors").delete().eq("id", newInstructorId);
    return Response.json({ message: `Unable to copy the course. ${courseError.message}` }, { status: 500 });
  }

  const translations = rows(source.course_translations).map((translation) => ({
    ...copyRow(translation),
    course_id: newId,
    locale: text(translation.locale, text(source.default_locale, "ar")),
    title: `نسخة من ${text(translation.title, "الدورة")}`,
  }));
  if (translations.length) {
    const { error } = await supabase.from("course_translations").insert(translations);
    if (error) {
      await supabase.from("courses").delete().eq("id", newId);
      if (newInstructorId) await supabase.from("instructors").delete().eq("id", newInstructorId);
      console.error("duplicate_course_translations_failed", error);
      return Response.json({ message: `Unable to copy course content. ${error.message}` }, { status: 500 });
    }
  }

  const sessions = rows(source.course_sessions).map((session) => ({
    ...copyRow(session),
    course_id: newId,
    google_event_id: null,
    meet_space_name: null,
    meet_url: null,
    registration_open: false,
  }));
  if (sessions.length) {
    const { error } = await supabase.from("course_sessions").insert(sessions);
    if (error) {
      await supabase.from("courses").delete().eq("id", newId);
      if (newInstructorId) await supabase.from("instructors").delete().eq("id", newInstructorId);
      console.error("duplicate_course_sessions_failed", error);
      return Response.json({ message: `Unable to copy the course schedule. ${error.message}` }, { status: 500 });
    }
  }

  revalidatePath("/admin/courses");
  return Response.json({ ok: true, id: newId });
}
