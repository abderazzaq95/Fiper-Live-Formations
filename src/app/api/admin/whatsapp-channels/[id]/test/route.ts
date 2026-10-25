import { z } from "zod";

import { getDashboardIdentity } from "@/lib/auth";
import { sendCallbellTemplate } from "@/lib/integrations/callbell";
import { verifyCallbellChannel } from "@/lib/integrations/callbell-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({ phoneE164: z.string().trim().regex(/^\+[1-9][0-9]{6,14}$/) });

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const identity = await getDashboardIdentity();
  if (!identity || identity.role !== "admin") return Response.json({ message: "غير مصرح لك بتنفيذ هذا الإجراء." }, { status: 403 });
  const { id } = await context.params;
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ message: "بيانات الطلب غير صالحة." }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ message: "أدخل رقم الاختبار بالصيغة الدولية، مثل +968..." }, { status: 422 });
  const { data: channel } = await createAdminClient().from("whatsapp_channels")
    .select("callbell_channel_uuid,template_registration_uuid,template_reminder_day_uuid,template_reminder_today_uuid,template_join_now_uuid,template_custom_uuid")
    .eq("id", id).maybeSingle();
  if (!channel) return Response.json({ message: "قناة واتساب غير موجودة." }, { status: 404 });
  const templates = [channel.template_registration_uuid, channel.template_reminder_day_uuid, channel.template_reminder_today_uuid, channel.template_join_now_uuid, channel.template_custom_uuid];
  if (templates.some((value) => !value)) return Response.json({ message: "أكمل ربط القوالب الخمسة أولًا." }, { status: 422 });
  try {
    await verifyCallbellChannel(channel.callbell_channel_uuid, templates as string[]);
    const result = await sendCallbellTemplate({
      to: parsed.data.phoneE164,
      channelUuid: channel.callbell_channel_uuid,
      templateUuid: channel.template_registration_uuid as string,
      values: ["مشارك تجريبي", "اختبار إعدادات Fiper", "موعد تجريبي", "هذه رسالة اختبار من لوحة Fiper"],
      registrationId: "dashboard-test",
      deliveryId: crypto.randomUUID(),
    });
    return Response.json({ ok: true, messageId: result.uuid });
  } catch (error) {
    return Response.json({ message: error instanceof Error ? error.message : "تعذر إرسال الرسالة التجريبية." }, { status: 502 });
  }
}
