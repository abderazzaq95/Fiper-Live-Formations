import { createClient } from "@supabase/supabase-js";
import { mapCallbellStatus } from "@/lib/integrations/callbell";

export async function POST(request: Request) {
  const expectedSecret = process.env.CALLBELL_WEBHOOK_SECRET;
  const suppliedSecret = request.headers.get("x-fiper-webhook-secret");
  if (!expectedSecret || suppliedSecret !== expectedSecret) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return Response.json({ message: "Storage is not configured" }, { status: 503 });
  }

  const body = await request.json();
  const eventName = String(body?.event ?? "");
  if (eventName !== "message_status_updated") {
    return Response.json({ received: true, ignored: true });
  }

  const message = body?.payload?.message ?? body?.payload ?? {};
  const providerMessageId = String(message?.uuid ?? message?.id ?? "");
  const providerStatus = String(message?.status ?? "");
  if (!providerMessageId || !providerStatus) {
    return Response.json({ message: "Invalid webhook payload" }, { status: 400 });
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const mappedStatus = mapCallbellStatus(providerStatus);
  const updates: Record<string, unknown> = {
    state: mappedStatus,
    provider_payload: body,
    updated_at: new Date().toISOString(),
  };
  if (mappedStatus === "delivered") updates.delivered_at = new Date().toISOString();
  if (mappedStatus === "failed") updates.failure_reason = String(message?.error ?? "Provider delivery failed").slice(0, 500);

  const { error } = await supabase
    .from("message_deliveries")
    .update(updates)
    .eq("provider_message_id", providerMessageId);

  if (error) {
    console.error("callbell_webhook_update_failed", { code: error.code });
    return Response.json({ message: "Update failed" }, { status: 500 });
  }

  return Response.json({ received: true });
}
