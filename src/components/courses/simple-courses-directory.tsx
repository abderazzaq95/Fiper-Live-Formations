"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarBlank,
  Clock,
  Globe,
  MagnifyingGlass,
  MapPin,
  MonitorPlay,
} from "@phosphor-icons/react";
import type { Course } from "@/lib/demo-data";
import { CourseCover } from "@/components/courses/course-cover";

function courseHref(course: Course) {
  return `/courses/${course.slug || course.id}`;
}

function CourseCard({ course, priority = false }: { course: Course; priority?: boolean }) {
  const isOnline = course.type === "online";
  const location = course.type === "online" ? course.platform || "عبر الإنترنت" : course.venueName || "حضوري";

  return (
    <article className="group overflow-hidden rounded-[18px] border border-[#e1e4e7] bg-white p-3 shadow-[0_5px_18px_rgba(13,34,50,0.05)] transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(13,34,50,0.10)]">
      <Link href={courseHref(course)} className="relative block overflow-hidden rounded-[12px]" aria-label={`عرض دورة ${course.title}`}>
        <CourseCover course={course} priority={priority} className="aspect-[16/9] w-full" />
        <span className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-[9px] bg-[#cf262c] shadow-md">
          <Image src="/brand/fiper-mark.png" alt="" width={31} height={31} className="h-8 w-8 object-contain" />
        </span>
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-[#10283a] shadow-sm">
          {isOnline ? <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-[#16a05d]" /> : null}
          {isOnline ? "دورة أونلاين" : "دورة حضورية"}
        </span>
      </Link>

      <div className="px-1 pb-1 pt-4">
        <Link href={courseHref(course)}>
          <h2 className="line-clamp-2 text-[21px] font-bold leading-[1.45] text-[#071f31] transition-colors group-hover:text-[#cf262c]">
            {course.title}
          </h2>
        </Link>
        <p className="mt-2 line-clamp-2 min-h-[48px] text-sm leading-6 text-[#667783]">{course.description}</p>

        <div className="mt-4 grid grid-cols-3 divide-x divide-x-reverse divide-[#e1e4e7] overflow-hidden rounded-[10px] border border-[#e1e4e7] text-center">
          <div className="flex min-w-0 items-center justify-center gap-1.5 px-2 py-3 text-xs font-semibold text-[#526571]">
            <CalendarBlank size={17} weight="regular" className="shrink-0 text-[#cf262c]" />
            <span className="truncate">{course.dateLabel}</span>
          </div>
          <div className="flex min-w-0 items-center justify-center gap-1.5 px-2 py-3 text-xs font-semibold text-[#526571]">
            <Clock size={17} weight="regular" className="shrink-0 text-[#cf262c]" />
            <span className="truncate">{course.duration}</span>
          </div>
          <div className="flex min-w-0 items-center justify-center gap-1.5 px-2 py-3 text-xs font-semibold text-[#526571]">
            {course.type === "online" ? <MonitorPlay size={17} className="shrink-0 text-[#cf262c]" /> : <MapPin size={17} className="shrink-0 text-[#cf262c]" />}
            <span className="truncate">{location}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#e7edf1]">
              {course.instructor.image ? (
                <Image src={course.instructor.image} alt={course.instructor.name} fill sizes="44px" className="object-cover object-top" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs font-bold text-[#526571]">{course.instructor.initials}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#10283a]">{course.instructor.name}</p>
              <p className="truncate text-xs text-[#788894]">{course.instructor.role}</p>
            </div>
          </div>
          <Link href={courseHref(course)} className="inline-flex shrink-0 items-center gap-2 rounded-[8px] bg-[#071f31] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#cf262c]">
            عرض الدورة
            <ArrowLeft size={16} weight="bold" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black text-white">
      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="Fiper Academy" className="shrink-0">
          <Image src="/brand/fiper-wordmark-drive.png" alt="Fiper" width={151} height={58} priority className="h-[50px] w-auto object-contain" />
        </Link>

        <nav className="flex items-center text-sm font-bold sm:text-base" aria-label="التنقل الرئيسي">
          <Link href="/courses" className="text-[#cf262c]">الدورات</Link>
        </nav>

        <div className="hidden items-center gap-5 md:flex" aria-hidden="true">
          <Globe size={25} />
          <MagnifyingGlass size={25} />
        </div>

      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-[1240px] px-6 py-12 sm:px-8 lg:py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_0.8fr_1.15fr]">
          <div>
            <Image src="/brand/fiper-wordmark-drive.png" alt="Fiper" width={170} height={66} className="h-[58px] w-auto object-contain" />
            <p className="mt-4 max-w-xs text-sm leading-7 text-[#b8c0c7]">تعليم مباشر يساعد المتداول العربي على فهم السوق وبناء قرارات أكثر وضوحًا.</p>
          </div>
          <div>
            <h3 className="text-base font-bold">الأكاديمية</h3>
            <div className="mt-4 space-y-3 text-sm text-[#b8c0c7]">
              <Link href="/" className="block hover:text-white">الرئيسية</Link>
              <Link href="/courses" className="block hover:text-white">الدورات المتاحة</Link>
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold">معلومات مهمة</h3>
            <div className="mt-4 space-y-3 text-sm text-[#b8c0c7]">
              <Link href="/privacy" className="block hover:text-white">سياسة الخصوصية</Link>
              <Link href="/terms" className="block hover:text-white">الشروط والأحكام</Link>
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold">اختر دورتك</h3>
            <p className="mt-4 text-sm leading-7 text-[#b8c0c7]">راجع الدورات المتاحة وافتح صفحة الدورة التي تناسب وقتك وهدفك.</p>
            <Link href="#courses-list" className="mt-5 inline-flex items-center gap-2 rounded-[8px] bg-[#cf262c] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#b71f25]">
              تصفح الدورات
              <ArrowLeft size={16} weight="bold" />
            </Link>
          </div>
        </div>
        <div className="mt-11 border-t border-white/15 pt-6 text-xs leading-6 text-[#8f9aa2]">
          <p>التداول في الأسواق المالية ينطوي على مخاطر. المحتوى التعليمي لا يُعد توصية استثمارية أو دعوة للشراء أو البيع.</p>
          <p className="mt-3">© 2026 Fiper Academy. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}

export function SimpleCoursesDirectory({ courses }: { courses: Course[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("ar");
  const filteredCourses = useMemo(() => {
    if (!normalizedQuery) return courses;
    return courses.filter((course) => [course.title, course.description, course.topic, course.instructor.name]
      .filter(Boolean)
      .some((value) => value!.toLocaleLowerCase("ar").includes(normalizedQuery)));
  }, [courses, normalizedQuery]);

  return (
    <div dir="rtl" className="min-h-screen bg-[#eef1f3] text-[#071f31]">
      <Header />
      <main className="min-h-[580px] px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-[1120px]">
          <section aria-labelledby="courses-heading" className="mx-auto max-w-[760px] text-center">
            <h1 id="courses-heading" className="text-3xl font-bold leading-[1.35] text-[#071f31] sm:text-4xl">
              دورات وندوات فايبر التعليمية
            </h1>
            <p className="mx-auto mt-4 max-w-[720px] text-base leading-8 text-[#607481] sm:text-lg">
              استعرض جدول الدورات والمحاضرات المباشرة في تعلّم التداول عبر الأسواق المالية المختلفة بإشراف مدربينا، حضوريًّا وأونلاين.
            </p>
          </section>

          <div className="relative mx-auto mt-8 max-w-[560px]">
            <MagnifyingGlass size={23} className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[#92a0aa]" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="البحث عن الدورات"
              aria-label="البحث عن الدورات"
              className="h-14 w-full rounded-[12px] border border-[#e0e4e7] bg-white pr-14 pl-5 text-base outline-none shadow-[0_3px_10px_rgba(13,34,50,0.05)] transition focus:border-[#cf262c] focus:ring-2 focus:ring-[#cf262c]/10"
            />
          </div>

          <section id="courses-list" aria-label="الدورات المتاحة" className="mt-10 scroll-mt-28">
            {filteredCourses.length ? (
              <div className="grid gap-5 md:grid-cols-2">
                {filteredCourses.map((course, index) => <CourseCard key={course.id} course={course} priority={index < 2} />)}
              </div>
            ) : (
              <div className="rounded-[18px] border border-[#dde2e5] bg-white px-6 py-20 text-center">
                <h2 className="text-2xl font-bold">لا توجد دورات مطابقة</h2>
                <p className="mt-3 text-[#6c7d88]">جرّب البحث باسم دورة أو محاضر آخر.</p>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
