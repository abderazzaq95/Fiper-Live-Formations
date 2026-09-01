import "server-only";

import { agenda as demoAgenda, audience as demoAudience, faqs as demoFaqs, featuredCourse, learningOutcomes, type Course } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

type JsonRecord = Record<string, unknown>;

export type PublicCourseData = {
  course: Course;
  outcomes: typeof learningOutcomes;
  agenda: typeof demoAgenda;
  audience: typeof demoAudience;
  faqs: typeof demoFaqs;
};

export type DashboardCourse = {
  id: string;
  title: string;
  date: string;
    startsAt: string;
registrations: number;
  capacity: number;
  registrationOpen: boolean;
  featured: boolean;
  status: "مفتوح" | "مغلق" | "قائمة انتظار" | "مسودة" | "مكتملة";
  tone: "green" | "amber" | "slate" | "red";
};

export type DashboardRegistration = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  course: string;
  source: string;
  status: string;
  time: string;
  registeredAt: string;
};

function asArray(value: unknown): JsonRecord[] {
  return Array.isArray(value) ? value.filter((item): item is JsonRecord => Boolean(item && typeof item === "object")) : [];
}

function firstRecord(value: unknown): JsonRecord | undefined {
  if (Array.isArray(value)) return value.find((item): item is JsonRecord => Boolean(item && typeof item === "object"));
  return value && typeof value === "object" ? value as JsonRecord : undefined;
}

function asText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ar", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

function mapPublicData(row: JsonRecord, translation: JsonRecord | undefined, session: JsonRecord | undefined, instructor: JsonRecord | undefined, registrationCount = 0): PublicCourseData {
  const title = asText(translation?.title, featuredCourse.title);
  const heroHeading = asText(translation?.hero_heading, featuredCourse.heroHeading);
  const eyebrow = asText(translation?.eyebrow, featuredCourse.eyebrow);
  const description = asText(translation?.description, featuredCourse.description);
  const startsAt = asText(session?.starts_at, featuredCourse.isoStart);
  const endsAt = asText(session?.ends_at, "");
  const startDate = new Date(startsAt);
  const endDate = endsAt ? new Date(endsAt) : new Date(startDate.getTime() + 90 * 60 * 1000);
  const durationMinutes = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 60000));
  const type = session?.delivery_type === "onsite" ? "onsite" : "online";
  const platform = type === "onsite" ? asText(session?.platform, "حضوري") : asText(session?.platform, featuredCourse.platform);
  const capacity = typeof session?.capacity === "number" ? session.capacity : featuredCourse.capacity;
  const course: Course = {
    ...featuredCourse,
    id: asText(row.id, featuredCourse.id),
    slug: asText(row.slug, featuredCourse.slug),
    coverImage: asText(row.cover_path, featuredCourse.coverImage),
    title,
    heroHeading,
    eyebrow,
    description,
    isoStart: startsAt,
    isoEnd: endDate.toISOString(),
    dateLabel: formatDate(startsAt),
    timeLabel: new Intl.DateTimeFormat("ar", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: asText(session?.timezone, "Africa/Casablanca") }).format(startDate),
    duration: String(durationMinutes) + " دقيقة",
    type,
    platform,
    capacity,
    registrations: registrationCount,
    status: row.state === "published" ? "open" : "draft",
    registrationOpen: session?.registration_open !== false,
    instructor: {
      name: asText(instructor?.name, featuredCourse.instructor.name),
      role: asText(instructor?.title, featuredCourse.instructor.role),
      bio: asText(instructor?.bio, featuredCourse.instructor.bio),
      initials: featuredCourse.instructor.initials,
      image: asText(instructor?.photo_path, featuredCourse.instructor.image),
    },
  };

  const outcomeRows = asArray(translation?.outcomes);
  const agendaRows = asArray(translation?.agenda);
  const audienceRows = Array.isArray(translation?.audience) ? translation?.audience : [];
  const faqRows = asArray(translation?.faqs);

  return {
    course,
    outcomes: outcomeRows.length ? outcomeRows.map((item, index) => ({ index: String(index + 1).padStart(2, "0"), title: asText(item.title, learningOutcomes[index]?.title ?? ""), text: asText(item.text, learningOutcomes[index]?.text ?? "") })) : learningOutcomes,
    agenda: agendaRows.length ? agendaRows.map((item) => ({ time: typeof item.minutes === "number" ? String(item.minutes) + " دقيقة" : asText(item.time), title: asText(item.title), text: asText(item.text) })) : demoAgenda,
    audience: audienceRows.length ? audienceRows.map((item) => asText(item)) : demoAudience,
    faqs: faqRows.length ? faqRows.map((item) => ({ question: asText(item.question), answer: asText(item.answer) })) : demoFaqs,
  };
}

export async function getPublicCourse(): Promise<PublicCourseData> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("courses")
      .select("id,slug,state,is_featured,default_locale,instructor_id,cover_path,course_translations(locale,title,hero_heading,eyebrow,description,outcomes,agenda,audience,faqs),course_sessions(id,starts_at,ends_at,timezone,delivery_type,platform,capacity,registration_open),instructors(name,title,bio,photo_path)")
      .eq("state", "published")
      .order("is_featured", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(50);

    if (error || !data?.length) return { course: featuredCourse, outcomes: learningOutcomes, agenda: demoAgenda, audience: demoAudience, faqs: demoFaqs };

    const rows = data as unknown as JsonRecord[];
    const now = Date.now();
    const candidates = rows.map((row) => {
      const session = firstRecord(asArray(row.course_sessions));
      const start = new Date(asText(session?.starts_at, featuredCourse.isoStart)).getTime();
      const endValue = asText(session?.ends_at);
      const end = endValue ? new Date(endValue).getTime() : start + 90 * 60 * 1000;
      return { row, session, start, end, featured: row.is_featured === true };
    });
    const selected = candidates.filter((candidate) => candidate.end > now).sort((a, b) => Number(b.featured) - Number(a.featured) || a.start - b.start)[0] ?? candidates.sort((a, b) => Number(b.featured) - Number(a.featured) || b.start - a.start)[0];
    if (!selected) return { course: featuredCourse, outcomes: learningOutcomes, agenda: demoAgenda, audience: demoAudience, faqs: demoFaqs };

    const row = selected.row;
    const translations = asArray(row.course_translations);
    const locale = asText(row.default_locale, "ar");
    const translation = translations.find((item) => item.locale === locale) ?? translations[0];
    const instructor = firstRecord(row.instructors);
    let registrationCount = 0;
    const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const sessionId = asText(selected.session?.id);
    if (serviceUrl && serviceKey && sessionId) {
      const admin = createSupabaseClient(serviceUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
      const result = await admin.from("registrations").select("id", { count: "exact", head: true }).eq("session_id", sessionId).in("status", ["confirmed", "attended"]);
      registrationCount = result.count ?? 0;
    }
    return mapPublicData(row, translation, selected.session, instructor, registrationCount);
  } catch {
    return { course: featuredCourse, outcomes: learningOutcomes, agenda: demoAgenda, audience: demoAudience, faqs: demoFaqs };
  }
}

/**
 * Load a specific course by id so confirmation pages reflect dashboard edits.
 */
export async function getPublicCourseById(id: string): Promise<PublicCourseData> {
  if (!id) return getPublicCourse();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("courses")
      .select("id,slug,state,is_featured,default_locale,instructor_id,cover_path,course_translations(locale,title,hero_heading,eyebrow,description,outcomes,agenda,audience,faqs),course_sessions(id,starts_at,ends_at,timezone,delivery_type,platform,capacity,registration_open),instructors(name,title,bio,photo_path)")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return getPublicCourse();

    const row = data as unknown as JsonRecord;
    const translations = asArray(row.course_translations);
    const locale = asText(row.default_locale, "ar");
    const translation = translations.find((item) => item.locale === locale) ?? translations[0];
    const sessions = asArray(row.course_sessions);
    const instructor = firstRecord(row.instructors);
    return mapPublicData(row, translation, sessions[0], instructor);
  } catch {
    return getPublicCourse();
  }
}
export async function listDashboardCourses(): Promise<DashboardCourse[]> {
  try {
    const supabase = await createClient();
    const { data: courses, error } = await supabase.from("courses").select("id,default_locale,state,is_featured,course_translations(locale,title),course_sessions(id,starts_at,capacity,registration_open)").order("created_at", { ascending: false });
    if (error || !courses) return [];

    const sessionIds = courses.flatMap((course) => asArray((course as JsonRecord).course_sessions).map((session) => asText(session.id))).filter(Boolean);
    const { data: registrations } = sessionIds.length ? await supabase.from("registrations").select("session_id,status").in("session_id", sessionIds) : { data: [] };
    const registrationRows = asArray(registrations);
    return courses.map((course) => {
      const row = course as unknown as JsonRecord;
      const translations = asArray(row.course_translations);
      const translation = translations.find((item) => item.locale === row.default_locale) ?? translations[0];
      const session = firstRecord(row.course_sessions);
      const sessionId = asText(session?.id);
      const count = registrationRows.filter((registration) => registration.session_id === sessionId && ["confirmed", "attended"].includes(asText(registration.status))).length;
      const capacity = typeof session?.capacity === "number" ? session.capacity : 0;
      const state = asText(row.state);
      const isOpen = session?.registration_open === true;
      const status = state === "draft" ? "مسودة" : state === "completed" ? "مكتملة" : count >= capacity && capacity > 0 && isOpen ? "قائمة انتظار" : isOpen ? "مفتوح" : "مغلق";
      return { id: asText(row.id), featured: row.is_featured === true, title: asText(translation?.title, "دورة بدون عنوان"), date: formatDate(asText(session?.starts_at)), startsAt: asText(session?.starts_at), registrations: count, capacity, registrationOpen: isOpen, status, tone: status === "قائمة انتظار" ? "amber" : status === "مسودة" ? "slate" : status === "مغلق" ? "red" : "green" };
    });
  } catch {
    return [];
  }
}

export async function listDashboardRegistrations(): Promise<DashboardRegistration[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("registrations").select("id,full_name,email,phone_e164,country,status,registered_at,session_id,course_sessions(course_id,starts_at,courses(id,default_locale,course_translations(locale,title)))").order("registered_at", { ascending: false });
    if (error || !data) return [];
    return data.map((item) => {
      const row = item as unknown as JsonRecord;
      const session = firstRecord(row.course_sessions);
      const course = firstRecord(session?.courses);
      const translations = asArray(course?.course_translations);
      const translation = translations.find((translationRow) => translationRow.locale === course?.default_locale) ?? translations[0];
      const status = asText(row.status);
      return {
        id: asText(row.id),
        name: asText(row.full_name),
        email: asText(row.email),
        phone: asText(row.phone_e164),
        country: asText(row.country),
        course: asText(translation?.title, asText(course?.id, "—")),
        source: "Landing page",
        status: status === "waitlisted" ? "قائمة انتظار" : status === "confirmed" ? "مؤكد" : status,
        time: formatDate(asText(row.registered_at)),
        registeredAt: asText(row.registered_at),
      };
    });
  } catch {
    return [];
  }
}
export type CourseEditorData = {
  id: string;
  slug: string;
  state: string;
  title: string;
  eyebrow: string;
  description: string
  heroHeading: string
  coverPath: string;
  faqs: Array<{ question: string; answer: string }>;
  registrationCount: number;
  instructor: { id: string; name: string; title: string; bio: string; image: string };
  session: { id: string; startsAt: string; endsAt: string; timezone: string; deliveryType: string; platform: string; capacity: number; registrationOpen: boolean; waitlistEnabled: boolean; meetUrl: string; venueName: string; venueAddress: string };
};

export async function getCourseEditorData(id: string): Promise<CourseEditorData | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("courses")
      .select("id,slug,state,is_featured,default_locale,instructor_id,cover_path,course_translations(locale,title,hero_heading,eyebrow,description,faqs),course_sessions(id,starts_at,ends_at,timezone,delivery_type,platform,capacity,registration_open,waitlist_enabled,meet_url,venue_name,venue_address),instructors(id,name,title,bio,photo_path)")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    const row = data as unknown as JsonRecord;
    const translations = asArray(row.course_translations);
    const translation = translations.find((item) => item.locale === row.default_locale) ?? translations[0] ?? {};
    const session = asArray(row.course_sessions)[0] ?? {};
    const instructor = firstRecord(row.instructors) ?? {};
    const editorSessionId = asText(session.id);
    const { count: registrationCount } = editorSessionId ? await supabase.from("registrations").select("id", { count: "exact", head: true }).eq("session_id", editorSessionId).in("status", ["confirmed", "attended"]) : { count: 0 };
    return {
      id: asText(row.id),
      slug: asText(row.slug),
      state: asText(row.state),
      title: asText(translation.title),
      heroHeading: asText(translation.hero_heading, featuredCourse.heroHeading),
      eyebrow: asText(translation.eyebrow),
      description: asText(translation.description),
      coverPath: asText(row.cover_path),
      faqs: asArray(translation.faqs).map((item) => ({ question: asText(item.question), answer: asText(item.answer) })).filter((item) => item.question && item.answer),
      registrationCount: registrationCount ?? 0,
      instructor: { id: asText(instructor.id), name: asText(instructor.name), title: asText(instructor.title), bio: asText(instructor.bio), image: asText(instructor.photo_path) },
      session: {
        id: asText(session.id),
        startsAt: asText(session.starts_at),
        endsAt: asText(session.ends_at),
        timezone: asText(session.timezone, "Africa/Casablanca"),
        deliveryType: asText(session.delivery_type, "online"),
        platform: asText(session.platform, "Google Meet"),
        capacity: typeof session.capacity === "number" ? session.capacity : 200,
        registrationOpen: session.registration_open === true,
        waitlistEnabled: session.waitlist_enabled !== false,
        meetUrl: asText(session.meet_url),
        venueName: asText(session.venue_name),
        venueAddress: asText(session.venue_address),
      },
    };
  } catch {
    return null;
  }
}