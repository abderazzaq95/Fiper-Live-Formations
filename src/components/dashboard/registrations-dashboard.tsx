"use client";

import { ChevronDown, UsersRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { RegistrationsTable } from "@/components/dashboard/registrations-table";
import { CustomMessageComposer } from "@/components/dashboard/custom-message-composer";
import type { DashboardRegistration } from "@/lib/data/courses";

const t = { course: "الدورة", allCourses: "كل الدورات", total: "إجمالي المسجلين", confirmed: "المؤكدون", wait: "قائمة الانتظار" } as const;

export function RegistrationsDashboard({ registrations, courseOptions = [] }: { registrations: DashboardRegistration[]; courseOptions?: string[] }) {
  const courses = useMemo(() => [...new Set([...courseOptions, ...registrations.map((item) => item.course)].filter(Boolean))].sort(), [registrations, courseOptions]);
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
    [t.total, String(filtered.length), "bg-[#e6eefc] text-[#1d4ed8]"],
    [t.confirmed, String(confirmed), "bg-[#e3f6ec] text-[#047857]"],
    [t.wait, String(waitlisted), "bg-[#fef3c7] text-[#92400e]"],
  ] as const;

  return <>
    <div className="mb-5 flex flex-col items-stretch justify-end gap-3 rounded-[12px] border border-[#dfe6f0] bg-white shadow-[0_1px_2px_rgba(15,23,42,.05)] p-4 sm:flex-row sm:items-center">
      <label className="text-[12px] font-bold text-[#56657c]" htmlFor="registrations-course-filter">{t.course}</label>
      <div className="relative">
        <select id="registrations-course-filter" value={course} onChange={(event) => setCourse(event.target.value)} className="h-10 w-full appearance-none rounded-lg border border-[#dfe6f0] bg-white px-4 pl-9 text-[12px] font-bold text-[#334155] sm:w-auto sm:min-w-[250px]">
          <option value="all">{t.allCourses}</option>
          {courses.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <ChevronDown size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#56657c]" />
      </div>
    </div>
    <CustomMessageComposer recipients={filtered} />
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map(([label, value, tone]) => <div key={label} className="flex items-center gap-4 rounded-[12px] border border-[#dfe6f0] bg-white shadow-[0_1px_2px_rgba(15,23,42,.05)] p-5"><span className={"flex h-11 w-11 items-center justify-center rounded-[10px] " + tone}><UsersRound size={19} /></span><span><small className="text-[11.5px] text-[#64748b]">{label}</small><strong className="latin mt-1 block text-xl">{value}</strong></span></div>)}
    </div>
    <RegistrationsTable key={course} registrations={filtered} disableCourseFilter />
  </>;
}