import { z } from "zod";
import { getDashboardIdentity } from "@/lib/auth";
import { buildCourseEmail } from "@/lib/email/course-email";
import { createAdminClient } from "@/lib/supabase/admin";

type Row = Record<string, unknown>;

const schema = z.object({ email: z.string().trim().toLowerCase().email().max(180) });

function object(value: unknown): Row {
  return value && typeof value === "object" ? value as Row : {};
}

function string(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export async function POST(request: Request) {
  const identity = await getDashboardIdentity();
  if (!identity || identity.role !== "admin") return Response.json({ message: "غير مصرح لك بتنفيذ هذا الإجراء." }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ message: "بيانات الطلب غير صالحة." }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ message: "أدخل بريدًا إلكترونيًا صالحًا." }, { status: 422 });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return Response.json({ message: "خدمة البريد غير مهيأة في بيئة الإنتاج." }, { status: 503 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("course_sessions")
    .select("starts_at,timezone,delivery_type,meet_url,venue_name,venue_address,maps_url,courses!inner(state,is_featured,course_translations(title,locale))")
    .order("starts_at", { ascending: true })
    .limit(30);
  if (error) return Response.json({ message: "تعذر تحميل بيانات دورة للاختبار." }, { status: 500 });

  const sessions = (data ?? []) as unknown as Row[];
  const session = sessions.find((item) => string(object(item.courses).state) === "published" && object(item.courses).is_featured === true)
    ?? sessions.find((item) => string(object(item.courses).state) === "published");
  const course = object(session?.courses);
  const translations = Array.isArray(course.course_translations) ? course.course_translations.map(object) : [];
  const translation = translations.find((item) => string(item.locale) === "ar") ?? translations[0];
  const timezone = string(session?.timezone, "Europe/Berlin");
  const startsAtValue = string(session?.starts_at, "2026-11-04T20:30:00+01:00");
  const deliveryType = string(session?.delivery_type) === "onsite" ? "onsite" as const : "online" as const;
  const actionUrl = deliveryType === "onsite" ? string(session?.maps_url) : string(session?.meet_url);
  const venue = [string(session?.venue_name), string(session?.venue_address)].filter(Boolean).join("، ");
  const startsAt = new Intl.DateTimeFormat("ar", { dateStyle: "full", timeStyle: "short", timeZone: timezone }).format(new Date(startsAtValue));
  const email = buildCourseEmail({
    name: identity.name,
    title: string(translation?.title, "دورة Fiper التعليمية"),
    startsAt,
    timezone,
    templateKey: "registration_confirmation",
    attendanceDetails: deliveryType === "onsite" ? venue || "سيتم إرسال عنوان المكان قبل الموعد" : "عبر Google Meet",
    deliveryType,
    actionUrl,
  });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [parsed.data.email], subject: `[اختبار] ${email.subject}`, html: email.html, text: email.text }),
  });
  const result = await response.json().catch(() => ({})) as Row;
  if (!response.ok) return Response.json({ message: string(result.message, "تعذر إرسال رسالة الاختبار.") }, { status: 502 });
  return Response.json({ ok: true, message: "تم إرسال رسالة الاختبار." });
}
