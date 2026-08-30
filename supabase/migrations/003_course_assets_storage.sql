-- Public course and instructor images uploaded from the admin dashboard.
insert into storage.buckets (id, name, public)
values ('course-assets', 'course-assets', true)
on conflict (id) do update set public = true;

drop policy if exists "public course assets are readable" on storage.objects;
create policy "public course assets are readable"
on storage.objects for select
to public
using (bucket_id = 'course-assets');

drop policy if exists "staff upload course assets" on storage.objects;
create policy "staff upload course assets"
on storage.objects for insert
to authenticated
with check (bucket_id = 'course-assets' and private.current_role() in ('admin', 'user'));

drop policy if exists "staff update course assets" on storage.objects;
create policy "staff update course assets"
on storage.objects for update
to authenticated
using (bucket_id = 'course-assets' and private.current_role() in ('admin', 'user'))
with check (bucket_id = 'course-assets' and private.current_role() in ('admin', 'user'));

drop policy if exists "staff delete course assets" on storage.objects;
create policy "staff delete course assets"
on storage.objects for delete
to authenticated
using (bucket_id = 'course-assets' and private.current_role() in ('admin', 'user'));