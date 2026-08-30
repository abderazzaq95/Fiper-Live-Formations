import { CalendarCheck2, Clock3, Download, RefreshCw, Search, UserRoundCheck, UserRoundX } from "lucide-react";
import { getDashboardAttendance } from "@/lib/data/dashboard";

const methodLabel: Record<string, string> = {
  automatic: "تلقائية",
  manual: "يدوية",
  pending: "بانتظار المزامنة",
};

export default async function AttendancePage() {
  const data = await getDashboardAttendance();
  const eligible = data.attended + data.absent;
  const stats = [
    ["الحاضرون", String(data.attended), eligible ? `${Math.round((data.attended / eligible) * 100)}% من الحضور المسجل` : "لا توجد بيانات", UserRoundCheck, "bg-[#eaf8f3] text-[#168a65]"],
    ["لم يحضروا", String(data.absent), eligible ? `${Math.round((data.absent / eligible) * 100)}% بعد بدء الدورة` : `${data.pending} بانتظار بدء الدورة`, UserRoundX, "bg-[#fff0f1] text-[#C32828]"],
    ["متوسط الحضور", `${data.averageMinutes} دقيقة`, "من بيانات جلسات الحضور", Clock3, "bg-[#eaf5fc] text-[#1574ad]"],
  ] as const;

  return (
    <div className="mx-auto max-w-[1450px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-[10px] font-bold text-[#C32828]">Google Meet</p><h1 className="mt-2 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">الحضور</h1><p className="mt-2 text-xs text-[#788d9c]">مزامنة الحضور ومدة المشاركة مع إمكانية التصحيح اليدوي.</p></div>
        <div className="flex gap-2"><button type="button" className="flex h-11 items-center gap-2 rounded-xl border border-[#dce5eb] bg-white px-4 text-[9px] font-bold text-[#536b7b]"><RefreshCw size={14} /> مزامنة Meet</button><button type="button" className="flex h-11 items-center gap-2 rounded-xl bg-[#102f47] px-4 text-[9px] font-bold text-white"><Download size={14} /> تصدير</button></div>
      </div>
      <div className="mt-7 grid gap-4 sm:grid-cols-3">{stats.map(([label, value, note, Icon, tone]) => <div key={label} className="flex items-center gap-4 rounded-[18px] border border-[#dfe7ec] bg-white p-5"><span className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${tone}`}><Icon size={19} /></span><span><small className="text-[9px] text-[#7f929f]">{label}</small><strong className="mt-1 block text-xl">{value}</strong><small className="text-[8px] text-[#91a2ae]">{note}</small></span></div>)}</div>
      <section className="mt-5 overflow-hidden rounded-[22px] border border-[#dfe7ec] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#e8eef2] p-5 sm:flex-row sm:items-center"><div><h2 className="text-sm font-bold">أساسيات التداول في أسواق الفوركس</h2><p className="mt-1 text-[9px] text-[#91a2ae]">آخر مزامنة: {data.lastSync}</p></div><div className="relative mr-auto w-full sm:w-64"><Search size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8ba0ae]" /><input aria-label="البحث عن مشارك" placeholder="ابحث عن مشارك..." className="h-10 w-full rounded-xl border border-[#dfe7ec] bg-[#f8fafb] pr-10 text-[9px] focus:outline-none" /></div></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-right"><thead className="bg-[#f8fafb] text-[9px] text-[#7f929f]"><tr><th className="px-6 py-3">المشارك</th><th className="px-4 py-3">الحالة</th><th className="px-4 py-3">وقت الدخول</th><th className="px-4 py-3">وقت الخروج</th><th className="px-4 py-3">مدة الحضور</th><th className="px-4 py-3">المطابقة</th></tr></thead><tbody className="divide-y divide-[#edf2f5]">{data.rows.length ? data.rows.map((person) => { const attended = person.status === "attended"; const pending = person.status === "pending"; return <tr key={person.id} className="text-[9px]"><td className="px-6 py-4"><strong className="block text-[10px]">{person.name}</strong><small className="latin mt-1 block text-[8px] text-[#91a2ae]">{person.email}</small></td><td className="px-4 py-4"><span className={`rounded-full px-3 py-1.5 text-[8px] font-bold ${attended ? "bg-[#eaf8f3] text-[#168a65]" : pending ? "bg-[#eaf5fc] text-[#1574ad]" : "bg-[#fff0f1] text-[#C32828]"}`}>{attended ? "حضر" : pending ? "لم تبدأ" : "لم يحضر"}</span></td><td className="latin px-4 py-4 text-[#607686]">{person.joinedAt}</td><td className="latin px-4 py-4 text-[#607686]">{person.leftAt}</td><td className="px-4 py-4"><strong>{attended ? `${person.durationMinutes} دقيقة` : "—"}</strong>{attended && <div className="mt-2 h-1 w-20 overflow-hidden rounded-full bg-[#e8eef2]"><div className="h-full bg-[#1779b5]" style={{ width: `${Math.min(100, (person.durationMinutes / 90) * 100)}%` }} /></div>}</td><td className="px-4 py-4"><span className="flex items-center gap-2 text-[#168a65]"><CalendarCheck2 size={14} /> {methodLabel[person.matchMethod] ?? person.matchMethod}</span></td></tr>; }) : <tr><td colSpan={6} className="px-6 py-14 text-center text-xs text-[#788d9c]">لا توجد سجلات حضور بعد.</td></tr>}</tbody></table></div>
      </section>
    </div>
  );
}