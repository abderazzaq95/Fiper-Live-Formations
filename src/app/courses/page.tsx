import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Users,
  Video,
} from "lucide-react";

import { FiperLogo } from "@/components/brand/fiper-logo";
import { listPublicActiveCourses } from "@/lib/data/courses";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الدورات المباشرة المتاحة",
  description: "اكتشف دورات Fiper Academy المباشرة، وراجع المواعيد والمحاضرين ثم سجّل حضورك مجانًا.",
  alternates: { canonical: "/courses" },
};

function countLabel(count: number) {
  if (count === 0) return "لا توجد دورات متاحة";
  if (count === 1) return "دورة واحدة متاحة";
  if (count === 2) return "دورتان متاحتان";
  if (count > 2 && count < 11) return `${count} دورات متاحة`;
  return `${count} دورة متاحة`;
}

export async function CoursesIndexPage({ isHome = false }: { isHome?: boolean } = {}) {
  const courses = await listPublicActiveCourses();
  const featured = courses[0];

  return <main className="min-h-screen bg-[#f4f3f0] text-[#071d2f]">
    <a href="#available-courses" className="sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-[#071d2f] focus:shadow-lg">
      الانتقال إلى الدورات
    </a>

    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#031a2d]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1240px] items-center justify-between gap-4 px-5 sm:px-8">
        <div className="shrink-0"><FiperLogo variant="drive" href="/" /></div>
        <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-8 text-xs font-semibold text-[#9bb3c5] md:flex">
          <a href="#available-courses" className="transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30">الدورات</a>
          {featured ? <a href="#why-live" className="transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30">لماذا Fiper</a> : null}
        </nav>
        {featured ? (
          <Link href={`/courses/${encodeURIComponent(featured.slug)}`} className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[#C32828] px-3 text-xs font-bold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-[#A92121] active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-white/70 sm:px-5">
            <span className="sm:hidden">سجّل الآن</span><span className="hidden sm:inline">سجّل الآن مجانًا</span> <ArrowLeft size={15} aria-hidden="true" />
          </Link>
        ) : (
          <a href="#available-courses" className="flex h-11 items-center gap-2 rounded-xl border border-white/15 px-3 text-xs font-bold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/10 active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-white/70 sm:px-5">الدورات</a>
        )}
      </div>
    </header>

    <section className="bg-[#fbfaf8]">
      <div className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8 sm:py-20">
        <p className="text-sm font-semibold text-[#C32828]">Fiper Live Academy</p>
        <div className="mt-4 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="w-full max-w-[680px] lg:flex-1">
            <h1 aria-label="اختر الدورة التي تناسب أهدافك" className="max-w-[680px] bg-gradient-to-l from-black to-[#666666] bg-clip-text text-[40px] font-extrabold leading-[1.32] tracking-[-0.055em] text-transparent sm:text-[54px] lg:text-[62px]">
              <span aria-hidden="true" className="block">اختر الدورة التي</span>
              <span aria-hidden="true" className="relative block">تناسب أهدافك<span className="absolute -bottom-2 right-0 h-1.5 w-24 rounded-full bg-[#C32828]" /></span>
            </h1>
            <p className="mt-6 max-w-[680px] text-base leading-8 text-pretty text-[#526575] sm:text-lg">
              تعرّف على محتوى كل دورة وموعدها ومحاضرها، ثم احجز مقعدك لتصلك تفاصيل الحضور والتذكيرات تلقائيًا.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C32828] text-lg font-bold text-white">{courses.length}</span>
            <div><p className="text-sm font-semibold text-[#071d2f]">{countLabel(courses.length)}</p><p className="mt-1 text-xs font-medium text-[#6f7f8c]">التسجيل مجاني ومباشر</p></div>
          </div>
        </div>
      </div>
    </section>

    {featured ? <>
      <section id="available-courses" aria-labelledby="available-courses-heading" className="scroll-mt-20 bg-[#eef3f6]">
        <div className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8 sm:py-20">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-[680px]">
              <p className="text-xs font-semibold text-[#C32828]">الدورات المفتوحة للتسجيل</p>
              <h2 id="available-courses-heading" className="mt-2 text-3xl font-bold tracking-[-0.04em] text-balance text-[#071d2f] sm:text-4xl">اختر دورتك وابدأ التسجيل</h2>
              <p className="mt-4 text-base text-pretty text-[#526575]">قارن المواعيد والمحاضرين وطريقة الحضور، ثم افتح صفحة الدورة المناسبة لك.</p>
            </div>
            <p className="text-sm font-semibold text-[#526575]">{countLabel(courses.length)}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {courses.map((course, index) => (
              <article key={course.id} className="group flex h-full flex-col rounded-2xl bg-white p-4 shadow-[0_18px_50px_rgba(7,29,47,.08)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-[0_24px_64px_rgba(7,29,47,.13)]">
                <Link href={`/courses/${encodeURIComponent(course.slug)}`} aria-label={`عرض دورة ${course.title}`} className="relative block aspect-[16/9] overflow-hidden rounded-xl bg-[#d9eaf6] focus:outline-none focus:ring-2 focus:ring-[#C32828]/40">
                  <Image src={course.coverImage || "/brand/hero-reference.png"} alt={`صورة دورة ${course.title}`} fill priority={index < 2} sizes="(max-width: 767px) 100vw, 50vw" className="object-cover object-center transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.03]" />
                  <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
                    <span className="rounded-lg bg-[#071d2f]/90 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md">{course.type === "online" ? "دورة مباشرة" : "دورة حضورية"}</span>
                    {index === 0 ? <span className="rounded-lg bg-[#C32828] px-3 py-2 text-xs font-semibold text-white">الدورة الأقرب</span> : null}
                  </div>
                </Link>

                <div className="flex flex-1 flex-col px-2 pb-2 pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-[#C32828]">{course.eyebrow}</p>
                    <p className="flex items-center gap-2 text-xs font-medium text-[#6f7f8c]"><Users size={15} className="text-[#C32828]" aria-hidden="true" />{73 + course.registrations} شخصًا أكدوا حضورهم</p>
                  </div>

                  <h3 className="mt-4 text-2xl font-bold tracking-[-0.035em] text-balance text-[#071d2f] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:text-[#C32828]">{course.title}</h3>
                  <p className="mt-3 line-clamp-2 text-sm text-pretty text-[#526575]">{course.description}</p>

                  <dl className="mt-6 grid grid-cols-3 overflow-hidden rounded-xl border border-[#dce2e6] bg-[#fbfcfc] text-center">
                    <div className="p-3"><CalendarDays size={18} className="mx-auto text-[#C32828]" aria-hidden="true" /><dt className="mt-2 text-xs font-medium text-[#7b8994]">التاريخ</dt><dd className="mt-1 text-xs font-semibold text-[#071d2f]">{course.dateLabel}</dd></div>
                    <div className="border-x border-[#dce2e6] p-3"><Clock3 size={18} className="mx-auto text-[#C32828]" aria-hidden="true" /><dt className="mt-2 text-xs font-medium text-[#7b8994]">الوقت والمدة</dt><dd className="mt-1 text-xs font-semibold text-[#071d2f]">{course.timeLabel} · {course.duration}</dd></div>
                    <div className="p-3">{course.type === "online" ? <Video size={18} className="mx-auto text-[#C32828]" aria-hidden="true" /> : <MapPin size={18} className="mx-auto text-[#C32828]" aria-hidden="true" />}<dt className="mt-2 text-xs font-medium text-[#7b8994]">الحضور</dt><dd className="mt-1 text-xs font-semibold text-[#071d2f]">{course.type === "online" ? course.platform : course.venueName || "حضوري"}</dd></div>
                  </dl>

                  <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#e5e9ec] pt-5">
                    <div className="flex min-w-0 items-center gap-3">
                      {course.instructor.image ? (
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#e3e6e8]"><Image src={course.instructor.image} alt={`المحاضر ${course.instructor.name}`} fill sizes="48px" className="object-cover object-top" /></div>
                      ) : (
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#071d2f] text-sm font-bold text-white">{course.instructor.initials}</span>
                      )}
                      <div className="min-w-0"><p className="truncate text-sm font-bold text-[#071d2f]">{course.instructor.name}</p><p className="mt-1 truncate text-xs font-medium text-[#7b8994]">{course.instructor.role}</p></div>
                    </div>
                    <Link href={`/courses/${encodeURIComponent(course.slug)}`} className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#071d2f] px-4 text-sm font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#C32828] active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-[#C32828]/30">التفاصيل والتسجيل <ArrowLeft size={16} aria-hidden="true" /></Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="why-live" className="scroll-mt-20 bg-[#eeeae4]">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <h2 className="max-w-[680px] text-3xl font-extrabold leading-[1.45] tracking-[-0.045em] text-balance text-[#071d2f] sm:text-4xl">تعلّم مباشرة من المختصين، واسأل أثناء الجلسة، ثم حوّل ما تعلمته إلى خطوات عملية.</h2>
          <div className="space-y-4">
            {["حضور مباشر وتفاعلي", "تأكيد فوري بعد التسجيل", "تذكيرات عبر البريد وواتساب"].map((item) => <p key={item} className="flex items-center gap-3 text-sm font-semibold text-[#526575]"><CheckCircle2 size={19} className="text-[#16785f]" aria-hidden="true" />{item}</p>)}
          </div>
        </div>
      </section>
    </> : <section id="available-courses" className="mx-auto max-w-[1280px] px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-4xl bg-white px-6 py-20 text-center shadow-[0_24px_80px_rgba(7,29,47,.07)] sm:px-8">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fbecec] text-[#C32828]"><CalendarDays size={26} aria-hidden="true" /></span>
        <h2 className="mt-5 text-2xl font-bold text-balance text-[#071d2f]">لا توجد دورات مفتوحة الآن</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm font-medium text-pretty text-[#526575]">نعمل على تجهيز المواعيد القادمة. عد إلى هذه الصفحة لاحقًا للاطلاع على الدورات الجديدة.</p>
        <Link href="/" className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#071d2f] px-4 text-sm font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#15364f] active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-[#071d2f]/30">العودة إلى الرئيسية</Link>
      </div>
    </section>}

    <footer className="bg-[#071d2f] text-white">
      {featured ? <div className="mx-auto max-w-[1280px] px-5 pt-16 sm:px-8 sm:pt-20">
        <div className="flex flex-col gap-8 bg-[#102b40] p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-[680px]">
            <p className="text-xs font-semibold text-[#eaa2a2]">خطوتك التالية</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-[1.45] tracking-[-0.045em] text-balance sm:text-4xl">اختر دورتك واحجز مقعدك المجاني الآن</h2>
            <p className="mt-3 text-sm leading-7 text-pretty text-[#aab9c5]">أكمل التسجيل خلال دقائق، وسنرسل إليك التأكيد ورابط الحضور والتذكيرات المهمة.</p>
          </div>
          <Link href={`/courses/${encodeURIComponent(featured.slug)}`} className="flex h-12 shrink-0 items-center justify-center gap-3 rounded-xl bg-[#C32828] px-5 text-base font-semibold text-white shadow-[0_16px_40px_rgba(195,40,40,.24)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#a92121] hover:shadow-[0_20px_48px_rgba(195,40,40,.3)] active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-[#102b40]">سجّل في الدورة القادمة <ArrowLeft size={18} aria-hidden="true" /></Link>
        </div>
      </div> : null}

      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.5fr_.75fr_.75fr]">
        <div className="max-w-sm">
          <FiperLogo variant="drive" href="/" />
          <p className="mt-5 text-sm leading-7 text-pretty text-[#aab9c5]">دورات مباشرة وعملية تساعدك على فهم الأسواق المالية وبناء قرارات أكثر وضوحًا وانضباطًا.</p>
        </div>
        <nav aria-label="روابط التذييل">
          <p className="text-sm font-bold text-white">استكشف</p>
          <div className="mt-5 flex flex-col items-start gap-4 text-sm font-medium text-[#aab9c5]">
            <Link href="/" aria-current={isHome ? "page" : undefined} className="transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30">الرئيسية</Link>
            {isHome ? (
              <a href="#available-courses" className="transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30">الدورات المتاحة</a>
            ) : (
              <Link href="/courses" aria-current="page" className="transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30">الدورات المتاحة</Link>
            )}
          </div>
        </nav>
        <div>
          <p className="text-sm font-bold text-white">ما الذي تحصل عليه</p>
          <div className="mt-5 space-y-4 text-sm font-medium text-[#aab9c5]">
            <p>حضور مباشر وتفاعلي</p>
            <p>تأكيد فوري للتسجيل</p>
            <p>تذكيرات عبر البريد وواتساب</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-5 py-6 text-xs font-medium text-[#7f97a9] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© 2026 Fiper Academy. جميع الحقوق محفوظة.</p>
          <p>تعلّم الأسواق المالية بخطوات عملية واضحة</p>
        </div>
      </div>
    </footer>
  </main>;
}

export default function CoursesPage() {
  return <CoursesIndexPage />;
}
