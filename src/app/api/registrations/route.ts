import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const registrationSchema = z.object({
  courseId: z.string().min(3).max(80),
  name: z.string().trim().min(3).max(100),
  email: z.string().trim().toLowerCase().email().max(180),
  phone: z.string().trim().min(8).max(24),
  country: z.string().trim().min(2).max(80),
  whatsappConsent: z.literal(true),
  company: z.string().optional().default(""),
});

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (phone.trim().startsWith("+")) return `+${digits}`;
  if (digits.startsWith("212")) return `+${digits}`;
  return `+212${digits.replace(/^0/, "")}`;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "البيانات المرسلة غير صالحة." }, { status: 400 });
  }

  const result = registrationSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { message: "يرجى التأكد من جميع الحقول والموافقة على استلام تفاصيل الدورة." },
      { status: 422 },
    );
  }

  if (result.data.company) {
    return Response.json({ status: "confirmed", registrationId: crypto.randomUUID() });
  }

  const payload = {
    ...result.data,
    phone: normalizePhone(result.data.phone),
    userAgent: request.headers.get("user-agent")?.slice(0, 400) ?? null,
  };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Preview mode keeps the full UX testable before staging credentials are connected.
  if (!url || !serviceKey) {
    await new Promise((resolve) => setTimeout(resolve, 650));
    return Response.json({
      status: "confirmed",
      registrationId: `preview_${crypto.randomUUID()}`,
      preview: true,
    });
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.rpc("register_course_participant", {
    p_course_id: payload.courseId,
    p_name: payload.name,
    p_email: payload.email,
    p_phone_e164: payload.phone,
    p_country: payload.country,
    p_whatsapp_consent: payload.whatsappConsent,
    p_user_agent: payload.userAgent,
  });

  if (error) {
    if (error.code === "23505" || error.message.includes("already_registered")) {
      return Response.json({ message: "أنت مسجل بالفعل في هذه الدورة. تحقق من رسائل التأكيد." }, { status: 409 });
    }
    if (error.message.includes("registration_closed")) {
      return Response.json({ message: "\u0627\u0644\u062a\u0633\u062c\u064a\u0644 \u0645\u063a\u0644\u0642 \u062d\u0627\u0644\u064a\u0627\u064b \u0644\u0647\u0630\u0647 \u0627\u0644\u062f\u0648\u0631\u0629." }, { status: 409 });
    }
    if (error.message.includes("course_full")) {
      return Response.json({ message: "\u0627\u0643\u062a\u0645\u0644\u062a \u0645\u0642\u0627\u0639\u062f \u0627\u0644\u062f\u0648\u0631\u0629. \u062a\u062d\u0642\u0642 \u0645\u0646 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0627\u0646\u062a\u0638\u0627\u0631." }, { status: 409 });
    }
    console.error("registration_failed", { code: error.code, message: error.message });
    return Response.json({ message: "تعذر حفظ التسجيل الآن. يرجى المحاولة بعد لحظات." }, { status: 500 });
  }

  const registration = Array.isArray(data) ? data[0] : data;
  return Response.json({
    status: registration?.status === "waitlisted" ? "waitlisted" : "confirmed",
    registrationId: registration?.registration_id,
  });
}
