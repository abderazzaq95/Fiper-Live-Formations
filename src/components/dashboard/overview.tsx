import Link from "next/link";
import { ArrowLeft, ArrowUpLeft, CalendarDays, CheckCircle2, Clock3, MoreHorizontal, UserRoundCheck, UsersRound } from "lucide-react";
import { dashboardCourses, registrations } from "@/lib/demo-data";

const stats = [
  { label: "إجمالي التسجيلات", value: "346", change: "+18.4%", note: "مقارنة بالشهر الماضي", icon: UsersRound, tone: "blue" },
  { label: "الدورات النشطة", value: "03", change: "+1", note: "دورة جديدة هذا الشهر", icon: CalendarDays, tone: "red" },
  { label: "نسبة الحضور", value: "78%", change: "+6.2%", note: "آخر ثلاث دورات", icon: UserRoundCheck, tone: "green" },
  { label: "وصول الرسائل", value: "96.8%", change: "+1.4%", note: "بريد وواتساب", icon: CheckCircle2, tone: "violet" },
];

const toneMap: Record<string, string> = {
  blue: "bg-[#eaf5fc] text-[#1574ad]",
  red: "bg-[#fff0f1] text-[#C32828]",
  green: "bg-[#eaf8f3] text-[#168a65]",
  violet: "bg-[#f2effc] text-[#7059c8]",
};

const statusMap: Record<string, string> = {
  green: "bg-[#eaf8f3] text-[#168a65]",
  amber: "bg-[#fff6df] text-[#a36b00]",
  slate: "bg-[#eef2f4] text-[#617585]",
};

export function Overview() {
  return (
    <div className="mx-auto max-w-[1450px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-[10px] font-bold text-[#C32828]">الخميس، 27 أغسطس 2026</p><h1 className="mt-2 text-2xl font-bold tracking-[-0.035em] text-[#102536] sm:text-3xl">صباح الخير، خالد</h1><p className="mt-2 text-xs text-[#788d9c]">إليك ملخص أداء دورات Fiper اليوم.</p></div>
        <div className="flex items-center gap-2 rounded-xl border border-[#dce5eb] bg-white px-4 py-3 text-[10px] font-semibold text-[#5c7282]"><Clock3 size={15} className="text-[#C32828]" /> الدورة القادمة بعد 9 أيام</div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, change, note, icon: Icon, tone }) => (
          <article key={label} className="rounded-[20px] border border-[#dfe7ec] bg-white p-5 shadow-[0_12px_35px_rgba(15,42,61,.035)]">
            <div className="flex items-start justify-between"><span className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${toneMap[tone]}`}><Icon size={19} /></span><span className="latin flex items-center gap-1 rounded-full bg-[#eaf8f3] px-2 py-1 text-[9px] font-bold text-[#168a65]"><ArrowUpLeft size={11} />{change}</span></div>
            <p className="mt-6 text-[11px] font-semibold text-[#718695]">{label}</p>
            <p className="latin mt-2 text-[30px] font-bold tracking-[-0.05em] text-[#102536]">{value}</p>
            <p className="mt-1 text-[9px] text-[#9aabb7]">{note}</p>
          </article>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_.55fr]">
        <section className="rounded-[22px] border border-[#dfe7ec] bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div><h2 className="text-sm font-bold">نمو التسجيلات</h2><p className="mt-1 text-[9px] text-[#91a2ae]">آخر 30 يوماً</p></div>
            <select aria-label="فترة التقرير" className="rounded-xl border border-[#dfe7ec] bg-[#f8fafb] px-3 py-2 text-[9px] text-[#5c7282]"><option>آخر 30 يوماً</option><option>آخر 7 أيام</option></select>
          </div>
          <div className="mt-6 overflow-hidden rounded-2xl bg-[#f8fafb] p-3 sm:p-5">
            <svg viewBox="0 0 720 220" className="h-[230px] w-full" role="img" aria-label="رسم يوضح نمو التسجيلات">
              <defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1779b5" stopOpacity=".24" /><stop offset="100%" stopColor="#1779b5" stopOpacity="0" /></linearGradient></defs>
              {[30, 75, 120, 165, 210].map((y) => <line key={y} x1="0" x2="720" y1={y} y2={y} stroke="#dce7ed" strokeWidth="1" strokeDasharray="4 6" />)}
              <path d="M0 188 C55 175 82 182 122 156 S205 148 244 129 S322 142 365 105 S445 105 486 78 S565 95 610 57 S675 44 720 25 L720 220 L0 220 Z" fill="url(#area)" />
              <path d="M0 188 C55 175 82 182 122 156 S205 148 244 129 S322 142 365 105 S445 105 486 78 S565 95 610 57 S675 44 720 25" fill="none" stroke="#1779b5" strokeWidth="4" strokeLinecap="round" />
              <circle cx="610" cy="57" r="6" fill="white" stroke="#C32828" strokeWidth="4" />
            </svg>
            <div className="latin flex justify-between px-2 text-[8px] text-[#91a2ae]"><span>01 AUG</span><span>08 AUG</span><span>15 AUG</span><span>22 AUG</span><span>27 AUG</span></div>
          </div>
        </section>

        <section className="rounded-[22px] border border-[#dfe7ec] bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between"><div><h2 className="text-sm font-bold">أحدث التسجيلات</h2><p className="mt-1 text-[9px] text-[#91a2ae]">تحديث مباشر</p></div><Link href="/admin/registrations" className="text-[9px] font-bold text-[#1574ad]">عرض الكل</Link></div>
          <div className="mt-5 divide-y divide-[#edf2f5]">
            {registrations.slice(0, 4).map((person) => (
              <div key={person.email} className="flex items-center gap-3 py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#edf4f8] text-[10px] font-bold text-[#315a75]">{person.name.split(" ").map((p) => p[0]).join("")}</span>
                <span className="min-w-0"><strong className="block truncate text-[10px]">{person.name}</strong><small className="mt-1 block truncate text-[8px] text-[#91a2ae]">{person.time}</small></span>
                <span className="mr-auto h-2 w-2 rounded-full bg-[#32b886]" />
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-5 overflow-hidden rounded-[22px] border border-[#dfe7ec] bg-white">
        <div className="flex items-center justify-between border-b border-[#e8eef2] p-5 sm:px-6"><div><h2 className="text-sm font-bold">الدورات القادمة</h2><p className="mt-1 text-[9px] text-[#91a2ae]">إدارة سريعة للحالة والسعة</p></div><Link href="/admin/courses" className="flex items-center gap-2 text-[9px] font-bold text-[#1574ad]">كل الدورات <ArrowLeft size={13} /></Link></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-right">
            <thead className="bg-[#f8fafb] text-[9px] font-semibold text-[#7f929f]"><tr><th className="px-6 py-3">الدورة</th><th className="px-4 py-3">الموعد</th><th className="px-4 py-3">التسجيلات</th><th className="px-4 py-3">الحالة</th><th className="px-5 py-3" /></tr></thead>
            <tbody className="divide-y divide-[#edf2f5]">{dashboardCourses.map((course) => (
              <tr key={course.id} className="text-[10px] transition hover:bg-[#fbfcfd]"><td className="px-6 py-4 font-bold">{course.title}</td><td className="px-4 py-4 text-[#607686]">{course.date}</td><td className="px-4 py-4"><span className="latin font-bold">{course.registrations}/{course.capacity}</span><div className="mt-2 h-1 w-24 overflow-hidden rounded-full bg-[#e9eff3]"><div className="h-full rounded-full bg-[#1779b5]" style={{ width: `${(course.registrations / course.capacity) * 100}%` }} /></div></td><td className="px-4 py-4"><span className={`rounded-full px-3 py-1.5 text-[8px] font-bold ${statusMap[course.tone]}`}>{course.status}</span></td><td className="px-5 py-4"><button aria-label="خيارات الدورة" className="text-[#8598a6]"><MoreHorizontal size={18} /></button></td></tr>
            ))}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
