"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarBlank, Clock, MagnifyingGlass, MapPin, VideoCamera } from "@phosphor-icons/react";

import { ShareCourseButton } from "@/components/courses/course-actions";
import { CourseCover } from "@/components/courses/course-cover";
import { CourseTrustSignal } from "@/components/courses/course-trust-signal";
import { LocalizedCourseTime, TimezoneSelector } from "@/components/courses/timezone-provider";
import type { Course } from "@/lib/demo-data";
import { trackAcademyEvent } from "@/lib/analytics";

type Filter = "all" | "online" | "onsite";
type Sort = "date" | "popular";
type QuickFilter = "all" | "today" | "week";
const levelLabels = { beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم" } as const;
const filterReferenceTime = Date.now();

function CourseCard({ course, priority = false }: { course: Course; priority?: boolean }) {
  const reduceMotion = useReducedMotion();
  const href = `/courses/${encodeURIComponent(course.slug)}`;
  return (
    <motion.article whileHover={reduceMotion ? undefined : { y: -6 }} transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }} className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_18px_55px_rgba(3,26,45,.09)] ring-1 ring-[#dfe7ec] transition-shadow duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_28px_75px_rgba(3,26,45,.15)]">
      <Link href={href} aria-label={`عرض تفاصيل ${course.title}`} className="relative block aspect-[16/9] overflow-hidden bg-[#d8e7f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c32828] focus-visible:ring-inset">
        <CourseCover course={course} priority={priority} className="h-full" />
        <span className="absolute right-4 top-4 rounded-lg bg-[#031a2d]/90 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md">{course.type === "online" ? "مباشر أونلاين" : "حضور مباشر"}</span>
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-[#c32828]">{course.topic || course.eyebrow || "دورة مباشرة"}</span>
          <CourseTrustSignal course={course} />
        </div>
        {course.level ? <span className="mt-4 w-max rounded-lg bg-[#eef3f6] px-3 py-2 text-xs font-semibold text-[#3e5769]">المستوى: {levelLabels[course.level]}</span> : null}
        <h3 className="mt-4 text-balance text-2xl font-bold leading-tight tracking-tight text-[#071d2f] transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:text-[#c32828]">{course.title}</h3>
        <p className="mt-3 line-clamp-2 text-pretty text-sm leading-6 text-[#526575]">{course.description || "اطّلع على تفاصيل الدورة وموعدها وطريقة الحضور قبل إتمام التسجيل."}</p>
        <dl className="mt-6 grid grid-cols-2 gap-3 text-sm text-[#071d2f]">
          <div className="flex gap-2"><CalendarBlank size={19} weight="duotone" className="shrink-0 text-[#c32828]" /><div><dt className="text-xs text-[#788894]">التاريخ</dt><dd className="mt-1"><LocalizedCourseTime iso={course.isoStart} courseTimezone={course.timezone} part="date" /></dd></div></div>
          <div className="flex gap-2"><Clock size={19} weight="duotone" className="shrink-0 text-[#c32828]" /><div><dt className="text-xs text-[#788894]">الوقت والمدة</dt><dd className="mt-1"><LocalizedCourseTime iso={course.isoStart} courseTimezone={course.timezone} part="time" /><span className="mt-1 block text-xs text-[#788894]">{course.duration}</span></dd></div></div>
          <div className="col-span-2 flex gap-2">{course.type === "online" ? <VideoCamera size={19} weight="duotone" className="shrink-0 text-[#c32828]" /> : <MapPin size={19} weight="duotone" className="shrink-0 text-[#c32828]" />}<div><dt className="text-xs text-[#788894]">الحضور</dt><dd className="mt-1 font-semibold">{course.type === "online" ? course.platform : course.venueName || "حضوري"}</dd></div></div>
        </dl>
        <div className="mt-6 flex flex-col gap-4 border-t border-[#e3e9ed] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            {course.instructor.image ? <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#dce5ea]"><Image src={course.instructor.image} alt={`المحاضر ${course.instructor.name}`} fill sizes="44px" className="object-cover object-top" /></span> : <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#031a2d] text-xs font-bold text-white">{course.instructor.initials}</span>}
            <div className="min-w-0"><p className="truncate text-sm font-bold text-[#071d2f]">{course.instructor.name}</p><p className="mt-1 truncate text-xs text-[#788894]">{course.instructor.role}</p></div>
          </div>
          <div className="flex shrink-0 gap-2"><ShareCourseButton slug={course.slug} title={course.title} /><Link href={`${href}#register`} onClick={() => trackAcademyEvent({ name: "academy_register_start", source: "catalog_card", courseSlug: course.slug })} className="inline-flex h-11 shrink-0 items-center rounded-xl bg-[#031a2d] px-3 text-sm font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#c32828] active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c32828]">التسجيل</Link></div>
        </div>
      </div>
    </motion.article>
  );
}

export function CourseCatalog({ courses }: { courses: Course[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [level, setLevel] = useState<string>("all");
  const [topic, setTopic] = useState<string>("all");
  const [quick, setQuick] = useState<QuickFilter>("all");
  const [sort, setSort] = useState<Sort>("date");
  const formats = new Set(courses.map((course) => course.type));
  const levels = Array.from(new Set(courses.map((course) => course.level).filter(Boolean))) as Array<NonNullable<Course["level"]>>;
  const topics = Array.from(new Set(courses.map((course) => course.topic).filter(Boolean))) as string[];
  const visible = useMemo(() => courses
    .filter((course) => filter === "all" || course.type === filter)
    .filter((course) => level === "all" || course.level === level)
    .filter((course) => topic === "all" || course.topic === topic)
    .filter((course) => {
      if (quick === "all") return true;
      const start = new Date(course.isoStart);
      const now = new Date(filterReferenceTime);
      if (quick === "today") return start.toDateString() === now.toDateString();
      const startOfToday = now.setHours(0, 0, 0, 0);
      return start.getTime() >= startOfToday && start.getTime() <= startOfToday + 7 * 86_400_000;
    })
    .filter((course) => `${course.title} ${course.description} ${course.eyebrow} ${course.topic || ""} ${course.instructor.name}`.toLocaleLowerCase("ar").includes(query.trim().toLocaleLowerCase("ar")))
    .sort((a, b) => sort === "popular" ? b.registrations - a.registrations : Date.parse(a.isoStart) - Date.parse(b.isoStart)), [courses, filter, level, topic, quick, query, sort]);

  function changeFilter(next: Filter) {
    setFilter(next);
    trackAcademyEvent({ name: "academy_filter_use", filter: "format", value: next });
  }

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-[0_14px_45px_rgba(3,26,45,.07)] ring-1 ring-[#e1e8ec] lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="تصفية الدورات" className="flex flex-wrap gap-2">
          {[
            { value: "all" as const, label: "الكل", show: true },
            { value: "online" as const, label: "مباشر أونلاين", show: formats.has("online") },
            { value: "onsite" as const, label: "حضوري", show: formats.has("onsite") },
          ].filter((item) => item.show).map((item) => <button key={item.value} type="button" role="tab" aria-selected={filter === item.value} onClick={() => changeFilter(item.value)} className={`h-10 rounded-xl px-3 text-sm font-semibold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c32828] ${filter === item.value ? "bg-[#031a2d] text-white" : "bg-[#eef3f6] text-[#526575] hover:bg-[#e3eaee]"}`}>{item.label}</button>)}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative block min-w-64 flex-1">
            <span className="sr-only">ابحث في الدورات</span>
            <MagnifyingGlass size={20} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#718391]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="ابحث عن دورة أو محاضر" className="h-11 w-full rounded-xl border border-[#d9e2e7] bg-white pr-11 pl-3 text-sm text-[#071d2f] placeholder:text-[#8a98a2] focus:border-[#c32828] focus:outline-none focus:ring-2 focus:ring-[#c32828]/20" />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-[#526575]">
            <span>الترتيب</span>
            <select value={sort} onChange={(event) => { const value = event.target.value as Sort; setSort(value); trackAcademyEvent({ name: "academy_filter_use", filter: "sort", value }); }} className="h-11 rounded-xl border border-[#d9e2e7] bg-white px-3 text-[#071d2f] focus:border-[#c32828] focus:outline-none focus:ring-2 focus:ring-[#c32828]/20"><option value="date">الأقرب موعدًا</option><option value="popular">الأكثر تسجيلًا</option></select>
          </label>
          <TimezoneSelector className="text-[#526575]" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="فلاتر إضافية">
        {[{ value: "all" as const, label: "كل المواعيد" }, { value: "today" as const, label: "اليوم" }, { value: "week" as const, label: "هذا الأسبوع" }].map((item) => <button key={item.value} type="button" onClick={() => { setQuick(item.value); trackAcademyEvent({ name: "academy_filter_use", filter: "date_window", value: item.value }); }} className={`h-10 rounded-xl px-3 text-sm font-semibold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c32828] ${quick === item.value ? "bg-[#c32828] text-white" : "bg-white text-[#526575] ring-1 ring-[#d9e2e7] hover:bg-[#eef3f6]"}`}>{item.label}</button>)}
        {levels.map((item) => <button key={item} type="button" onClick={() => { const next = level === item ? "all" : item; setLevel(next); trackAcademyEvent({ name: "academy_filter_use", filter: "level", value: next }); }} className={`h-10 rounded-xl px-3 text-sm font-semibold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c32828] ${level === item ? "bg-[#031a2d] text-white" : "bg-white text-[#526575] ring-1 ring-[#d9e2e7] hover:bg-[#eef3f6]"}`}>{levelLabels[item]}</button>)}
        {topics.map((item) => <button key={item} type="button" onClick={() => { const next = topic === item ? "all" : item; setTopic(next); trackAcademyEvent({ name: "academy_filter_use", filter: "topic", value: next }); }} className={`h-10 rounded-xl px-3 text-sm font-semibold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c32828] ${topic === item ? "bg-[#031a2d] text-white" : "bg-white text-[#526575] ring-1 ring-[#d9e2e7] hover:bg-[#eef3f6]"}`}>{item}</button>)}
      </div>

      <p className="mt-5 text-sm font-semibold text-[#617485]" aria-live="polite">{visible.length.toLocaleString("ar")} {visible.length === 1 ? "دورة متاحة" : "دورات متاحة"}</p>
      {visible.length ? (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {visible.map((course, index) => <CourseCard key={course.id} course={course} priority={index < 2} />)}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-[#e1e8ec]">
          <MagnifyingGlass size={32} weight="duotone" className="mx-auto text-[#c32828]" />
          <h3 className="mt-4 text-balance text-2xl font-bold text-[#071d2f]">لا توجد دورة تطابق بحثك</h3>
          <p className="mx-auto mt-3 max-w-lg text-pretty text-sm text-[#617485]">جرّب كلمة أخرى أو اعرض جميع الدورات المتاحة حاليًا.</p>
          <button type="button" onClick={() => { setQuery(""); changeFilter("all"); setLevel("all"); setTopic("all"); setQuick("all"); }} className="mt-5 h-11 rounded-xl bg-[#031a2d] px-3 text-sm font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#c32828] active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c32828]">عرض جميع الدورات</button>
        </div>
      )}
    </div>
  );
}
