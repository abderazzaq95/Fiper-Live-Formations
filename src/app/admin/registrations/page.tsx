import { RegistrationsDashboard } from "@/components/dashboard/registrations-dashboard";
import { listDashboardRegistrations } from "@/lib/data/courses";

const t = { eyebrow: "قاعدة المشاركين", title: "التسجيلات", desc: "تابع حالة كل مشارك، وابحث وفلتر البيانات." } as const;

export default async function RegistrationsPage() {
  const registrations = await listDashboardRegistrations();
  return <div className="mx-auto max-w-[1450px]">
    <div><p className="text-[10px] font-bold text-[#C32828]">{t.eyebrow}</p><h1 className="mt-2 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">{t.title}</h1><p className="mt-2 text-xs text-[#788d9c]">{t.desc}</p></div>
    <div className="mt-7"><RegistrationsDashboard registrations={registrations} /></div>
  </div>;
}