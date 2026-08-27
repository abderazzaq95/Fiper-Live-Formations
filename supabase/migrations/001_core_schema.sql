create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'user');
create type public.course_state as enum ('draft', 'published', 'completed', 'cancelled');
create type public.registration_state as enum ('confirmed', 'waitlisted', 'cancelled', 'attended', 'no_show');
create type public.delivery_state as enum ('scheduled', 'queued', 'sent', 'delivered', 'read', 'failed', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.instructors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text not null,
  bio text not null default '',
  photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id text primary key,
  slug text not null unique,
  state public.course_state not null default 'draft',
  default_locale text not null default 'ar' check (default_locale in ('ar', 'en')),
  instructor_id uuid references public.instructors(id) on delete set null,
  cover_path text,
  created_by uuid references public.profiles(id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.course_translations (
  course_id text not null references public.courses(id) on delete cascade,
  locale text not null check (locale in ('ar', 'en')),
  title text not null,
  eyebrow text not null default '',
  description text not null default '',
  outcomes jsonb not null default '[]'::jsonb,
  agenda jsonb not null default '[]'::jsonb,
  audience jsonb not null default '[]'::jsonb,
  faqs jsonb not null default '[]'::jsonb,
  seo_title text,
  seo_description text,
  primary key (course_id, locale)
);

create table public.course_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references public.courses(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  timezone text not null default 'Africa/Casablanca',
  delivery_type text not null check (delivery_type in ('online', 'onsite')),
  platform text,
  venue_name text,
  venue_address text,
  meet_space_name text,
  meet_url text,
  google_event_id text,
  capacity integer not null check (capacity > 0),
  registration_open boolean not null default false,
  waitlist_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.course_sessions(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone_e164 text not null,
  country text not null,
  status public.registration_state not null,
  whatsapp_consent boolean not null,
  source text,
  user_agent text,
  registered_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index registrations_session_email_uidx on public.registrations (session_id, lower(email));
create unique index registrations_session_phone_uidx on public.registrations (session_id, phone_e164);
create index registrations_session_status_idx on public.registrations (session_id, status);
create index registrations_registered_at_idx on public.registrations (registered_at desc);

create table public.message_deliveries (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  channel text not null check (channel in ('email', 'whatsapp')),
  template_key text not null,
  provider text not null,
  provider_message_id text,
  state public.delivery_state not null default 'scheduled',
  scheduled_for timestamptz not null,
  sent_at timestamptz,
  delivered_at timestamptz,
  failure_reason text,
  attempt_count integer not null default 0,
  idempotency_key text not null unique,
  provider_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index message_deliveries_due_idx on public.message_deliveries (state, scheduled_for);

create table public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  meet_participant_id text,
  joined_at timestamptz,
  left_at timestamptz,
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  match_method text not null default 'email',
  manually_overridden boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.outbox_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  aggregate_id uuid not null,
  payload jsonb not null,
  available_at timestamptz not null default now(),
  processed_at timestamptz,
  attempts integer not null default 0,
  created_at timestamptz not null default now()
);

create index outbox_events_pending_idx on public.outbox_events (available_at) where processed_at is null;

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);
