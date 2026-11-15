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
    [t.total, String(filtered.length), "bg-[var(--adm-blue-soft)] text-[var(--adm-blue)]"],
    [t.confirmed, String(confirmed), "bg-[var(--adm-good-soft)] text-[var(--adm-good)]"],
    [t.wait, String(waitlisted), "bg-[var(--adm-mid-soft)] text-[var(--adm-mid-ink)]"],
  ] as const;

  return <>
    <div className="mb-5 flex flex-col items-stretch justify-end gap-3 rounded-[12px] border border-[var(--adm-line)] bg-[var(--adm-panel)] shadow-[0_1px_2px_rgba(15,23,42,.05)] p-4 sm:flex-row sm:items-center">
      <label className="text-[12px] font-bold text-[var(--adm-ink-3)]" htmlFor="registrations-course-filter">{t.course}</label>
      <div className="relative">
        <select id="registrations-course-filter" value={course} onChange={(event) => setCourse(event.target.value)} className="h-10 w-full appearance-none rounded-lg border border-[var(--adm-line)] bg-[var(--adm-panel)] px-4 pl-9 text-[12px] font-bold text-[var(--adm-ink-2)] sm:w-auto sm:min-w-[250px]">
          <option value="all">{t.allCourses}</option>
          {courses.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <ChevronDown size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--adm-ink-3)]" />
      </div>
    </div>
    <CustomMessageComposer recipients={filtered} />
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map(([label, value, tone]) => <div key={label} className="flex items-center gap-4 rounded-[12px] border border-[var(--adm-line)] bg-[var(--adm-panel)] shadow-[0_1px_2px_rgba(15,23,42,.05)] p-5"><span className={"flex h-11 w-11 items-center justify-center rounded-[10px] " + tone}><UsersRound size={19} /></span><span><small className="text-[11.5px] text-[var(--adm-ink-4)]">{label}</small><strong className="latin mt-1 block text-xl">{value}</strong></span></div>)}
    </div>
    <RegistrationsTable key={course} registrations={filtered} disableCourseFilter />
  </>;
}