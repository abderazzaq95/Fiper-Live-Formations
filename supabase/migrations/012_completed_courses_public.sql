-- Completed courses stay visible on the public website (with registration closed).
-- Before: only state = 'published' was readable by visitors. Now 'completed' is readable too.
-- Registration is still blocked for completed courses: the course is closed for registration
-- when it is marked completed, and register_course_participant only accepts open sessions.

drop policy if exists "published courses are public" on public.courses;
create policy "published courses are public" on public.courses for select to anon
  using (state in ('published', 'completed'));

drop policy if exists "public translations follow published course" on public.course_translations;
create policy "public translations follow published course" on public.course_translations for select to anon
  using (exists (select 1 from public.courses c where c.id = course_id and c.state in ('published', 'completed')));

drop policy if exists "public instructors belong to published courses" on public.instructors;
create policy "public instructors belong to published courses" on public.instructors for select to anon
  using (exists (select 1 from public.courses c where c.instructor_id = instructors.id and c.state in ('published', 'completed')));

drop policy if exists "public sessions belong to published courses" on public.course_sessions;
create policy "public sessions belong to published courses" on public.course_sessions for select to anon
  using (exists (select 1 from public.courses c where c.id = course_id and c.state in ('published', 'completed')));
