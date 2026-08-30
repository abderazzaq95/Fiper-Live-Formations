import { z } from "zod";
import { getDashboardIdentity } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const updateSchema = z.object({
  name: z.string().trim().min(3).max(100),
  email: z.string().trim().toLowerCase().email().max(180),
  phone: z.string().trim().min(8).max(24),
});

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (phone.trim().startsWith("+")) return `+${digits}`;
  if (digits.startsWith("212")) return `+${digits}`;
  return `+212${digits.replace(/^0/, "")}`;
}

export async function PATCH(request: Request, context: RouteContext<"/api/admin/registrations/[id]">) {
  const identity = await getDashboardIdentity();
  if (!identity || identity.role !== "admin") return Response.json({ message: "Unauthorized" }, { status: 403 });
  const { id } = await context.params;
  if (!id) return Response.json({ message: "Registration not found." }, { status: 404 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ message: "Invalid request data." }, { status: 400 }); }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ message: "Please check the participant fields." }, { status: 422 });
  const supabase = createAdminClient();
  const { error } = await supabase.from("registrations").update({ full_name: parsed.data.name, email: parsed.data.email, phone_e164: normalizePhone(parsed.data.phone), updated_at: new Date().toISOString() }).eq("id", id);
  if (error) {
    if (error.code === "23505") return Response.json({ message: "This email or phone is already registered for this course." }, { status: 409 });
    return Response.json({ message: "Unable to update the participant." }, { status: 500 });
  }
  return Response.json({ ok: true });
}

export async function DELETE(request: Request, context: RouteContext<"/api/admin/registrations/[id]">) {
  void request;
  const identity = await getDashboardIdentity();
  if (!identity || identity.role !== "admin") return Response.json({ message: "Unauthorized" }, { status: 403 });
  const { id } = await context.params;
  if (!id) return Response.json({ message: "Registration not found." }, { status: 404 });
  const supabase = createAdminClient();
  const { data: deleted, error } = await supabase.from("registrations").delete().eq("id", id).select("id").maybeSingle();
  if (error) return Response.json({ message: "Unable to delete the participant." }, { status: 500 });
  if (!deleted) return Response.json({ message: "Registration not found." }, { status: 404 });
  return Response.json({ ok: true });
}