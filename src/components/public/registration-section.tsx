import { CalendarPlus, ChevronDown, Clock3, MailCheck, MessageCircleMore, ShieldCheck, Video } from "lucide-react";
import { FiperLogo } from "@/components/brand/fiper-logo";
import { RegistrationForm } from "./registration-form";
import { SectionHeading } from "./section-heading";
import type { Course } from "@/lib/demo-data";
import type { PublicCourseData } from "@/lib/data/courses";

export function RegistrationSection({ course, faqs }: { course: Course; faqs: PublicCourseData["faqs"] }) {
  return (
    <>
      <section id="faq" className="fine-grid bg-[#f4f8fb] py-24 text-[#071d2f] sm:py-30">
        <div className="mx-auto max-w-[920px] px-5 sm:px-8">
          <SectionHeading align="center" light eyebrow="قبل أن تسجل" title="إجابات واضحة عن أسئلتك" />
          <div className="mt-10 space-y-3">
            {faqs.map((item, index) => (
              <details key={item.question} open={index === 0} className="group rounded-[20px] border border-[#dce7ef] bg-white px-5 shadow-[0_12px_35px_rgba(12,43,65,.045)] sm:px-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-sm font-bold">
                  {item.question}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eef4f8] text-[#567084] transition group-open:rotate-180 group-open:bg-[#C32828] group-open:text-white"><ChevronDown size={16} /></span>
                </summary>
                <p className="border-t border-[#edf2f5] pb-6 pt-4 text-xs leading-7 text-[#657c8e]">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="register" className="noise-grid relative overflow-hidden bg-[#031a2d] py-20 sm:py-28">
        <div className="pointer-events-none absolute -bottom-44 -left-40 h-[420px] w-[420px] rounded-full bg-[#C32828]/10 blur-[110px]" />
        <div className="relative mx-auto grid max-w-[1120px] overflow-hidden rounded-[34px] border border-white/10 bg-[#062139]/80 shadow-[0_40px_100px_rgba(0,8,15,.35)] lg:grid-cols-[.85fr_1.15fr]">
          <div className="border-b border-white/8 p-7 sm:p-10 lg:border-b-0 lg:border-l">
            <SectionHeading eyebrow="خطوتك التالية" title="احجز مقعدك المجاني" description="أدخل بياناتك مرة واحدة، وسنرسل إليك التأكيد والرابط وكل التذكيرات المهمة." />

            <div className="mt-9 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                <CalendarPlus size={19} className="text-[#C32828]" />
                <span><small className="block text-[9px] text-[#7895aa]">الموعد</small><strong className="mt-1 block text-xs">{course.dateLabel}</strong></span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                  <Clock3 size={18} className="text-[#C32828]" /><span><small className="block text-[9px] text-[#7895aa]">المدة</small><strong className="mt-1 block text-xs">{course.duration}</strong></span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                  <Video size={18} className="text-[#C32828]" /><span><small className="block text-[9px] text-[#7895aa]">المكان</small><strong className="mt-1 block text-xs">{course.platform}</strong></span>
                </div>
              </div>
            </div>

            <div className="mt-9 border-t border-white/8 pt-7">
              <p className="text-[10px] font-bold text-[#7895aa]">بعد التسجيل مباشرة</p>
              <div className="mt-4 flex flex-wrap gap-4 text-[10px] text-[#bed1df]">
                <span className="flex items-center gap-2"><MailCheck size={14} className="text-[#62d5aa]" /> تأكيد بالبريد</span>
                <span className="flex items-center gap-2"><MessageCircleMore size={14} className="text-[#62d5aa]" /> رسالة واتساب</span>
                <span className="flex items-center gap-2"><CalendarPlus size={14} className="text-[#62d5aa]" /> إضافة للتقويم</span>
              </div>
            </div>
          </div>

          <div className="bg-[#041a2d]/75 p-7 sm:p-10">
            <div className="mb-7 flex items-center justify-between">
              <div><p className="text-sm font-bold text-white">بيانات التسجيل</p><p className="mt-1 text-[10px] text-[#6f8ba0]">جميع الحقول مطلوبة</p></div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#123754] text-[#62d5aa]"><ShieldCheck size={19} /></span>
            </div>
            <RegistrationForm courseId={course.id} />
          </div>
        </div>
      </section>

      <footer className="border-t border-white/8 bg-[#021525] pb-24 pt-12 sm:pb-10">
        <div className="mx-auto flex max-w-[1120px] flex-col items-center justify-between gap-8 px-5 text-center sm:px-8 md:flex-row md:text-right">
          <div><FiperLogo /><p className="mt-4 max-w-md text-[10px] leading-6 text-[#67859b]">محتوى تعليمي عام ولا يمثل نصيحة استثمارية. ينطوي تداول المنتجات المالية على مخاطر وقد يؤدي إلى خسارة رأس المال.</p></div>
          <div className="text-[10px] leading-6 text-[#67859b]">
            <p className="latin">© 2026 Fiper Academy</p>
            <div className="mt-2 flex gap-4"><a href="#" className="hover:text-white">الخصوصية</a><a href="#" className="hover:text-white">الشروط</a></div>
          </div>
        </div>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#031a2d]/92 p-3 backdrop-blur-xl sm:hidden">
        <a href="#register" className="flex h-13 items-center justify-center rounded-2xl bg-[#C32828] text-sm font-bold text-white shadow-[0_10px_35px_rgba(195,40,40,.3)]">احجز مقعدك المجاني</a>
      </div>
    </>
  );
}
