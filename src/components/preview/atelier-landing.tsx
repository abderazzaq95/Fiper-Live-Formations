"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { PublicCourseData } from "@/lib/data/courses";
import { RegistrationForm } from "@/components/public/registration-form";
import styles from "./atelier.module.css";

export function AtelierLanding({ course, agenda, outcomes, faqs, landing }: PublicCourseData) {
  const root = useRef<HTMLElement>(null);
  const [chapter, setChapter] = useState(0);
  const [menu, setMenu] = useState(false);
  const selected = agenda[chapter];
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add(styles.visible); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    root.current?.querySelectorAll("[data-reveal]").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  const cta = "احجز مقعدك المجاني";
  return <main ref={root} className={styles.page} dir="rtl">
    <a href="#atelier-content" className={styles.skip}>انتقل إلى المحتوى</a>
    <div className={styles.preview}>معاينة التصميم <span dir="ltr">FIPER LIVE / CONCEPT 03</span></div>
    <header className={styles.header}>
      <a href="#atelier-content" aria-label="Fiper Live" className={styles.logo}><Image src="/brand/fiper-mark.png" alt="" width={40} height={40} /><span>Fiper<span className={styles.live}>LIVE</span></span></a>
      <nav aria-label="التنقل الرئيسي" className={styles.nav}><a href="#mentor">مع المحاضر</a><a href="#chapters">داخل الجلسة</a><a href="#reserve">التسجيل</a></nav>
      <a href="#reserve" className={styles.headerCta}>{cta} <span aria-hidden="true">↙</span></a>
      <button className={styles.menuButton} aria-label={menu ? "إغلاق القائمة" : "فتح القائمة"} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? "إغلاق ×" : "القائمة +"}</button>
    </header>
    {menu && <nav className={styles.mobileMenu} aria-label="قائمة الهاتف">{[["mentor", "مع المحاضر"], ["chapters", "داخل الجلسة"], ["reserve", "التسجيل"]].map(([id, label]) => <a key={id} href={`#${id}`} onClick={() => setMenu(false)}>{label} ↙</a>)}</nav>}

    <section id="atelier-content" className={styles.hero}>
      <div className={styles.heroTop}><span className={styles.eyebrow}><i /> تعلم مباشر. حوار مفتوح.</span><span className={styles.edition}>أكاديمية فيبر / جلسات الأسواق المالية</span></div>
      <h1>السوق يتحرّك.<br /><span>افهمه قبل أن تتحرّك.</span></h1>
      <div className={styles.heroBottom}>
        <div className={styles.heroIntro}><p>{course.description}</p><a href="#reserve" className={styles.cta}>{cta}<span aria-hidden="true">↙</span></a><span className={styles.micro}>تعليم مجاني · {course.type === "online" ? "جلسة أونلاين" : "جلسة حضورية"} · {course.duration}</span></div>
        <div className={styles.ticket}>
          <div className={styles.ticketTop}><span dir="ltr">YOUR NEXT SESSION</span><span className={styles.ticketDot} /></div>
          <h2>{course.title}</h2>
          <div className={styles.ticketFacts}><div><small>الموعد</small><strong>{course.dateLabel}</strong></div><div><small>وقت البداية</small><strong>{course.timeLabel}</strong></div></div>
          <div className={styles.ticketFoot}><span>{course.type === "online" ? course.platform : course.venueName || "حضوري"}</span><span dir="ltr">F / LIVE</span></div>
          <div className={styles.barcode} aria-hidden="true" />
        </div>
        <div className={styles.heroIndex} aria-hidden="true"><span>F</span><small>LEARN.<br />QUESTION.<br />UNDERSTAND.</small></div>
      </div>
      <div className={styles.bottomLine}><span>معرفة تستحق وقتك</span><span aria-hidden="true">↓</span><span dir="ltr">LESS NOISE. MORE UNDERSTANDING.</span></div>
    </section>

    {landing.visibility.instructor && <section id="mentor" className={styles.mentor}>
      <div className={styles.mentorImage} data-reveal>
        {course.instructor.image ? <Image src={course.instructor.image} alt={course.instructor.name} fill unoptimized sizes="(max-width: 760px) 100vw, 45vw" /> : <span className={styles.initials}>{course.instructor.initials}</span>}
        <span className={styles.photoCaption}>خلف كل فكرة واضحة، حوار جيد.</span>
      </div>
      <div className={styles.mentorCopy} data-reveal><span className={styles.eyebrow}>01 / تعلم من إنسان، واسأل إنسانًا</span><h2>ليس مجرد شرح.<br />مساحة لفهم أعمق.</h2><p>اسأل عن الفكرة التي لم تتضح. شاهد كيف تُقرأ الأسواق، وناقش خطوات التحليل مع محاضرك خلال الجلسة.</p><div className={styles.signature}><h3>{course.instructor.name}</h3><span>{course.instructor.role}</span></div><p className={styles.bio}>{course.instructor.bio}</p><a href="#chapters" className={styles.textLink}>اكتشف مسار الجلسة <span aria-hidden="true">↙</span></a></div>
    </section>}

    <section className={styles.manifesto} aria-label="فلسفة التعلم"><span className={styles.eyebrow}>الفهم أولًا. دائمًا.</span><h2>{"لا تحتاج إلى المزيد من الضوضاء. تحتاج إلى أسئلة أفضل، وفهم أوضح.".split(" ").map((word, i) => <span key={i} data-reveal style={{ transitionDelay: `${i * 65}ms` }}>{word} </span>)}</h2><p>جلسة تمنحك مساحة للتفكير، لا وعودًا بالربح.</p></section>

    {(landing.visibility.agenda || landing.visibility.about) && <section id="chapters" className={styles.chapters}>
      <div className={styles.sectionHead} data-reveal><span className={styles.eyebrow}>02 / داخل الجلسة</span><h2>فكرة تقود إلى فكرة.<br /><span>حتى تتضح الصورة.</span></h2><p>{course.duration} من الشرح والتطبيق والنقاش.<br />اختر محورًا لاستكشاف ما ستتعلمه.</p></div>
      <div className={styles.chapterLayout}>
        <div className={styles.chapterList} role="tablist" aria-label="محاور الجلسة" aria-orientation="vertical">{agenda.map((item, i) => <button key={i} id={`chapter-tab-${i}`} role="tab" aria-selected={chapter === i} aria-controls="chapter-panel" tabIndex={chapter === i ? 0 : -1} onKeyDown={event => { if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) { event.preventDefault(); const next = event.key === "Home" ? 0 : event.key === "End" ? agenda.length - 1 : (i + (event.key === "ArrowDown" ? 1 : -1) + agenda.length) % agenda.length; setChapter(next); document.getElementById(`chapter-tab-${next}`)?.focus(); } }} onClick={() => setChapter(i)}><span dir="ltr">{String(i + 1).padStart(2, "0")}</span><strong>{item.title}</strong><span aria-hidden="true">{chapter === i ? "↙" : "+"}</span></button>)}</div>
        <article id="chapter-panel" role="tabpanel" aria-labelledby={`chapter-tab-${chapter}`} tabIndex={0} className={styles.chapterPanel}>
          <div key={chapter} className={styles.chapterInner}><div className={styles.chapterNumber} aria-hidden="true">{String(chapter + 1).padStart(2, "0")}</div><span className={styles.eyebrow}>{selected?.time || course.duration}</span><h3>{selected?.title || course.title}</h3><p>{selected?.text || course.description}</p><div className={styles.chapterRule} /><span className={styles.micro}>فهم الفكرة ← تطبيق عملي ← نقاش مباشر</span></div>
        </article>
      </div>
      {landing.visibility.about && <div className={styles.takeaways}><span>ما تأخذه معك</span>{outcomes.map((item, i) => <div key={i} data-reveal><span className={styles.tinyNumber}>/{i + 1}</span><h3>{item.title}</h3><p>{item.text}</p></div>)}</div>}
    </section>}

    <section id="reserve" className={styles.reserve}>
      <div className={styles.reserveIntro} data-reveal><span className={styles.eyebrow}>03 / نلتقي في الجلسة</span><h2>مكانك هنا.<br /><span>والخطوة لك.</span></h2><p>سجّل بياناتك لتصلك تفاصيل الحضور والتذكيرات. البداية لا تحتاج أكثر من فضولك ووقتك.</p><div className={styles.reserveDate}><span>{course.dateLabel}</span><strong>{course.timeLabel}</strong></div>
      {landing.visibility.faq && <div className={styles.faq}><h3>قبل أن تنضم</h3>{faqs.map((faq, i) => <details key={i}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div>}</div>
      {landing.visibility.registration && <div className={styles.formWrap}><div className={styles.formHeading}><span dir="ltr">REGISTRATION / FIPER LIVE</span><h3>{cta}</h3><p>جميع الحقول مطلوبة</p></div>{course.registrationOpen === false ? <p>التسجيل مغلق حاليًا.</p> : <RegistrationForm courseId={course.id} />}</div>}
    </section>
    <footer className={styles.footer}><div className={styles.footerBrand} dir="ltr">Fiper<span>Live.</span></div><div className={styles.footerBottom}><p>{landing.footer.disclaimer}</p><a href="#atelier-content">العودة إلى البداية ↑</a><span dir="ltr">© {new Date().getFullYear()} Fiper Academy</span></div></footer>
  </main>;
}
