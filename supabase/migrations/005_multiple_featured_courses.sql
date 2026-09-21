-- Allow any number of courses to be featured at the same time.
-- The application still controls which courses are published; featured is no longer single-valued.
drop index if exists public.courses_single_featured_idx;
create index if not exists courses_featured_idx
  on public.courses (is_featured)
  where is_featured = true;
