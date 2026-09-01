import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDashboardIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ open: z.boolean() });

export async function PATCH(request: Request, context: RouteContext<"/api/admin/courses/[id]/registration">) {
  const identity = await getDashboardIdentity();
  if (!identity || identity.role !== "admin") return Response.json({ message: "Unauthorized" }, { status: 403 });
  const { id } = await context.params;
  if (!id || id === "new") return Response.json({ message: "Course not found." }, { status: 400 });

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ message: "Invalid request data." }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ message: "Invalid registration status." }, { status: 422 });

  const supabase = await createClient();
  const { data: course } = await supabase.from("courses").select("id").eq("id", id).maybeSingle();
  if (!course) return Response.json({ message: "Course not found." }, { status: 404 });
  const { error } = await supabase.from("course_sessions").update({ registration_open: parsed.data.open, updated_at: new Date().toISOString() }).eq("course_id", id);
  if (error) return Response.json({ message: "Unable to update registration status." }, { status: 500 });

  revalidatePath("/");
  revalidatePath("/admin/courses");
  return Response.json({ ok: true, open: parsed.data.open });
}