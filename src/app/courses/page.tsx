import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Radio,
  ShieldCheck,
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

export default async function CoursesPage() {
  const courses = await listPublicActiveCourses();
  const featured = courses[0];
  const remainingCourses = courses.slice(1);

  return <main className="min-h-screen bg-[#f4f3f0] text-[#071d2f]">
    <a href="#available-courses" className="sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-[#071d2f] focus:shadow-lg">
      الانتقال إلى الدورات
    </a>

    <header className="bg-white shadow-[0_1px_0_rgba(7,29,47,.08)]">
      <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-5 sm:px-8">
        <FiperLogo darkText href="/" />
        <nav aria-label="التنقل الرئيسي" className="flex items-center gap-2">
          <Link href="/" className="rounded-lg px-3 py-2 text-sm font-medium text-[#526575] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#f1f3f4] hover:text-[#071d2f] active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-[#C32828]/30">الرئيسية</Link>
          <span aria-current="page" className="rounded-lg bg-[#071d2f] px-3 py-2 text-sm font-semibold text-white">الدورات</span>
        </nav>
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
      <section id="available-courses" aria-labelledby="featured-course-heading" className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#C32828]">الدورة الأقرب</p>
            <h2 id="featured-course-heading" className="mt-2 text-2xl font-extrabold leading-[1.45] tracking-[-0.04em] text-balance sm:text-3xl">ابدأ من الدورة القادمة</h2>
          </div>
          <p className="flex items-center gap-2 text-sm font-medium text-[#526575]"><Radio size={16} className="text-[#C32828]" aria-hidden="true" /> التسجيل مفتوح الآن</p>
        </div>

        <article className="overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(7,29,47,.09)]">
          <div className="grid lg:grid-cols-[.72fr_1.28fr]">
            <aside className="flex flex-col bg-[#071d2f] p-6 text-white sm:p-8 lg:p-10">
              <div className="relative aspect-[1.22/1] overflow-hidden rounded-xl bg-[#d9eaf6]">
                <Image src={featured.coverImage || "/brand/hero-reference.png"} alt={`صورة دورة ${featured.title}`} fill priority sizes="(max-width: 1024px) 100vw, 35vw" className="object-contain object-center transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.03]" />
              </div>

              <div className="mt-8">
                <p className="text-xs font-semibold text-[#eaa2a2]">احجز مقعدك في الدورة</p>
                <p className="mt-3 text-2xl font-extrabold leading-[1.45] tracking-[-0.04em] text-balance">التسجيل مجاني والمقاعد محدودة</p>
                <p className="mt-3 text-sm leading-7 text-pretty text-[#aab9c5]">أكمل بياناتك مرة واحدة، وسنرسل إليك رابط الحضور والتذكيرات المهمة.</p>
              </div>

              <Link href={`/courses/${encodeURIComponent(featured.slug)}`} className="mt-8 flex h-12 items-center justify-center gap-3 rounded-xl bg-[#C32828] px-5 text-base font-semibold text-white shadow-[0_16px_40px_rgba(195,40,40,.24)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#a92121] hover:shadow-[0_20px_48px_rgba(195,40,40,.3)] active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-[#071d2f]">
                سجّل حضورك الآن <ArrowLeft size={18} aria-hidden="true" />
              </Link>

              <div className="mt-6 flex items-center gap-3 text-xs font-medium text-[#aab9c5]">
                <ShieldCheck size={17} className="text-[#6fd8b6]" aria-hidden="true" /> بياناتك تستخدم فقط للتسجيل والتذكير بالدورة
              </div>
            </aside>

            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#edf8f3] px-3 py-2 text-xs font-semibold text-[#16785f]">دورة مباشرة</span>
                <span className="text-xs font-semibold text-[#C32828]">{featured.eyebrow}</span>
              </div>

              <h2 className="mt-6 max-w-[680px] text-3xl font-extrabold leading-[1.45] tracking-[-0.045em] text-balance text-[#071d2f] sm:text-4xl">{featured.title}</h2>
              <p className="mt-5 max-w-[680px] text-base leading-8 text-pretty text-[#526575] sm:text-lg">{featured.description}</p>

              <dl className="mt-8 grid gap-6 bg-[#f7f7f5] p-6 sm:grid-cols-2 lg:grid-cols-4">
                <div><CalendarDays size={22} className="text-[#C32828]" aria-hidden="true" /><dt className="mt-3 text-xs font-medium text-[#7b8994]">التاريخ</dt><dd className="mt-1 text-sm font-semibold text-[#071d2f]">{featured.dateLabel}</dd></div>
                <div><Clock3 size={22} className="text-[#C32828]" aria-hidden="true" /><dt className="mt-3 text-xs font-medium text-[#7b8994]">الوقت والمدة</dt><dd className="mt-1 text-sm font-semibold text-[#071d2f]">{featured.timeLabel} · {featured.duration}</dd></div>
                <div>{featured.type === "online" ? <Video size={22} className="text-[#C32828]" aria-hidden="true" /> : <MapPin size={22} className="text-[#C32828]" aria-hidden="true" />}<dt className="mt-3 text-xs font-medium text-[#7b8994]">طريقة الحضور</dt><dd className="mt-1 text-sm font-semibold text-[#071d2f]">{featured.type === "online" ? featured.platform : featured.venueName || "حضوري"}</dd></div>
                <div><Users size={22} className="text-[#C32828]" aria-hidden="true" /><dt className="mt-3 text-xs font-medium text-[#7b8994]">الحضور المؤكد</dt><dd className="mt-1 text-sm font-semibold text-[#071d2f]">{73 + featured.registrations} مشاركًا</dd></div>
              </dl>

              <section aria-labelledby="instructor-heading" className="mt-8">
                <p className="text-xs font-semibold text-[#C32828]">المحاضر</p>
                <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center">
                  {featured.instructor.image ? <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-[#eef0f1]"><Image src={featured.instructor.image} alt={`المحاضر ${featured.instructor.name}`} fill sizes="112px" className="object-cover" /></div> : <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-[#071d2f] text-2xl font-bold text-white">{featured.instructor.initials}</div>}
                  <div className="max-w-xl">
                    <h3 id="instructor-heading" className="text-xl font-extrabold tracking-[-0.035em] text-balance text-[#071d2f]">{featured.instructor.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-[#526575]">{featured.instructor.role}</p>
                    <p className="mt-3 text-sm font-medium text-pretty text-[#6f7f8c]">{featured.instructor.bio}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </article>
      </section>

      {remainingCourses.length ? <section aria-labelledby="more-courses-heading" className="bg-white">
        <div className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8 sm:py-20">
          <div className="max-w-[680px]">
            <p className="text-xs font-semibold text-[#C32828]">مواعيد أخرى</p>
            <h2 id="more-courses-heading" className="mt-2 text-3xl font-extrabold leading-[1.45] tracking-[-0.045em] text-balance text-[#071d2f] sm:text-4xl">استكشف بقية الدورات المباشرة</h2>
            <p className="mt-4 text-base leading-8 text-pretty text-[#526575]">قارن الموضوع والموعد وطريقة الحضور، ثم انتقل مباشرة إلى صفحة التسجيل.</p>
          </div>

          <div className="mt-10 divide-y divide-[#dce2e6] border-y border-[#dce2e6]">
            {remainingCourses.map((course, index) => <article key={course.id} className="group grid gap-6 py-8 lg:grid-cols-[80px_1fr_auto] lg:items-center">
              <p className="latin text-3xl font-bold text-[#c3cbd1]">{String(index + 2).padStart(2, "0")}</p>
              <div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#C32828]"><span>{course.eyebrow}</span><span className="h-1 w-1 rounded-full bg-[#c3cbd1]" /><span className="text-[#526575]">{73 + course.registrations} شخصًا أكدوا حضورهم</span></div>
                <h3 className="mt-3 text-2xl font-extrabold leading-[1.45] tracking-[-0.04em] text-balance text-[#071d2f] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:text-[#C32828]">{course.title}</h3>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-[#526575]">
                  <span className="flex items-center gap-2"><CalendarDays size={17} className="text-[#C32828]" aria-hidden="true" />{course.dateLabel}</span>
                  <span className="flex items-center gap-2"><Clock3 size={17} className="text-[#C32828]" aria-hidden="true" />{course.timeLabel} · {course.duration}</span>
                  <span className="flex items-center gap-2">{course.type === "online" ? <Video size={17} className="text-[#C32828]" aria-hidden="true" /> : <MapPin size={17} className="text-[#C32828]" aria-hidden="true" />}{course.type === "online" ? course.platform : course.venueName || "حضوري"}</span>
                </div>
              </div>
              <Link href={`/courses/${encodeURIComponent(course.slug)}`} aria-label={`عرض دورة ${course.title}`} className="flex h-12 items-center justify-center gap-3 rounded-xl border border-[#cfd7dc] px-5 text-sm font-semibold text-[#071d2f] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-[#C32828] hover:bg-[#C32828] hover:text-white active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-[#C32828]/30">التفاصيل والتسجيل <ArrowLeft size={17} aria-hidden="true" /></Link>
            </article>)}
          </div>
        </div>
      </section> : null}

      <section className="bg-[#eeeae4]">
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
            <Link href="/" className="transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30">الرئيسية</Link>
            <Link href="/courses" aria-current="page" className="transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30">الدورات المتاحة</Link>
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
