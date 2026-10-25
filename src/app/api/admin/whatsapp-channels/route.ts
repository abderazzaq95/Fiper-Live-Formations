import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getDashboardIdentity } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const createSchema = z.object({
  label: z.string().trim().min(1).max(120),
  countryName: z.string().trim().min(1).max(120),
  countryCode: z.string().trim().length(2).transform((value) => value.toUpperCase()),
  phoneE164: z.string().trim().regex(/^\+[1-9][0-9]{6,14}$/),
  callbellChannelUuid: z.string().trim().toLowerCase().regex(/^[a-f0-9]{32}$/),
  isDefault: z.boolean().default(false),
});

export async function POST(request: Request) {
  const identity = await getDashboardIdentity();
  if (!identity || identity.role !== "admin") return Response.json({ message: "غير مصرح لك بتنفيذ هذا الإجراء." }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ message: "بيانات الطلب غير صالحة." }, { status: 400 }); }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return Response.json({ message: "تحقق من اسم القناة والرقم وChannel UUID." }, { status: 422 });

  const admin = createAdminClient();
  const value = parsed.data;
  const id = `${value.countryCode.toLowerCase()}_${crypto.randomUUID().replaceAll("-", "").slice(0, 8)}`;
  const { error } = await admin.from("whatsapp_channels").insert({
    id,
    label: value.label,
    country_name: value.countryName,
    country_code: value.countryCode,
    phone_e164: value.phoneE164,
    callbell_channel_uuid: value.callbellChannelUuid,
    active: true,
    is_default: false,
  });
  if (error) {
    const duplicate = error.code === "23505";
    return Response.json({ message: duplicate ? "هذا الرقم أو Channel UUID مضاف مسبقًا." : "تعذر حفظ قناة واتساب." }, { status: duplicate ? 409 : 500 });
  }
  if (value.isDefault) {
    await admin.from("whatsapp_channels").update({ is_default: false, updated_at: new Date().toISOString() }).eq("is_default", true);
    const { error: defaultError } = await admin.from("whatsapp_channels").update({ is_default: true, updated_at: new Date().toISOString() }).eq("id", id);
    if (defaultError) return Response.json({ message: "تمت إضافة الرقم، لكن تعذر تعيينه افتراضيًا." }, { status: 500 });
  }
  revalidatePath("/admin/settings");
  revalidatePath("/admin/courses");
  return Response.json({ ok: true, id }, { status: 201 });
}
