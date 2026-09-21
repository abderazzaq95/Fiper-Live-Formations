type CallbellTemplateRequest = {
  to: string;
  templateUuid: string;
  values?: string[];
  registrationId: string;
  deliveryId: string;
};

type CallbellSendResult = {
  uuid: string;
  status?: string;
  messageStatusPayload?: unknown;
};

export function isCallbellConfigured() {
  return Boolean(
    process.env.CALLBELL_API_KEY &&
    process.env.CALLBELL_CHANNEL_UUID,
  );
}

export async function sendCallbellTemplate(input: CallbellTemplateRequest) {
  const apiKey = process.env.CALLBELL_API_KEY;
  const channelUuid = process.env.CALLBELL_CHANNEL_UUID;
  if (!apiKey || !channelUuid) {
    throw new Error("callbell_not_configured");
  }

  const response = await fetch("https://api.callbell.eu/v1/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      to: input.to,
      from: "whatsapp",
      // Callbell keeps the message type as the media/text type even when a template_uuid is supplied.
      type: "text",
      channel_uuid: channelUuid,
      content: {
        // The API requires content for the request; template_values are used for multi-variable templates.
        text: input.values?.[0] ?? "",
      },
      template_uuid: input.templateUuid,
      template_values: input.values ?? [],
      optin_contact: true,
      metadata: {
        registration_id: input.registrationId,
        delivery_id: input.deliveryId,
        source: "fiper_academy",
      },
    }),
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) {
    const providerBody = await response.text();
    throw new Error(`callbell_send_failed:${response.status}:${providerBody.slice(0, 300)}`);
  }

  return (await response.json()) as CallbellSendResult;
}


export async function sendCallbellText(input: { to: string; text: string }) {
  const apiKey = process.env.CALLBELL_API_KEY;
  const channelUuid = process.env.CALLBELL_CHANNEL_UUID;
  if (!apiKey || !channelUuid) throw new Error("callbell_not_configured");
  const response = await fetch("https://api.callbell.eu/v1/messages/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ to: input.to, from: "whatsapp", type: "text", channel_uuid: channelUuid, content: { text: input.text }, optin_contact: true }),
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`callbell_send_failed:${response.status}`);
  return (await response.json()) as CallbellSendResult;
}

export function mapCallbellStatus(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("read")) return "read";
  if (normalized.includes("deliver")) return "delivered";
  if (normalized.includes("sent")) return "sent";
  if (normalized.includes("fail") || normalized.includes("error")) return "failed";
  return "sent";
}
