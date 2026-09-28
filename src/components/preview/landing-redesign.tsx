import { ArrowLeft, CalendarDays, Clock3, Quote, ShieldCheck } from "lucide-react";
import Image from "next/image";
import type { PublicCourseData } from "@/lib/data/courses";
import { RegistrationForm } from "@/components/public/registration-form";
import { CourseInterfacePreview } from "@/components/preview/course-interface-preview";

export function LandingRedesign({ course, outcomes, agenda, audience, faqs }: PublicCourseData) {
  const displayedRegistrations = 73 + course.registrations;
  const location = course.type === "online" ? course.platform : course.venueName || "حضوري";

  return (
    <main className="min-h-screen overflow-hidden bg-[#0d0f12] text-[#f4f2ee]">
      <div className="fixed inset-x-0 top-0 z-50 bg-[#cf3030] px-4 py-2 text-center text-[10px] font-extrabold text-white">
        نسخة تصميم تجريبية — غير ظاهرة لزوار الموقع الحالي
      </div>

      <header className="relative border-b border-white/8 pt-9">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between px-5 py-6 lg:px-10">
          <a href="#top" className="relative h-10 w-36 sm:w-44" aria-label="Fiper Academy">
            <Image src="/brand/fiper-wordmark-drive.png" alt="Fiper Academy" fill sizes="176px" className="object-contain object-right" priority />
          </a>
          <nav className="hidden items-center gap-8 text-[11px] font-bold text-white/50 lg:flex">
            <a href="#method" className="transition hover:text-white">المنهج</a>
            <a href="#journey" className="transition hover:text-white">تجربة التعلم</a>
            <a href="#instructor" className="transition hover:text-white">المحاضر</a>
            <a href="#faq" className="transition hover:text-white">الأسئلة</a>
          </nav>
          <a href="#register" className="flex items-center gap-2 border-b border-[#d83a3a] pb-1 text-[11px] font-extrabold text-white transition hover:text-[#ef6969]">
            سجل الآن <ArrowLeft size={14} />
          </a>
        </div>
      </header>

      <section id="top" className="relative isolate border-b border-white/8">
        <div className="absolute inset-0 -z-20 bg-[#0d0f12]" />
        <div className="absolute -left-40 top-0 -z-10 h-[620px] w-[620px] rounded-full bg-[#8c2525]/8 blur-[130px]" />
        <div className="mx-auto grid min-h-[780px] max-w-[1320px] items-center gap-14 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-10" dir="ltr">
          <div dir="rtl" className="max-w-2xl lg:pl-12">
            <div className="mb-7 flex items-center gap-3"><span className="h-px w-10 bg-[#d83a3a]" /><span className="text-[10px] font-extrabold tracking-wide text-[#e45858]">{course.eyebrow}</span></div>
            <h1 className="text-balance text-5xl font-extrabold leading-[1.14] tracking-[-.055em] text-[#f6f3ed] sm:text-7xl lg:text-[78px]">{course.heroHeading}</h1>
            <p className="mt-8 max-w-xl text-pretty text-sm font-medium leading-8 text-[#999b9f] sm:text-base sm:leading-9">{course.description}</p>
            <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <a href="#register" className="group flex h-14 items-center gap-4 bg-[#cf3030] px-8 text-sm font-extrabold text-white transition hover:bg-[#df3838]">سجل الآن مجانًا <ArrowLeft size={17} className="transition group-hover:-translate-x-1" /></a>
              <a href="#method" className="border-b border-white/25 pb-1 text-[11px] font-bold text-white/65 transition hover:border-white hover:text-white">اكتشف ما ستتعلمه</a>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/8 pt-6 text-[10px] font-medium text-white/45"><span>مناسبة للمبتدئين</span><span>تطبيق مباشر</span><span>أسئلة مع المحاضر</span></div>
          </div>

          <div dir="rtl" className="relative lg:pr-6">
            <span className="latin absolute -left-6 -top-10 hidden text-[86px] font-extrabold leading-none text-white/[.025] lg:block">LIVE</span>
            <CourseInterfacePreview title={course.title} date={course.dateLabel} time={course.timeLabel} duration={course.duration} location={location} registrations={displayedRegistrations} startsAt={course.isoStart} agenda={agenda} />
          </div>
        </div>
      </section>

      <section className="border-b border-white/8 bg-[#111419]">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-8 px-5 py-8 lg:px-10">
          <p className="max-w-sm text-pretty text-[11px] font-medium leading-6 text-white/45">جلسة تعليمية مباشرة تضع الوضوح والانضباط قبل الوعود السريعة.</p>
          <div className="flex flex-wrap gap-10 sm:gap-16">
            {[{ value: `${displayedRegistrations}+`, label: "مشارك مؤكد" }, { value: course.duration, label: "تدريب مباشر" }, { value: String(outcomes.length), label: "محاور عملية" }].map((stat) => <div key={stat.label}><strong className="latin text-xl font-extrabold text-white">{stat.value}</strong><span className="mr-2 text-[9px] font-medium text-white/35">{stat.label}</span></div>)}
          </div>
        </div>
      </section>

      <section id="method" className="bg-[#f1f0ec] py-24 text-[#17191c] sm:py-36">
        <div className="mx-auto max-w-[1240px] px-5 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[.62fr_1.38fr] lg:gap-20">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className="text-[10px] font-extrabold text-[#c92f2f]">المنهج قبل المعلومات</p>
              <h2 className="mt-5 text-balance text-4xl font-extrabold leading-[1.24] tracking-[-.045em] sm:text-6xl">لا نضيف ضوضاء جديدة. نمنحك طريقة تفكير.</h2>
              <p className="mt-7 max-w-md text-pretty text-sm font-medium leading-8 text-[#676a6e]">كل محطة في الدورة تنقلك من الفهم إلى القرار، ثم من القرار إلى خطة قابلة للتنفيذ.</p>
            </div>
            <div className="border-t border-[#cfd0cd]">
              {outcomes.map((item, index) => <article key={`${item.index}-${item.title}`} className="grid gap-5 border-b border-[#cfd0cd] py-9 sm:grid-cols-[80px_1fr] sm:py-12">
                <span className="latin text-sm font-extrabold text-[#c92f2f]">{String(index + 1).padStart(2, "0")}</span>
                <div><h3 className="text-balance text-2xl font-extrabold tracking-[-.025em] sm:text-3xl">{item.title}</h3><p className="mt-4 max-w-xl text-pretty text-sm font-medium leading-8 text-[#696c70]">{item.text}</p></div>
              </article>)}
            </div>
          </div>
        </div>
      </section>

      <section id="journey" className="relative overflow-hidden bg-[#121519] py-24 sm:py-36">
        <div className="mx-auto max-w-[1240px] px-5 lg:px-10">
          <div className="grid items-start gap-16 lg:grid-cols-[1.15fr_.85fr]" dir="ltr">
            <div dir="rtl" className="relative min-h-[580px] overflow-hidden border border-white/8">
              <Image src="/brand/hero-market-path.png" alt="مسار تعليمي لفهم الأسواق" fill sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover opacity-75" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121519] via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10"><span className="latin text-7xl font-extrabold tracking-[-.07em] text-white sm:text-9xl">90</span><p className="mt-2 max-w-sm text-pretty text-sm font-medium leading-7 text-white/65">دقيقة مركزة من الفهم، التطبيق، والأسئلة المباشرة.</p></div>
            </div>
            <div dir="rtl" className="lg:pt-10">
              <p className="text-[10px] font-extrabold text-[#e04a4a]">تجربة تعلم إنسانية</p>
              <h2 className="mt-5 text-balance text-4xl font-extrabold leading-[1.25] tracking-[-.045em] sm:text-6xl">المحاضر معك، لا أمامك فقط.</h2>
              <p className="mt-7 text-pretty text-sm font-medium leading-8 text-white/50">ليست مشاهدة سلبية لمحتوى مسجل. تتقدم مع المحاضر، ترى التطبيق، وتسأل عندما تصبح الفكرة غير واضحة.</p>
              <div className="mt-12 border-t border-white/10">
                {audience.map((item, index) => <div key={item} className="flex gap-5 border-b border-white/10 py-5"><span className="latin shrink-0 text-[10px] font-extrabold text-[#df4545]">0{index + 1}</span><p className="text-pretty text-xs font-medium leading-6 text-white/70">{item}</p></div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f1f0ec] py-24 text-[#17191c] sm:py-36">
        <div className="mx-auto max-w-[1120px] px-5 lg:px-10">
          <div className="flex flex-col justify-between gap-8 border-b border-[#cfd0cd] pb-10 sm:flex-row sm:items-end">
            <div><p className="text-[10px] font-extrabold text-[#c92f2f]">مسار الجلسة</p><h2 className="mt-5 max-w-2xl text-balance text-4xl font-extrabold leading-[1.22] tracking-[-.045em] sm:text-6xl">من السؤال الصحيح إلى قرار أكثر انضباطًا.</h2></div>
            <span className="shrink-0 text-[11px] font-bold text-[#6d7073]">{course.duration} · بث مباشر</span>
          </div>
          <ol>
            {agenda.map((item, index) => <li key={`${item.title}-${index}`} className="group grid gap-4 border-b border-[#cfd0cd] py-8 sm:grid-cols-[64px_1fr_120px] sm:items-start">
              <span className="latin text-xs font-extrabold text-[#c92f2f]">{String(index + 1).padStart(2, "0")}</span>
              <div><h3 className="text-balance text-xl font-extrabold sm:text-2xl">{item.title}</h3><p className="mt-3 max-w-2xl text-pretty text-xs font-medium leading-7 text-[#6a6d70]">{item.text}</p></div>
              <span className="text-[10px] font-bold text-[#777a7d] sm:text-left">{item.time}</span>
            </li>)}
          </ol>
        </div>
      </section>

      <section id="instructor" className="bg-[#0d0f12] py-24 sm:py-36">
        <div className="mx-auto grid max-w-[1240px] items-center gap-14 px-5 lg:grid-cols-[.9fr_1.1fr] lg:px-10" dir="ltr">
          <div dir="rtl" className="relative min-h-[600px] overflow-hidden border border-white/8">
            <div role="img" aria-label={course.instructor.name} className="absolute inset-0 bg-cover bg-top" style={{ backgroundImage: `url("${course.instructor.image || "/brand/instructor-ahmed-tamimi.png"}"), url("/brand/instructor-ahmed-tamimi.png")` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f12] via-transparent to-transparent" />
          </div>
          <div dir="rtl" className="lg:pl-8">
            <Quote size={30} className="text-[#d83a3a]" />
            <blockquote className="mt-8 text-balance text-3xl font-medium leading-[1.55] tracking-[-.03em] text-white sm:text-5xl">“هدفنا ليس أن تحفظ السوق، بل أن تعرف كيف تتعامل معه عندما يتغير.”</blockquote>
            <div className="mt-10 border-r-2 border-[#d83a3a] pr-5"><h2 className="text-balance text-2xl font-extrabold">{course.instructor.name}</h2><p className="mt-2 text-pretty text-xs font-bold text-white/45">{course.instructor.role}</p></div>
            <p className="mt-8 max-w-xl text-pretty text-sm font-medium leading-8 text-white/50">{course.instructor.bio}</p>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-[#f1f0ec] py-24 text-[#17191c] sm:py-36">
        <div className="mx-auto grid max-w-[1120px] gap-14 px-5 lg:grid-cols-[.7fr_1.3fr] lg:px-10">
          <div><p className="text-[10px] font-extrabold text-[#c92f2f]">قبل التسجيل</p><h2 className="mt-5 text-balance text-4xl font-extrabold leading-[1.22] tracking-[-.045em] sm:text-6xl">ما تحتاج إلى معرفته.</h2></div>
          <div className="border-t border-[#cfd0cd]">
            {faqs.map((faq, index) => <details key={faq.question} className="group border-b border-[#cfd0cd] py-6">
              <summary className="flex cursor-pointer list-none items-start gap-5 text-sm font-extrabold leading-7"><span className="latin mt-1 text-[9px] text-[#b0b1ae]">{String(index + 1).padStart(2, "0")}</span><span className="text-balance">{faq.question}</span><span className="mr-auto text-xl font-medium text-[#c92f2f] transition group-open:rotate-45">+</span></summary>
              <p className="max-w-2xl pr-10 pt-5 text-pretty text-xs font-medium leading-7 text-[#686b6e]">{faq.answer}</p>
            </details>)}
          </div>
        </div>
      </section>

      <section id="register" className="relative bg-[#121519] py-24 sm:py-36">
        <div className="mx-auto grid max-w-[1240px] gap-16 px-5 lg:grid-cols-[.8fr_1.2fr] lg:items-start lg:px-10" dir="ltr">
          <div dir="rtl" className="lg:sticky lg:top-24">
            <div className="mb-7 flex items-center gap-3"><span className="h-px w-10 bg-[#d83a3a]" /><span className="text-[10px] font-extrabold text-[#e45858]">خطوتك التالية</span></div>
            <h2 className="text-balance text-4xl font-extrabold leading-[1.2] tracking-[-.05em] sm:text-6xl">احجز مكانك. وابدأ بفهم السوق.</h2>
            <p className="mt-7 max-w-lg text-pretty text-sm font-medium leading-8 text-white/50">أدخل بياناتك مرة واحدة وسنرسل إليك تأكيد التسجيل، رابط الحضور، والتذكيرات المهمة.</p>
            <div className="mt-10 border-t border-white/10">
              <div className="flex items-center gap-4 border-b border-white/10 py-5"><CalendarDays size={17} className="text-[#d83a3a]" /><span className="text-xs font-bold text-white/75">{course.dateLabel}</span></div>
              <div className="flex items-center gap-4 border-b border-white/10 py-5"><Clock3 size={17} className="text-[#d83a3a]" /><span className="text-xs font-bold text-white/75">{course.timeLabel} · {course.duration}</span></div>
            </div>
          </div>
          <div dir="rtl" className="border-t-2 border-[#d83a3a] bg-[#171b20] px-5 py-8 sm:px-10 sm:py-10">
            <div className="mb-9 flex items-start justify-between gap-5"><div><h3 className="text-balance text-xl font-extrabold">بيانات التسجيل</h3><p className="mt-2 text-pretty text-[10px] font-medium text-white/35">جميع الحقول مطلوبة لإتمام الحجز</p></div><ShieldCheck size={22} className="text-[#d83a3a]" /></div>
            {course.registrationOpen === false ? <p className="border border-white/10 p-6 text-center text-sm font-bold text-white/60">التسجيل مغلق حاليًا</p> : <RegistrationForm courseId={course.id} />}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/8 bg-[#0d0f12] px-5 py-8">
        <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-right">
          <div className="relative h-8 w-28"><Image src="/brand/fiper-wordmark-drive.png" alt="Fiper Academy" fill sizes="112px" className="object-contain object-right" /></div>
          <p className="max-w-2xl text-pretty text-[9px] font-medium leading-5 text-white/30">محتوى تعليمي عام ولا يمثل نصيحة استثمارية. ينطوي تداول المنتجات المالية على مخاطر وقد يؤدي إلى خسارة رأس المال.</p>
          <span className="latin text-[9px] font-medium text-white/30">© 2026 Fiper Academy</span>
        </div>
      </footer>
    </main>
  );
}
