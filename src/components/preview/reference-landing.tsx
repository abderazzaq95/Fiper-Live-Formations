"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarBlank,
  CheckCircle,
  Clock,
  CurrencyDollar,
  Globe,
  List,
  MagnifyingGlass,
  VideoCamera,
  X,
} from "@phosphor-icons/react";

import { RegistrationForm } from "@/components/public/registration-form";
import type { PublicCourseData } from "@/lib/data/courses";
import styles from "./reference.module.css";

export function ReferenceLanding({ course, agenda, outcomes, faqs, landing }: PublicCourseData) {
  const root = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add(styles.visible);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.14 });
    root.current?.querySelectorAll("[data-reveal], [data-word]").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const curriculum = agenda.length ? agenda : outcomes.map((item) => ({ title: item.title, text: item.text, time: "" }));
  const statement = "افهم الفكرة من مصدرها، وناقشها مباشرة، ثم غادر بخطوات أوضح يمكنك تطبيقها.";

  return (
    <main ref={root} className={styles.page} dir="rtl">
      <a href="#main-content" className={styles.skipLink}>انتقل إلى المحتوى</a>

      <header className={styles.header}>
        <a href="#main-content" className={styles.brand} aria-label="Fiper Academy">
          <Image src="/brand/fiper-wordmark-drive.png" alt="Fiper Academy" width={190} height={66} priority />
        </a>
        <nav className={styles.desktopNav} aria-label="التنقل الرئيسي">
          <a href="#main-content" aria-current="page">الدورة</a>
          <a href="#instructor">المحاضر</a>
          <a href="#program">البرنامج التدريبي</a>
          <a href="#questions">الأسئلة الشائعة</a>
        </nav>
        <div className={styles.headerTools}>
          <a href="#register" aria-label="الانتقال إلى التسجيل"><MagnifyingGlass size={22} /></a>
          <a href="#footer" aria-label="معلومات الأكاديمية"><Globe size={22} /></a>
          <button type="button" aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)} className={styles.menuButton}>
            {menuOpen ? <X size={24} /> : <List size={24} />}
          </button>
        </div>
      </header>

      {menuOpen ? <nav className={styles.mobileNav} aria-label="قائمة الهاتف">{[
        ["main-content", "الدورة"],
        ["instructor", "المحاضر"],
        ["program", "البرنامج التدريبي"],
        ["questions", "الأسئلة الشائعة"],
        ["register", "سجل الآن"],
      ].map(([target, label], index) => <a key={target} href={`#${target}`} style={{ transitionDelay: `${index * 50}ms` }} onClick={() => setMenuOpen(false)}>{label}<ArrowLeft size={18} /></a>)}</nav> : null}

      <section id="main-content" className={styles.heroSection}>
        <div className={styles.heroGrid}>
          <article className={styles.courseIntro} data-reveal>
            <p className={styles.kicker}>دعوة لحضور دورة مباشرة</p>
            <h1>{course.title}</h1>
            <p className={styles.lead}>{course.heroHeading}</p>
            <div className={styles.shortRule} />
            <dl className={styles.courseFacts}>
              <div><CurrencyDollar size={30} weight="duotone" /><dt>السعر</dt><dd>مجانًا</dd></div>
              <div><CalendarBlank size={30} weight="duotone" /><dt>التاريخ</dt><dd>{course.dateLabel}</dd></div>
              <div><Clock size={30} weight="duotone" /><dt>الوقت</dt><dd>{course.timeLabel}</dd></div>
              <div><VideoCamera size={30} weight="duotone" /><dt>الحضور</dt><dd>{course.type === "online" ? course.platform : course.venueName || "حضوري"}</dd></div>
            </dl>
            <p className={styles.description}>{course.description}</p>
            <div className={styles.assurances}>
              <span><CheckCircle size={18} weight="fill" />تسجيل مجاني</span>
              <span><CheckCircle size={18} weight="fill" />تأكيد وتذكير قبل الموعد</span>
              <span><CheckCircle size={18} weight="fill" />حضور مباشر وتفاعلي</span>
            </div>
          </article>

          {landing.visibility.registration ? <aside id="register" className={styles.formCard} data-reveal>
            <div className={styles.formTitle}>
              <h2>بيانات التسجيل في الدورة</h2>
              <p>بادر بالحجز، المقاعد محدودة</p>
              <span />
            </div>
            {course.registrationOpen === false ? <p className={styles.closed}>التسجيل مغلق حاليًا.</p> : <RegistrationForm courseId={course.id} compact />}
          </aside> : null}
        </div>
      </section>

      {landing.visibility.instructor ? <section id="instructor" className={styles.instructorSection}>
        <div className={styles.sectionLabel}><span>المحاضر</span></div>
        <article className={styles.instructorStrip} data-reveal>
          <div className={styles.instructorPhoto}>
            {course.instructor.image ? <Image src={course.instructor.image} alt={`المحاضر ${course.instructor.name}`} fill unoptimized sizes="(max-width: 760px) 100vw, 280px" /> : <span>{course.instructor.initials}</span>}
          </div>
          <div className={styles.instructorCopy}>
            <p>المحاضر</p>
            <h2>{course.instructor.name}</h2>
            <i aria-hidden="true" />
            <h3>{course.instructor.role}</h3>
            <p>{course.instructor.bio}</p>
          </div>
        </article>

        <div className={styles.sessionStrip} data-reveal>
          <dl>
            <div><dt>التاريخ</dt><dd>{course.dateLabel}</dd></div>
            <div><dt>المدة</dt><dd>{course.duration}</dd></div>
            <div><dt>السعر</dt><dd>مجانًا</dd></div>
          </dl>
          <a href="#register">سجل الآن<ArrowLeft size={18} /></a>
        </div>
      </section> : null}

      <section className={styles.statement} aria-label="قيمة الدورة">
        <p>{statement.split(" ").map((word, index) => <span key={`${word}-${index}`} data-word style={{ transitionDelay: `${index * 55}ms` }}>{word} </span>)}</p>
      </section>

      {landing.visibility.agenda || landing.visibility.about ? <section id="program" className={styles.programSection}>
        <div className={styles.programBox} data-reveal>
          <div className={styles.programContent}>
            <h2>محتوى البرنامج التدريبي</h2>
            <ul className={styles.programBullets}>
              {curriculum.map((item, index) => <li key={`${item.title}-${index}`}>{item.title}</li>)}
            </ul>
          </div>
        </div>
      </section> : null}

      {landing.visibility.faq && faqs.length ? <section id="questions" className={styles.faqSection}>
        <div data-reveal><p>قبل التسجيل</p><h2>أسئلة شائعة</h2></div>
        <div className={styles.faqList}>{faqs.map((faq, index) => <details key={`${faq.question}-${index}`} data-reveal><summary>{faq.question}<span>+</span></summary><p>{faq.answer}</p></details>)}</div>
      </section> : null}

      <footer id="footer" className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}><Image src="/brand/fiper-wordmark-drive.png" alt="Fiper Academy" width={210} height={73} /><p>تعليم مباشر يساعد المتداول العربي على فهم السوق وبناء قرارات أكثر وضوحًا.</p></div>
          <nav aria-label="روابط الدورة"><h2>الدورة</h2><a href="#main-content">تفاصيل الدورة</a><a href="#instructor">المحاضر</a><a href="#program">البرنامج</a></nav>
          <nav aria-label="روابط مهمة"><h2>معلومات مهمة</h2><a href="/privacy">سياسة الخصوصية</a><a href="/terms">الشروط والأحكام</a><a href="mailto:meetings@fiperacademy.com">تواصل معنا</a></nav>
          <div className={styles.footerAction}><h2>احجز مقعدك</h2><p>أدخل بياناتك مرة واحدة لتصلك تفاصيل الحضور والتذكيرات.</p><a href="#register">سجل مجانًا<ArrowLeft size={18} /></a></div>
        </div>
        <div className={styles.disclaimer}><p>{landing.footer.disclaimer}</p></div>
        <div className={styles.copyright}><span>© {new Date().getFullYear()} Fiper Academy</span><a href="#main-content">العودة إلى الأعلى</a></div>
      </footer>
    </main>
  );
}
