alter table public.attendance_sessions
  alter column registration_id drop not null;

alter table public.attendance_sessions
  add column if not exists session_id uuid references public.course_sessions(id) on delete cascade,
  add column if not exists participant_name text,
  add column if not exists participant_email text;

update public.attendance_sessions a
set session_id = r.session_id
from public.registrations r
where a.registration_id = r.id and a.session_id is null;

create index if not exists attendance_sessions_participant_idx
  on public.attendance_sessions (meet_participant_id);