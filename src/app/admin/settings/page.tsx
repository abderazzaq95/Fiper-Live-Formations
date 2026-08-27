import { CalendarDays, CheckCircle2, KeyRound, Mail, MessageCircleMore, Plus, ShieldCheck, UserCog } from "lucide-react";
import { requireDashboardIdentity } from "@/lib/auth";

const integrations = [
  { name: "Callbell WhatsApp", description: "إرسال التأكيدات والتذكيرات وتتبع حالة الوصول.", status: "جاهز للربط", icon: MessageCircleMore, tone: "bg-[#eaf8f3] text-[#168a65]", button: "إضافة المفاتيح" },
  { name: "Google Calendar & Meet", description: "إنشاء المواعيد وروابط Meet ومزامنة الحضور.", status: "حساب تجريبي", icon: CalendarDays, tone: "bg-[#eaf5fc] text-[#1574ad]", button: "ربط Google" },
  { name: "البريد الإلكتروني", description: "إرسال الرسائل من نطاق Fiper وتتبع التسليم.", status: "غير مهيأ", icon: Mail, tone: "bg-[#fff6df] text-[#a36b00]", button: "إعداد البريد" },
];

export default async function SettingsPage() {
  await requireDashboardIdentity("admin");
  return (
    <div className="mx-auto max-w-[1180px]">
      <div><p className="text-[10px] font-bold text-[#C32828]">الإدارة</p><h1 className="mt-2 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">الإعدادات والتكاملات</h1><p className="mt-2 text-xs text-[#788d9c]">إدارة الخدمات الخارجية، المستخدمين، وحماية مساحة العمل.</p></div>

      <section className="mt-7 rounded-[22px] border border-[#dfe7ec] bg-white p-5 sm:p-7">
        <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#edf4f8] text-[#1779b5]"><KeyRound size={19} /></span><div><h2 className="text-sm font-bold">التكاملات</h2><p className="mt-1 text-[9px] text-[#91a2ae]">تحفظ المفاتيح مشفرة ولا تظهر مرة أخرى بعد إدخالها.</p></div></div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {integrations.map(({ name, description, status, icon: Icon, tone, button }) => (
            <article key={name} className="rounded-[20px] border border-[#e0e8ed] p-5">
              <div className="flex items-start justify-between"><span className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${tone}`}><Icon size={19} /></span><span className={`rounded-full px-3 py-1.5 text-[8px] font-bold ${tone}`}>{status}</span></div>
              <h3 className="latin mt-6 text-sm font-bold">{name}</h3><p className="mt-2 min-h-12 text-[9px] leading-5 text-[#718695]">{description}</p>
              <button className="mt-5 h-10 w-full rounded-xl border border-[#dce5eb] bg-[#f8fafb] text-[9px] font-bold text-[#526a7a] transition hover:bg-[#eef4f7]">{button}</button>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-5 overflow-hidden rounded-[22px] border border-[#dfe7ec] bg-white">
        <div className="flex items-center justify-between border-b border-[#e8eef2] p-5 sm:px-7"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2effc] text-[#7059c8]"><UserCog size={18} /></span><div><h2 className="text-sm font-bold">المستخدمون والصلاحيات</h2><p className="mt-1 text-[9px] text-[#91a2ae]">دوران فقط: Admin وUser.</p></div></div><button className="flex h-10 items-center gap-2 rounded-xl bg-[#102f47] px-4 text-[9px] font-bold text-white"><Plus size={14} /> إضافة مستخدم</button></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-right"><thead className="bg-[#f8fafb] text-[9px] text-[#7f929f]"><tr><th className="px-7 py-3">المستخدم</th><th className="px-4 py-3">الدور</th><th className="px-4 py-3">آخر دخول</th><th className="px-4 py-3">الحالة</th></tr></thead><tbody className="divide-y divide-[#edf2f5]"><tr className="text-[9px]"><td className="px-7 py-4"><strong className="block text-[10px]">Khalid Admin</strong><small className="latin mt-1 block text-[8px] text-[#91a2ae]">admin@fiper.me</small></td><td className="px-4 py-4"><span className="latin rounded-full bg-[#fff0f1] px-3 py-1.5 text-[8px] font-bold text-[#C32828]">ADMIN</span></td><td className="px-4 py-4 text-[#718695]">الآن</td><td className="px-4 py-4"><span className="flex items-center gap-2 text-[#168a65]"><CheckCircle2 size={13} /> نشط</span></td></tr><tr className="text-[9px]"><td className="px-7 py-4"><strong className="block text-[10px]">Course Operator</strong><small className="latin mt-1 block text-[8px] text-[#91a2ae]">courses@fiper.me</small></td><td className="px-4 py-4"><span className="latin rounded-full bg-[#eaf5fc] px-3 py-1.5 text-[8px] font-bold text-[#1574ad]">USER</span></td><td className="px-4 py-4 text-[#718695]">منذ يومين</td><td className="px-4 py-4"><span className="flex items-center gap-2 text-[#168a65]"><CheckCircle2 size={13} /> نشط</span></td></tr></tbody></table></div>
      </section>

      <section className="mt-5 rounded-[22px] border border-[#dfe7ec] bg-white p-5 sm:p-7"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#eaf8f3] text-[#168a65]"><ShieldCheck size={19} /></span><div><h2 className="text-sm font-bold">الأمان والخصوصية</h2><p className="mt-1 text-[9px] text-[#91a2ae]">المصادقة متعددة العوامل وسجل التدقيق جاهزان للتفعيل مع Supabase Auth.</p></div></div><div className="mt-6 grid gap-3 sm:grid-cols-3">{["MFA لحسابات Admin","سجل كامل للتغييرات","تقييد تصدير البيانات"].map((item) => <div key={item} className="flex items-center gap-2 rounded-xl bg-[#f7f9fa] p-4 text-[9px] font-bold"><CheckCircle2 size={14} className="text-[#168a65]" />{item}</div>)}</div></section>
    </div>
  );
}
