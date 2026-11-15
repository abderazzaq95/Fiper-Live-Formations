import { CheckCircle2, Clock3, Mail, MessageCircleMore, MoreHorizontal, Send, TriangleAlert } from "lucide-react";
import { getDashboardDeliveries } from "@/lib/data/dashboard";
import { EmailTestButton } from "@/components/dashboard/email-test-button";

const automation = [
  ["تأكيد التسجيل", "البريد + واتساب", "فور التسجيل", "نشطة", CheckCircle2, "text-[#047857] bg-[#e3f6ec]"],
  ["تذكير قبل الدورة", "البريد + واتساب", "قبل 24 ساعة", "نشطة", Clock3, "text-[#1d4ed8] bg-[#e6eefc]"],
  ["تذكير يوم الدورة", "واتساب", "09:00 صباحاً", "نشطة", Clock3, "text-[#1d4ed8] bg-[#e6eefc]"],
  ["رابط الدخول", "البريد + واتساب", "قبل 10 دقائق", "نشطة", Send, "text-[#c2182b] bg-[#fbe8ea]"],
] as const;

const stateLabel: Record<string, string> = { queued: "في الانتظار", scheduled: "مجدول", sent: "أُرسل", delivered: "تم التسليم", read: "تم الفتح", failed: "فشل", cancelled: "ملغى" };

export default async function CommunicationsPage() {
  const data = await getDashboardDeliveries();
  const total = data.emailTotal + data.whatsappTotal;
  const deliveryRate = total ? Math.round((data.delivered / total) * 100) : 0;
  return (
    <div className="mx-auto max-w-[1450px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[12px] font-bold text-[#c2182b]">الأتمتة</p><h1 className="mt-2 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">رحلة التواصل</h1><p className="mt-2 text-xs text-[#64748b]">راقب رسائل البريد وواتساب وجدولها من مكان واحد.</p></div><EmailTestButton /></div>
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[12px] border border-[#dfe6f0] bg-white shadow-[0_1px_2px_rgba(15,23,42,.05)] p-5"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e6eefc] text-[#1d4ed8]"><Mail size={18} /></span><p className="mt-5 text-[11.5px] text-[#64748b]">رسائل البريد المسجلة</p><strong className="latin mt-2 block text-2xl">{data.emailTotal}</strong><small className="mt-1 text-[11px] text-[#047857]">{deliveryRate}% تم التسليم</small></div>
        <div className="rounded-[12px] border border-[#dfe6f0] bg-white shadow-[0_1px_2px_rgba(15,23,42,.05)] p-5"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e3f6ec] text-[#047857]"><MessageCircleMore size={18} /></span><p className="mt-5 text-[11.5px] text-[#64748b]">رسائل واتساب المسجلة</p><strong className="latin mt-2 block text-2xl">{data.whatsappTotal}</strong><small className="mt-1 text-[11px] text-[#047857]">من سجل الإرسال الحقيقي</small></div>
        <div className="rounded-[12px] border border-[#efdfbc] bg-[#fffbf1] p-5"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fff2cf] text-[#92400e]"><TriangleAlert size={18} /></span><p className="mt-5 text-[11.5px] text-[#806d45]">تحتاج إلى مراجعة</p><strong className="latin mt-2 block text-2xl">{String(data.failed).padStart(2, "0")}</strong><small className="mt-1 text-[11px] text-[#9b7d3e]">رسائل تعذر تسليمها</small></div>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <section className="rounded-[12px] border border-[#dfe6f0] bg-white shadow-[0_1px_2px_rgba(15,23,42,.05)] p-5 sm:p-6"><div><h2 className="text-sm font-bold">أتمتة دورة أساسيات الفوركس</h2><p className="mt-1 text-[11.5px] text-[#64748b]">القوالب التالية جاهزة، وسيظهر تنفيذها في سجل التسليم.</p></div><div className="relative mt-7 space-y-3 before:absolute before:bottom-7 before:right-[22px] before:top-7 before:w-px before:bg-[#dfe6f0]">{automation.map(([title, channel, timing, status, Icon, color]) => <article key={title} className="relative flex items-center gap-4 rounded-xl border border-[#dfe6f0] bg-white p-4"><span className={`z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] ${color}`}><Icon size={18} /></span><span className="min-w-0 flex-1"><strong className="block text-[12px]">{title}</strong><small className="mt-1 block text-[11px] text-[#64748b]">{channel}</small></span><span className="hidden text-left sm:block"><small className="block text-[11px] text-[#64748b]">موعد الإرسال</small><strong className="mt-1 block text-[11.5px]">{timing}</strong></span><span className="rounded-full bg-[#e3f6ec] px-3 py-1.5 text-[11px] font-bold text-[#047857]">{status}</span><button type="button" aria-label="خيارات الرسالة" className="text-[#64748b]"><MoreHorizontal size={17} /></button></article>)}</div></section>
        <section className="rounded-[12px] border border-[#dfe6f0] bg-white shadow-[0_1px_2px_rgba(15,23,42,.05)] p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="text-sm font-bold">سجل التسليم</h2><p className="mt-1 text-[11.5px] text-[#64748b]">آخر العمليات من قاعدة البيانات</p></div><span className="text-[11.5px] font-bold text-[#1d4ed8]">{total} رسالة</span></div><div className="mt-6 space-y-1">{data.rows.length ? data.rows.slice(0, 8).map((message) => { const failed = message.state === "failed"; return <div key={message.id} className="flex items-center gap-3 border-b border-[#e9eef6] py-3.5 last:border-0"><span className={`h-2 w-2 rounded-full ${failed ? "bg-[#c2182b]" : message.state === "delivered" || message.state === "read" ? "bg-[#1fa57a]" : "bg-[#1d4ed8]"}`} /><span><strong className="block text-[11.5px]">{message.recipient}</strong><small className="mt-1 block text-[11px] text-[#64748b]">{message.channel === "whatsapp" ? "واتساب" : "البريد"} · {stateLabel[message.state] ?? message.state}{message.channel === "whatsapp" && message.sender ? ` · من ${message.sender}` : ""}</small></span><small className="mr-auto text-[11px] text-[#64748b]">{message.time}</small></div>; }) : <p className="py-12 text-center text-xs text-[#64748b]">لا توجد رسائل في السجل بعد.</p>}</div></section>
      </div>
    </div>
  );
}
