import { CalendarDays, CheckCircle2, KeyRound, Mail, MessageCircleMore, Plus, ShieldCheck, UserCog } from "lucide-react";
import { requireDashboardIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getStoredGoogleConfig } from "@/lib/integrations/google";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { WhatsAppChannelManager } from "@/components/dashboard/whatsapp-channel-manager";
import { listWhatsAppChannels } from "@/lib/data/whatsapp-channels";

const integrations = [
  { name: "Callbell WhatsApp", description: "إرسال التأكيدات والتذكيرات وتتبع حالة الوصول.", status: "جاهز للربط", icon: MessageCircleMore, tone: "bg-[#e3f6ec] text-[#047857]", button: "إضافة المفاتيح" },
  { name: "Google Calendar & Meet", description: "إنشاء المواعيد وروابط Meet ومزامنة الحضور.", status: "حساب تجريبي", icon: CalendarDays, tone: "bg-[#e6eefc] text-[#1d4ed8]", button: "ربط Google" },
  { name: "البريد الإلكتروني", description: "إرسال الرسائل من نطاق Fiper وتتبع التسليم.", status: "غير مهيأ", icon: Mail, tone: "bg-[#fef3c7] text-[#92400e]", button: "إعداد البريد" },
];

export default async function SettingsPage() {
  const identity = await requireDashboardIdentity("admin");
  const supabase = await createClient();
  const googleIntegration = await getStoredGoogleConfig(supabase);
  const whatsappChannels = await listWhatsAppChannels();
  const googleConnected = googleIntegration.state === "connected" && Boolean(googleIntegration.config?.refreshToken);
  const callbellConnected = Boolean(process.env.CALLBELL_API_KEY && whatsappChannels.some((channel) => channel.active));
  const emailConnected = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
  const { data: profiles } = await supabase.from("profiles").select("id,full_name,role,updated_at").order("created_at", { ascending: true });
  const emailById = new Map<string, string>();
  const lastLoginById = new Map<string, string>();
  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceUrl && serviceKey) {
    const admin = createSupabaseClient(serviceUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const result = await admin.auth.admin.listUsers({ perPage: 1000 });
    for (const user of result.data.users ?? []) { if (user.email) emailById.set(user.id, user.email); if (user.last_sign_in_at) lastLoginById.set(user.id, user.last_sign_in_at); }
  }
  const users = (profiles ?? []).map((profile) => ({ id: profile.id, name: profile.full_name, email: emailById.get(profile.id) ?? "—", role: profile.role, lastLogin: lastLoginById.get(profile.id) ?? profile.updated_at ?? "—" }));
  if (!users.length) users.push({ id: identity.id, name: identity.name, email: identity.email, role: identity.role, lastLogin: "الآن" });
  return (
    <div className="mx-auto max-w-[1180px]">
      <div><p className="text-[12px] font-bold text-[#c2182b]">الإدارة</p><h1 className="mt-2 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">الإعدادات والتكاملات</h1><p className="mt-2 text-xs text-[#64748b]">إدارة الخدمات الخارجية، المستخدمين، وحماية مساحة العمل.</p></div>

      <section className="mt-7 rounded-[12px] border border-[#dfe6f0] bg-white shadow-[0_1px_2px_rgba(15,23,42,.05)] p-5 sm:p-7">
        <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#eaf1fb] text-[#1d4ed8]"><KeyRound size={19} /></span><div><h2 className="text-sm font-bold">التكاملات</h2><p className="mt-1 text-[11.5px] text-[#64748b]">تحفظ المفاتيح مشفرة ولا تظهر مرة أخرى بعد إدخالها.</p></div></div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {integrations.map(({ name, description, status, icon: Icon, tone, button }) => {
            const connected = name === "Google Calendar & Meet" ? googleConnected : name === "Callbell WhatsApp" ? callbellConnected : emailConnected;
            return (
            <article key={name} className="rounded-[12px] border border-[#dfe6f0] p-5">
              <div className="flex items-start justify-between"><span className={`flex h-11 w-11 items-center justify-center rounded-[10px] ${tone}`}><Icon size={19} /></span><span className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${connected ? "bg-[#e3f6ec] text-[#047857]" : tone}`}>{connected ? "متصل" : status}</span></div>
              <h3 className="latin mt-6 text-sm font-bold">{name}</h3><p className="mt-2 min-h-12 text-[11.5px] leading-5 text-[#56657c]">{description}</p>
              {name === "Google Calendar & Meet" ? <a href="/api/admin/integrations/google/start" className="mt-5 flex h-10 w-full items-center justify-center rounded-lg border border-[#dfe6f0] bg-[#f8fafc] text-[11.5px] font-bold text-[#334155] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#f3f7fd] active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20">{googleConnected ? "إعادة ربط Google" : button}</a> : name === "Callbell WhatsApp" ? <a href="#whatsapp-channels" className="mt-5 flex h-10 w-full items-center justify-center rounded-lg border border-[#dfe6f0] bg-[#f8fafc] text-[11.5px] font-bold text-[#334155] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#f3f7fd] active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20">إدارة الأرقام والقوالب</a> : <button type="button" disabled={emailConnected} className="mt-5 h-10 w-full rounded-lg border border-[#dfe6f0] bg-[#f8fafc] text-[11.5px] font-bold text-[#334155] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#f3f7fd] active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 disabled:cursor-default disabled:opacity-70">{emailConnected ? "البريد متصل" : button}</button>}
            </article>
          )})}
        </div>
      </section>

      <div id="whatsapp-channels"><WhatsAppChannelManager channels={whatsappChannels} /></div>

      <section className="mt-5 overflow-hidden rounded-[12px] border border-[#dfe6f0] bg-white shadow-[0_1px_2px_rgba(15,23,42,.05)]">
        <div className="flex items-center justify-between border-b border-[#e7edf5] p-5 sm:px-7"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f2effc] text-[#7059c8]"><UserCog size={18} /></span><div><h2 className="text-sm font-bold">المستخدمون والصلاحيات</h2><p className="mt-1 text-[11.5px] text-[#64748b]">دوران فقط: Admin وUser.</p></div></div><button className="flex h-10 items-center gap-2 rounded-lg bg-[#0b1533] px-4 text-[11.5px] font-bold text-white"><Plus size={14} /> إضافة مستخدم</button></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-right"><thead className="bg-[#f8fafc] text-[11.5px] text-[#64748b]"><tr><th className="px-7 py-3">المستخدم</th><th className="px-4 py-3">الدور</th><th className="px-4 py-3">آخر دخول</th><th className="px-4 py-3">الحالة</th></tr></thead><tbody className="divide-y divide-[#e9eef6]">{users.map((user) => <tr key={user.id} className="text-[11.5px]"><td className="px-7 py-4"><strong className="block text-[12px]">{user.name}</strong><small className="latin mt-1 block text-[11px] text-[#64748b]">{user.email}</small></td><td className="px-4 py-4"><span className={`latin rounded-full px-3 py-1.5 text-[11px] font-bold ${user.role === "admin" ? "bg-[#fbe8ea] text-[#c2182b]" : "bg-[#e6eefc] text-[#1d4ed8]"}`}>{user.role.toUpperCase()}</span></td><td className="px-4 py-4 text-[#56657c]">{user.lastLogin === "الآن" ? user.lastLogin : new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short" }).format(new Date(user.lastLogin))}</td><td className="px-4 py-4"><span className="flex items-center gap-2 text-[#047857]"><CheckCircle2 size={13} /> نشط</span></td></tr>)}</tbody></table></div>
      </section>

      <section className="mt-5 rounded-[12px] border border-[#dfe6f0] bg-white shadow-[0_1px_2px_rgba(15,23,42,.05)] p-5 sm:p-7"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#e3f6ec] text-[#047857]"><ShieldCheck size={19} /></span><div><h2 className="text-sm font-bold">الأمان والخصوصية</h2><p className="mt-1 text-[11.5px] text-[#64748b]">المصادقة متعددة العوامل وسجل التدقيق جاهزان للتفعيل مع Supabase Auth.</p></div></div><div className="mt-6 grid gap-3 sm:grid-cols-3">{["MFA لحسابات Admin","سجل كامل للتغييرات","تقييد تصدير البيانات"].map((item) => <div key={item} className="flex items-center gap-2 rounded-lg bg-[#f8fafc] p-4 text-[11.5px] font-bold"><CheckCircle2 size={14} className="text-[#047857]" />{item}</div>)}</div></section>
    </div>
  );
}
