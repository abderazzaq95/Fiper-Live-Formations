import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getDashboardIdentity } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyCallbellChannel } from "@/lib/integrations/callbell-admin";

const uuid = z.string().trim().toLowerCase().regex(/^[a-f0-9]{32}$/);

const updateSchema = z.object({
  active: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  label: z.string().trim().min(1).max(120).optional(),
  countryName: z.string().trim().min(1).max(120).optional(),
  countryCode: z.string().trim().length(2).transform((value) => value.toUpperCase()).optional(),
  phoneE164: z.string().trim().regex(/^\+[1-9][0-9]{6,14}$/).optional(),
  callbellChannelUuid: uuid.optional(),
  templates: z.object({
    registration: uuid,
    reminderDay: uuid,
    reminderToday: uuid,
    joinNow: uuid,
    custom: uuid,
  }).optional(),
}).refine((value) => Object.keys(value).length > 0);

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
  const { data: current } = await admin.from("whatsapp_channels").select("id,is_default,active,callbell_channel_uuid,template_registration_uuid,template_reminder_day_uuid,template_reminder_today_uuid,template_join_now_uuid,template_custom_uuid").eq("id", id).maybeSingle();
  if (!current) return Response.json({ message: "قناة واتساب غير موجودة." }, { status: 404 });
  if (current.is_default && parsed.data.active === false) return Response.json({ message: "اختر رقمًا افتراضيًا آخر قبل تعطيل هذا الرقم." }, { status: 409 });

  const nextChannelUuid = parsed.data.callbellChannelUuid ?? current.callbell_channel_uuid;
  const nextTemplates = parsed.data.templates ? Object.values(parsed.data.templates) : [current.template_registration_uuid, current.template_reminder_day_uuid, current.template_reminder_today_uuid, current.template_join_now_uuid, current.template_custom_uuid];
  const configurationChanged = Boolean(parsed.data.callbellChannelUuid || parsed.data.templates);
  if (parsed.data.active === true || parsed.data.isDefault === true) {
    if (nextTemplates.some((value) => !value)) return Response.json({ message: "يجب ربط القوالب الخمسة قبل تفعيل القناة." }, { status: 422 });
    try {
      await verifyCallbellChannel(nextChannelUuid, nextTemplates as string[]);
    } catch (verificationError) {
      const message = verificationError instanceof Error ? verificationError.message : "تعذر التحقق من Callbell.";
      await admin.from("whatsapp_channels").update({ active: false, callbell_verified_at: null, callbell_verification_error: message, updated_at: new Date().toISOString() }).eq("id", id);
      return Response.json({ message }, { status: 422 });
    }
  }
  if (parsed.data.isDefault === true) await admin.from("whatsapp_channels").update({ is_default: false, updated_at: new Date().toISOString() }).eq("is_default", true);
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (parsed.data.active !== undefined) update.active = parsed.data.active;
  if (parsed.data.isDefault !== undefined) update.is_default = parsed.data.isDefault;
  if (parsed.data.isDefault === true) update.active = true;
  if (parsed.data.label !== undefined) update.label = parsed.data.label;
  if (parsed.data.countryName !== undefined) update.country_name = parsed.data.countryName;
  if (parsed.data.countryCode !== undefined) update.country_code = parsed.data.countryCode;
  if (parsed.data.phoneE164 !== undefined) update.phone_e164 = parsed.data.phoneE164;
  if (parsed.data.callbellChannelUuid !== undefined) update.callbell_channel_uuid = parsed.data.callbellChannelUuid;
  if (parsed.data.templates) {
    update.template_registration_uuid = parsed.data.templates.registration;
    update.template_reminder_day_uuid = parsed.data.templates.reminderDay;
    update.template_reminder_today_uuid = parsed.data.templates.reminderToday;
    update.template_join_now_uuid = parsed.data.templates.joinNow;
    update.template_custom_uuid = parsed.data.templates.custom;
  }
  if (configurationChanged) {
    if (!current.is_default) {
      update.active = false;
      update.is_default = false;
    }
    update.callbell_verified_at = null;
    update.callbell_verification_error = "تحقق من القناة والقوالب بعد حفظ التغييرات.";
  } else if (parsed.data.active === true || parsed.data.isDefault === true) {
    update.callbell_verified_at = new Date().toISOString();
    update.callbell_verification_error = null;
  }
  const { error } = await admin.from("whatsapp_channels").update(update).eq("id", id);
  if (error) return Response.json({ message: "تعذر تحديث قناة واتساب." }, { status: 500 });

  revalidatePath("/admin/settings");
  revalidatePath("/admin/courses");
  return Response.json({ ok: true });
}
