import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock3, MapPin, Radio, Users, Video } from "lucide-react";

import { FiperLogo } from "@/components/brand/fiper-logo";
import { listPublicActiveCourses } from "@/lib/data/courses";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الدورات المتاحة",
  description: "استعرض دورات Fiper Academy المباشرة، واختر الدورة المناسبة لك ثم سجّل حضورك.",
  alternates: { canonical: "/courses" },
};

export default async function CoursesPage() {
  const courses = await listPublicActiveCourses();

  return <main className="min-h-screen bg-[#f5f6f7] text-[#071d2f]">
    <a href="#available-courses" className="sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-[#071d2f] focus:shadow-lg">
      الانتقال إلى الدورات
    </a>

    <header className="bg-white">
      <div className="mx-auto flex h-20 max-w-[1240px] items-center justify-between px-5 sm:px-8">
        <FiperLogo darkText href="/" />
        <nav aria-label="التنقل الرئيسي" className="flex items-center gap-2">
          <Link href="/" className="rounded-lg px-3 py-2 text-sm font-medium text-[#526575] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#f1f3f4] hover:text-[#071d2f] active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-[#C32828]/30">
            الرئيسية
          </Link>
          <span aria-current="page" className="rounded-lg bg-[#071d2f] px-3 py-2 text-sm font-semibold text-white">الدورات المتاحة</span>
        </nav>
      </div>
    </header>

    <section className="bg-[#fffdfb]">
      <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[680px]">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#fbecec] px-4 py-2 text-xs font-semibold text-[#a92121]">
              <Radio size={14} aria-hidden="true" /> دورات مباشرة ومفتوحة للتسجيل
            </p>
            <h1 className="mt-6 bg-gradient-to-l from-black to-[#666666] bg-clip-text text-4xl font-bold text-transparent text-balance sm:text-5xl lg:whitespace-nowrap">
              اختر الدورة التي تناسب أهدافك
            </h1>
            <p className="mt-4 max-w-[680px] text-base font-medium text-pretty text-[#526575] sm:text-lg">
              اطّلع على الدورات القادمة وقارن مواعيدها، ثم افتح صفحة الدورة التي تهمك وأكمل تسجيلك خلال دقائق.
            </p>
          </div>

          <div className="flex items-center gap-3 lg:pb-1">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#071d2f] text-base font-bold text-white">{courses.length}</span>
            <p className="max-w-40 text-sm font-medium text-pretty text-[#526575]">دورة قادمة متاحة للتسجيل الآن</p>
          </div>
        </div>
      </div>
    </section>

    <section id="available-courses" aria-labelledby="courses-heading" className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 sm:py-20">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold text-[#C32828]">التسجيل متاح</p>
          <h2 id="courses-heading" className="mt-2 text-2xl font-bold text-balance text-[#071d2f] sm:text-3xl">الدورات القادمة</h2>
        </div>
        <p className="hidden max-w-md text-left text-sm font-medium text-pretty text-[#6f7f8c] sm:block">اختر الدورة لعرض البرنامج الكامل وبيانات المحاضر ونموذج التسجيل.</p>
      </div>

      {courses.length ? <div className="space-y-8">
        {courses.map((course) => {
          const displayedRegistrations = 73 + course.registrations;
          const attendance = course.type === "online" ? `مباشرة عبر ${course.platform}` : course.venueName || "حضوري";

          return <article key={course.id} className="group overflow-hidden rounded-2xl border border-[#dce2e6] bg-white shadow-[0_16px_48px_rgba(7,29,47,.06)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:border-[#c8d1d7] hover:shadow-[0_24px_64px_rgba(7,29,47,.1)]">
            <div className="grid lg:grid-cols-[minmax(360px,.9fr)_1.1fr]">
              <div className="relative min-h-64 overflow-hidden bg-[#e8ecef] lg:min-h-96">
                <Image
                  src={course.coverImage || "/brand/hero-reference.png"}
                  alt={`صورة دورة ${course.title}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 44vw"
                  className="object-cover transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.03]"
                />
                <span className="absolute right-4 top-4 rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#16785f] shadow-sm">التسجيل مفتوح</span>
              </div>

              <div className="flex flex-col p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs font-semibold text-[#C32828]">{course.eyebrow}</p>
                  <span className="h-1 w-1 rounded-full bg-[#aab5bd]" aria-hidden="true" />
                  <p className="flex items-center gap-2 text-xs font-medium text-[#526575]"><Users size={15} aria-hidden="true" /> {displayedRegistrations} شخصًا أكدوا حضورهم</p>
                </div>

                <h3 className="mt-4 max-w-2xl text-2xl font-bold text-balance text-[#071d2f] sm:text-3xl">{course.title}</h3>
                <p className="mt-4 max-w-2xl text-sm font-medium text-pretty text-[#526575] sm:text-base">{course.description}</p>

                <dl className="mt-8 grid gap-6 border-y border-[#e5e9ec] py-6 sm:grid-cols-3">
                  <div className="flex items-start gap-3">
                    <CalendarDays size={19} className="mt-1 shrink-0 text-[#C32828]" aria-hidden="true" />
                    <div><dt className="text-xs font-medium text-[#7b8994]">التاريخ</dt><dd className="mt-1 text-sm font-semibold text-[#071d2f]">{course.dateLabel}</dd></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock3 size={19} className="mt-1 shrink-0 text-[#C32828]" aria-hidden="true" />
                    <div><dt className="text-xs font-medium text-[#7b8994]">الوقت والمدة</dt><dd className="mt-1 text-sm font-semibold text-[#071d2f]">{course.timeLabel} · {course.duration}</dd></div>
                  </div>
                  <div className="flex items-start gap-3">
                    {course.type === "online" ? <Video size={19} className="mt-1 shrink-0 text-[#C32828]" aria-hidden="true" /> : <MapPin size={19} className="mt-1 shrink-0 text-[#C32828]" aria-hidden="true" />}
                    <div><dt className="text-xs font-medium text-[#7b8994]">طريقة الحضور</dt><dd className="mt-1 text-sm font-semibold text-[#071d2f]">{attendance}</dd></div>
                  </div>
                </dl>

                <div className="mt-auto flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-sm text-xs font-medium text-pretty text-[#6f7f8c]">التسجيل مجاني، ويصلك التأكيد والتذكيرات عبر البريد الإلكتروني وواتساب.</p>
                  <Link href={`/courses/${encodeURIComponent(course.slug)}`} className="flex h-12 shrink-0 items-center justify-center gap-3 rounded-xl bg-[#C32828] px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(195,40,40,.18)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#a92121] hover:shadow-[0_16px_36px_rgba(195,40,40,.24)] active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-[#C32828]/30 focus:ring-offset-2">
                    عرض الدورة والتسجيل <ArrowLeft size={17} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </article>;
        })}
      </div> : <div className="rounded-2xl border border-[#dce2e6] bg-white px-6 py-16 text-center shadow-[0_16px_48px_rgba(7,29,47,.05)]">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fbecec] text-[#C32828]"><CalendarDays size={26} aria-hidden="true" /></span>
        <h2 className="mt-5 text-2xl font-bold text-balance text-[#071d2f]">لا توجد دورات مفتوحة الآن</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm font-medium text-pretty text-[#526575]">نعمل على تجهيز المواعيد القادمة. عد إلى هذه الصفحة لاحقًا للاطلاع على الدورات الجديدة.</p>
        <Link href="/" className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-[#cfd7dc] bg-white px-4 text-sm font-semibold text-[#071d2f] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#f1f3f4] active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-[#C32828]/30">
          العودة إلى الرئيسية
        </Link>
      </div>}
    </section>

    <footer className="bg-white">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-5 py-8 text-xs font-medium text-[#6f7f8c] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <FiperLogo compact href="/" />
        <p>Fiper Academy · تعلّم الأسواق المالية بخطوات عملية وواضحة</p>
      </div>
    </footer>
  </main>;
}
