import "server-only";

import { agenda as demoAgenda, audience as demoAudience, faqs as demoFaqs, featuredCourse, learningOutcomes, type Course } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/server";

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
  registrations: number;
  capacity: number;
  status: "مفتوح" | "قائمة انتظار" | "مسودة" | "مكتملة";
  tone: "green" | "amber" | "slate";
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

function mapPublicData(row: JsonRecord, translation: JsonRecord | undefined, session: JsonRecord | undefined, instructor: JsonRecord | undefined): PublicCourseData {
  const title = asText(translation?.title, featuredCourse.title);
  const eyebrow = asText(translation?.eyebrow, featuredCourse.eyebrow);
  const description = asText(translation?.description, featuredCourse.description);
  const startsAt = asText(session?.starts_at, featuredCourse.isoStart);
  const endsAt = asText(session?.ends_at, "");
  const startDate = new Date(startsAt);
  const endDate = endsAt ? new Date(endsAt) : new Date(startDate.getTime() + 90 * 60 * 1000);
  const durationMinutes = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 60000));
  const type = session?.delivery_type === "onsite" ? "onsite" : "online";
  const platform = asText(session?.platform, featuredCourse.platform);
  const capacity = typeof session?.capacity === "number" ? session.capacity : featuredCourse.capacity;
  const course: Course = {
    ...featuredCourse,
    id: asText(row.id, featuredCourse.id),
    slug: asText(row.slug, featuredCourse.slug),
    title,
    eyebrow,
    description,
    isoStart: startsAt,
    dateLabel: formatDate(startsAt),
    timeLabel: new Intl.DateTimeFormat("ar", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: asText(session?.timezone, "Africa/Casablanca") }).format(startDate),
    duration: String(durationMinutes) + " دقيقة",
    type,
    platform,
    capacity,
    registrations: 0,
    status: row.state === "published" ? "open" : "draft",
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
      .select("id,slug,state,default_locale,instructor_id,course_translations(locale,title,eyebrow,description,outcomes,agenda,audience,faqs),course_sessions(starts_at,ends_at,timezone,delivery_type,platform,capacity),instructors(name,title,bio,photo_path)")
      .eq("state", "published")
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return { course: featuredCourse, outcomes: learningOutcomes, agenda: demoAgenda, audience: demoAudience, faqs: demoFaqs };

    const row = data as unknown as JsonRecord;
    const translations = asArray(row.course_translations);
    const locale = asText(row.default_locale, "ar");
    const translation = translations.find((item) => item.locale === locale) ?? translations[0];
    const sessions = asArray(row.course_sessions);
    const instructor = firstRecord(row.instructors);
    return mapPublicData(row, translation, sessions[0], instructor);
  } catch {
    return { course: featuredCourse, outcomes: learningOutcomes, agenda: demoAgenda, audience: demoAudience, faqs: demoFaqs };
  }
}

export async function listDashboardCourses(): Promise<DashboardCourse[]> {
  try {
    const supabase = await createClient();
    const { data: courses, error } = await supabase.from("courses").select("id,default_locale,state,course_translations(locale,title),course_sessions(id,starts_at,capacity,registration_open)").order("created_at", { ascending: false });
    if (error || !courses) return [];

    const sessionIds = courses.flatMap((course) => asArray((course as JsonRecord).course_sessions).map((session) => asText(session.id))).filter(Boolean);
    const { data: registrations } = sessionIds.length ? await supabase.from("registrations").select("session_id,status").in("session_id", sessionIds) : { data: [] };
    const registrationRows = asArray(registrations);
    return courses.map((course) => {
      const row = course as unknown as JsonRecord;
      const translations = asArray(row.course_translations);
      const translation = translations.find((item) => item.locale === row.default_locale) ?? translations[0];
      const session = asArray(row.course_sessions)[0];
      const sessionId = asText(session?.id);
      const count = registrationRows.filter((registration) => registration.session_id === sessionId && ["confirmed", "attended"].includes(asText(registration.status))).length;
      const capacity = typeof session?.capacity === "number" ? session.capacity : 0;
      const state = asText(row.state);
      const isOpen = session?.registration_open === true;
      const status = state === "draft" ? "مسودة" : count >= capacity && capacity > 0 ? "قائمة انتظار" : state === "completed" ? "مكتملة" : isOpen ? "مفتوح" : "مسودة";
      return { id: asText(row.id), title: asText(translation?.title, "دورة بدون عنوان"), date: formatDate(asText(session?.starts_at)), registrations: count, capacity, status, tone: status === "قائمة انتظار" ? "amber" : status === "مسودة" ? "slate" : "green" };
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
      const session = asArray(row.course_sessions)[0];
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
  description: string;
  instructor: { id: string; name: string; title: string; bio: string };
  session: { id: string; startsAt: string; endsAt: string; timezone: string; deliveryType: string; platform: string; capacity: number; registrationOpen: boolean; waitlistEnabled: boolean; meetUrl: string };
};

export async function getCourseEditorData(id: string): Promise<CourseEditorData | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("courses")
      .select("id,slug,state,default_locale,instructor_id,course_translations(locale,title,eyebrow,description),course_sessions(id,starts_at,ends_at,timezone,delivery_type,platform,capacity,registration_open,waitlist_enabled,meet_url),instructors(id,name,title,bio)")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    const row = data as unknown as JsonRecord;
    const translations = asArray(row.course_translations);
    const translation = translations.find((item) => item.locale === row.default_locale) ?? translations[0] ?? {};
    const session = asArray(row.course_sessions)[0] ?? {};
    const instructor = firstRecord(row.instructors) ?? {};
    return {
      id: asText(row.id),
      slug: asText(row.slug),
      state: asText(row.state),
      title: asText(translation.title),
      eyebrow: asText(translation.eyebrow),
      description: asText(translation.description),
      instructor: { id: asText(instructor.id), name: asText(instructor.name), title: asText(instructor.title), bio: asText(instructor.bio) },
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
      },
    };
  } catch {
    return null;
  }
}