create table public.whatsapp_channels (
  id text primary key check (id ~ '^[a-z0-9_]+$'),
  label text not null,
  country_name text not null,
  country_code text not null check (char_length(country_code) = 2),
  phone_e164 text not null unique check (phone_e164 ~ '^\+[1-9][0-9]{6,14}$'),
  callbell_channel_uuid text not null unique check (callbell_channel_uuid ~ '^[a-f0-9]{32}$'),
  active boolean not null default true,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index whatsapp_channels_single_default_idx
  on public.whatsapp_channels (is_default)
  where is_default = true;

insert into public.whatsapp_channels (
  id, label, country_name, country_code, phone_e164, callbell_channel_uuid, active, is_default
) values
  ('uae', 'Fiper markets', 'الإمارات', 'AE', '+971545623724', 'a93d7cbf9fe744ba8b6d41a6ef50c1bd', true, true),
  ('lebanon', 'FIPER LEBANON', 'لبنان', 'LB', '+9613897731', '07332a2eb7f04282b43cc88be6e3891f', true, false),
  ('oman', 'Fiper Oman', 'عُمان', 'OM', '+96877868980', 'd9701d57ebb34cf7ad0b9b67cd5248cb', true, false)
on conflict (id) do update set
  label = excluded.label,
  country_name = excluded.country_name,
  country_code = excluded.country_code,
  phone_e164 = excluded.phone_e164,
  callbell_channel_uuid = excluded.callbell_channel_uuid,
  active = excluded.active,
  is_default = excluded.is_default,
  updated_at = now();

alter table public.course_sessions
  add column whatsapp_channel_id text references public.whatsapp_channels(id) on update cascade on delete set null;

update public.course_sessions
set whatsapp_channel_id = 'uae'
where whatsapp_channel_id is null;

alter table public.course_sessions
  alter column whatsapp_channel_id set default 'uae';

alter table public.message_deliveries
  add column sender_channel_id text references public.whatsapp_channels(id) on update cascade on delete set null;

update public.message_deliveries as delivery
set sender_channel_id = session.whatsapp_channel_id
from public.registrations as registration
join public.course_sessions as session on session.id = registration.session_id
where delivery.registration_id = registration.id
  and delivery.channel = 'whatsapp'
  and delivery.sender_channel_id is null;

alter table public.whatsapp_channels enable row level security;

revoke all on public.whatsapp_channels from anon, authenticated;
grant select on public.whatsapp_channels to authenticated;
grant insert, update, delete on public.whatsapp_channels to authenticated;

create policy "staff read whatsapp channels"
  on public.whatsapp_channels for select to authenticated
  using (private.current_role() in ('admin', 'user'));

create policy "admins manage whatsapp channels"
  on public.whatsapp_channels for all to authenticated
  using (private.current_role() = 'admin')
  with check (private.current_role() = 'admin');
