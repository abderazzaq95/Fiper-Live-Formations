insert into public.instructors (id, name, title, bio)
values (
  '11111111-1111-4111-8111-111111111111',
  'أحمد بن داعور',
  'محلل أسواق مالية ومدرب تداول',
  'خبرة تتجاوز 10 سنوات في أسواق العملات والسلع، ساعد خلالها آلاف المتداولين على بناء منهج أكثر انضباطاً ووضوحاً.'
)
on conflict (id) do update set name = excluded.name, title = excluded.title, bio = excluded.bio;

insert into public.courses (id, slug, state, default_locale, instructor_id, published_at)
values (
  'crs_forex_001',
  'forex-foundations',
  'published',
  'ar',
  '11111111-1111-4111-8111-111111111111',
  now()
)
on conflict (id) do update set state = excluded.state, instructor_id = excluded.instructor_id;

insert into public.course_translations (
  course_id, locale, title, eyebrow, description, outcomes, agenda, audience, faqs
)
values (
  'crs_forex_001',
  'ar',
  'أساسيات التداول في أسواق الفوركس',
  'دورة تدريبية مباشرة ومجانية',
  'من قراءة حركة السعر إلى بناء خطة تداول واضحة — تجربة عملية تمنحك الأساس الصحيح لفهم السوق وإدارة قراراتك بثقة.',
  '[{"title":"قراءة السوق"},{"title":"تحليل الفرص"},{"title":"إدارة المخاطر"},{"title":"خطة قابلة للتنفيذ"}]'::jsonb,
  '[{"title":"كيف يعمل سوق الفوركس؟","minutes":15},{"title":"قراءة الرسم البياني","minutes":25},{"title":"المخاطر قبل العائد","minutes":25},{"title":"بناء خطة البداية","minutes":15},{"title":"أسئلة مباشرة","minutes":10}]'::jsonb,
  '["تبدأ من الصفر","تبحث عن إطار عملي لإدارة المخاطر"]'::jsonb,
  '[{"question":"هل الدورة مجانية؟","answer":"نعم، التسجيل والحضور مجانيان."}]'::jsonb
)
on conflict (course_id, locale) do update set
  title = excluded.title,
  eyebrow = excluded.eyebrow,
  description = excluded.description;

insert into public.course_sessions (
  id, course_id, starts_at, ends_at, timezone, delivery_type,
  platform, capacity, registration_open, waitlist_enabled
)
values (
  '22222222-2222-4222-8222-222222222222',
  'crs_forex_001',
  '2026-09-06T19:00:00Z',
  '2026-09-06T20:30:00Z',
  'Africa/Casablanca',
  'online',
  'Google Meet',
  200,
  true,
  true
)
on conflict (id) do update set
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  capacity = excluded.capacity,
  registration_open = excluded.registration_open;
