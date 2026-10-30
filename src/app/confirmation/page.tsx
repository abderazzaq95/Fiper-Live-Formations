import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarPlus, CheckCircle2, Clock3, MailCheck, MapPin, MessageCircleMore, Users } from "lucide-react";
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
    <main className="fine-grid flex min-h-screen flex-col bg-[#f3f6f8] text-[#071d2f]">
      <header className="mx-auto flex h-20 w-full max-w-[1120px] items-center px-5 sm:px-8"><FiperLogo darkText /></header>
      <div className="mx-auto flex w-full max-w-[920px] flex-1 items-center px-5 py-10 sm:px-8">
        <div className="grid w-full overflow-hidden rounded-3xl border border-[#dce5eb] bg-white shadow-[0_24px_70px_rgba(7,29,47,.12)] lg:grid-cols-[1.1fr_.9fr]">
          <section className="p-7 sm:p-12">
            <span className={`flex h-16 w-16 items-center justify-center rounded-2xl ${waitlisted ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
              {waitlisted ? <Users size={30} /> : <CheckCircle2 size={32} />}
            </span>
            <p className="mt-8 text-xs font-bold text-[#C32828]">{waitlisted ? "قائمة الانتظار" : "تم تأكيد تسجيلك"}</p>
            <h1 className="mt-3 text-3xl font-bold text-[#071d2f] sm:text-4xl">
              <span className="block">{waitlisted ? "شكرًا،" : "أهلًا،"}</span>
              <bdi dir="auto" className="latin mt-2 block break-words text-2xl font-bold sm:text-3xl">{name}</bdi>
              <span className="mt-2 block">{waitlisted ? "حفظنا ترتيبك." : "مقعدك جاهز."}</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-[#607686]">
              {waitlisted
                ? "الدورة مكتملة حالياً. سنرسل لك رسالة فور توفر مقعد، ولن تحتاج إلى التسجيل مرة أخرى."
                : "أرسلنا تفاصيل الدورة إلى بريدك وواتساب. احتفظ بالموعد، وسنذكّرك قبل الانطلاق."}
            </p>

            {!waitlisted && (
              <a href={calendarHref} target="_blank" rel="noreferrer" aria-label="إضافة الدورة إلى التقويم" className="mt-8 flex h-13 items-center justify-center gap-2 rounded-xl bg-[#C32828] px-6 text-base font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#A92121] active:scale-[.98]">
                <CalendarPlus size={17} /> أضف الموعد إلى تقويمك
              </a>
            )}
            <Link href={`/courses/${encodeURIComponent(course.slug)}`} className="mt-7 inline-flex items-center gap-2 text-xs font-semibold text-[#607686] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-[#071d2f]"><ArrowRight size={15} /> العودة إلى صفحة الدورة</Link>
          </section>

          <aside className="border-t border-[#dce5eb] bg-[#f8fafb] p-7 sm:p-9 lg:border-r lg:border-t-0">
            <p className="text-xs font-bold text-[#071d2f]">ملخص الدورة</p>
            <h2 className="mt-4 text-lg font-bold text-[#071d2f]">{course.title}</h2>
            <div className="mt-7 space-y-3">
              <div className="flex items-center gap-3 rounded-xl border border-[#dce5eb] bg-white p-4"><CalendarPlus size={18} className="text-[#C32828]" /><span><small className="block text-xs text-[#718696]">التاريخ</small><strong className="mt-1 block text-xs text-[#071d2f]">{course.dateLabel}</strong></span></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-[#dce5eb] bg-white p-4"><Clock3 size={16} className="text-[#C32828]" /><span><small className="block text-xs text-[#718696]">التوقيت</small><strong className="latin mt-1 block text-xs text-[#071d2f]">{course.timeLabel}</strong></span></div>
                <div className="rounded-xl border border-[#dce5eb] bg-white p-4"><small className="block text-xs text-[#718696]">المكان</small><strong className="mt-1 block text-xs text-[#071d2f]">{course.type === "onsite" ? (course.venueName || course.venueAddress || "حضوري") : course.platform}</strong>{course.type === "onsite" && course.venueAddress && course.venueName ? <small className="mt-1 block text-xs text-[#607686]">{course.venueAddress}</small> : null}{course.type === "onsite" && course.mapsUrl ? <a href={course.mapsUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#C32828] underline"><MapPin size={12} /> فتح الموقع على Google Maps</a> : null}</div>
              </div>
            </div>
            <div className="mt-8 border-t border-[#dce5eb] pt-6">
              <p className="text-xs font-bold text-[#607686]">ماذا سيحدث الآن؟</p>
              <div className="mt-4 space-y-3 text-xs text-[#405968]">
                <p className="flex items-center gap-2"><MailCheck size={14} className="text-emerald-600" /> تحقق من رسالة التأكيد في بريدك</p>
                <p className="flex items-center gap-2"><MessageCircleMore size={14} className="text-emerald-600" /> ستصلك التذكيرات على واتساب</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <p className="pb-8 text-center text-xs text-[#718696] latin">Fiper Academy · Registration ID secured</p>
    </main>
  );
}
