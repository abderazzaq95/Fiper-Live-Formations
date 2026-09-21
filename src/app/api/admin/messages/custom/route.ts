import { z } from "zod";
import { getDashboardIdentity } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCallbellConfigured, sendCallbellTemplate } from "@/lib/integrations/callbell";

const schema = z.object({
  registrationIds: z.array(z.string().uuid()).min(1).max(500),
  message: z.string().trim().min(1).max(4000),
  email: z.boolean().default(true),
  whatsapp: z.boolean().default(true),
});

function html(value: string) { return value.replace(/[&<>\"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[char] ?? char)).replace(/\n/g, "<br>"); }

export async function POST(request: Request) {
  const identity = await getDashboardIdentity();
  if (!identity || identity.role !== "admin") return Response.json({ message: "Unauthorized" }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ message: "Invalid request data." }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success || (!parsed.data.email && !parsed.data.whatsapp)) return Response.json({ message: "Choose at least one channel." }, { status: 422 });
  const supabase = createAdminClient();
  const { data: recipients, error } = await supabase.from("registrations").select("id,full_name,email,phone_e164,whatsapp_consent").in("id", parsed.data.registrationIds);
  if (error) return Response.json({ message: "Unable to load recipients." }, { status: 500 });
  let emailSent = 0, whatsappSent = 0, skipped = 0;
  const failures: string[] = [];
  for (const recipient of recipients ?? []) {
    const name = recipient.full_name || "Participant";
    const personalized = parsed.data.message.replace(/\{\{name\}\}/gi, name);
    if (parsed.data.email && recipient.email) {
      const key = process.env.RESEND_API_KEY, from = process.env.RESEND_FROM_EMAIL;
      if (!key || !from) skipped++;
      else {
        try {
          const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [recipient.email], subject: "رسالة من Fiper Academy", html: `<div dir="rtl" lang="ar"><p>${html(personalized)}</p></div>` }) });
          if (!response.ok) throw new Error("email_" + response.status);
          emailSent++;
        } catch (err) { failures.push(`email:${recipient.email}:${err instanceof Error ? err.message : "failed"}`); }
      }
    }
    if (parsed.data.whatsapp && recipient.phone_e164 && recipient.whatsapp_consent) {
      if (!isCallbellConfigured() || !process.env.CALLBELL_TEMPLATE_CUSTOM) skipped++;
      else {
        try { await sendCallbellTemplate({ to: recipient.phone_e164, templateUuid: process.env.CALLBELL_TEMPLATE_CUSTOM, values: [name, personalized], registrationId: recipient.id, deliveryId: "custom" }); whatsappSent++; }
        catch (err) { failures.push(`whatsapp:${recipient.phone_e164}:${err instanceof Error ? err.message : "failed"}`); }
      }
    }
  }
  return Response.json({ ok: true, total: recipients?.length ?? 0, emailSent, whatsappSent, skipped, failures });
}
