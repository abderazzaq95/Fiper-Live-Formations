import { UsersRound } from "lucide-react";
import { RegistrationsTable } from "@/components/dashboard/registrations-table";
import { listDashboardRegistrations } from "@/lib/data/courses";

export default async function RegistrationsPage() {
  const registrations = await listDashboardRegistrations();
  const confirmedCount = registrations.filter((person) => person.status === "مؤكد").length;
  const waitlistedCount = registrations.filter((person) => person.status === "قائمة انتظار").length;
  return <div className="mx-auto max-w-[1450px]">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold text-[#C32828]">قاعدة المشاركين</p><h1 className="mt-2 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">التسجيلات</h1><p className="mt-2 text-xs text-[#788d9c]">تابع حالة كل مشارك، وابحث وفلتر البيانات، وصدّر القوائم بأمان.</p></div></div>
    <div className="mt-7 grid gap-4 sm:grid-cols-3">{[["إجمالي المسجلين", String(registrations.length), "bg-[#eaf5fc] text-[#1574ad]"], ["المؤكدون", String(confirmedCount), "bg-[#eaf8f3] text-[#168a65]"], ["قائمة الانتظار", String(waitlistedCount), "bg-[#fff6df] text-[#a36b00]"]].map(([label, value, tone]) => <div key={label} className="flex items-center gap-4 rounded-[18px] border border-[#dfe7ec] bg-white p-5"><span className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${tone}`}><UsersRound size={19} /></span><span><small className="text-[9px] text-[#7f929f]">{label}</small><strong className="latin mt-1 block text-xl">{value}</strong></span></div>)}</div>
    <RegistrationsTable registrations={registrations} />
  </div>;
}