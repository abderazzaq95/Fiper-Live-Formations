import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarCheck, ChatCircleDots, CheckCircle, EnvelopeSimple, NumberCircleOne, NumberCircleThree, NumberCircleTwo } from "@phosphor-icons/react/dist/ssr";

import { FiperLogo } from "@/components/brand/fiper-logo";
import { AcademyHeader } from "@/components/courses/academy-header";
import { CourseCatalog } from "@/components/courses/course-catalog";
import { FaqAccordion, type AcademyFaq } from "@/components/courses/faq-accordion";
import { MobileRegisterBar } from "@/components/courses/mobile-register-bar";
import { Reveal, TaglineReveal } from "@/components/courses/motion";
import { NextSession } from "@/components/courses/next-session";
import { SocialProof } from "@/components/courses/social-proof";
import { TrackedLink } from "@/components/courses/tracked-link";
import { courseTestimonials, academySocialLinks } from "@/lib/course-social-proof";
import { listPublicActiveCourses } from "@/lib/data/courses";

const faqs: AcademyFaq[] = [
  { question: "هل التسجيل في الدورات مجاني؟", answer: "نعم. الدورات المعروضة في هذه الصفحة مجانية، ويمكنك مراجعة صفحة كل دورة لمعرفة الموعد وطريقة الحضور قبل تأكيد تسجيلك." },
  { question: "كيف أحصل على رابط الحضور؟", answer: "بعد إكمال التسجيل تصلك رسالة تأكيد وتفاصيل الحضور عبر البريد الإلكتروني وواتساب، ثم نرسل التذكيرات المهمة قبل بداية الجلسة." },
  { question: "هل يمكن مشاهدة تسجيل للجلسة لاحقًا؟", answer: "الحضور المباشر هو الأساس. إذا قررت Fiper إتاحة تسجيل أو إعادة لجلسة محددة، فسيظهر ذلك بوضوح في صفحة الدورة ورسائل المتابعة." },
  { question: "بأي توقيت تُعرض مواعيد الدورات؟", answer: "يعرض كل موعد مع المنطقة الزمنية المرتبطة بالجلسة. يمكنك كذلك إضافة الموعد إلى تقويم Google أو تنزيل ملف تقويم لتراه وفق توقيت جهازك." },
  { question: "هل أحتاج إلى خبرة سابقة؟", answer: "تختلف المتطلبات حسب محتوى الدورة. اقرأ الوصف والبرنامج في صفحة الدورة، واختر الجلسة التي تناسب مستواك وهدفك التعليمي." },
];

function structuredData(courses: Awaited<ReturnType<typeof listPublicActiveCourses>>) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Fiper Academy",
      url: "https://fiperacademy.com",
      logo: "https://fiperacademy.com/brand/fiper-mark.png",
      contactPoint: { "@type": "ContactPoint", email: "meetings@fiperacademy.com", contactType: "customer support" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
    },
    ...courses.map((course) => ({
      "@context": "https://schema.org",
      "@type": "Event",
      name: course.title,
      description: course.description,
      startDate: course.isoStart,
      endDate: course.isoEnd,
      eventAttendanceMode: course.type === "online" ? "https://schema.org/OnlineEventAttendanceMode" : "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: course.type === "online" ? { "@type": "VirtualLocation", url: `https://fiperacademy.com/courses/${course.slug}` } : { "@type": "Place", name: course.venueName, address: course.venueAddress },
      image: [`https://fiperacademy.com${course.coverImage || "/brand/hero-reference.png"}`],
      organizer: { "@type": "Organization", name: "Fiper Academy", url: "https://fiperacademy.com" },
      performer: { "@type": "Person", name: course.instructor.name, jobTitle: course.instructor.role },
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock", url: `https://fiperacademy.com/courses/${course.slug}` },
    })),
  ];
}

export async function CoursesDirectory({ isHome = false }: { isHome?: boolean }) {
  const courses = await listPublicActiveCourses();
  const chronological = [...courses].sort((a, b) => Date.parse(a.isoStart) - Date.parse(b.isoStart));
  const featured = chronological[0];
  const instructors = Array.from(new Map(courses.map((course) => [course.instructor.name, course.instructor])).values());
  const registrationTotal = courses.reduce((total, course) => total + course.registrations, 0);
  const registerHref = featured ? `/courses/${encodeURIComponent(featured.slug)}#register` : "#courses";

  return (
    <main id="main-content" className="min-h-screen overflow-x-clip bg-[#f3f6f7] pb-20 text-[#071d2f] md:pb-0">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#071d2f]">انتقل إلى المحتوى</a>
      <AcademyHeader registerHref={registerHref} courseSlug={featured?.slug} />

      <section className="relative isolate overflow-hidden bg-[#031a2d] text-white">
        <div aria-hidden="true" className="absolute inset-0 opacity-35 fine-grid" />
        <svg aria-hidden="true" viewBox="0 0 1200 420" className="absolute inset-x-0 bottom-0 h-auto w-full opacity-20" preserveAspectRatio="none">
          <path d="M0 330 C100 315 150 345 240 275 S390 250 475 210 S630 250 710 165 S880 185 955 110 S1100 145 1200 60" fill="none" stroke="#c32828" strokeWidth="3" />
          <path d="M0 372 C140 350 220 380 330 320 S500 340 610 270 S790 300 920 225 S1080 240 1200 175" fill="none" stroke="#6aa7ca" strokeWidth="2" />
        </svg>
        <div className="relative mx-auto grid min-h-[680px] max-w-[1280px] items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#c32828]/40 bg-[#c32828]/10 px-3 py-2 text-sm font-semibold text-[#f2a2a2]"><span className="h-2 w-2 rounded-full bg-[#c32828] pulse-dot" />جلسات تعليمية مباشرة ومجانية</p>
            <h1 className="mt-6 max-w-[680px] text-balance bg-gradient-to-l from-white to-[#9b9b9b] bg-clip-text text-5xl font-bold leading-tight tracking-tight text-transparent sm:text-6xl">تعلّم الأسواق مباشرة، وابدأ بخطوات أوضح</h1>
            <p className="mt-6 max-w-[680px] text-pretty text-lg leading-8 text-[#b7c7d2]">اختر دورة مباشرة، تعرّف إلى المحاضر والبرنامج، ثم احجز مقعدك لتصلك تفاصيل الحضور والتذكيرات تلقائيًا.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <TrackedLink href={registerHref} source="hero_primary" courseSlug={featured?.slug} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#c32828] px-3 text-base font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-[#a92121] active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">سجّل في أقرب دورة <ArrowLeft size={18} /></TrackedLink>
              <a href="#courses" className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 px-3 text-base font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/10 active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">استعرض جميع الدورات</a>
            </div>
          </Reveal>

          <Reveal delay={0.12} className="lg:justify-self-end">
            <div className="max-w-xl rounded-2xl bg-[#08243a]/90 p-6 shadow-[0_32px_90px_rgba(0,0,0,.24)] ring-1 ring-white/10 backdrop-blur-md sm:p-8">
              <p className="text-sm font-semibold text-[#ef8b8b]">أكاديمية مصممة للحضور الفعلي</p>
              <p className="mt-4 text-balance text-3xl font-bold leading-tight">من اختيار الجلسة إلى رابط Meet، كل خطوة في مكان واحد.</p>
              <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-6 text-center">
                <div><strong className="latin block text-3xl font-bold">{registrationTotal.toLocaleString("ar")}</strong><span className="mt-2 block text-xs text-[#8daac1]">تسجيل مؤكد</span></div>
                <div><strong className="latin block text-3xl font-bold">{courses.length.toLocaleString("ar")}</strong><span className="mt-2 block text-xs text-[#8daac1]">جلسة متاحة</span></div>
                <div><strong className="latin block text-3xl font-bold">{instructors.length.toLocaleString("ar")}</strong><span className="mt-2 block text-xs text-[#8daac1]">محاضر</span></div>
              </div>
              <p className="mt-5 text-pretty text-xs leading-6 text-[#7f99aa]">هذه الأرقام محسوبة من الدورات والتسجيلات النشطة حاليًا، من دون أرقام تسويقية مضافة.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {featured ? <section aria-labelledby="next-session-title" className="bg-[#eaf0f3]"><div className="mx-auto max-w-[1280px] px-5 py-20 sm:px-8"><Reveal><div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-[#c32828]">موعدك الأقرب للتعلّم</p><h2 id="next-session-title" className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-4xl">الجلسة المباشرة القادمة</h2></div><p className="max-w-lg text-pretty text-sm leading-7 text-[#5f7382]">ابدأ بالدورة الأقرب، أو تابع إلى الكتالوج لتقارن كل المواعيد المتاحة.</p></div><NextSession course={featured} /></Reveal></div></section> : null}

      <section id="courses" aria-labelledby="courses-title" className="scroll-mt-20 bg-[#f8f9f9]">
        <div className="mx-auto max-w-[1280px] px-5 py-20 sm:px-8 sm:py-24">
          <Reveal><p className="text-sm font-semibold text-[#c32828]">مسارك يبدأ من هنا</p><div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><h2 id="courses-title" className="max-w-[680px] text-balance text-4xl font-bold tracking-tight sm:text-5xl">اختر الدورة التي تناسب وقتك وهدفك</h2><p className="max-w-xl text-pretty text-base leading-8 text-[#5f7382]">ابحث باسم الدورة أو المحاضر، وقارن المواعيد وطريقة الحضور قبل فتح صفحة التسجيل.</p></div></Reveal>
          <Reveal delay={0.08} className="mt-10"><CourseCatalog courses={chronological} /></Reveal>
        </div>
      </section>

      <section className="bg-[#071d2f] text-white">
        <div className="mx-auto max-w-[1280px] px-5 py-24 sm:px-8 sm:py-28">
          <TaglineReveal text="لا تكتفِ بمشاهدة المحتوى. اسأل مباشرة، افهم السياق، وحوّل المعرفة إلى خطوات يمكنك تطبيقها." />
        </div>
      </section>

      <section id="why-fiper" aria-labelledby="why-title" className="scroll-mt-20 bg-[#efece7]">
        <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <Reveal><p className="text-sm font-semibold text-[#c32828]">لماذا التعلّم المباشر؟</p><h2 id="why-title" className="mt-3 max-w-[680px] text-balance text-4xl font-bold tracking-tight sm:text-5xl">المعلومة تصبح أوضح عندما تناقشها في وقتها</h2><p className="mt-5 max-w-xl text-pretty text-base leading-8 text-[#5f7382]">صُممت رحلة Fiper لتبقيك قريبًا من المحاضر والموعد والخطوة التالية، بدل أن تضيع بين روابط ورسائل متفرقة.</p></Reveal>
          <Reveal delay={0.08}><div className="divide-y divide-[#cfd7dc] border-y border-[#cfd7dc]">{[
            { icon: ChatCircleDots, title: "أسئلة وأجوبة مباشرة", text: "اطرح سؤالك أثناء الجلسة واربط الفكرة بما يحدث أمامك." },
            { icon: CheckCircle, title: "تأكيد فوري وواضح", text: "تعرف أن مقعدك محفوظ، وتحصل على تفاصيل الدورة بعد التسجيل." },
            { icon: EnvelopeSimple, title: "تذكيرات عبر البريد وواتساب", text: "تصل إليك الرسائل المهمة قبل الموعد باستخدام بيانات التسجيل." },
            { icon: CalendarCheck, title: "موعد محفوظ في تقويمك", text: "أضف الجلسة إلى تقويم Google أو نزّل ملف الموعد بنقرة واحدة." },
          ].map(({ icon: Icon, title, text }) => <div key={title} className="grid gap-4 py-6 sm:grid-cols-[48px_1fr] sm:items-start"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#031a2d] text-white"><Icon size={24} weight="duotone" /></span><div><h3 className="text-xl font-bold">{title}</h3><p className="mt-2 text-pretty text-sm leading-7 text-[#5f7382]">{text}</p></div></div>)}</div></Reveal>
        </div>
      </section>

      <section aria-labelledby="steps-title" className="bg-white">
        <div className="mx-auto max-w-[1280px] px-5 py-20 sm:px-8 sm:py-24">
          <Reveal><p className="text-sm font-semibold text-[#c32828]">ثلاث خطوات فقط</p><h2 id="steps-title" className="mt-3 max-w-[680px] text-balance text-4xl font-bold tracking-tight sm:text-5xl">من اختيار الدورة إلى الحضور المباشر</h2></Reveal>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">{[
            { icon: NumberCircleOne, title: "اختر وسجّل", text: "افتح صفحة الدورة المناسبة وأدخل بياناتك مرة واحدة." },
            { icon: NumberCircleTwo, title: "استلم التأكيد والرابط", text: "نرسل تفاصيل التسجيل ورابط الحضور والتذكيرات المهمة." },
            { icon: NumberCircleThree, title: "انضم في الموعد", text: "افتح الرابط، احضر الجلسة مباشرة، وشارك بأسئلتك." },
          ].map(({ icon: Icon, title, text }, index) => <Reveal key={title} delay={index * 0.08}><div className="border-t-2 border-[#071d2f] pt-6"><Icon size={38} weight="duotone" className="text-[#c32828]" /><h3 className="mt-5 text-2xl font-bold">{title}</h3><p className="mt-3 text-pretty text-sm leading-7 text-[#5f7382]">{text}</p></div></Reveal>)}</div>
        </div>
      </section>

      {instructors.length ? <section id="instructors" aria-labelledby="instructors-title" className="scroll-mt-20 bg-[#031a2d] text-white"><div className="mx-auto max-w-[1280px] px-5 py-20 sm:px-8 sm:py-24"><Reveal><p className="text-sm font-semibold text-[#ef8b8b]">تعرّف إلى المحاضرين</p><h2 id="instructors-title" className="mt-3 max-w-[680px] text-balance text-4xl font-bold tracking-tight sm:text-5xl">خبرة تشرح لك الفكرة في سياقها العملي</h2></Reveal><div className="mt-12 grid gap-6 md:grid-cols-2">{instructors.map((instructor, index) => <Reveal key={instructor.name} delay={index * 0.08}><article className="grid overflow-hidden rounded-2xl bg-[#08243a] ring-1 ring-white/10 sm:grid-cols-[180px_1fr]">{instructor.image ? <div className="relative min-h-56 bg-[#d7e0e5]"><Image src={instructor.image} alt={`المحاضر ${instructor.name}`} fill sizes="(max-width: 639px) 100vw, 180px" className="object-cover object-top" /></div> : <div className="flex min-h-48 items-center justify-center bg-[#102f47] text-3xl font-bold">{instructor.initials}</div>}<div className="p-6"><p className="text-xs font-semibold text-[#ef8b8b]">المحاضر</p><h3 className="mt-2 text-2xl font-bold">{instructor.name}</h3><p className="mt-2 text-sm font-semibold text-[#a9bdcb]">{instructor.role}</p><p className="mt-4 line-clamp-4 text-pretty text-sm leading-7 text-[#91a8b8]">{instructor.bio}</p><a href="#courses" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white underline decoration-[#c32828] decoration-2 underline-offset-8">عرض جلساته <ArrowLeft size={16} /></a></div></article></Reveal>)}</div></div></section> : null}

      <SocialProof testimonials={courseTestimonials} />

      <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 bg-[#f8f9f9]"><div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[.72fr_1.28fr]"><Reveal><p className="text-sm font-semibold text-[#c32828]">قبل أن تسجّل</p><h2 id="faq-title" className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">إجابات واضحة عن رحلة الحضور</h2><p className="mt-5 text-pretty text-base leading-8 text-[#5f7382]">إذا بقي لديك سؤال عن دورة محددة، ستجد تفاصيل إضافية في صفحتها.</p></Reveal><Reveal delay={0.08}><FaqAccordion items={faqs} /></Reveal></div></section>

      {featured ? <section className="bg-[#c32828] text-white"><div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-5 py-16 sm:px-8 lg:flex-row lg:items-center lg:justify-between"><Reveal><h2 className="max-w-[680px] text-balance text-4xl font-bold tracking-tight sm:text-5xl">موعد واحد قد يكون بداية فهم أوضح للسوق</h2><p className="mt-4 max-w-2xl text-pretty text-base leading-8 text-white/80">احجز مقعدك في الجلسة القادمة، واستلم رابط الحضور والتذكيرات دون أي رسوم.</p></Reveal><TrackedLink href={`${registerHref}`} source="final_cta" courseSlug={featured.slug} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-3 text-base font-semibold text-[#8f1f1f] shadow-[0_16px_45px_rgba(90,10,10,.2)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#031a2d]">سجّل مجانًا <ArrowLeft size={18} /></TrackedLink></div></section> : null}

      <footer className="bg-[#021525] text-white">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.35fr_.7fr_.7fr]">
          <div className="max-w-md"><FiperLogo variant="drive" href="/" /><p className="mt-5 text-pretty text-sm leading-7 text-[#9eb1bf]">أكاديمية Fiper للدورات المباشرة في الأسواق المالية، من التسجيل إلى التذكير والحضور في رحلة واحدة واضحة.</p><a href="mailto:meetings@fiperacademy.com" className="latin mt-5 inline-block text-sm font-semibold text-white underline decoration-[#c32828] decoration-2 underline-offset-8">meetings@fiperacademy.com</a>{academySocialLinks.length ? <div className="mt-5 flex flex-wrap gap-3">{academySocialLinks.map((item) => <a key={item.href} href={item.href} rel="noreferrer" target="_blank">{item.label}</a>)}</div> : null}</div>
          <nav aria-label="روابط الأكاديمية"><p className="text-sm font-bold">استكشف</p><div className="mt-5 flex flex-col items-start gap-4 text-sm text-[#9eb1bf]"><Link href="/" aria-current={isHome ? "page" : undefined}>الرئيسية</Link><Link href="/courses" aria-current={isHome ? undefined : "page"}>الدورات</Link><a href="#why-fiper">لماذا Fiper</a><a href="#faq">الأسئلة الشائعة</a></div></nav>
          <div><p className="text-sm font-bold">معلومات مهمة</p><div className="mt-5 flex flex-col items-start gap-4 text-sm text-[#9eb1bf]"><Link href="/privacy">سياسة الخصوصية</Link><Link href="/terms">الشروط والأحكام</Link></div></div>
        </div>
        <div className="border-y border-white/10"><div className="mx-auto max-w-[1280px] px-5 py-6 sm:px-8"><p className="text-pretty text-xs leading-6 text-[#8299a9]">ينطوي التداول في الأسواق المالية على مخاطر وقد لا يناسب جميع الأشخاص. المحتوى المقدم تعليمي فقط ولا يمثل نصيحة استثمارية أو توصية بالشراء أو البيع.</p></div></div>
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-5 py-6 text-xs text-[#6f8798] sm:flex-row sm:items-center sm:justify-between sm:px-8"><p>© 2026 Fiper Academy. جميع الحقوق محفوظة.</p><p>تعلّم بوضوح، وقرّر بمسؤولية.</p></div>
      </footer>

      {featured ? <MobileRegisterBar href={registerHref} slug={featured.slug} title={featured.title} /> : null}
      {structuredData(courses).map((data, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />)}
    </main>
  );
}
