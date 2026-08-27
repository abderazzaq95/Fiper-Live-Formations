import { CheckCircle2, Clock3, Mail, MessageCircleMore, MoreHorizontal, RefreshCw, Send, TriangleAlert } from "lucide-react";

const messages = [
  { title: "تأكيد التسجيل", channel: "البريد + واتساب", timing: "فور التسجيل", status: "نشط", icon: CheckCircle2, color: "text-[#168a65] bg-[#eaf8f3]" },
  { title: "تذكير قبل الدورة", channel: "البريد + واتساب", timing: "قبل 24 ساعة", status: "نشط", icon: Clock3, color: "text-[#1574ad] bg-[#eaf5fc]" },
  { title: "تذكير يوم الدورة", channel: "واتساب", timing: "09:00 صباحاً", status: "نشط", icon: Clock3, color: "text-[#1574ad] bg-[#eaf5fc]" },
  { title: "رابط الدخول", channel: "البريد + واتساب", timing: "قبل 10 دقائق", status: "نشط", icon: Send, color: "text-[#C32828] bg-[#fff0f1]" },
  { title: "متابعة ما بعد الدورة", channel: "البريد + واتساب", timing: "بعد ساعتين", status: "مسودة", icon: RefreshCw, color: "text-[#6f7e89] bg-[#eef2f4]" },
];

export default function CommunicationsPage() {
  return (
    <div className="mx-auto max-w-[1450px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-[10px] font-bold text-[#C32828]">الأتمتة</p><h1 className="mt-2 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">رحلة التواصل</h1><p className="mt-2 text-xs text-[#788d9c]">راقب رسائل البريد وواتساب وجدولها من مكان واحد.</p></div>
        <button className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#102f47] px-5 text-[9px] font-bold text-white"><Send size={15} /> رسالة تجريبية</button>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[18px] border border-[#dfe7ec] bg-white p-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf5fc] text-[#1574ad]"><Mail size={18} /></span><p className="mt-5 text-[9px] text-[#7f929f]">رسائل البريد هذا الشهر</p><strong className="latin mt-2 block text-2xl">1,024</strong><small className="mt-1 text-[8px] text-[#168a65]">98.2% تم تسليمها</small></div>
        <div className="rounded-[18px] border border-[#dfe7ec] bg-white p-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf8f3] text-[#168a65]"><MessageCircleMore size={18} /></span><p className="mt-5 text-[9px] text-[#7f929f]">رسائل واتساب هذا الشهر</p><strong className="latin mt-2 block text-2xl">846</strong><small className="mt-1 text-[8px] text-[#168a65]">96.8% تم تسليمها</small></div>
        <div className="rounded-[18px] border border-[#efdfbc] bg-[#fffbf1] p-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff2cf] text-[#a36b00]"><TriangleAlert size={18} /></span><p className="mt-5 text-[9px] text-[#806d45]">تحتاج إلى مراجعة</p><strong className="latin mt-2 block text-2xl">03</strong><small className="mt-1 text-[8px] text-[#9b7d3e]">رسائل تعذر تسليمها</small></div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <section className="rounded-[22px] border border-[#dfe7ec] bg-white p-5 sm:p-6">
          <div><h2 className="text-sm font-bold">أتمتة دورة أساسيات الفوركس</h2><p className="mt-1 text-[9px] text-[#91a2ae]">كل الخطوات تستخدم توقيت الدورة وتُعاد جدولتها عند تغييره.</p></div>
          <div className="relative mt-7 space-y-3 before:absolute before:bottom-7 before:right-[22px] before:top-7 before:w-px before:bg-[#dfe7ec]">
            {messages.map(({ title, channel, timing, status, icon: Icon, color }) => (
              <article key={title} className="relative flex items-center gap-4 rounded-2xl border border-[#e2e9ed] bg-white p-4">
                <span className={`z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${color}`}><Icon size={18} /></span>
                <span className="min-w-0 flex-1"><strong className="block text-[10px]">{title}</strong><small className="mt-1 block text-[8px] text-[#91a2ae]">{channel}</small></span>
                <span className="hidden text-left sm:block"><small className="block text-[8px] text-[#91a2ae]">موعد الإرسال</small><strong className="mt-1 block text-[9px]">{timing}</strong></span>
                <span className={`rounded-full px-3 py-1.5 text-[8px] font-bold ${status === "نشط" ? "bg-[#eaf8f3] text-[#168a65]" : "bg-[#eef2f4] text-[#617585]"}`}>{status}</span>
                <button aria-label="خيارات الرسالة" className="text-[#8799a6]"><MoreHorizontal size={17} /></button>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[22px] border border-[#dfe7ec] bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between"><div><h2 className="text-sm font-bold">سجل التسليم</h2><p className="mt-1 text-[9px] text-[#91a2ae]">آخر العمليات</p></div><button className="text-[9px] font-bold text-[#1574ad]">عرض السجل</button></div>
          <div className="mt-6 space-y-1">{[
            ["واتساب","تم التسليم","سارة العلوي","منذ 3 دقائق","green"],
            ["البريد","تم التسليم","عمر بنسالم","منذ 8 دقائق","green"],
            ["واتساب","فشل","هشام زين","منذ 18 دقيقة","red"],
            ["البريد","تم الفتح","ريم الخطيب","منذ 31 دقيقة","blue"],
            ["واتساب","تم التسليم","يوسف المريني","منذ 42 دقيقة","green"],
          ].map(([channel,status,name,time,tone], index) => (
            <div key={`${name}-${index}`} className="flex items-center gap-3 border-b border-[#edf2f5] py-3.5 last:border-0"><span className={`h-2 w-2 rounded-full ${tone === "green" ? "bg-[#32b886]" : tone === "red" ? "bg-[#C32828]" : "bg-[#1779b5]"}`} /><span><strong className="block text-[9px]">{name}</strong><small className="mt-1 block text-[8px] text-[#91a2ae]">{channel} · {status}</small></span><small className="mr-auto text-[8px] text-[#91a2ae]">{time}</small></div>
          ))}</div>
        </section>
      </div>
    </div>
  );
}
