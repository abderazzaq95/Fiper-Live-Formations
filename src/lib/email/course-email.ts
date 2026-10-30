export type CourseEmailTemplateKey = "registration_confirmation" | "course_reminder_24h" | "course_reminder_day" | "meeting_reminder";

export type CourseEmailInput = {
  name: string;
  title: string;
  startsAt: string;
  timezone: string;
  templateKey: CourseEmailTemplateKey | string;
  attendanceDetails: string;
  deliveryType: "online" | "onsite";
  actionUrl?: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char] ?? char));
}

export function formatFiperEmailSender(value: string) {
  const address = value.match(/<([^>]+)>/)?.[1]?.trim() ?? value.trim();
  return address.includes("@") ? `Fiper Academy <${address}>` : value;
}

export function formatCourseTimezone(timezone: string) {
  const labels: Record<string, string> = {
    "Europe/Berlin": "ألمانيا، توقيت برلين",
    "Europe/Istanbul": "تركيا، توقيت إسطنبول",
    "Asia/Qatar": "قطر، توقيت الدوحة",
    "Africa/Casablanca": "المغرب، توقيت الدار البيضاء",
    "Asia/Amman": "الأردن، توقيت عمّان",
    "Asia/Riyadh": "السعودية، توقيت الرياض",
    "Asia/Beirut": "لبنان، توقيت بيروت",
    "Asia/Muscat": "عُمان، توقيت مسقط",
    "Asia/Dubai": "الإمارات، توقيت دبي",
    "Asia/Baghdad": "العراق، توقيت بغداد",
    "Europe/Paris": "فرنسا، توقيت باريس",
    "Europe/London": "المملكة المتحدة، توقيت لندن",
  };
  return labels[timezone] ?? "التوقيت المحلي للدورة";
}

function safeActionUrl(value?: string) {
  const rawValue = value?.trim() ?? "";
  if (!rawValue) return "";

  const candidate = rawValue.startsWith("//")
    ? `https:${rawValue}`
    : /^https?:\/\//i.test(rawValue)
      ? rawValue
      : `https://${rawValue}`;

  try {
    const url = new URL(candidate);
    if (!url.hostname.includes(".")) return "";
    url.protocol = "https:";
    return url.toString();
  } catch {
    return "";
  }
}

function messageFor(templateKey: string) {
  if (templateKey === "course_reminder_24h") return { eyebrow: "تذكير بموعدك", heading: "موعد الدورة غدًا", intro: "نذكّرك بأن موعد دورتك أصبح قريبًا." };
  if (templateKey === "course_reminder_day") return { eyebrow: "موعدك اليوم", heading: "نراك اليوم في الدورة", intro: "هذه رسالة تذكير بموعد دورتك اليوم." };
  if (templateKey === "meeting_reminder") return { eyebrow: "تبدأ بعد 10 دقائق", heading: "حان وقت الانضمام", intro: "دورتك على وشك البدء. استخدم زر الحضور للوصول مباشرة." };
  return { eyebrow: "تم تأكيد تسجيلك بنجاح", heading: "ننتظرك في الدورة", intro: "حُجز مقعدك، وستصلك التذكيرات المهمة قبل الموعد." };
}

export function buildCourseEmail(input: CourseEmailInput) {
  const copy = messageFor(input.templateKey);
  const actionUrl = safeActionUrl(input.actionUrl);
  const attendanceLabel = input.deliveryType === "onsite" ? "دورة حضورية" : "دورة أونلاين";
  const attendanceDetails = input.deliveryType === "online" && actionUrl ? "عبر Google Meet" : input.attendanceDetails;
  const actionLabel = input.deliveryType === "onsite"
    ? "عرض موقع الدورة"
    : input.templateKey === "meeting_reminder"
      ? "ادخل إلى الدورة الآن"
      : "الانضمام إلى الدورة";
  const actionHint = input.deliveryType === "onsite" ? "يفتح الزر موقع الدورة على Google Maps." : "يفتح الزر رابط المشاركة في الدورة.";
  const subject = input.templateKey === "registration_confirmation" ? `تأكيد التسجيل - ${input.title}` : `تذكير بالدورة - ${input.title}`;
  const button = actionUrl ? `
    <tr>
      <td align="center" style="padding:0 32px 28px;">
        <a href="${escapeHtml(actionUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#cf262c;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;line-height:20px;padding:14px 34px;border-radius:6px;">${actionLabel}</a>
        <p style="margin:12px 0 0;color:#8a949c;font-size:12px;line-height:20px;">${actionHint}</p>
      </td>
    </tr>` : "";

  const html = `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="color-scheme" content="light only">
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f1f3f4;color:#071f31;font-family:Tahoma,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(copy.heading)} — ${escapeHtml(input.title)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f1f3f4;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-collapse:separate;border-spacing:0;border-radius:10px;overflow:hidden;box-shadow:0 8px 24px rgba(7,31,49,.08);">
            <tr>
              <td align="center" style="padding:24px 24px 20px;border-bottom:3px solid #cf262c;background:#ffffff;">
                <img src="https://fiperacademy.com/brand/fiper-wordmark.png" width="210" alt="Fiper" style="display:block;width:210px;max-width:70%;height:auto;border:0;">
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:34px 32px 12px;">
                <p style="margin:0 0 10px;color:#cf262c;font-size:14px;font-weight:700;line-height:22px;">${escapeHtml(copy.eyebrow)}</p>
                <h1 style="margin:0;color:#071f31;font-size:28px;font-weight:700;line-height:40px;">${escapeHtml(copy.heading)}</h1>
                <p style="margin:14px 0 0;color:#667783;font-size:15px;line-height:26px;">مرحبًا <bdi dir="auto" style="color:#344b5a;font-weight:700;unicode-bidi:isolate;">${escapeHtml(input.name)}</bdi>،</p>
                <p style="margin:4px 0 0;color:#667783;font-size:15px;line-height:26px;">${escapeHtml(copy.intro)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px 26px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f7f8f8;border:1px solid #e3e6e8;border-radius:8px;">
                  <tr><td style="padding:22px 24px 8px;color:#071f31;font-size:18px;font-weight:700;line-height:28px;">${escapeHtml(input.title)}</td></tr>
                  <tr><td style="padding:6px 24px;color:#667783;font-size:14px;line-height:24px;"><strong style="color:#344b5a;">الموعد:</strong> ${escapeHtml(input.startsAt)}</td></tr>
                  <tr><td style="padding:6px 24px;color:#667783;font-size:14px;line-height:24px;"><strong style="color:#344b5a;">التوقيت:</strong> ${escapeHtml(input.timezone)}</td></tr>
                  <tr><td style="padding:6px 24px;color:#667783;font-size:14px;line-height:24px;"><strong style="color:#344b5a;">نوع الحضور:</strong> ${attendanceLabel}</td></tr>
                  <tr><td style="padding:6px 24px 22px;color:#667783;font-size:14px;line-height:24px;"><strong style="color:#344b5a;">تفاصيل الحضور:</strong> ${escapeHtml(attendanceDetails)}</td></tr>
                </table>
              </td>
            </tr>
            ${button}
            <tr>
              <td align="center" style="padding:20px 32px 24px;border-top:1px solid #eceeef;color:#8a949c;font-size:12px;line-height:21px;">
                <p style="margin:0;">نتمنى لك حضورًا موفقًا وتجربة تعليمية مفيدة.</p>
                <p style="margin:6px 0 0;">Fiper Academy</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    copy.heading,
    `مرحبًا ${input.name}، ${copy.intro}`,
    input.title,
    `الموعد: ${input.startsAt}`,
    `التوقيت: ${input.timezone}`,
    `نوع الحضور: ${attendanceLabel}`,
    `تفاصيل الحضور: ${attendanceDetails}`,
    actionUrl ? `${actionLabel}: ${actionUrl}` : "",
    "Fiper Academy",
  ].filter(Boolean).join("\n\n");

  return { subject, html, text };
}
