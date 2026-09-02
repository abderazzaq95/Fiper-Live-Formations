"use client";

import { Clock3, ChevronDown, UserRoundCheck, UserRoundX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AttendanceTable } from "@/components/dashboard/attendance-table";
import type { AttendanceRow } from "@/lib/data/dashboard";

const t = {
  courseFilter: "الدورة",
  allCourses: "كل الدورات",
  attended: "الحاضرون",
  absent: "لم يحضروا",
  average: "متوسط الحضور",
  sessionData: "من بيانات جلسات الحضور",
  pending: "بانتظار بدء الدورة",
} as const;

export function AttendanceDashboard({ rows }: { rows: AttendanceRow[] }) {
  const courses = useMemo(() => [...new Set(rows.map((row) => row.course).filter(Boolean))].sort(), [rows]);
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

  const filteredRows = useMemo(() => course === "all" ? rows : rows.filter((row) => row.course === course), [rows, course]);
  const attended = filteredRows.filter((row) => row.status === "attended").length;
  const absent = filteredRows.filter((row) => row.status === "absent").length;
  const pending = filteredRows.filter((row) => row.status === "pending").length;
  const durations = filteredRows.filter((row) => row.durationMinutes > 0).map((row) => row.durationMinutes);
  const average = durations.length ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length) : 0;
  const eligible = attended + absent;
  const stats = [
    [t.attended, String(attended), eligible ? Math.round(attended / eligible * 100) + "%" : "—", UserRoundCheck, "bg-[#eaf8f3] text-[#168a65]"],
    [t.absent, String(absent), eligible ? Math.round(absent / eligible * 100) + "%" : pending + " " + t.pending, UserRoundX, "bg-[#fff0f1] text-[#C32828]"],
    [t.average, average + " دقيقة", t.sessionData, Clock3, "bg-[#eaf5fc] text-[#1574ad]"],
  ] as const;

  return <>
    <div className="mb-5 flex items-center justify-end gap-3 rounded-[18px] border border-[#dfe7ec] bg-white p-4">
      <label className="text-[10px] font-bold text-[#617585]" htmlFor="attendance-course-filter">{t.courseFilter}</label>
      <div className="relative">
        <select id="attendance-course-filter" value={course} onChange={(event) => setCourse(event.target.value)} className="h-10 min-w-[250px] appearance-none rounded-xl border border-[#dfe7ec] bg-white px-4 pl-9 text-[10px] font-bold text-[#29485d]">
          <option value="all">{t.allCourses}</option>
          {courses.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <ChevronDown size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#617585]" />
      </div>
    </div>
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map(([label, value, note, Icon, tone]) => <div key={label} className="flex items-center gap-4 rounded-[18px] border border-[#dfe7ec] bg-white p-5"><span className={"flex h-11 w-11 items-center justify-center rounded-[14px] " + tone}><Icon size={19} /></span><span><small className="text-[9px] text-[#7f929f]">{label}</small><strong className="mt-1 block text-xl">{value}</strong><small className="text-[8px] text-[#91a2ae]">{note}</small></span></div>)}
    </div>
    <AttendanceTable key={course} rows={filteredRows} disableCourseFilter />
  </>;
}