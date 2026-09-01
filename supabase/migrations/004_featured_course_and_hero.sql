alter table public.courses
  add column if not exists is_featured boolean not null default false;

create unique index if not exists courses_single_featured_idx
  on public.courses (is_featured)
  where is_featured = true;

alter table public.course_translations
  add column if not exists hero_heading text not null default 'افهم السوق. تداول بوضوح.';