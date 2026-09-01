-- Keep landing-page registration open while an enabled session is still running.
-- Registration remains closed after the configured end time.

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
    and ends_at > now()
  order by starts_at asc
  limit 1
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'registration_closed';
  end if;

  if exists (
    select 1 from public.registrations as r
    where r.session_id = v_session.id
      and (lower(r.email) = lower(trim(p_email)) or r.phone_e164 = p_phone_e164)
  ) then
    raise exception using errcode = '23505', message = 'already_registered';
  end if;

  select count(*) into v_confirmed_count
  from public.registrations as r
  where r.session_id = v_session.id and r.status in ('confirmed', 'attended');

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
