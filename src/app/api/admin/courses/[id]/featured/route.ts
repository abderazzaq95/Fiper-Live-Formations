import { revalidatePath } from "next/cache";
import { getDashboardIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, context: RouteContext<"/api/admin/courses/[id]/featured">) {
  const identity = await getDashboardIdentity();
  if (!identity || identity.role !== "admin") return Response.json({ message: "Unauthorized" }, { status: 403 });
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const featured = body?.featured === true;
  const supabase = await createClient();
  if (featured) {
    const { error: clearError } = await supabase.from("courses").update({ is_featured: false }).eq("is_featured", true);
    if (clearError) return Response.json({ message: "Unable to update featured course." }, { status: 500 });
  }
  const { error } = await supabase.from("courses").update({ is_featured: featured, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return Response.json({ message: "Unable to update featured course." }, { status: 500 });
  revalidatePath("/");
  revalidatePath("/admin/courses");
  return Response.json({ ok: true, featured });
}