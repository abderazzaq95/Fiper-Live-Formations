-- Per-course copy for all editable landing-page sections.
alter table public.course_translations
  add column if not exists landing_content jsonb not null default '{}'::jsonb;