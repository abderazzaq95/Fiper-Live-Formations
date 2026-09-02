"use client";

import * as XLSX from "xlsx";
import { CalendarCheck2, ChevronDown, Download, Filter, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AttendanceRow } from "@/lib/data/dashboard";

const t = { email: "البريد", excel: "تصدير Excel", records: "سجلات الحضور", filter: "تصفية مباشرة حسب الدورة والحالة", search: "ابحث عن مشارك...", allCourses: "كل الدورات", allStatuses: "كل الحالات", participant: "المشارك", course: "الدورة", courseDate: "تاريخ الدورة", status: "الحالة", joined: "وقت الدخول", left: "وقت الخروج", duration: "مدة الحضور", match: "المطابقة", attended: "حضر", absent: "لم يحضر", pending: "لم تبدأ", sync: "بانتظار المزامنة", empty: "لا توجد نتائج مطابقة." } as const;
const labels: Record<AttendanceRow["status"], string> = { attended: t.attended, absent: t.absent, pending: t.pending };
const matchLabels: Record<string, string> = { name: "الاسم", email: "البريد", unregistered: "غير مسجل", pending: t.sync };

export function AttendanceTable({ rows, disableCourseFilter = false }: { rows: AttendanceRow[]; disableCourseFilter?: boolean }) {
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("all");
  const [status, setStatus] = useState("all");
  const courses = useMemo(() => [...new Set(rows.map((row) => row.course).filter(Boolean))], [rows]);
  const filterHydrated = useRef(false);
  useEffect(() => {
    if (!filterHydrated.current) {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get("q") ?? "");
      if (!disableCourseFilter) setCourse(params.get("course") ?? "all");
      setStatus(params.get("status") ?? "all");
      filterHydrated.current = true;
      return;
    }
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (course !== "all") params.set("course", course);
    if (status !== "all") params.set("status", status);
    const url = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [query, course, status]);
  const filtered = useMemo(() => rows.filter((row) => {
    const haystack = `${row.name} ${row.email}`.toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (disableCourseFilter || course === "all" || row.course === course) && (status === "all" || row.status === status);
  }), [rows, query, course, status]);
  const exportExcel = () => {
    const data = [[t.participant, t.email, t.course, t.courseDate, t.status, `${t.joined} (DE)`, `${t.left} (DE)`, t.duration, t.match], ...filtered.map((person) => [person.name, person.email, person.course, person.courseDate, labels[person.status], person.joinedAt, person.leftAt, person.status === "attended" ? `${person.durationMinutes} دقيقة` : "—", matchLabels[person.matchMethod] ?? person.matchMethod])];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    worksheet["!cols"] = [{ wch: 24 }, { wch: 30 }, { wch: 32 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 20 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    const bytes = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    const link = document.createElement("a"); link.href = url; link.download = "fiper-attendance.xlsx"; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <section className="mt-5 overflow-hidden rounded-[22px] border border-[#dfe7ec] bg-white">
    <div className="flex flex-col gap-3 border-b border-[#e8eef2] p-5 sm:flex-row sm:items-center">
      <div><h2 className="text-sm font-bold">{t.records}</h2><p className="mt-1 text-[9px] text-[#91a2ae]">{t.filter}</p><button type="button" onClick={exportExcel} className="mt-3 flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#102f47] px-4 text-[9px] font-bold text-white"><Download size={14} />{t.excel}</button></div>
      <div className="relative mr-auto w-full sm:w-64"><Search size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8ba0ae]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} className="h-10 w-full rounded-xl border border-[#dfe7ec] bg-[#f8fafb] pr-10 text-[9px] focus:outline-none" /></div>
      <label className="relative hidden"><span className="sr-only">{t.course}</span><select value={course} onChange={(event) => setCourse(event.target.value)} className="h-10 appearance-none rounded-xl border border-[#dfe7ec] bg-white px-3 pl-8 text-[9px] font-bold text-[#617585]"><option value="all">{t.allCourses}</option>{courses.map((item) => <option key={item} value={item}>{item}</option>)}</select><ChevronDown size={12} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2" /></label>
      <label className="relative"><span className="sr-only">{t.status}</span><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 appearance-none rounded-xl border border-[#dfe7ec] bg-white px-3 pl-8 text-[9px] font-bold text-[#617585]"><option value="all">{t.allStatuses}</option><option value="attended">{t.attended}</option><option value="absent">{t.absent}</option><option value="pending">{t.pending}</option></select><Filter size={12} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2" /></label>
    </div>
    <div className="overflow-x-auto"><table className="w-full min-w-[1120px] text-right"><thead className="bg-[#f8fafb] text-[9px] text-[#7f929f]"><tr><th className="px-6 py-3">{t.participant}</th><th className="px-4 py-3">{t.course}</th><th className="px-4 py-3">{t.courseDate}</th><th className="px-4 py-3">{t.status}</th><th className="px-4 py-3">{t.joined}<small className="mt-1 block text-[7px] font-normal">DE</small></th><th className="px-4 py-3">{t.left}<small className="mt-1 block text-[7px] font-normal">DE</small></th><th className="px-4 py-3">{t.duration}</th><th className="px-4 py-3">{t.match}</th></tr></thead><tbody className="divide-y divide-[#edf2f5]">{filtered.length ? filtered.map((person) => <tr key={person.id} className="text-[9px]"><td className="px-6 py-4"><strong className="block text-[10px]">{person.name}</strong><small className="latin mt-1 block text-[8px] text-[#91a2ae]">{person.email}</small></td><td className="px-4 py-4 text-[#607686]">{person.course}</td><td className="px-4 py-4 text-[#607686] whitespace-nowrap">{person.courseDate}</td><td className="px-4 py-4"><span className={`rounded-full px-3 py-1.5 text-[8px] font-bold ${person.status === "attended" ? "bg-[#eaf8f3] text-[#168a65]" : person.status === "pending" ? "bg-[#eaf5fc] text-[#1574ad]" : "bg-[#fff0f1] text-[#C32828]"}`}>{labels[person.status]}</span></td><td className="px-4 py-4 text-[#607686]"><span className="latin">{person.joinedAt}</span></td><td className="px-4 py-4 text-[#607686]"><span className="latin">{person.leftAt}</span></td><td className="px-4 py-4">{person.status === "attended" ? `${person.durationMinutes} دقيقة` : "—"}</td><td className="px-4 py-4"><span className="flex items-center gap-2 text-[#168a65]"><CalendarCheck2 size={14} /> {matchLabels[person.matchMethod] ?? person.matchMethod}</span></td></tr>) : <tr><td colSpan={8} className="px-6 py-14 text-center text-xs text-[#788d9c]">{t.empty}</td></tr>}</tbody></table></div>
  </section>;
}