import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock3, MapPin, Radio, Users, Video } from "lucide-react";

import { FiperLogo } from "@/components/brand/fiper-logo";
import { listPublicActiveCourses } from "@/lib/data/courses";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الدورات المتاحة",
  description: "استعرض دورات Fiper Academy المباشرة واختر الدورة المناسبة لك ثم سجّل حضورك.",
  alternates: { canonical: "/courses" },
};

export default async function CoursesPage() {
  const courses = await listPublicActiveCourses();

  return <main className="noise-grid min-h-screen bg-[#031a2d] text-white">
    <header className="border-b border-white/8 bg-[#031a2d]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1240px] items-center justify-between px-5 sm:px-8">
        <FiperLogo variant="drive" href="/" />
        <nav aria-label="التنقل الرئيسي" className="flex items-center gap-3">
          <Link href="/" className="rounded-xl px-3 py-2 text-sm font-medium text-[#91adc2] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.05] hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20">الرئيسية</Link>
          <span aria-current="page" className="rounded-xl bg-white/[0.07] px-3 py-2 text-sm font-semibold text-white">الدورات</span>
        </nav>
      </div>
    </header>

    <section className="mx-auto max-w-[1240px] px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-20">
      <div className="max-w-3xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-[#C32828]/25 bg-[#C32828]/10 px-4 py-2 text-xs font-semibold text-[#E6A2A2]"><Radio size={14} /> دورات مباشرة ومتاحة للتسجيل</p>
        <h1 className="mt-6 max-w-[680px] bg-gradient-to-l from-white to-[#9B9B9B] bg-clip-text text-4xl font-bold text-transparent text-balance sm:text-5xl">اختر الدورة التي تناسب أهدافك</h1>
        <p className="mt-4 max-w-[680px] text-base font-medium text-pretty text-[#91adc2] sm:text-lg">اطّلع على المواعيد والتفاصيل، ثم انتقل إلى صفحة الدورة لإكمال تسجيلك واستلام التأكيد والتذكيرات.</p>
      </div>

      <div className="mt-12 flex items-center justify-between border-y border-white/10 py-4">
        <p className="text-sm font-medium text-[#91adc2]">الدورات القادمة المفتوحة للتسجيل</p>
        <p className="latin text-sm font-semibold text-white">{courses.length} {courses.length === 1 ? "COURSE" : "COURSES"}</p>
      </div>

      {courses.length ? <section aria-label="الدورات المتاحة" className="mt-8 space-y-6">
        {courses.map((course) => {
          const displayedRegistrations = 73 + course.registrations;
          const attendance = course.type === "online" ? `مباشرة عبر ${course.platform}` : course.venueName || "حضوري";
          return <article key={course.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#062139]/80 shadow-[0_24px_70px_rgba(0,10,20,.22)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:border-white/20 hover:bg-[#082740]">
            <div className="grid lg:grid-cols-[minmax(320px,.82fr)_1.18fr]">
              <div className="relative min-h-64 overflow-hidden bg-[#0a2a46] lg:min-h-80">
                <Image src={course.coverImage || "/brand/hero-reference.png"} alt={`صورة دورة ${course.title}`} fill sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.03]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#021525]/85 via-transparent to-transparent" />
                <span className="absolute right-4 top-4 rounded-full border border-[#23c99a]/25 bg-[#05283a]/90 px-3 py-2 text-xs font-semibold text-[#8af0cb] backdrop-blur-xl">التسجيل مفتوح</span>
                <p className="absolute bottom-4 right-4 flex items-center gap-2 text-sm font-semibold text-white"><Users size={16} className="text-[#E56B6B]" /> {displayedRegistrations} شخصًا أكدوا حضورهم</p>
              </div>

              <div className="flex flex-col p-6 sm:p-8 lg:p-10">
                <p className="text-xs font-semibold text-[#E6A2A2]">{course.eyebrow}</p>
                <h2 className="mt-3 max-w-2xl text-2xl font-bold text-balance text-white sm:text-3xl">{course.title}</h2>
                <p className="mt-4 max-w-2xl text-sm font-medium text-pretty text-[#91adc2] sm:text-base">{course.description}</p>

                <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3"><CalendarDays size={18} className="shrink-0 text-[#E56B6B]" /><div><dt className="text-xs text-[#6f8da4]">التاريخ</dt><dd className="mt-1 text-sm font-semibold text-white">{course.dateLabel}</dd></div></div>
                  <div className="flex items-center gap-3"><Clock3 size={18} className="shrink-0 text-[#E56B6B]" /><div><dt className="text-xs text-[#6f8da4]">الوقت والمدة</dt><dd className="mt-1 text-sm font-semibold text-white">{course.timeLabel} · {course.duration}</dd></div></div>
                  <div className="flex items-center gap-3 sm:col-span-2">{course.type === "online" ? <Video size={18} className="shrink-0 text-[#E56B6B]" /> : <MapPin size={18} className="shrink-0 text-[#E56B6B]" />}<div><dt className="text-xs text-[#6f8da4]">طريقة الحضور</dt><dd className="mt-1 text-sm font-semibold text-white">{attendance}</dd></div></div>
                </dl>

                <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-medium text-[#7f9cb2]">التسجيل مجاني والتأكيد يصل عبر البريد وواتساب</p>
                  <Link href={`/courses/${encodeURIComponent(course.slug)}`} className="red-glow flex h-12 items-center justify-center gap-3 rounded-xl bg-[#C32828] px-5 text-sm font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#A92121] active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-[#E56B6B]/50">عرض الدورة والتسجيل <ArrowLeft size={17} /></Link>
                </div>
              </div>
            </div>
          </article>;
        })}
      </section> : <section className="mt-8 rounded-2xl border border-white/10 bg-[#062139]/80 px-6 py-16 text-center">
        <CalendarDays size={32} className="mx-auto text-[#E56B6B]" />
        <h2 className="mt-5 text-2xl font-bold text-balance">لا توجد دورات مفتوحة الآن</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm font-medium text-pretty text-[#91adc2]">نعمل على تجهيز المواعيد القادمة. عد إلى هذه الصفحة لاحقًا للاطلاع على الدورات الجديدة.</p>
        <Link href="/" className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-white/15 px-4 text-sm font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.06] active:scale-[.98]">العودة إلى الرئيسية</Link>
      </section>}
    </section>

    <footer className="border-t border-white/8 bg-[#021525]">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-3 px-5 py-8 text-xs text-[#6f8da4] sm:flex-row sm:items-center sm:justify-between sm:px-8"><FiperLogo compact href="/" /><p>Fiper Academy · تعلّم الأسواق المالية بخطوات عملية وواضحة</p></div>
    </footer>
  </main>;
}
