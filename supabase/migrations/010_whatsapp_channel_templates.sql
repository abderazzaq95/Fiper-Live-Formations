alter table public.whatsapp_channels
  add column template_registration_uuid text check (template_registration_uuid is null or template_registration_uuid ~ '^[a-f0-9]{32}$'),
  add column template_reminder_day_uuid text check (template_reminder_day_uuid is null or template_reminder_day_uuid ~ '^[a-f0-9]{32}$'),
  add column template_reminder_today_uuid text check (template_reminder_today_uuid is null or template_reminder_today_uuid ~ '^[a-f0-9]{32}$'),
  add column template_join_now_uuid text check (template_join_now_uuid is null or template_join_now_uuid ~ '^[a-f0-9]{32}$'),
  add column template_custom_uuid text check (template_custom_uuid is null or template_custom_uuid ~ '^[a-f0-9]{32}$'),
  add column callbell_verified_at timestamptz,
  add column callbell_verification_error text;

-- The current UAE default keeps using the existing Vercel templates until its
-- template UUIDs are saved from the dashboard. Other senders stay unavailable
-- until an administrator verifies their own approved templates.
update public.whatsapp_channels
set active = false,
    callbell_verification_error = 'أكمل ربط القوالب المعتمدة ثم تحقق من القناة.'
where is_default = false
  and template_registration_uuid is null;
