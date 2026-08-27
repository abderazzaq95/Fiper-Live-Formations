create schema if not exists private;
revoke all on schema private from public;

create or replace function private.current_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid()
$$;

revoke all on function private.current_role() from public;
grant usage on schema private to authenticated;
grant execute on function private.current_role() to authenticated;

create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  provider text not null unique check (provider in ('callbell', 'google', 'email')),
  state text not null default 'disconnected',
  encrypted_config jsonb not null default '{}'::jsonb,
  connected_by uuid references public.profiles(id),
  connected_at timestamptz,
  updated_at timestamptz not null default now()
);

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_auth_user();

create or replace function public.register_course_participant(
  p_course_id text,
  p_name text,
  p_email text,
  p_phone_e164 text,
  p_country text,
  p_whatsapp_consent boolean,
  p_user_agent text default null
)
returns table (registration_id uuid, status text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.course_sessions%rowtype;
  v_confirmed_count integer;
  v_status public.registration_state;
  v_registration_id uuid;
begin
  if not p_whatsapp_consent then
    raise exception using errcode = '22023', message = 'whatsapp_consent_required';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_course_id, 0));

  select *
  into v_session
  from public.course_sessions
  where course_id = p_course_id
    and registration_open = true
    and starts_at > now()
  order by starts_at asc
  limit 1
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'registration_closed';
  end if;

  if exists (
    select 1 from public.registrations
    where session_id = v_session.id
      and (lower(email) = lower(trim(p_email)) or phone_e164 = p_phone_e164)
  ) then
    raise exception using errcode = '23505', message = 'already_registered';
  end if;

  select count(*) into v_confirmed_count
  from public.registrations
  where session_id = v_session.id and status in ('confirmed', 'attended');

  if v_confirmed_count >= v_session.capacity then
    if not v_session.waitlist_enabled then
      raise exception using errcode = 'P0001', message = 'course_full';
    end if;
    v_status := 'waitlisted';
  else
    v_status := 'confirmed';
  end if;

  insert into public.registrations (
    session_id, full_name, email, phone_e164, country, status,
    whatsapp_consent, user_agent
  ) values (
    v_session.id, trim(p_name), lower(trim(p_email)), p_phone_e164,
    trim(p_country), v_status, p_whatsapp_consent, p_user_agent
  )
  returning id into v_registration_id;

  insert into public.outbox_events (event_type, aggregate_id, payload)
  values (
    'registration.created',
    v_registration_id,
    jsonb_build_object(
      'registration_id', v_registration_id,
      'session_id', v_session.id,
      'status', v_status
    )
  );

  return query select v_registration_id, v_status::text;
end;
$$;

revoke all on function public.register_course_participant(text,text,text,text,text,boolean,text) from public;
grant execute on function public.register_course_participant(text,text,text,text,text,boolean,text) to anon, authenticated, service_role;

alter table public.profiles enable row level security;
alter table public.instructors enable row level security;
alter table public.courses enable row level security;
alter table public.course_translations enable row level security;
alter table public.course_sessions enable row level security;
alter table public.registrations enable row level security;
alter table public.message_deliveries enable row level security;
alter table public.attendance_sessions enable row level security;
alter table public.outbox_events enable row level security;
alter table public.audit_logs enable row level security;
alter table public.integrations enable row level security;

revoke all on all tables in schema public from anon, authenticated;
grant select on public.instructors, public.courses, public.course_translations, public.course_sessions to anon;
grant select on public.instructors, public.courses, public.course_translations, public.course_sessions,
  public.registrations, public.message_deliveries, public.attendance_sessions to authenticated;
grant insert, update, delete on public.instructors, public.courses, public.course_translations,
  public.course_sessions to authenticated;
grant insert, update on public.registrations, public.attendance_sessions to authenticated;
grant select on public.profiles, public.integrations, public.audit_logs to authenticated;
grant insert, update, delete on public.profiles, public.integrations to authenticated;

create policy "published courses are public" on public.courses for select to anon
  using (state = 'published');
create policy "public translations follow published course" on public.course_translations for select to anon
  using (exists (select 1 from public.courses c where c.id = course_id and c.state = 'published'));
create policy "public instructors belong to published courses" on public.instructors for select to anon
  using (exists (select 1 from public.courses c where c.instructor_id = id and c.state = 'published'));
create policy "public sessions belong to published courses" on public.course_sessions for select to anon
  using (exists (select 1 from public.courses c where c.id = course_id and c.state = 'published'));

create policy "staff read courses" on public.courses for select to authenticated
  using (private.current_role() in ('admin', 'user'));
create policy "staff read translations" on public.course_translations for select to authenticated
  using (private.current_role() in ('admin', 'user'));
create policy "staff read sessions" on public.course_sessions for select to authenticated
  using (private.current_role() in ('admin', 'user'));
create policy "staff read instructors" on public.instructors for select to authenticated
  using (private.current_role() in ('admin', 'user'));
create policy "staff insert courses" on public.courses for insert to authenticated
  with check (private.current_role() in ('admin', 'user'));
create policy "staff update courses" on public.courses for update to authenticated
  using (private.current_role() in ('admin', 'user')) with check (private.current_role() in ('admin', 'user'));
create policy "admins delete courses" on public.courses for delete to authenticated using (private.current_role() = 'admin');
create policy "staff insert translations" on public.course_translations for insert to authenticated with check (private.current_role() in ('admin', 'user'));
create policy "staff update translations" on public.course_translations for update to authenticated using (private.current_role() in ('admin', 'user')) with check (private.current_role() in ('admin', 'user'));
create policy "admins delete translations" on public.course_translations for delete to authenticated using (private.current_role() = 'admin');
create policy "staff insert sessions" on public.course_sessions for insert to authenticated with check (private.current_role() in ('admin', 'user'));
create policy "staff update sessions" on public.course_sessions for update to authenticated using (private.current_role() in ('admin', 'user')) with check (private.current_role() in ('admin', 'user'));
create policy "admins delete sessions" on public.course_sessions for delete to authenticated using (private.current_role() = 'admin');
create policy "staff insert instructors" on public.instructors for insert to authenticated with check (private.current_role() in ('admin', 'user'));
create policy "staff update instructors" on public.instructors for update to authenticated using (private.current_role() in ('admin', 'user')) with check (private.current_role() in ('admin', 'user'));
create policy "admins delete instructors" on public.instructors for delete to authenticated using (private.current_role() = 'admin');
create policy "staff read registrations" on public.registrations for select to authenticated
  using (private.current_role() in ('admin', 'user'));
create policy "staff update registrations" on public.registrations for update to authenticated
  using (private.current_role() in ('admin', 'user'))
  with check (private.current_role() in ('admin', 'user'));
create policy "admins delete registrations" on public.registrations for delete to authenticated
  using (private.current_role() = 'admin');
create policy "staff read deliveries" on public.message_deliveries for select to authenticated
  using (private.current_role() in ('admin', 'user'));
create policy "staff manage attendance" on public.attendance_sessions for all to authenticated
  using (private.current_role() in ('admin', 'user'))
  with check (private.current_role() in ('admin', 'user'));
create policy "users read own profile" on public.profiles for select to authenticated
  using (id = auth.uid() or private.current_role() = 'admin');
create policy "admins read integrations" on public.integrations for select to authenticated
  using (private.current_role() = 'admin');
create policy "admins read audit log" on public.audit_logs for select to authenticated
  using (private.current_role() = 'admin');
create policy "admins manage profiles" on public.profiles for all to authenticated
  using (private.current_role() = 'admin') with check (private.current_role() = 'admin');
create policy "admins manage integrations" on public.integrations for all to authenticated
  using (private.current_role() = 'admin') with check (private.current_role() = 'admin');
