import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDashboardIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ completed: z.boolean() });

// Marks a course as completed (its public page stays online, registration is closed and reminders stop)
// or makes it active again (published; registration stays closed until it is reopened).
export async function PATCH(request: Request, context: RouteContext<"/api/admin/courses/[id]/completed">) {
  const identity = await getDashboardIdentity();
  if (!identity || identity.role !== "admin") return Response.json({ message: "Unauthorized" }, { status: 403 });
  const { id } = await context.params;
  if (!id || id === "new") return Response.json({ message: "Course not found." }, { status: 400 });

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ message: "Invalid request data." }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ message: "Invalid course status." }, { status: 422 });

  const supabase = await createClient();
  const { data: course } = await supabase.from("courses").select("id,state").eq("id", id).maybeSingle();
  if (!course) return Response.json({ message: "Course not found." }, { status: 404 });
  if (!parsed.data.completed && course.state !== "completed") return Response.json({ ok: true, completed: false });
  if (parsed.data.completed && course.state === "draft") return Response.json({ message: "انشر الدورة أولاً قبل تحديدها كمكتملة." }, { status: 422 });

  const now = new Date().toISOString();
  if (parsed.data.completed) {
    const { error: sessionError } = await supabase.from("course_sessions").update({ registration_open: false, updated_at: now }).eq("course_id", id);
    if (sessionError) return Response.json({ message: "Unable to close registration." }, { status: 500 });
  }
  const { error } = await supabase.from("courses").update({ state: parsed.data.completed ? "completed" : "published", updated_at: now }).eq("id", id);
  if (error) return Response.json({ message: "Unable to update the course status." }, { status: 500 });

  revalidatePath("/");
  revalidatePath("/admin/courses");
  return Response.json({ ok: true, completed: parsed.data.completed });
}
