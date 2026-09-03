import { createAdminClient } from "@/lib/supabase/admin";
import { isCallbellConfigured, sendCallbellTemplate } from "@/lib/integrations/callbell";

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord { return value && typeof value === "object" ? value as JsonRecord : {}; }
function first(value: unknown): JsonRecord | undefined { return Array.isArray(value) ? value.find((item): item is JsonRecord => Boolean(item && typeof item === "object")) : value && typeof value === "object" ? value as JsonRecord : undefined; }
function text(value: unknown, fallback = "") { return typeof value === "string" && value.trim() ? value : fallback; }
function escapeHtml(value: string) { return value.replace(/[&<>\"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char] ?? char)); }
function formatStartsAt(value: string, timezone: string) { const timestamp = Date.parse(value); if (!Number.isFinite(timestamp)) return value || "—"; try { return new Intl.DateTimeFormat("ar", { dateStyle: "full", timeStyle: "short", timeZone: timezone || "UTC" }).format(new Date(timestamp)); } catch { return new Intl.DateTimeFormat("ar", { dateStyle: "full", timeStyle: "short", timeZone: "UTC" }).format(new Date(timestamp)); } }

function timezoneLabel(timezone: string) {
  const labels: Record<string, string> = {
    "Europe/Berlin": "ألمانيا (برلين)",
    "Europe/Istanbul": "تركيا (إسطنبول)",
    "Asia/Qatar": "قطر (الدوحة)",
    "Africa/Casablanca": "المغرب (الدار البيضاء)",
    "Asia/Dubai": "الإمارات (دبي)",
    "Europe/Paris": "فرنسا (باريس)",
    "Europe/London": "المملكة المتحدة (لندن)",
  };
  return labels[timezone] ?? `التوقيت المحلي للدورة (${timezone || "UTC"})`;
}

function reminderLead(templateKey: string) {
  if (templateKey === "course_reminder_24h") return "تذكير: لديك دورة غداً:";
  if (templateKey === "course_reminder_day") return "تذكير: لديك دورة اليوم:";
  if (templateKey === "meeting_reminder") return "تبدأ الدورة خلال 10 دقائق:";
  return "تذكير بالدورة:";
}

async function sendResend(to: string, name: string, title: string, startsAt: string, sourceTimezone: string, saudiStartsAt: string, templateKey: string, meetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return { configured: false as const, provider: "resend" as const, reason: "Resend is not configured (RESEND_API_KEY and RESEND_FROM_EMAIL are required)." };
  const reminderHtml = meetUrl ? `<p>رابط الدخول: <a href="${escapeHtml(meetUrl)}">${escapeHtml(meetUrl)}</a></p>` : `<p>رابط الدخول غير متاح حتى الآن.</p>`;
  const isRegistrationConfirmation = templateKey === "registration_confirmation";
  const subject = isRegistrationConfirmation ? `تأكيد التسجيل - ${title}` : `تذكير بالدورة - ${title}`;
  const html = isRegistrationConfirmation
    ? `<div dir="rtl" lang="ar"><p>مرحباً ${escapeHtml(name)} 👋</p><p>تم تأكيد تسجيلك في دورة <strong>${escapeHtml(title)}</strong>.</p><p>موعد الدورة:</p><p>${escapeHtml(timezoneLabel(sourceTimezone))}: ${escapeHtml(startsAt)}</p><p>بتوقيت السعودية: ${escapeHtml(saudiStartsAt)}</p><p>سنرسل لك رابط الدخول والتذكيرات قبل الموعد.</p><p>أكاديمية Fiper</p></div>`
    : `<div dir="rtl" lang="ar"><p>مرحباً ${escapeHtml(name)} 👋</p><p>${reminderLead(templateKey)}</p><p><strong>${escapeHtml(title)}</strong></p><p>موعد الدورة:</p><p>${escapeHtml(timezoneLabel(sourceTimezone))}: ${escapeHtml(startsAt)}</p><p>بتوقيت السعودية: ${escapeHtml(saudiStartsAt)}</p>${reminderHtml}<p>أكاديمية Fiper</p></div>`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  const body = await response.json().catch(() => ({})) as JsonRecord;
  if (!response.ok) throw new Error(text(body.message, `Resend returned ${response.status}`));
  return { configured: true as const, provider: "resend" as const, id: text(body.id) };
}
async function sendTwilio(to: string, name: string, title: string, startsAt: string, templateKey: string, meetUrl: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!sid || !token || !from) return { configured: false as const, provider: "twilio" as const, reason: "Twilio is not configured (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_WHATSAPP_FROM are required)." };
  const body = new URLSearchParams({ From: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`, To: `whatsapp:${to}` });
  const contentSid = templateKey !== "registration_confirmation" ? process.env.TWILIO_WHATSAPP_REMINDER_CONTENT_SID : process.env.TWILIO_WHATSAPP_CONTENT_SID;
  if (contentSid) {
    body.set("ContentSid", contentSid);
    body.set("ContentVariables", JSON.stringify({ "1": name, "2": title, "3": startsAt, "4": meetUrl }));
  } else {
    body.set("Body", templateKey !== "registration_confirmation" ? `Meeting link for ${title} at ${startsAt}: ${meetUrl}` : `Registration confirmed for ${name}: ${title}. Time: ${startsAt}.`);
  }
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const result = await response.json().catch(() => ({})) as JsonRecord;
  if (!response.ok) throw new Error(text(result.message, `Twilio returned ${response.status}`));
  return { configured: true as const, provider: "twilio" as const, id: text(result.sid) };
}

function callbellTemplateFor(templateKey: string) {
  const templates: Record<string, string | undefined> = {
    registration_confirmation: process.env.CALLBELL_TEMPLATE_REGISTRATION,
    course_reminder_24h: process.env.CALLBELL_TEMPLATE_REMINDER_DAY,
    course_reminder_day: process.env.CALLBELL_TEMPLATE_REMINDER_TODAY,
    meeting_reminder: process.env.CALLBELL_TEMPLATE_JOIN_NOW,
  };
  return templates[templateKey];
}

async function sendWhatsApp(to: string, name: string, title: string, startsAt: string, templateKey: string, meetUrl: string, registrationId: string, deliveryId: string) {
  if (isCallbellConfigured()) {
    const templateUuid = callbellTemplateFor(templateKey);
    if (!templateUuid) return { configured: false as const, provider: "callbell" as const, reason: `Callbell template is not configured for ${templateKey}.` };
    const values = templateKey === "registration_confirmation" ? [name, title, startsAt] : [name, title, startsAt, meetUrl];
    const result = await sendCallbellTemplate({ to, templateUuid, values, registrationId, deliveryId });
    return { configured: true as const, provider: "callbell" as const, id: text(result.uuid) };
  }
  return sendTwilio(to, name, title, startsAt, templateKey, meetUrl);
}
async function ensureDelivery(supabase: ReturnType<typeof createAdminClient>, registration: JsonRecord, channel: "email" | "whatsapp", templateKey = "registration_confirmation", scheduledFor = new Date().toISOString()) {
  const registrationId = text(registration.id);
  // Reminder deliveries must be unique per scheduled occurrence so a rescheduled course gets a new reminder.
  // Registration confirmations remain one-time per registration/channel.
  const occurrence = templateKey === "registration_confirmation" ? "" : `:${new Date(scheduledFor).toISOString()}`;
  const key = `${registrationId}:${templateKey}:${channel}${occurrence}`;
  const { data: existing } = await supabase.from("message_deliveries").select("id,state,attempt_count").eq("idempotency_key", key).maybeSingle();
  if (existing) return existing as JsonRecord;
  const { data } = await supabase.from("message_deliveries").insert({ registration_id: registrationId, channel, template_key: templateKey, provider: channel === "email" ? "resend" : (isCallbellConfigured() ? "callbell" : "twilio"), state: new Date(scheduledFor).getTime() <= Date.now() ? "queued" : "scheduled", scheduled_for: scheduledFor, idempotency_key: key }).select("id,state,attempt_count").single();
  return data as JsonRecord;
}

async function processDelivery(supabase: ReturnType<typeof createAdminClient>, delivery: JsonRecord) {
  const id = text(delivery.id);
  const { data: registrationData, error } = await supabase.from("registrations").select("id,full_name,email,phone_e164,whatsapp_consent,course_sessions(starts_at,timezone,meet_url,courses(state,is_featured,course_translations(title,locale)))").eq("id", text(delivery.registration_id)).maybeSingle();
  if (error || !registrationData) return { id, state: "failed", reason: "Registration not found" };
  const registration = record(registrationData);
  const session = first(registration.course_sessions);
  const course = first(session?.courses);
  const translations = Array.isArray(course?.course_translations) ? course.course_translations as unknown[] : [];
  const translation = translations.map(record).find((item) => text(item.locale) === "ar") ?? record(translations[0]);
  const name = text(registration.full_name, "Participant");
  const title = text(translation.title, "Fiper course");
  const sourceTimezone = text(session?.timezone, "UTC");
  const startsAtIso = text(session?.starts_at, "");
  const startsAt = formatStartsAt(startsAtIso, sourceTimezone);
  const saudiStartsAt = formatStartsAt(startsAtIso, "Asia/Riyadh");
  const meetUrl = text(session?.meet_url);
  const templateKey = text(delivery.template_key, "registration_confirmation");
  if (templateKey !== "registration_confirmation" && (text(course?.state) !== "published" || course?.is_featured !== true)) {
    const reason = "Course is not featured and published";
    await supabase.from("message_deliveries").update({ state: "cancelled", failure_reason: reason, updated_at: new Date().toISOString() }).eq("id", id);
    return { id, state: "cancelled", reason };
  }
  const channel = text(delivery.channel) as "email" | "whatsapp";
  const result = channel === "email" ? await sendResend(text(registration.email), name, title, startsAt, sourceTimezone, saudiStartsAt, templateKey, meetUrl) : await sendWhatsApp(text(registration.phone_e164), name, title, startsAt, templateKey, meetUrl, text(registration.id), id);
  if (!result.configured) return { id, state: "queued", reason: result.reason };
  await supabase.from("message_deliveries").update({ state: "sent", sent_at: new Date().toISOString(), provider_message_id: result.id || null, provider_payload: { provider: result.provider }, failure_reason: null, attempt_count: Number(delivery.attempt_count) + 1, updated_at: new Date().toISOString() }).eq("id", id);
  return { id, state: "sent" };
}

function localMorningTimestamp(startAtMs: number, timezone: string) {
  const format = new Intl.DateTimeFormat("en-US", { timeZone: timezone || "UTC", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const parts = Object.fromEntries(format.formatToParts(new Date(startAtMs)).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  const naive = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), 9, 0, 0);
  const offsetParts = Object.fromEntries(format.formatToParts(new Date(naive)).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  const localAsUtc = Date.UTC(Number(offsetParts.year), Number(offsetParts.month) - 1, Number(offsetParts.day), Number(offsetParts.hour), Number(offsetParts.minute), Number(offsetParts.second));
  return naive - (localAsUtc - naive);
}

async function scheduleReminders(supabase: ReturnType<typeof createAdminClient>, registration: JsonRecord) {
  if (text(registration.status) !== "confirmed") return;
  const session = first(registration.course_sessions);
  const course = first(session?.courses);
  if (text(course?.state) !== "published" || course?.is_featured !== true) return;
  const startsAtMs = Date.parse(text(session?.starts_at));
  const meetUrl = text(session?.meet_url);
  if (!meetUrl || !Number.isFinite(startsAtMs) || startsAtMs <= Date.now()) return;
  const timezone = text(session?.timezone, "UTC");
  const reminders = [
    ["course_reminder_24h", startsAtMs - 24 * 60 * 60 * 1000],
    ["course_reminder_day", localMorningTimestamp(startsAtMs, timezone)],
    ["meeting_reminder", startsAtMs - 10 * 60 * 1000],
  ] as const;
  const now = Date.now();
  for (const [templateKey, timestamp] of reminders) {
    if (timestamp <= now) continue;
    const scheduledFor = new Date(timestamp).toISOString();
    await ensureDelivery(supabase, registration, "email", templateKey, scheduledFor);
    if (registration.whatsapp_consent) await ensureDelivery(supabase, registration, "whatsapp", templateKey, scheduledFor);
  }
}
async function run() {
  const supabase = createAdminClient();
  const { data: events } = await supabase.from("outbox_events").select("id,aggregate_id,payload,attempts").is("processed_at", null).lte("available_at", new Date().toISOString()).order("created_at", { ascending: true }).limit(25);
  let created = 0;
  for (const event of events ?? []) {
    const payload = record(event.payload);
    const registrationId = text(payload.registration_id, text(event.aggregate_id));
    const { data: registration } = await supabase.from("registrations").select("id,email,phone_e164,whatsapp_consent,status,course_sessions(starts_at,meet_url,courses(state,is_featured))").eq("id", registrationId).maybeSingle();
    if (!registration) { await supabase.from("outbox_events").update({ processed_at: new Date().toISOString() }).eq("id", event.id); continue; }
    const row = record(registration);
    await ensureDelivery(supabase, row, "email");
    if (row.whatsapp_consent) await ensureDelivery(supabase, row, "whatsapp");
    await scheduleReminders(supabase, row);
    await supabase.from("outbox_events").update({ processed_at: new Date().toISOString(), attempts: Number(event.attempts ?? 0) + 1 }).eq("id", event.id);
    created += 1;
  }
  // Reconcile reminders on every run as well, so adding a Meet URL after registration still schedules it.
  const { data: confirmedRegistrations } = await supabase.from("registrations").select("id,email,phone_e164,whatsapp_consent,status,course_sessions(starts_at,meet_url,courses(state,is_featured))").eq("status", "confirmed").limit(200);
  for (const registration of confirmedRegistrations ?? []) {
    await scheduleReminders(supabase, record(registration));
  }
  const { data: queued } = await supabase.from("message_deliveries").select("id,registration_id,channel,template_key,state,scheduled_for,attempt_count").in("state", ["scheduled", "queued"]).lte("scheduled_for", new Date().toISOString()).order("created_at", { ascending: true }).limit(50);
  const results = [];
  for (const delivery of queued ?? []) {

    try { results.push(await processDelivery(supabase, record(delivery))); } catch (error) { const reason = error instanceof Error ? error.message : "Provider request failed"; await supabase.from("message_deliveries").update({ state: "failed", failure_reason: reason, attempt_count: Number(delivery.attempt_count ?? 0) + 1, updated_at: new Date().toISOString() }).eq("id", delivery.id); results.push({ id: delivery.id, state: "failed", reason }); }
  }
  return { processedEvents: created, deliveries: results };
}

async function handler(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ error: "CRON_SECRET is not configured" }, { status: 503 });
  const authorization = request.headers.get("authorization");
  const supplied = authorization?.startsWith("Bearer ") ? authorization.slice(7) : request.headers.get("x-cron-secret");
  if (supplied !== secret) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try { return Response.json(await run()); } catch (error) { console.error("outbox_processing_failed", error); return Response.json({ error: "Outbox processing failed" }, { status: 500 }); }
}

export const GET = handler;
export const POST = handler;