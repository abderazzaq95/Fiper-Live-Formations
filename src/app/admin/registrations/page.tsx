import { ChevronDown, Download, Filter, MoreHorizontal, Search, UserPlus, UsersRound } from "lucide-react";
import { registrations } from "@/lib/demo-data";

export default function RegistrationsPage() {
  return (
    <div className="mx-auto max-w-[1450px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-[10px] font-bold text-[#C32828]">قاعدة المشاركين</p><h1 className="mt-2 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">التسجيلات</h1><p className="mt-2 text-xs text-[#788d9c]">تابع حالة كل مشارك، ابحث في البيانات، وصدّر القوائم بأمان.</p></div>
        <div className="flex gap-2"><button className="flex h-11 items-center gap-2 rounded-xl border border-[#dce5eb] bg-white px-4 text-[9px] font-bold text-[#536b7b]"><UserPlus size={15} /> إضافة يدوية</button><button className="flex h-11 items-center gap-2 rounded-xl bg-[#102f47] px-4 text-[9px] font-bold text-white"><Download size={15} /> تصدير CSV</button></div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        {[["إجمالي المسجلين","346","bg-[#eaf5fc] text-[#1574ad]"],["المؤكدون","318","bg-[#eaf8f3] text-[#168a65]"],["قائمة الانتظار","28","bg-[#fff6df] text-[#a36b00]"]].map(([label,value,tone]) => (
          <div key={label} className="flex items-center gap-4 rounded-[18px] border border-[#dfe7ec] bg-white p-5"><span className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${tone}`}><UsersRound size={19} /></span><span><small className="text-[9px] text-[#7f929f]">{label}</small><strong className="latin mt-1 block text-xl">{value}</strong></span></div>
        ))}
      </div>

      <section className="mt-5 overflow-hidden rounded-[22px] border border-[#dfe7ec] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#e8eef2] p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="relative flex-1"><Search size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8ba0ae]" /><input placeholder="الاسم، البريد أو الهاتف..." className="h-11 w-full rounded-xl border border-[#dfe7ec] bg-[#f8fafb] pr-10 pl-4 text-[10px] focus:border-[#9ebfd5] focus:outline-none" /></div>
          <button className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#dfe7ec] bg-white px-4 text-[9px] font-bold text-[#617585]"><Filter size={14} /> أساسيات الفوركس <ChevronDown size={13} /></button>
          <button className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#dfe7ec] bg-white px-4 text-[9px] font-bold text-[#617585]">كل الحالات <ChevronDown size={13} /></button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-right">
            <thead className="bg-[#f8fafb] text-[9px] font-semibold text-[#7f929f]"><tr><th className="w-12 px-5 py-3"><input type="checkbox" aria-label="تحديد الكل" className="accent-[#C32828]" /></th><th className="px-3 py-3">المشارك</th><th className="px-3 py-3">رقم واتساب</th><th className="px-3 py-3">الدورة</th><th className="px-3 py-3">المصدر</th><th className="px-3 py-3">الحالة</th><th className="px-3 py-3">التسجيل</th><th className="px-5 py-3" /></tr></thead>
            <tbody className="divide-y divide-[#edf2f5]">{[...registrations, ...registrations].map((person, index) => (
              <tr key={`${person.email}-${index}`} className="text-[9px] transition hover:bg-[#fbfcfd]">
                <td className="px-5 py-4"><input type="checkbox" aria-label={`تحديد ${person.name}`} className="accent-[#C32828]" /></td>
                <td className="px-3 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf4f8] text-[9px] font-bold text-[#315a75]">{person.name.split(" ").map((p) => p[0]).join("")}</span><span><strong className="block text-[10px]">{person.name}</strong><small className="latin mt-1 block text-[8px] text-[#8da0ad]">{person.email}</small></span></div></td>
                <td className="latin px-3 py-4 text-[#607686]">{person.phone}</td><td className="px-3 py-4 text-[#607686]">{person.course}</td><td className="latin px-3 py-4 text-[#607686]">{person.source}</td>
                <td className="px-3 py-4"><span className={`rounded-full px-3 py-1.5 text-[8px] font-bold ${person.status === "مؤكد" ? "bg-[#eaf8f3] text-[#168a65]" : "bg-[#fff6df] text-[#a36b00]"}`}>{person.status}</span></td>
                <td className="px-3 py-4 text-[#8da0ad]">{person.time}</td><td className="px-5 py-4"><button aria-label="خيارات" className="text-[#8598a6]"><MoreHorizontal size={17} /></button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#e8eef2] px-5 py-4 text-[9px] text-[#8295a2]"><span>عرض 1–8 من 346</span><div className="flex gap-1"><button className="rounded-lg border border-[#dce5eb] px-3 py-2">السابق</button><button className="rounded-lg bg-[#102f47] px-3 py-2 text-white latin">1</button><button className="rounded-lg border border-[#dce5eb] px-3 py-2 latin">2</button><button className="rounded-lg border border-[#dce5eb] px-3 py-2">التالي</button></div></div>
      </section>
    </div>
  );
}
