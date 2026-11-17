"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Search, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { CourseCardActions } from "@/components/dashboard/course-card-actions";
import type { DashboardCourse } from "@/lib/data/courses";

const statusMap: Record<string, string> = {
  green: "bg-[#e3f6ec] text-[#047857]",
  amber: "bg-[#fef3c7] text-[#92400e]",
  slate: "bg-[#eef2f7] text-[#56657c]",
  red: "bg-[#fbe8ea] text-[#c2182b]",
};

// Same labels the course list uses (lib/data/courses.ts), so the filter matches every card.
const STATUSES: DashboardCourse["status"][] = ["مفتوح", "قائمة انتظار", "مغلق", "مسودة", "مكتملة"];

export function CoursesBrowser({ courses }: { courses: DashboardCourse[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const visible = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("ar");
    return courses.filter((course) => (status === "all" || course.status === status) && (!term || course.title.toLocaleLowerCase("ar").includes(term)));
  }, [courses, query, status]);

  return (
    <>
      <div className="mt-7 flex flex-col gap-3 rounded-[12px] border border-[#dfe6f0] bg-white shadow-[0_1px_2px_rgba(15,23,42,.05)] p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1"><Search size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b]" /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="ابحث باسم الدورة" placeholder="ابحث باسم الدورة..." className="h-11 w-full rounded-lg border border-[#dfe6f0] bg-[#f8fafc] pr-10 pl-4 text-[12px] focus:border-[#a9b9e3] focus:outline-none" /></div>
        <select aria-label="حالة الدورة" value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 rounded-lg border border-[#dfe6f0] bg-[#f8fafc] px-4 text-[12px] text-[#56657c]"><option value="all">جميع الحالات</option>{STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <span className="text-[11.5px] text-[#64748b] sm:px-3"><span className="latin font-bold text-[#0f172a]">{visible.length}</span> دورات</span>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        {visible.map((course) => { const index = courses.indexOf(course); return (
          <article key={course.id} className="group overflow-hidden rounded-[12px] border border-[#dfe6f0] bg-white shadow-[0_1px_2px_rgba(15,23,42,.05)]">
            <div className={`relative h-32 overflow-visible p-5 ${index === 0 ? "bg-[#0b1533]" : index === 1 ? "bg-[#13204a]" : "bg-[#1b2c62]"}`}>
              <div className="absolute -left-10 -top-16 h-40 w-40 rounded-full border-[28px] border-white/[0.035]" />
              <div className="absolute bottom-0 right-0 h-16 w-full bg-[linear-gradient(110deg,transparent_20%,rgba(42,134,194,.2)_21%,transparent_22%,transparent_48%,rgba(195,40,40,.15)_49%,transparent_50%)]" />
              <div className="relative flex items-start justify-between"><span className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${statusMap[course.tone]}`}>{course.status}</span><CourseCardActions courseId={course.id} courseSlug={course.slug} registrationOpen={course.registrationOpen} featured={course.featured} courseTitle={course.title} variant="menu" /></div>
              <span className="latin absolute bottom-4 left-5 text-[11.5px] font-semibold text-white/35">FIPER ACADEMY</span>
            </div>
            <div className="p-5">
              <Link href={`/admin/courses/${course.id}`} aria-label={`تعديل ${course.title}`} className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#1d4ed8]">
              <h2 className="min-h-12 text-sm font-bold leading-6">{course.title}</h2>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-lg bg-[#f8fafc] p-3 text-[11.5px] text-[#56657c]"><CalendarDays size={14} className="text-[#1d4ed8]" />{course.date}</div>
                <div className="flex items-center gap-2 rounded-lg bg-[#f8fafc] p-3 text-[11.5px] text-[#56657c]"><UsersRound size={14} className="text-[#1d4ed8]" /><span className="latin font-bold">{course.registrations}/{course.capacity}</span></div>
              </div>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#e9eef6]"><div className={`h-full rounded-full ${course.registrations >= course.capacity ? "bg-[#e0a11b]" : "bg-[#1d4ed8]"}`} style={{ width: `${Math.min(100, (course.registrations / course.capacity) * 100)}%` }} /></div>
              </Link>
              <div className="mt-5 flex items-center gap-2 border-t border-[#e9eef6] pt-4">
                <Link href={`/admin/courses/${course.id}`} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#0b1533] py-3 text-[11.5px] font-bold text-white">تعديل الدورة <ArrowLeft size={13} /></Link>
                <CourseCardActions courseId={course.id} courseSlug={course.slug} registrationOpen={course.registrationOpen} featured={course.featured} courseTitle={course.title} variant="quick" />
              </div>
            </div>
          </article>
        ); })}
      </div>
      {!visible.length && <p className="mt-5 rounded-[12px] border border-[#dfe6f0] bg-white p-10 text-center text-[12px] text-[#64748b]">لا توجد دورات مطابقة.</p>}
    </>
  );
}
