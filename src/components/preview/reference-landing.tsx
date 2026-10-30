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
  MapPin,
  MagnifyingGlass,
  VideoCamera,
  X,
} from "@phosphor-icons/react";

import { RegistrationForm } from "@/components/public/registration-form";
import { CompactPublicFooter } from "@/components/public/compact-public-footer";
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
  const isOnsite = course.type === "onsite";
  const mapUrl = typeof course.mapsUrl === "string" && /^https?:\/\//i.test(course.mapsUrl) ? course.mapsUrl : "";
  const attendanceBenefit = isOnsite && landing.hero.benefitTwo === "حضور مباشر وتفاعلي" ? "حضور حضوري وتفاعلي" : landing.hero.benefitTwo;
  return (
    <main ref={root} className={styles.page} dir="rtl">
      <a href="#main-content" className={styles.skipLink}>انتقل إلى المحتوى</a>

      <header className={styles.header}>
        <a href="#main-content" className={styles.brand} aria-label="Fiper Academy">
          <Image src="/brand/fiper-wordmark-drive.png" alt="Fiper Academy" width={190} height={66} priority />
        </a>
        <nav className={styles.desktopNav} aria-label="التنقل الرئيسي">
          <a href="#main-content" aria-current="page">{landing.hero.navCourse}</a>
          <a href="#instructor">{landing.hero.navInstructor}</a>
          <a href="#program">{landing.hero.navAgenda}</a>
          <a href="#questions">{landing.hero.navFaq}</a>
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
        ["main-content", landing.hero.navCourse],
        ["instructor", landing.hero.navInstructor],
        ["program", landing.hero.navAgenda],
        ["questions", landing.hero.navFaq],
        ["register", landing.hero.primaryCta],
      ].map(([target, label], index) => <a key={target} href={`#${target}`} style={{ transitionDelay: `${index * 50}ms` }} onClick={() => setMenuOpen(false)}>{label}<ArrowLeft size={18} /></a>)}</nav> : null}

      {landing.visibility.hero ? <section id="main-content" className={styles.heroSection}>
        <div className={styles.heroGrid}>
          <article className={styles.courseIntro} data-reveal>
            <p className={styles.kicker}>{course.eyebrow || "دعوة لحضور دورة مباشرة"}</p>
            <h1>{course.title}</h1>
            <p className={styles.lead}>{course.heroHeading}</p>
            <div className={styles.shortRule} />
            <dl className={styles.courseFacts}>
              <div><CurrencyDollar size={30} weight="duotone" /><dt>السعر</dt><dd>مجانًا</dd></div>
              <div><CalendarBlank size={30} weight="duotone" /><dt>التاريخ</dt><dd>{course.dateLabel}</dd></div>
              <div><Clock size={30} weight="duotone" /><dt>الوقت</dt><dd>{course.timeLabel}</dd></div>
              {isOnsite ? <div className={styles.venueFact}><MapPin size={30} weight="duotone" /><dt>المكان</dt><dd><strong>{course.venueName || "حضوري"}</strong>{course.venueAddress ? <small title={course.venueAddress}>{course.venueAddress}</small> : null}{mapUrl ? <a href={mapUrl} target="_blank" rel="noreferrer">عرض الخريطة</a> : null}</dd></div> : <div><VideoCamera size={30} weight="duotone" /><dt>الحضور</dt><dd>{course.platform}</dd></div>}
            </dl>
            <p className={styles.description}>{course.description}</p>
            <div className={styles.assurances}>
              <span><CheckCircle size={18} weight="fill" />{landing.hero.benefitOne}</span>
              <span><CheckCircle size={18} weight="fill" />{landing.hero.benefitThree}</span>
              <span><CheckCircle size={18} weight="fill" />{attendanceBenefit}</span>
            </div>
          </article>

          {landing.visibility.registration ? <aside id="register" className={styles.formCard} data-reveal>
            <div className={styles.formTitle}>
              <h2>{landing.registration.formTitle}</h2>
              <p>{landing.registration.formDescription}</p>
              <span />
            </div>
            {course.registrationOpen === false ? <p className={styles.closed}>التسجيل مغلق حاليًا.</p> : <RegistrationForm courseId={course.id} compact />}
          </aside> : null}
        </div>
      </section> : null}

      {landing.visibility.instructor ? <section id="instructor" className={styles.instructorSection}>
        <div className={styles.sectionLabel}><span>{landing.instructor.eyebrow}</span></div>
        <article className={styles.instructorStrip} data-reveal>
          <div className={styles.instructorPhoto}>
            {course.instructor.image ? <Image src={course.instructor.image} alt={`المحاضر ${course.instructor.name}`} fill unoptimized sizes="(max-width: 760px) 100vw, 280px" /> : <span>{course.instructor.initials}</span>}
          </div>
          <div className={styles.instructorCopy}>
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
          <a href="#register">{landing.hero.primaryCta}<ArrowLeft size={18} /></a>
        </div>
      </section> : null}

      {landing.visibility.agenda ? <section id="program" className={styles.programSection}>
        <div className={styles.programBox} data-reveal>
          <div className={styles.programContent}>
            <h2>{landing.agenda.title}</h2>
            <ul className={styles.programBullets}>
              {curriculum.map((item, index) => <li key={`${item.title}-${index}`}>{item.title}</li>)}
            </ul>
          </div>
        </div>
      </section> : null}

      {landing.visibility.faq && faqs.length ? <section id="questions" className={styles.faqSection}>
        <div data-reveal><p>{landing.faq.eyebrow}</p><h2>{landing.faq.title}</h2></div>
        <div className={styles.faqList}>{faqs.map((faq, index) => <details key={`${faq.question}-${index}`} data-reveal><summary>{faq.question}<span>+</span></summary><p>{faq.answer}</p></details>)}</div>
      </section> : null}

      {landing.visibility.footer ? <CompactPublicFooter
        brandDescription={landing.footer.brandDescription}
        disclaimer={landing.footer.disclaimer}
        privacyLabel={landing.footer.privacyLabel}
        termsLabel={landing.footer.termsLabel}
      /> : null}
    </main>
  );
}
