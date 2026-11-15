import { CheckCircle2, Clock3, Mail, MessageCircleMore, MoreHorizontal, Send, TriangleAlert } from "lucide-react";
import { getDashboardDeliveries } from "@/lib/data/dashboard";
import { EmailTestButton } from "@/components/dashboard/email-test-button";

const automation = [
  ["تأكيد التسجيل", "البريد + واتساب", "فور التسجيل", "نشطة", CheckCircle2, "text-[var(--adm-good)] bg-[var(--adm-good-soft)]"],
  ["تذكير قبل الدورة", "البريد + واتساب", "قبل 24 ساعة", "نشطة", Clock3, "text-[var(--adm-blue)] bg-[var(--adm-blue-soft)]"],
  ["تذكير يوم الدورة", "واتساب", "09:00 صباحاً", "نشطة", Clock3, "text-[var(--adm-blue)] bg-[var(--adm-blue-soft)]"],
  ["رابط الدخول", "البريد + واتساب", "قبل 10 دقائق", "نشطة", Send, "text-[var(--adm-brand)] bg-[var(--adm-brand-soft)]"],
] as const;

const stateLabel: Record<string, string> = { queued: "في الانتظار", scheduled: "مجدول", sent: "أُرسل", delivered: "تم التسليم", read: "تم الفتح", failed: "فشل", cancelled: "ملغى" };

export default async function CommunicationsPage() {
  const data = await getDashboardDeliveries();
  const total = data.emailTotal + data.whatsappTotal;
  const deliveryRate = total ? Math.round((data.delivered / total) * 100) : 0;
  return (
    <div className="mx-auto max-w-[1450px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[12px] font-bold text-[var(--adm-brand)]">الأتمتة</p><h1 className="mt-2 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">رحلة التواصل</h1><p className="mt-2 text-xs text-[var(--adm-ink-4)]">راقب رسائل البريد وواتساب وجدولها من مكان واحد.</p></div><EmailTestButton /></div>
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[12px] border border-[var(--adm-line)] bg-[var(--adm-panel)] shadow-[0_1px_2px_rgba(15,23,42,.05)] p-5"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--adm-blue-soft)] text-[var(--adm-blue)]"><Mail size={18} /></span><p className="mt-5 text-[11.5px] text-[var(--adm-ink-4)]">رسائل البريد المسجلة</p><strong className="latin mt-2 block text-2xl">{data.emailTotal}</strong><small className="mt-1 text-[11px] text-[var(--adm-good)]">{deliveryRate}% تم التسليم</small></div>
        <div className="rounded-[12px] border border-[var(--adm-line)] bg-[var(--adm-panel)] shadow-[0_1px_2px_rgba(15,23,42,.05)] p-5"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--adm-good-soft)] text-[var(--adm-good)]"><MessageCircleMore size={18} /></span><p className="mt-5 text-[11.5px] text-[var(--adm-ink-4)]">رسائل واتساب المسجلة</p><strong className="latin mt-2 block text-2xl">{data.whatsappTotal}</strong><small className="mt-1 text-[11px] text-[var(--adm-good)]">من سجل الإرسال الحقيقي</small></div>
        <div className="rounded-[12px] border border-[var(--adm-mid-line)] bg-[var(--adm-mid-soft)] p-5"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--adm-mid-soft)] text-[var(--adm-mid-ink)]"><TriangleAlert size={18} /></span><p className="mt-5 text-[11.5px] text-[var(--adm-mid-ink)]">تحتاج إلى مراجعة</p><strong className="latin mt-2 block text-2xl">{String(data.failed).padStart(2, "0")}</strong><small className="mt-1 text-[11px] text-[var(--adm-mid-ink)]">رسائل تعذر تسليمها</small></div>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <section className="rounded-[12px] border border-[var(--adm-line)] bg-[var(--adm-panel)] shadow-[0_1px_2px_rgba(15,23,42,.05)] p-5 sm:p-6"><div><h2 className="text-sm font-bold">أتمتة دورة أساسيات الفوركس</h2><p className="mt-1 text-[11.5px] text-[var(--adm-ink-4)]">القوالب التالية جاهزة، وسيظهر تنفيذها في سجل التسليم.</p></div><div className="relative mt-7 space-y-3 before:absolute before:bottom-7 before:right-[22px] before:top-7 before:w-px before:bg-[var(--adm-line)]">{automation.map(([title, channel, timing, status, Icon, color]) => <article key={title} className="relative flex items-center gap-4 rounded-xl border border-[var(--adm-line)] bg-[var(--adm-panel)] p-4"><span className={`z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] ${color}`}><Icon size={18} /></span><span className="min-w-0 flex-1"><strong className="block text-[12px]">{title}</strong><small className="mt-1 block text-[11px] text-[var(--adm-ink-4)]">{channel}</small></span><span className="hidden text-left sm:block"><small className="block text-[11px] text-[var(--adm-ink-4)]">موعد الإرسال</small><strong className="mt-1 block text-[11.5px]">{timing}</strong></span><span className="rounded-full bg-[var(--adm-good-soft)] px-3 py-1.5 text-[11px] font-bold text-[var(--adm-good)]">{status}</span><button type="button" aria-label="خيارات الرسالة" className="text-[var(--adm-ink-4)]"><MoreHorizontal size={17} /></button></article>)}</div></section>
        <section className="rounded-[12px] border border-[var(--adm-line)] bg-[var(--adm-panel)] shadow-[0_1px_2px_rgba(15,23,42,.05)] p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="text-sm font-bold">سجل التسليم</h2><p className="mt-1 text-[11.5px] text-[var(--adm-ink-4)]">آخر العمليات من قاعدة البيانات</p></div><span className="text-[11.5px] font-bold text-[var(--adm-blue)]">{total} رسالة</span></div><div className="mt-6 space-y-1">{data.rows.length ? data.rows.slice(0, 8).map((message) => { const failed = message.state === "failed"; return <div key={message.id} className="flex items-center gap-3 border-b border-[var(--adm-sunken)] py-3.5 last:border-0"><span className={`h-2 w-2 rounded-full ${failed ? "bg-[var(--adm-brand)]" : message.state === "delivered" || message.state === "read" ? "bg-[var(--adm-good-2)]" : "bg-[var(--adm-blue)]"}`} /><span><strong className="block text-[11.5px]">{message.recipient}</strong><small className="mt-1 block text-[11px] text-[var(--adm-ink-4)]">{message.channel === "whatsapp" ? "واتساب" : "البريد"} · {stateLabel[message.state] ?? message.state}{message.channel === "whatsapp" && message.sender ? ` · من ${message.sender}` : ""}</small></span><small className="mr-auto text-[11px] text-[var(--adm-ink-4)]">{message.time}</small></div>; }) : <p className="py-12 text-center text-xs text-[var(--adm-ink-4)]">لا توجد رسائل في السجل بعد.</p>}</div></section>
      </div>
    </div>
  );
}
