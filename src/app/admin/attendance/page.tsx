import { CalendarCheck2, Clock3, Download, RefreshCw, Search, UserRoundCheck, UserRoundX } from "lucide-react";
import { registrations } from "@/lib/demo-data";

export default function AttendancePage() {
  return (
    <div className="mx-auto max-w-[1450px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-[10px] font-bold text-[#C32828]">Google Meet</p><h1 className="mt-2 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">الحضور</h1><p className="mt-2 text-xs text-[#788d9c]">مزامنة الحضور ومدة المشاركة مع إمكانية التصحيح اليدوي.</p></div>
        <div className="flex gap-2"><button className="flex h-11 items-center gap-2 rounded-xl border border-[#dce5eb] bg-white px-4 text-[9px] font-bold text-[#536b7b]"><RefreshCw size={14} /> مزامنة Meet</button><button className="flex h-11 items-center gap-2 rounded-xl bg-[#102f47] px-4 text-[9px] font-bold text-white"><Download size={14} /> تصدير</button></div>
      </div>
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        {[["الحاضرون","156","78% من المؤكدين",UserRoundCheck,"bg-[#eaf8f3] text-[#168a65]"],["لم يحضروا","44","22% من المؤكدين",UserRoundX,"bg-[#fff0f1] text-[#C32828]"],["متوسط الحضور","72 دقيقة","من أصل 90 دقيقة",Clock3,"bg-[#eaf5fc] text-[#1574ad]"]].map(([label,value,note,Icon,tone]) => {
          const CardIcon = Icon as typeof UserRoundCheck;
          return <div key={String(label)} className="flex items-center gap-4 rounded-[18px] border border-[#dfe7ec] bg-white p-5"><span className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${tone}`}><CardIcon size={19} /></span><span><small className="text-[9px] text-[#7f929f]">{String(label)}</small><strong className="mt-1 block text-xl">{String(value)}</strong><small className="text-[8px] text-[#91a2ae]">{String(note)}</small></span></div>;
        })}
      </div>
      <section className="mt-5 overflow-hidden rounded-[22px] border border-[#dfe7ec] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#e8eef2] p-5 sm:flex-row sm:items-center">
          <div><h2 className="text-sm font-bold">أساسيات التداول في أسواق الفوركس</h2><p className="mt-1 text-[9px] text-[#91a2ae]">آخر مزامنة: اليوم، 11:42</p></div>
          <div className="relative mr-auto w-full sm:w-64"><Search size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8ba0ae]" /><input placeholder="ابحث عن مشارك..." className="h-10 w-full rounded-xl border border-[#dfe7ec] bg-[#f8fafb] pr-10 text-[9px] focus:outline-none" /></div>
        </div>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-right"><thead className="bg-[#f8fafb] text-[9px] text-[#7f929f]"><tr><th className="px-6 py-3">المشارك</th><th className="px-4 py-3">الحالة</th><th className="px-4 py-3">وقت الدخول</th><th className="px-4 py-3">وقت الخروج</th><th className="px-4 py-3">مدة الحضور</th><th className="px-4 py-3">المطابقة</th></tr></thead><tbody className="divide-y divide-[#edf2f5]">{[...registrations,...registrations].map((person,index) => {
          const attended = index % 4 !== 2;
          const duration = attended ? 58 + (index * 7) % 31 : 0;
          return <tr key={`${person.email}-${index}`} className="text-[9px]"><td className="px-6 py-4"><strong className="block text-[10px]">{person.name}</strong><small className="latin mt-1 block text-[8px] text-[#91a2ae]">{person.email}</small></td><td className="px-4 py-4"><span className={`rounded-full px-3 py-1.5 text-[8px] font-bold ${attended ? "bg-[#eaf8f3] text-[#168a65]" : "bg-[#fff0f1] text-[#C32828]"}`}>{attended ? "حضر" : "لم يحضر"}</span></td><td className="latin px-4 py-4 text-[#607686]">{attended ? `19:${String(55 + index).slice(-2)}` : "—"}</td><td className="latin px-4 py-4 text-[#607686]">{attended ? "21:24" : "—"}</td><td className="px-4 py-4"><strong>{attended ? `${duration} دقيقة` : "—"}</strong>{attended && <div className="mt-2 h-1 w-20 overflow-hidden rounded-full bg-[#e8eef2]"><div className="h-full bg-[#1779b5]" style={{width:`${(duration/90)*100}%`}} /></div>}</td><td className="px-4 py-4"><span className="flex items-center gap-2 text-[#168a65]"><CalendarCheck2 size={14} /> تلقائية</span></td></tr>;
        })}</tbody></table></div>
      </section>
    </div>
  );
}
