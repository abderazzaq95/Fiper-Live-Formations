"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarBlank, Clock, UsersThree, VideoCamera } from "@phosphor-icons/react";

import type { Course } from "@/lib/demo-data";
import { trackAcademyEvent } from "@/lib/analytics";

function remaining(target: string) {
  const distance = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance / 3_600_000) % 24),
    minutes: Math.floor((distance / 60_000) % 60),
  };
}

function googleCalendarUrl(course: Course) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: course.title,
    dates: `${new Date(course.isoStart).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}/${new Date(course.isoEnd).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    details: course.description,
    location: course.type === "online" ? course.platform : course.venueName ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function NextSession({ course }: { course: Course }) {
  const [time, setTime] = useState(() => remaining(course.isoStart));
  const [now, setNow] = useState(() => Date.now());
  const reduceMotion = useReducedMotion();
  const starts = new Date(course.isoStart).getTime();
  const ends = new Date(course.isoEnd).getTime();
  const live = now >= starts && now < ends;
  const courseHref = `/courses/${encodeURIComponent(course.slug)}`;
  const calendarUrl = useMemo(() => googleCalendarUrl(course), [course]);

  useEffect(() => {
    const update = () => {
      setTime(remaining(course.isoStart));
      setNow(Date.now());
    };
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, [course.isoStart]);

  return (
    <article className="overflow-hidden rounded-2xl bg-[#08243a] text-white shadow-[0_28px_80px_rgba(3,26,45,.18)]">
      <div className="grid lg:grid-cols-[1.08fr_.92fr]">
        <div className="relative min-h-72 overflow-hidden bg-[#d8e7f0] lg:min-h-full">
          <Image src={course.coverImage || "/brand/hero-reference.png"} alt={`صورة دورة ${course.title}`} fill priority sizes="(max-width: 1023px) 100vw, 46vw" className="object-cover" />
          <div className="absolute inset-0 bg-[#031a2d]/15" />
          <span className={`absolute right-5 top-5 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold text-white ${live ? "bg-[#0f8f6f]" : "bg-[#c32828]"}`}>
            <span className="h-2 w-2 rounded-full bg-white pulse-dot" />
            {live ? "مباشر الآن" : "الجلسة القادمة"}
          </span>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <p className="text-sm font-semibold text-[#ef8b8b]">ابدأ من أقرب موعد</p>
          <h2 className="mt-3 text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{course.title}</h2>
          <p className="mt-4 text-pretty text-sm leading-7 text-[#b7c7d2] sm:text-base">{course.description}</p>

          {!live ? (
            <div className="mt-6" aria-label="الوقت المتبقي لانطلاق الجلسة" aria-live="polite">
              <p className="mb-3 text-xs font-semibold text-[#8daac1]">تنطلق الجلسة بعد</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  ["يوم", time.days],
                  ["ساعة", time.hours],
                  ["دقيقة", time.minutes],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-xl bg-white/7 p-3 text-center">
                    <motion.span key={Number(value)} initial={reduceMotion ? false : { opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="latin block text-2xl font-bold tabular-nums">{String(value).padStart(2, "0")}</motion.span>
                    <span className="mt-1 block text-xs text-[#8daac1]">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-3"><CalendarBlank size={20} weight="duotone" className="text-[#ef6b6b]" /><div><dt className="text-xs text-[#8daac1]">الموعد</dt><dd className="mt-1 font-semibold">{course.dateLabel}</dd></div></div>
            <div className="flex items-center gap-3"><Clock size={20} weight="duotone" className="text-[#ef6b6b]" /><div><dt className="text-xs text-[#8daac1]">الوقت</dt><dd className="mt-1 font-semibold"><span className="latin">{course.timeLabel}</span> · {course.duration}</dd></div></div>
            <div className="flex items-center gap-3"><VideoCamera size={20} weight="duotone" className="text-[#ef6b6b]" /><div><dt className="text-xs text-[#8daac1]">طريقة الحضور</dt><dd className="mt-1 font-semibold">{course.type === "online" ? course.platform : course.venueName || "حضوري"}</dd></div></div>
            <div className="flex items-center gap-3"><UsersThree size={20} weight="duotone" className="text-[#ef6b6b]" /><div><dt className="text-xs text-[#8daac1]">حضور مؤكد</dt><dd className="mt-1 font-semibold">{course.registrations.toLocaleString("ar")} مسجل</dd></div></div>
          </dl>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href={`${courseHref}#register`} onClick={() => trackAcademyEvent({ name: "academy_register_start", source: "next_session", courseSlug: course.slug })} className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-[#c32828] px-3 text-base font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-[#a92121] active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">احجز مقعدك مجانًا</Link>
            <a href={calendarUrl} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 px-3 text-sm font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/10 active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Google Calendar</a>
            <a href={`${courseHref}/calendar`} className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 px-3 text-sm font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/10 active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">تنزيل الموعد</a>
          </div>
          <p className="mt-3 text-xs text-[#8daac1]">التوقيت المعروض حسب المنطقة الزمنية: <span className="latin">{course.timezone || "Africa/Casablanca"}</span></p>
        </div>
      </div>
    </article>
  );
}
