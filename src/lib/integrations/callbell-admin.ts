import "server-only";

const CALLBELL_API_URL = "https://api.callbell.eu/v1";

type JsonRecord = Record<string, unknown>;

export type CallbellChannelResource = {
  uuid: string;
  title: string;
  type: string;
  main: boolean;
};

export type CallbellTemplateResource = {
  uuid: string;
  title: string;
  status: string;
  text: string;
  category: string;
};

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function apiKey() {
  const value = process.env.CALLBELL_API_KEY;
  if (!value) throw new Error("Callbell API key is not configured.");
  return value;
}

async function callbellGet(path: string) {
  const response = await fetch(`${CALLBELL_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${apiKey()}`, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });
  const body = await response.json().catch(() => ({})) as JsonRecord;
  if (!response.ok) throw new Error(text(body.error) || `Callbell returned ${response.status}.`);
  return body;
}

function pageCount(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) return 1;
  if (parsed > 1_000) throw new Error("Callbell returned an unexpected template page count.");
  return parsed;
}

async function listAllCallbellTemplates() {
  const firstPage = await callbellGet("/templates?page=1");
  const meta = firstPage.meta && typeof firstPage.meta === "object" ? firstPage.meta as JsonRecord : {};
  const pages = pageCount(meta.pages);
  const bodies = [firstPage];

  // Fetch a few pages at a time so large accounts load fully without flooding Callbell.
  for (let start = 2; start <= pages; start += 5) {
    const end = Math.min(start + 4, pages);
    const batch = await Promise.all(
      Array.from({ length: end - start + 1 }, (_, index) => callbellGet(`/templates?page=${start + index}`)),
    );
    bodies.push(...batch);
  }

  return bodies.flatMap((body) => Array.isArray(body.templates) ? body.templates : []);
}

export async function listCallbellResources() {
  const [channelBody, rawTemplates] = await Promise.all([
    callbellGet("/channels"),
    listAllCallbellTemplates(),
  ]);
  const rawChannels = Array.isArray(channelBody.channels) ? channelBody.channels : [];
  const channels = rawChannels.map((item) => item as JsonRecord).map((item): CallbellChannelResource => ({
    uuid: text(item.uuid).replaceAll("-", "").toLowerCase(),
    title: text(item.title) || "WhatsApp",
    type: text(item.type),
    main: item.main === true,
  })).filter((item) => /^[a-f0-9]{32}$/.test(item.uuid) && item.type === "whatsapp");
  const templates = rawTemplates.map((item) => item as JsonRecord).map((item): CallbellTemplateResource => ({
    uuid: text(item.uuid).replaceAll("-", "").toLowerCase(),
    title: text(item.title) || "Template",
    status: text(item.status).toLowerCase(),
    text: text(item.text),
    category: text(item.category),
  })).filter((item) => /^[a-f0-9]{32}$/.test(item.uuid));
  const uniqueTemplates = [...new Map(templates.map((template) => [template.uuid, template])).values()]
    .sort((first, second) => first.title.localeCompare(second.title, "en", { numeric: true, sensitivity: "base" }));
  return { channels, templates: uniqueTemplates };
}

export async function verifyCallbellChannel(channelUuid: string, templateUuids: string[]) {
  const [channelBody, ...templateBodies] = await Promise.all([
    callbellGet(`/channels/${channelUuid}`),
    ...templateUuids.map((uuid) => callbellGet(`/templates/${uuid}`)),
  ]);
  const channel = channelBody.channel as JsonRecord | undefined;
  if (!channel || text(channel.type) !== "whatsapp") throw new Error("القناة المحددة ليست قناة واتساب صالحة في Callbell.");
  const rejected = templateBodies.map((body) => body.template as JsonRecord | undefined)
    .filter((template) => !template || text(template.status).toLowerCase() !== "approved");
  if (rejected.length) throw new Error("واحد أو أكثر من القوالب غير معتمد في Callbell.");
  return true;
}
