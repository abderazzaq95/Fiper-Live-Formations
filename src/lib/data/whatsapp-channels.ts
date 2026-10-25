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
  templates: WhatsAppChannelTemplates;
  verifiedAt: string | null;
  verificationError: string | null;
};

export type WhatsAppChannelTemplates = {
  registration: string;
  reminderDay: string;
  reminderToday: string;
  joinNow: string;
  custom: string;
};

export type WhatsAppChannelOption = Pick<WhatsAppChannel, "id" | "label" | "countryName" | "countryCode" | "phoneE164" | "isDefault">;

export const seededWhatsAppChannels: WhatsAppChannel[] = [
  { id: "uae", label: "Fiper markets", countryName: "الإمارات", countryCode: "AE", phoneE164: "+971545623724", callbellChannelUuid: "a93d7cbf9fe744ba8b6d41a6ef50c1bd", active: true, isDefault: true, templates: { registration: "", reminderDay: "", reminderToday: "", joinNow: "", custom: "" }, verifiedAt: null, verificationError: null },
  { id: "lebanon", label: "FIPER LEBANON", countryName: "لبنان", countryCode: "LB", phoneE164: "+9613897731", callbellChannelUuid: "07332a2eb7f04282b43cc88be6e3891f", active: false, isDefault: false, templates: { registration: "", reminderDay: "", reminderToday: "", joinNow: "", custom: "" }, verifiedAt: null, verificationError: "أكمل ربط القوالب المعتمدة ثم تحقق من القناة." },
  { id: "oman", label: "Fiper Oman", countryName: "عُمان", countryCode: "OM", phoneE164: "+96877868980", callbellChannelUuid: "d9701d57ebb34cf7ad0b9b67cd5248cb", active: false, isDefault: false, templates: { registration: "", reminderDay: "", reminderToday: "", joinNow: "", custom: "" }, verifiedAt: null, verificationError: "أكمل ربط القوالب المعتمدة ثم تحقق من القناة." },
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
  template_registration_uuid: string | null;
  template_reminder_day_uuid: string | null;
  template_reminder_today_uuid: string | null;
  template_join_now_uuid: string | null;
  template_custom_uuid: string | null;
  callbell_verified_at: string | null;
  callbell_verification_error: string | null;
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
    templates: {
      registration: row.template_registration_uuid ?? "",
      reminderDay: row.template_reminder_day_uuid ?? "",
      reminderToday: row.template_reminder_today_uuid ?? "",
      joinNow: row.template_join_now_uuid ?? "",
      custom: row.template_custom_uuid ?? "",
    },
    verifiedAt: row.callbell_verified_at,
    verificationError: row.callbell_verification_error,
  };
}

export async function listWhatsAppChannels(): Promise<WhatsAppChannel[]> {
  try {
    const { data, error } = await createAdminClient()
      .from("whatsapp_channels")
      .select("id,label,country_name,country_code,phone_e164,callbell_channel_uuid,active,is_default,template_registration_uuid,template_reminder_day_uuid,template_reminder_today_uuid,template_join_now_uuid,template_custom_uuid,callbell_verified_at,callbell_verification_error")
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
