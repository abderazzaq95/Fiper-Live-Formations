import Link from "next/link";
import { ArrowLeft, ArrowUpLeft, CalendarDays, CheckCircle2, Clock3, MoreHorizontal, UserRoundCheck, UsersRound } from "lucide-react";
import { listDashboardCourses, listDashboardRegistrations } from "@/lib/data/courses";
import { getDashboardRegistrationGrowth } from "@/lib/data/dashboard";

const toneMap: Record<string, string> = {
  blue: "bg-[var(--adm-blue-soft)] text-[var(--adm-blue)]",
  red: "bg-[var(--adm-brand-soft)] text-[var(--adm-brand)]",
  green: "bg-[var(--adm-good-soft)] text-[var(--adm-good)]",
  violet: "bg-[var(--adm-violet-soft)] text-[var(--adm-violet)]",
};

const statusMap: Record<string, string> = {
  green: "bg-[var(--adm-good-soft)] text-[var(--adm-good)]",
  amber: "bg-[var(--adm-mid-soft)] text-[var(--adm-mid-ink)]",
  slate: "bg-[var(--adm-sunken)] text-[var(--adm-ink-3)]",
};

export async function Overview() {
  const [dashboardCourses, registrations, growth] = await Promise.all([listDashboardCourses(), listDashboardRegistrations(), getDashboardRegistrationGrowth(30)]);
  const nextCourse = dashboardCourses.filter((course) => course.status !== "مسودة" && course.startsAt && new Date(course.startsAt).getTime() > new Date().getTime()).sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0];
  const daysUntilNext = nextCourse ? Math.max(0, Math.ceil((new Date(nextCourse.startsAt).getTime() - new Date().getTime()) / 86_400_000)) : null;
  const growthValues = growth.map((point) => point.count);
  const maxGrowth = Math.max(1, ...growthValues);
  const chartPoints = growth.length > 1 ? growth.map((point, index) => `${(index / (growth.length - 1)) * 720},${210 - (point.count / maxGrowth) * 180}`).join(" ") : "0,210 720,210";
  const areaPoints = `${chartPoints} 720,220 0,220`;
  const todayLabel = new Intl.DateTimeFormat("ar", { dateStyle: "full" }).format(new Date());
  const stats = [
  { label: "إجمالي التسجيلات", value: String(registrations.length), change: "+18.4%", note: "مقارنة بالشهر الماضي", icon: UsersRound, tone: "blue" },
  { label: "الدورات النشطة", value: String(dashboardCourses.filter((course) => course.status !== "مسودة").length).padStart(2, "0"), change: "+1", note: "دورة جديدة هذا الشهر", icon: CalendarDays, tone: "red" },
  { label: "نسبة الحضور", value: "—", change: "+6.2%", note: "آخر ثلاث دورات", icon: UserRoundCheck, tone: "green" },
  { label: "وصول الرسائل", value: "—", change: "+1.4%", note: "بريد وواتساب", icon: CheckCircle2, tone: "violet" },
];
  return (
    <div className="mx-auto max-w-[1450px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-[12px] font-bold text-[var(--adm-brand)]">{todayLabel}</p><h1 className="mt-2 text-2xl font-bold tracking-[-0.035em] text-[var(--adm-ink)] sm:text-3xl">ملخص لوحة التحكم</h1><p className="mt-2 text-xs text-[var(--adm-ink-4)]">إليك ملخص أداء دورات Fiper اليوم.</p></div>
        <div className="flex items-center gap-2 rounded-lg border border-[var(--adm-line)] bg-[var(--adm-panel)] px-4 py-3 text-[12px] font-semibold text-[var(--adm-ink-3)]"><Clock3 size={15} className="text-[var(--adm-brand)]" /> {daysUntilNext === null ? "لا توجد دورة قادمة" : `الدورة القادمة بعد ${daysUntilNext} يوم`}</div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, change, note, icon: Icon, tone }) => (
          <article key={label} className="rounded-[12px] border border-[var(--adm-line)] bg-[var(--adm-panel)] shadow-[0_1px_2px_rgba(15,23,42,.05)] p-5">
            <div className="flex items-start justify-between"><span className={`flex h-11 w-11 items-center justify-center rounded-[10px] ${toneMap[tone]}`}><Icon size={19} /></span><span className="latin flex items-center gap-1 rounded-full bg-[var(--adm-good-soft)] px-2 py-1 text-[11.5px] font-bold text-[var(--adm-good)]"><ArrowUpLeft size={11} />{change}</span></div>
            <p className="mt-6 text-[12.5px] font-semibold text-[var(--adm-ink-3)]">{label}</p>
            <p className="latin mt-2 text-[30px] font-bold tracking-[-0.05em] text-[var(--adm-ink)]">{value}</p>
            <p className="mt-1 text-[11.5px] text-[var(--adm-ink-4)]">{note}</p>
          </article>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_.55fr]">
        <section className="rounded-[12px] border border-[var(--adm-line)] bg-[var(--adm-panel)] shadow-[0_1px_2px_rgba(15,23,42,.05)] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div><h2 className="text-sm font-bold">نمو التسجيلات</h2><p className="mt-1 text-[11.5px] text-[var(--adm-ink-4)]">آخر 30 يوماً</p></div>
            <select aria-label="فترة التقرير" className="rounded-lg border border-[var(--adm-line)] bg-[var(--adm-panel-2)] px-3 py-2 text-[11.5px] text-[var(--adm-ink-3)]"><option>آخر 30 يوماً</option><option>آخر 7 أيام</option></select>
          </div>
          <div className="mt-6 overflow-hidden rounded-xl bg-[var(--adm-panel-2)] p-3 sm:p-5">
            <svg viewBox="0 0 720 220" className="h-[230px] w-full" role="img" aria-label="نمو التسجيلات الفعلي">
              <defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" style={{ stopColor: "var(--adm-blue)" }} stopOpacity=".24" /><stop offset="100%" style={{ stopColor: "var(--adm-blue)" }} stopOpacity="0" /></linearGradient></defs>
              {[30, 75, 120, 165, 210].map((y) => <line key={y} x1="0" x2="720" y1={y} y2={y} style={{ stroke: "var(--adm-line)" }} strokeWidth="1" strokeDasharray="4 6" />)}
              <polygon points={areaPoints} fill="url(#area)" />
              <polyline points={chartPoints} fill="none" style={{ stroke: "var(--adm-blue)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              {growth.length > 0 && <circle cx={(growth.length - 1) / Math.max(1, growth.length - 1) * 720} cy={210 - (growth[growth.length - 1].count / maxGrowth) * 180} r="6" style={{ fill: "var(--adm-panel)", stroke: "var(--adm-brand)" }} strokeWidth="4" />}
            </svg>
            <div className="latin flex justify-between px-2 text-[11px] text-[var(--adm-ink-4)]">{growth.length ? <><span>{growth[0].label}</span><span>{growth[Math.floor(growth.length * .25)].label}</span><span>{growth[Math.floor(growth.length * .5)].label}</span><span>{growth[Math.floor(growth.length * .75)].label}</span><span>{growth[growth.length - 1].label}</span></> : <span>لا توجد تسجيلات في الفترة المحددة</span>}</div>
          </div>
        </section>

        <section className="rounded-[12px] border border-[var(--adm-line)] bg-[var(--adm-panel)] shadow-[0_1px_2px_rgba(15,23,42,.05)] p-5 sm:p-6">
          <div className="flex items-center justify-between"><div><h2 className="text-sm font-bold">أحدث التسجيلات</h2><p className="mt-1 text-[11.5px] text-[var(--adm-ink-4)]">تحديث مباشر</p></div><Link href="/admin/registrations" className="text-[11.5px] font-bold text-[var(--adm-blue)]">عرض الكل</Link></div>
          <div className="mt-5 divide-y divide-[var(--adm-sunken)]">
            {registrations.slice(0, 4).map((person) => (
              <div key={person.email} className="flex items-center gap-3 py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--adm-hover)] text-[12px] font-bold text-[var(--adm-ink-2)]">{person.name.split(" ").map((p) => p[0]).join("")}</span>
                <span className="min-w-0"><strong className="block truncate text-[12px]">{person.name}</strong><small className="mt-1 block truncate text-[11px] text-[var(--adm-ink-4)]">{person.time}</small></span>
                <span className="mr-auto h-2 w-2 rounded-full bg-[var(--adm-good-2)]" />
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-5 overflow-hidden rounded-[12px] border border-[var(--adm-line)] bg-[var(--adm-panel)] shadow-[0_1px_2px_rgba(15,23,42,.05)]">
        <div className="flex items-center justify-between border-b border-[var(--adm-line)] p-5 sm:px-6"><div><h2 className="text-sm font-bold">الدورات القادمة</h2><p className="mt-1 text-[11.5px] text-[var(--adm-ink-4)]">إدارة سريعة للحالة والسعة</p></div><Link href="/admin/courses" className="flex items-center gap-2 text-[11.5px] font-bold text-[var(--adm-blue)]">كل الدورات <ArrowLeft size={13} /></Link></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-right">
            <thead className="bg-[var(--adm-panel-2)] text-[11.5px] font-semibold text-[var(--adm-ink-4)]"><tr><th className="px-6 py-3">الدورة</th><th className="px-4 py-3">الموعد</th><th className="px-4 py-3">التسجيلات</th><th className="px-4 py-3">الحالة</th><th className="px-5 py-3" /></tr></thead>
            <tbody className="divide-y divide-[var(--adm-sunken)]">{dashboardCourses.map((course) => (
              <tr key={course.id} className="text-[12px] transition hover:bg-[var(--adm-panel-2)]"><td className="px-6 py-4 font-bold">{course.title}</td><td className="px-4 py-4 text-[var(--adm-ink-3)]">{course.date}</td><td className="px-4 py-4"><span className="latin font-bold">{course.registrations}/{course.capacity}</span><div className="mt-2 h-1 w-24 overflow-hidden rounded-full bg-[var(--adm-sunken)]"><div className="h-full rounded-full bg-[var(--adm-blue)]" style={{ width: `${(course.registrations / course.capacity) * 100}%` }} /></div></td><td className="px-4 py-4"><span className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${statusMap[course.tone]}`}>{course.status}</span></td><td className="px-5 py-4"><button aria-label="خيارات الدورة" className="text-[var(--adm-ink-4)]"><MoreHorizontal size={18} /></button></td></tr>
            ))}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
