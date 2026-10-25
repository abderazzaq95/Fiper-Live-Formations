import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type WhatsAppChannel = {
  id: string;
  label: string;
  countryName: string;
  countryCode: string;
  phoneE164: string;
  callbellChannelUuid: string;
  active: boolean;
  isDefault: boolean;
};

export type WhatsAppChannelOption = Pick<WhatsAppChannel, "id" | "label" | "countryName" | "countryCode" | "phoneE164" | "isDefault">;

export const seededWhatsAppChannels: WhatsAppChannel[] = [
  { id: "uae", label: "Fiper markets", countryName: "الإمارات", countryCode: "AE", phoneE164: "+971545623724", callbellChannelUuid: "a93d7cbf9fe744ba8b6d41a6ef50c1bd", active: true, isDefault: true },
  { id: "lebanon", label: "FIPER LEBANON", countryName: "لبنان", countryCode: "LB", phoneE164: "+9613897731", callbellChannelUuid: "07332a2eb7f04282b43cc88be6e3891f", active: true, isDefault: false },
  { id: "oman", label: "Fiper Oman", countryName: "عُمان", countryCode: "OM", phoneE164: "+96877868980", callbellChannelUuid: "d9701d57ebb34cf7ad0b9b67cd5248cb", active: true, isDefault: false },
];

type ChannelRow = {
  id: string;
  label: string;
  country_name: string;
  country_code: string;
  phone_e164: string;
  callbell_channel_uuid: string;
  active: boolean;
  is_default: boolean;
};

function mapChannel(row: ChannelRow): WhatsAppChannel {
  return {
    id: row.id,
    label: row.label,
    countryName: row.country_name,
    countryCode: row.country_code,
    phoneE164: row.phone_e164,
    callbellChannelUuid: row.callbell_channel_uuid,
    active: row.active,
    isDefault: row.is_default,
  };
}

export async function listWhatsAppChannels(): Promise<WhatsAppChannel[]> {
  try {
    const { data, error } = await createAdminClient()
      .from("whatsapp_channels")
      .select("id,label,country_name,country_code,phone_e164,callbell_channel_uuid,active,is_default")
      .order("is_default", { ascending: false })
      .order("country_name", { ascending: true });
    if (error || !data?.length) return seededWhatsAppChannels;
    return (data as ChannelRow[]).map(mapChannel);
  } catch {
    return seededWhatsAppChannels;
  }
}

export async function listActiveWhatsAppChannelOptions(): Promise<WhatsAppChannelOption[]> {
  const channels = await listWhatsAppChannels();
  return channels.filter((channel) => channel.active).map((channel) => ({
    id: channel.id,
    label: channel.label,
    countryName: channel.countryName,
    countryCode: channel.countryCode,
    phoneE164: channel.phoneE164,
    isDefault: channel.isDefault,
  }));
}
