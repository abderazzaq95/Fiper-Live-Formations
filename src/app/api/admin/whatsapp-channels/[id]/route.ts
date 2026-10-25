import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getDashboardIdentity } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const updateSchema = z.object({
  active: z.boolean().optional(),
  isDefault: z.boolean().optional(),
}).refine((value) => value.active !== undefined || value.isDefault !== undefined);

export async function PATCH(request: Request, context: RouteContext<"/api/admin/whatsapp-channels/[id]">) {
  const identity = await getDashboardIdentity();
  if (!identity || identity.role !== "admin") return Response.json({ message: "غير مصرح لك بتنفيذ هذا الإجراء." }, { status: 403 });
  const { id } = await context.params;
  if (!/^[a-z0-9_]+$/.test(id)) return Response.json({ message: "قناة واتساب غير صالحة." }, { status: 400 });

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ message: "بيانات الطلب غير صالحة." }, { status: 400 }); }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ message: "بيانات التحديث غير صالحة." }, { status: 422 });

  const admin = createAdminClient();
  const { data: current } = await admin.from("whatsapp_channels").select("id,is_default").eq("id", id).maybeSingle();
  if (!current) return Response.json({ message: "قناة واتساب غير موجودة." }, { status: 404 });
  if (current.is_default && parsed.data.active === false) return Response.json({ message: "اختر رقمًا افتراضيًا آخر قبل تعطيل هذا الرقم." }, { status: 409 });

  if (parsed.data.isDefault === true) await admin.from("whatsapp_channels").update({ is_default: false, updated_at: new Date().toISOString() }).eq("is_default", true);
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (parsed.data.active !== undefined) update.active = parsed.data.active;
  if (parsed.data.isDefault !== undefined) update.is_default = parsed.data.isDefault;
  if (parsed.data.isDefault === true) update.active = true;
  const { error } = await admin.from("whatsapp_channels").update(update).eq("id", id);
  if (error) return Response.json({ message: "تعذر تحديث قناة واتساب." }, { status: 500 });

  revalidatePath("/admin/settings");
  revalidatePath("/admin/courses");
  return Response.json({ ok: true });
}
