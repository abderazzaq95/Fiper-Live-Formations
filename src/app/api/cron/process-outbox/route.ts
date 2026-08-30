import { createAdminClient } from "@/lib/supabase/admin";

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord { return value && typeof value === "object" ? value as JsonRecord : {}; }
function first(value: unknown): JsonRecord | undefined { return Array.isArray(value) ? value.find((item): item is JsonRecord => Boolean(item && typeof item === "object")) : value && typeof value === "object" ? value as JsonRecord : undefined; }
function text(value: unknown, fallback = "") { return typeof value === "string" && value.trim() ? value : fallback; }
function escapeHtml(value: string) { return value.replace(/[&<>\"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char] ?? char)); }
function formatStartsAt(value: string, timezone: string) { const timestamp = Date.parse(value); if (!Number.isFinite(timestamp)) return value || "—"; try { return new Intl.DateTimeFormat("ar", { dateStyle: "full", timeStyle: "short", timeZone: timezone || "UTC" }).format(new Date(timestamp)); } catch { return new Intl.DateTimeFormat("ar", { dateStyle: "full", timeStyle: "short", timeZone: "UTC" }).format(new Date(timestamp)); } }

async function sendResend(to: string, name: string, title: string, startsAt: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return { configured: false as const, reason: "Resend is not configured (RESEND_API_KEY and RESEND_FROM_EMAIL are required)." };
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Registration confirmed - ${title}`,
      html: `<div dir="rtl" lang="ar"><p>\u0645\u0631\u062d\u0628\u0627 ${escapeHtml(name)}\u060c</p><p>\u062a\u0645 \u062a\u0623\u0643\u064a\u062f \u062a\u0633\u062c\u064a\u0644\u0643 \u0641\u064a \u062f\u0648\u0631\u0629 <strong>${escapeHtml(title)}</strong>.</p><p>\u0645\u0648\u0639\u062f \u0627\u0644\u062f\u0648\u0631\u0629: ${escapeHtml(startsAt)}</p><p>\u0633\u0646\u0631\u0633\u0644 \u0644\u0643 \u0631\u0627\u0628\u0637 \u0627\u0644\u062f\u062e\u0648\u0644 \u0648\u0627\u0644\u062a\u0630\u0643\u064a\u0631\u0627\u062a \u0642\u0628\u0644 \u0627\u0644\u0645\u0648\u0639\u062f.</p><p>Fiper</p></div>`,
    }),
  });
  const body = await response.json().catch(() => ({})) as JsonRecord;
  if (!response.ok) throw new Error(text(body.message, `Resend returned ${response.status}`));
  return { configured: true as const, id: text(body.id) };
}

async function sendTwilio(to: string, name: string, title: string, startsAt: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!sid || !token || !from) return { configured: false as const, reason: "Twilio is not configured (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_WHATSAPP_FROM are required)." };
  const body = new URLSearchParams({ From: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`, To: `whatsapp:${to}` });
  const contentSid = process.env.TWILIO_WHATSAPP_CONTENT_SID;
  if (contentSid) {
    body.set("ContentSid", contentSid);
    body.set("ContentVariables", JSON.stringify({ "1": name, "2": title, "3": startsAt }));
  } else {
    body.set("Body", `Registration confirmed for ${name}: ${title}. Time: ${startsAt}.`);
  }
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const result = await response.json().catch(() => ({})) as JsonRecord;
  if (!response.ok) throw new Error(text(result.message, `Twilio returned ${response.status}`));
  return { configured: true as const, id: text(result.sid) };
}

async function ensureDelivery(supabase: ReturnType<typeof createAdminClient>, registration: JsonRecord, channel: "email" | "whatsapp") {
  const registrationId = text(registration.id);
  const key = `${registrationId}:registration-confirmation:${channel}`;
  const { data: existing } = await supabase.from("message_deliveries").select("id,state,attempt_count").eq("idempotency_key", key).maybeSingle();
  if (existing) return existing as JsonRecord;
  const { data } = await supabase.from("message_deliveries").insert({ registration_id: registrationId, channel, template_key: "registration_confirmation", provider: channel === "email" ? "resend" : "twilio", state: "queued", scheduled_for: new Date().toISOString(), idempotency_key: key }).select("id,state,attempt_count").single();
  return data as JsonRecord;
}

async function processDelivery(supabase: ReturnType<typeof createAdminClient>, delivery: JsonRecord) {
  const id = text(delivery.id);
  const { data: registrationData, error } = await supabase.from("registrations").select("id,full_name,email,phone_e164,whatsapp_consent,course_sessions(starts_at,timezone,courses(course_translations(title,locale)))").eq("id", text(delivery.registration_id)).maybeSingle();
  if (error || !registrationData) return { id, state: "failed", reason: "Registration not found" };
  const registration = record(registrationData);
  const session = first(registration.course_sessions);
  const course = first(session?.courses);
  const translations = Array.isArray(course?.course_translations) ? course.course_translations as unknown[] : [];
  const translation = translations.map(record).find((item) => text(item.locale) === "ar") ?? record(translations[0]);
  const name = text(registration.full_name, "Participant");
  const title = text(translation.title, "Fiper course");
  const startsAt = formatStartsAt(text(session?.starts_at, ""), text(session?.timezone, "UTC"));
  const channel = text(delivery.channel) as "email" | "whatsapp";
  const result = channel === "email" ? await sendResend(text(registration.email), name, title, startsAt) : await sendTwilio(text(registration.phone_e164), name, title, startsAt);
  if (!result.configured) return { id, state: "queued", reason: result.reason };
  await supabase.from("message_deliveries").update({ state: "sent", sent_at: new Date().toISOString(), provider_message_id: result.id || null, provider_payload: { provider: channel === "email" ? "resend" : "twilio" }, failure_reason: null, attempt_count: Number(delivery.attempt_count) + 1, updated_at: new Date().toISOString() }).eq("id", id);
  return { id, state: "sent" };
}

async function run() {
  const supabase = createAdminClient();
  const { data: events } = await supabase.from("outbox_events").select("id,aggregate_id,payload,attempts").is("processed_at", null).lte("available_at", new Date().toISOString()).order("created_at", { ascending: true }).limit(25);
  let created = 0;
  for (const event of events ?? []) {
    const payload = record(event.payload);
    const registrationId = text(payload.registration_id, text(event.aggregate_id));
    const { data: registration } = await supabase.from("registrations").select("id,email,phone_e164,whatsapp_consent").eq("id", registrationId).maybeSingle();
    if (!registration) { await supabase.from("outbox_events").update({ processed_at: new Date().toISOString() }).eq("id", event.id); continue; }
    const row = record(registration);
    await ensureDelivery(supabase, row, "email");
    if (row.whatsapp_consent) await ensureDelivery(supabase, row, "whatsapp");
    await supabase.from("outbox_events").update({ processed_at: new Date().toISOString(), attempts: Number(event.attempts ?? 0) + 1 }).eq("id", event.id);
    created += 1;
  }
  const { data: queued } = await supabase.from("message_deliveries").select("id,registration_id,channel,state,attempt_count").in("state", ["scheduled", "queued"]).lte("scheduled_for", new Date().toISOString()).order("created_at", { ascending: true }).limit(50);
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