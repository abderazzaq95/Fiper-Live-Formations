"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarBlank,
  Clock,
  Globe,
  List,
  MagnifyingGlass,
  VideoCamera,
  X,
} from "@phosphor-icons/react";

import type { Course } from "@/lib/demo-data";
import styles from "@/components/preview/reference.module.css";

function CourseCard({ course, priority }: { course: Course; priority: boolean }) {
  const href = `/courses/${encodeURIComponent(course.slug)}`;
  return (
    <article className="group flex h-full flex-col rounded-2xl bg-white p-3 shadow-[0_1px_2px_rgba(7,29,47,.04)] ring-1 ring-[#e4e7ea] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(7,29,47,.10)]">
      <Link href={href} aria-label={`عرض دورة ${course.title}`} className="relative block aspect-[16/9] overflow-hidden rounded-xl bg-[#dfe6ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C32828]">
        <Image src={course.coverImage || "/brand/hero-reference.png"} alt={`صورة دورة ${course.title}`} fill priority={priority} sizes="(max-width: 767px) 100vw, 560px" className="object-cover object-center transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.03]" />
        <span className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#C32828] p-2 shadow-lg"><Image src="/brand/fiper-mark.png" alt="" width={30} height={30} className="h-full w-full object-contain" /></span>
        <span className="absolute bottom-4 left-4 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#071d2f] shadow-sm">{course.type === "online" ? "مباشرة" : "حضورية"}</span>
      </Link>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
        <h2 className="text-balance text-xl font-bold text-[#071d2f]">{course.title}</h2>
        <p className="mt-2 line-clamp-2 text-pretty text-sm leading-6 text-[#687681]">{course.description}</p>

        <dl className="mt-4 grid grid-cols-3 overflow-hidden rounded-xl border border-[#dde2e6] text-center">
          <div className="p-3"><CalendarBlank className="mx-auto text-[#687681]" size={18} weight="duotone" /><dt className="sr-only">التاريخ</dt><dd className="mt-2 line-clamp-2 text-xs font-semibold text-[#3f4e59]">{course.dateLabel}</dd></div>
          <div className="border-x border-[#dde2e6] p-3"><Clock className="mx-auto text-[#687681]" size={18} weight="duotone" /><dt className="sr-only">المدة</dt><dd className="mt-2 text-xs font-semibold text-[#3f4e59]">{course.duration}</dd></div>
          <div className="p-3"><VideoCamera className="mx-auto text-[#687681]" size={18} weight="duotone" /><dt className="sr-only">الحضور</dt><dd className="mt-2 truncate text-xs font-semibold text-[#3f4e59]">{course.type === "online" ? course.platform : course.venueName || "حضوري"}</dd></div>
        </dl>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {course.instructor.image ? <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-[#e1e5e8]"><Image src={course.instructor.image} alt={`المحاضر ${course.instructor.name}`} fill unoptimized sizes="44px" className="object-cover object-top" /></span> : <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#071d2f] text-xs font-bold text-white">{course.instructor.initials}</span>}
            <span className="min-w-0"><strong className="block truncate text-sm text-[#071d2f]">{course.instructor.name}</strong><small className="mt-1 block truncate text-xs text-[#7b8790]">{course.instructor.role}</small></span>
          </div>
          <Link href={href} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#071d2f] px-4 py-2 text-sm font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#C32828] active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C32828]">التفاصيل <ArrowLeft size={16} /></Link>
        </div>
      </div>
    </article>
  );
}

export function SimpleCoursesDirectory({ courses }: { courses: Course[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ar");
    if (!normalized) return courses;
    return courses.filter((course) => `${course.title} ${course.description} ${course.instructor.name}`.toLocaleLowerCase("ar").includes(normalized));
  }, [courses, query]);

  return (
    <main className={`${styles.page} min-h-screen bg-[#eef1f3]`} dir="rtl">
      <a href="#courses" className={styles.skipLink}>الانتقال إلى الدورات</a>

      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Fiper Academy"><Image src="/brand/fiper-wordmark-drive.png" alt="Fiper Academy" width={190} height={66} priority /></Link>
        <nav className={styles.desktopNav} aria-label="التنقل الرئيسي">
          <Link href="/">الرئيسية</Link>
          <a href="#courses" aria-current="page">الدورات</a>
        </nav>
        <div className={styles.headerTools}>
          <a href="#course-search" aria-label="البحث عن دورة"><MagnifyingGlass size={22} /></a>
          <a href="#footer" aria-label="معلومات الأكاديمية"><Globe size={22} /></a>
          <button type="button" aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)} className={styles.menuButton}>{menuOpen ? <X size={24} /> : <List size={24} />}</button>
        </div>
      </header>

      {menuOpen ? <nav className={styles.mobileNav} aria-label="قائمة الهاتف">{[["/", "الرئيسية"], ["#courses", "الدورات"], ["#footer", "عن Fiper"]].map(([href, label], index) => <Link key={href} href={href} style={{ transitionDelay: `${index * 50}ms` }} onClick={() => setMenuOpen(false)}>{label}<ArrowLeft size={18} /></Link>)}</nav> : null}

      <section id="courses" className="scroll-mt-16 bg-[#eef1f3] px-4 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-[1120px]">
          <label htmlFor="course-search" className="relative mx-auto block w-full max-w-xl">
            <span className="sr-only">البحث عن الدورات</span>
            <MagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#98a2aa]" size={20} />
            <input id="course-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="البحث عن الدورات" className="h-12 w-full rounded-xl border border-[#e1e5e8] bg-white px-4 pl-12 text-sm text-[#071d2f] shadow-sm outline-none transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-[#a8b0b7] focus:border-[#C32828] focus:ring-4 focus:ring-[#C32828]/10" />
          </label>

          {filtered.length ? <div className="mt-10 grid gap-4 md:grid-cols-2 sm:gap-6">{filtered.map((course, index) => <CourseCard key={course.id} course={course} priority={index < 2} />)}</div> : <div className="mt-10 rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-[#e1e5e8]"><h1 className="text-2xl font-bold text-[#071d2f]">لا توجد دورات مطابقة</h1><p className="mt-3 text-sm text-[#687681]">جرّب البحث باسم دورة أو محاضر آخر.</p></div>}
        </div>
      </section>

      <footer id="footer" className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}><Image src="/brand/fiper-wordmark-drive.png" alt="Fiper Academy" width={210} height={73} /><p>تعليم مباشر يساعد المتداول العربي على فهم السوق وبناء قرارات أكثر وضوحًا.</p></div>
          <nav aria-label="روابط الأكاديمية"><h2>الأكاديمية</h2><Link href="/">الرئيسية</Link><a href="#courses">الدورات المتاحة</a></nav>
          <nav aria-label="روابط مهمة"><h2>معلومات مهمة</h2><Link href="/privacy">سياسة الخصوصية</Link><Link href="/terms">الشروط والأحكام</Link><a href="mailto:meetings@fiperacademy.com">تواصل معنا</a></nav>
          <div className={styles.footerAction}><h2>اختر دورتك</h2><p>راجع الدورات المتاحة وافتح صفحة الدورة التي تناسب وقتك وهدفك.</p><a href="#courses">عرض الدورات<ArrowLeft size={18} /></a></div>
        </div>
        <div className={styles.disclaimer}><p>ينطوي التداول في الأسواق المالية على مخاطر وقد لا يناسب جميع الأشخاص. المحتوى المقدم تعليمي فقط ولا يمثل نصيحة استثمارية أو توصية بالشراء أو البيع.</p></div>
        <div className={styles.copyright}><span>© {new Date().getFullYear()} Fiper Academy</span><a href="#courses">العودة إلى الأعلى</a></div>
      </footer>
    </main>
  );
}
