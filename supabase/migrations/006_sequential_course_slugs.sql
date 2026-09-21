-- Stable, human-readable course URLs.
-- Existing slugs are kept as aliases, then every course receives id01, id02, ...
create table if not exists public.course_slug_aliases (
  slug text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists course_slug_aliases_course_id_idx
  on public.course_slug_aliases (course_id);

alter table public.course_slug_aliases enable row level security;

drop policy if exists "public course slug aliases are readable" on public.course_slug_aliases;
create policy "public course slug aliases are readable"
  on public.course_slug_aliases for select to anon, authenticated
  using (true);

-- Keep every URL that was already shared before the rename.
insert into public.course_slug_aliases (slug, course_id)
select slug, id from public.courses
on conflict (slug) do update set course_id = excluded.course_id;

-- Avoid an immediate unique-index collision while canonical names are assigned.
update public.courses
set slug = '__slug_migration__' || id
where slug !~ '^__slug_migration__';

with ordered as (
  select id, row_number() over (order by created_at asc, id asc) as course_number
  from public.courses
)
update public.courses c
set slug = 'id' || lpad(ordered.course_number::text, 2, '0')
from ordered
where c.id = ordered.id;

-- The canonical slugs themselves are not aliases; direct course lookup wins.
delete from public.course_slug_aliases aliases
using public.courses c
where aliases.slug = c.slug
  and aliases.course_id = c.id;