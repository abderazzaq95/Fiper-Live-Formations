import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarPlus, CheckCircle2, Clock3, MailCheck, MessageCircleMore, Users } from "lucide-react";
import { FiperLogo } from "@/components/brand/fiper-logo";
import { getPublicCourseById } from "@/lib/data/courses";

export const metadata: Metadata = { title: "تم استلام تسجيلك" };
export const dynamic = "force-dynamic";

export default async function ConfirmationPage({ searchParams }: PageProps<"/confirmation">) {
  const params = await searchParams;
  const waitlisted = params.status === "waitlisted";
  const name = typeof params.name === "string" ? params.name : "مرحباً بك";
  const courseId = typeof params.courseId === "string" ? params.courseId : "";
  const { course } = await getPublicCourseById(courseId);
  const calendarStart = new Date(course.isoStart).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const calendarEnd = new Date(new Date(course.isoStart).getTime() + 90 * 60 * 1000).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const calendarHref = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(course.title) + "&dates=" + calendarStart + "/" + calendarEnd + "&details=" + encodeURIComponent(course.description) + "&location=" + encodeURIComponent(course.platform);
  return (
    <main className="noise-grid flex min-h-screen flex-col bg-[#031a2d]">
      <header className="mx-auto flex h-20 w-full max-w-[1120px] items-center px-5 sm:px-8"><FiperLogo /></header>
      <div className="mx-auto flex w-full max-w-[920px] flex-1 items-center px-5 py-10 sm:px-8">
        <div className="grid w-full overflow-hidden rounded-[34px] border border-white/10 bg-[#062139]/80 shadow-[0_40px_100px_rgba(0,8,15,.4)] lg:grid-cols-[1.1fr_.9fr]">
          <section className="p-7 sm:p-12">
            <span className={`flex h-16 w-16 items-center justify-center rounded-[22px] ${waitlisted ? "bg-amber-400/12 text-amber-300" : "bg-[#3fd29b]/12 text-[#62d5aa]"}`}>
              {waitlisted ? <Users size={30} /> : <CheckCircle2 size={32} />}
            </span>
            <p className="mt-8 text-xs font-bold text-[#C32828]">{waitlisted ? "قائمة الانتظار" : "تم تأكيد تسجيلك"}</p>
            <h1 className="mt-3 text-3xl font-extrabold leading-[1.5] tracking-[-0.045em] text-white sm:text-4xl">
              {waitlisted ? `شكراً ${name}، حفظنا ترتيبك.` : `أهلاً ${name}، مقعدك جاهز.`}
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-8 text-[#91adc2]">
              {waitlisted
                ? "الدورة مكتملة حالياً. سنرسل لك رسالة فور توفر مقعد، ولن تحتاج إلى التسجيل مرة أخرى."
                : "أرسلنا تفاصيل الدورة إلى بريدك وواتساب. احتفظ بالموعد، وسنذكّرك قبل الانطلاق."}
            </p>

            {!waitlisted && (
              <a href={calendarHref} target="_blank" rel="noreferrer" aria-label="Add course to calendar" className="mt-8 flex h-13 items-center justify-center gap-2 rounded-2xl bg-[#C32828] px-6 text-xs font-bold text-white transition hover:bg-[#A92121]">
                <CalendarPlus size={17} /> أضف الموعد إلى تقويمك
              </a>
            )}
            <Link href="/" className="mt-7 inline-flex items-center gap-2 text-xs font-semibold text-[#91adc2] transition hover:text-white"><ArrowRight size={15} /> العودة إلى صفحة الدورة</Link>
          </section>

          <aside className="border-t border-white/8 bg-[#041a2d]/75 p-7 sm:p-9 lg:border-r lg:border-t-0">
            <p className="text-xs font-bold text-white">ملخص الدورة</p>
            <h2 className="mt-4 text-lg font-bold leading-8 text-white">{course.title}</h2>
            <div className="mt-7 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-4"><CalendarPlus size={18} className="text-[#C32828]" /><span><small className="block text-[9px] text-[#6f8ba0]">التاريخ</small><strong className="mt-1 block text-[11px]">{course.dateLabel}</strong></span></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.035] p-4"><Clock3 size={16} className="text-[#C32828]" /><span><small className="block text-[9px] text-[#6f8ba0]">التوقيت</small><strong className="latin mt-1 block text-[11px]">{course.timeLabel}</strong></span></div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4"><small className="block text-[9px] text-[#6f8ba0]">المنصة</small><strong className="latin mt-1 block text-[11px]">{course.platform}</strong></div>
              </div>
            </div>
            <div className="mt-8 border-t border-white/8 pt-6">
              <p className="text-[10px] font-bold text-[#7895aa]">ماذا سيحدث الآن؟</p>
              <div className="mt-4 space-y-3 text-[10px] text-[#b8ccda]">
                <p className="flex items-center gap-2"><MailCheck size={14} className="text-[#62d5aa]" /> تحقق من رسالة التأكيد في بريدك</p>
                <p className="flex items-center gap-2"><MessageCircleMore size={14} className="text-[#62d5aa]" /> ستصلك التذكيرات على واتساب</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <p className="pb-8 text-center text-[10px] text-[#55758c] latin">Fiper Academy · Registration ID secured</p>
    </main>
  );
}
