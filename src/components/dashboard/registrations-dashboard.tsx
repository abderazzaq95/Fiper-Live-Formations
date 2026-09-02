"use client";

import { ChevronDown, UsersRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { RegistrationsTable } from "@/components/dashboard/registrations-table";
import type { DashboardRegistration } from "@/lib/data/courses";

const t = { course: "الدورة", allCourses: "كل الدورات", total: "إجمالي المسجلين", confirmed: "المؤكدون", wait: "قائمة الانتظار" } as const;

export function RegistrationsDashboard({ registrations }: { registrations: DashboardRegistration[] }) {
  const courses = useMemo(() => [...new Set(registrations.map((item) => item.course).filter(Boolean))].sort(), [registrations]);
  const [course, setCourse] = useState("all");
  const hydrated = useRef(false);

  useEffect(() => {
    if (!hydrated.current) {
      const initial = new URLSearchParams(window.location.search).get("course") ?? "all";
      setCourse(initial === "all" || courses.includes(initial) ? initial : "all");
      hydrated.current = true;
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (course === "all") params.delete("course"); else params.set("course", course);
    window.history.replaceState(null, "", params.toString() ? window.location.pathname + "?" + params.toString() : window.location.pathname);
  }, [course, courses]);

  const filtered = useMemo(() => course === "all" ? registrations : registrations.filter((item) => item.course === course), [registrations, course]);
  const confirmed = filtered.filter((item) => item.status === "مؤكد").length;
  const waitlisted = filtered.filter((item) => item.status === "قائمة انتظار").length;
  const cards = [
    [t.total, String(filtered.length), "bg-[#eaf5fc] text-[#1574ad]"],
    [t.confirmed, String(confirmed), "bg-[#eaf8f3] text-[#168a65]"],
    [t.wait, String(waitlisted), "bg-[#fff6df] text-[#a36b00]"],
  ] as const;

  return <>
    <div className="mb-5 flex items-center justify-end gap-3 rounded-[18px] border border-[#dfe7ec] bg-white p-4">
      <label className="text-[10px] font-bold text-[#617585]" htmlFor="registrations-course-filter">{t.course}</label>
      <div className="relative">
        <select id="registrations-course-filter" value={course} onChange={(event) => setCourse(event.target.value)} className="h-10 min-w-[250px] appearance-none rounded-xl border border-[#dfe7ec] bg-white px-4 pl-9 text-[10px] font-bold text-[#29485d]">
          <option value="all">{t.allCourses}</option>
          {courses.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <ChevronDown size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#617585]" />
      </div>
    </div>
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map(([label, value, tone]) => <div key={label} className="flex items-center gap-4 rounded-[18px] border border-[#dfe7ec] bg-white p-5"><span className={"flex h-11 w-11 items-center justify-center rounded-[14px] " + tone}><UsersRound size={19} /></span><span><small className="text-[9px] text-[#7f929f]">{label}</small><strong className="latin mt-1 block text-xl">{value}</strong></span></div>)}
    </div>
    <RegistrationsTable key={course} registrations={filtered} disableCourseFilter />
  </>;
}