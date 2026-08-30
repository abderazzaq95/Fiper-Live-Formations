import { CheckCircle2, Clock3, Mail, MessageCircleMore, MoreHorizontal, Send, TriangleAlert } from "lucide-react";
import { getDashboardDeliveries } from "@/lib/data/dashboard";

const automation = [
  ["تأكيد التسجيل", "البريد + واتساب", "فور التسجيل", "نشطة", CheckCircle2, "text-[#168a65] bg-[#eaf8f3]"],
  ["تذكير قبل الدورة", "البريد + واتساب", "قبل 24 ساعة", "نشطة", Clock3, "text-[#1574ad] bg-[#eaf5fc]"],
  ["تذكير يوم الدورة", "واتساب", "09:00 صباحاً", "نشطة", Clock3, "text-[#1574ad] bg-[#eaf5fc]"],
  ["رابط الدخول", "البريد + واتساب", "قبل 10 دقائق", "نشطة", Send, "text-[#C32828] bg-[#fff0f1]"],
] as const;

const stateLabel: Record<string, string> = { queued: "في الانتظار", scheduled: "مجدول", sent: "أُرسل", delivered: "تم التسليم", read: "تم الفتح", failed: "فشل", cancelled: "ملغى" };

export default async function CommunicationsPage() {
  const data = await getDashboardDeliveries();
  const total = data.emailTotal + data.whatsappTotal;
  const deliveryRate = total ? Math.round((data.delivered / total) * 100) : 0;
  return (
    <div className="mx-auto max-w-[1450px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold text-[#C32828]">الأتمتة</p><h1 className="mt-2 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">رحلة التواصل</h1><p className="mt-2 text-xs text-[#788d9c]">راقب رسائل البريد وواتساب وجدولها من مكان واحد.</p></div><button type="button" className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#102f47] px-5 text-[9px] font-bold text-white"><Send size={15} /> رسالة تجريبية</button></div>
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[18px] border border-[#dfe7ec] bg-white p-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf5fc] text-[#1574ad]"><Mail size={18} /></span><p className="mt-5 text-[9px] text-[#7f929f]">رسائل البريد المسجلة</p><strong className="latin mt-2 block text-2xl">{data.emailTotal}</strong><small className="mt-1 text-[8px] text-[#168a65]">{deliveryRate}% تم التسليم</small></div>
        <div className="rounded-[18px] border border-[#dfe7ec] bg-white p-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf8f3] text-[#168a65]"><MessageCircleMore size={18} /></span><p className="mt-5 text-[9px] text-[#7f929f]">رسائل واتساب المسجلة</p><strong className="latin mt-2 block text-2xl">{data.whatsappTotal}</strong><small className="mt-1 text-[8px] text-[#168a65]">من سجل الإرسال الحقيقي</small></div>
        <div className="rounded-[18px] border border-[#efdfbc] bg-[#fffbf1] p-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff2cf] text-[#a36b00]"><TriangleAlert size={18} /></span><p className="mt-5 text-[9px] text-[#806d45]">تحتاج إلى مراجعة</p><strong className="latin mt-2 block text-2xl">{String(data.failed).padStart(2, "0")}</strong><small className="mt-1 text-[8px] text-[#9b7d3e]">رسائل تعذر تسليمها</small></div>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <section className="rounded-[22px] border border-[#dfe7ec] bg-white p-5 sm:p-6"><div><h2 className="text-sm font-bold">أتمتة دورة أساسيات الفوركس</h2><p className="mt-1 text-[9px] text-[#91a2ae]">القوالب التالية جاهزة، وسيظهر تنفيذها في سجل التسليم.</p></div><div className="relative mt-7 space-y-3 before:absolute before:bottom-7 before:right-[22px] before:top-7 before:w-px before:bg-[#dfe7ec]">{automation.map(([title, channel, timing, status, Icon, color]) => <article key={title} className="relative flex items-center gap-4 rounded-2xl border border-[#e2e9ed] bg-white p-4"><span className={`z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${color}`}><Icon size={18} /></span><span className="min-w-0 flex-1"><strong className="block text-[10px]">{title}</strong><small className="mt-1 block text-[8px] text-[#91a2ae]">{channel}</small></span><span className="hidden text-left sm:block"><small className="block text-[8px] text-[#91a2ae]">موعد الإرسال</small><strong className="mt-1 block text-[9px]">{timing}</strong></span><span className="rounded-full bg-[#eaf8f3] px-3 py-1.5 text-[8px] font-bold text-[#168a65]">{status}</span><button type="button" aria-label="خيارات الرسالة" className="text-[#8799a6]"><MoreHorizontal size={17} /></button></article>)}</div></section>
        <section className="rounded-[22px] border border-[#dfe7ec] bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="text-sm font-bold">سجل التسليم</h2><p className="mt-1 text-[9px] text-[#91a2ae]">آخر العمليات من قاعدة البيانات</p></div><span className="text-[9px] font-bold text-[#1574ad]">{total} رسالة</span></div><div className="mt-6 space-y-1">{data.rows.length ? data.rows.slice(0, 8).map((message) => { const failed = message.state === "failed"; return <div key={message.id} className="flex items-center gap-3 border-b border-[#edf2f5] py-3.5 last:border-0"><span className={`h-2 w-2 rounded-full ${failed ? "bg-[#C32828]" : message.state === "delivered" || message.state === "read" ? "bg-[#32b886]" : "bg-[#1779b5]"}`} /><span><strong className="block text-[9px]">{message.recipient}</strong><small className="mt-1 block text-[8px] text-[#91a2ae]">{message.channel === "whatsapp" ? "واتساب" : "البريد"} · {stateLabel[message.state] ?? message.state}</small></span><small className="mr-auto text-[8px] text-[#91a2ae]">{message.time}</small></div>; }) : <p className="py-12 text-center text-xs text-[#788d9c]">لا توجد رسائل في السجل بعد.</p>}</div></section>
      </div>
    </div>
  );
}