import { Download } from "lucide-react";
import { AttendanceDashboard } from "@/components/dashboard/attendance-dashboard";
import { AttendanceSyncButton } from "@/components/dashboard/attendance-sync-button";
import { getDashboardAttendance, listAttendanceSessions } from "@/lib/data/dashboard";
import { listDashboardCourses } from "@/lib/data/courses";

const t = { meet: "Google Meet", title: "الحضور", desc: "مزامنة الحضور ومدة المشاركة", sync: "مزامنة Meet", export: "تصدير" } as const;

export default async function AttendancePage() {
  const [data, courses, sessions] = await Promise.all([getDashboardAttendance(), listDashboardCourses(), listAttendanceSessions()]);
  return <div className="mx-auto max-w-[1450px]">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="text-[12px] font-bold text-[var(--adm-brand)]">{t.meet}</p><h1 className="mt-2 text-2xl font-bold sm:text-3xl">{t.title}</h1><p className="mt-2 text-xs text-[var(--adm-ink-4)]">{t.desc}</p></div>
      <div className="flex gap-2"><AttendanceSyncButton label={t.sync} /><button type="button" className="flex h-11 items-center gap-2 rounded-lg bg-[var(--adm-strong)] px-4 text-[11.5px] font-bold text-white"><Download size={14} />{t.export}</button></div>
    </div>
    <div className="mt-7"><AttendanceDashboard rows={data.rows} courseOptions={courses.map((course) => course.title)} sessions={sessions} /></div>
  </div>;
}