-- Optional, factual metadata for the public course directory.
-- Session capacity already exists on public.course_sessions and is not duplicated.

alter table public.courses
  add column if not exists level text
    check (level is null or level in ('beginner', 'intermediate', 'advanced')),
  add column if not exists topic text;

alter table public.instructors
  add column if not exists years_active integer
    check (years_active is null or years_active between 0 and 80),
  add column if not exists focus_markets text,
  add column if not exists credentials text;

comment on column public.courses.level is 'Optional catalog level: beginner, intermediate, or advanced.';
comment on column public.courses.topic is 'Optional short Arabic topic label used by the public catalog.';
comment on column public.instructors.years_active is 'Optional factual number of years active in the field.';
comment on column public.instructors.focus_markets is 'Optional factual list or sentence describing markets covered.';
comment on column public.instructors.credentials is 'Optional verified professional credentials approved for publication.';
