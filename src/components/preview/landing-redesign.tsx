import {
  ArrowLeft,
  BookOpenCheck,
  CalendarDays,
  Check,
  ChevronLeft,
  Clock3,
  Globe2,
  GraduationCap,
  LineChart,
  MessageCircleQuestion,
  MonitorPlay,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import Image from "next/image";
import type { PublicCourseData } from "@/lib/data/courses";
import { Countdown } from "@/components/public/countdown";
import { RegistrationForm } from "@/components/public/registration-form";

const featureIcons = [LineChart, Target, ShieldCheck, BookOpenCheck];

export function LandingRedesign({ course, outcomes, agenda, audience, faqs }: PublicCourseData) {
  const displayedRegistrations = 73 + course.registrations;
  const location = course.type === "online" ? course.platform : course.venueName || "حضوري";

  return (
    <main className="min-h-screen overflow-hidden bg-[#020d18] text-white">
      <div className="fixed inset-x-0 top-0 z-50 bg-[#d62d2d] px-4 py-2 text-center text-[10px] font-bold tracking-wide text-white">
        نسخة تصميم تجريبية — غير ظاهرة لزوار الموقع الحالي
      </div>

      <section className="relative isolate min-h-[850px] overflow-hidden border-b border-white/8 pt-9">
        <div className="absolute inset-0 -z-20 bg-[#031522]" />
        <Image src="/brand/hero-market-path.png" alt="" fill priority className="-z-10 object-cover object-center opacity-60" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(2,13,24,.99)_0%,rgba(2,13,24,.9)_40%,rgba(2,13,24,.3)_75%,rgba(2,13,24,.78)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_75%_25%,rgba(37,128,194,.2),transparent_32%)]" />

        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 lg:px-8">
          <a href="#top" aria-label="Fiper Academy" className="relative h-11 w-40 sm:w-48">
            <Image src="/brand/fiper-wordmark-drive.png" alt="Fiper Academy" fill sizes="192px" className="object-contain object-right" />
          </a>
          <div className="hidden items-center gap-8 text-xs font-semibold text-[#a9bfce] lg:flex">
            <a href="#about" className="transition hover:text-white">عن الدورة</a>
            <a href="#program" className="transition hover:text-white">المحاور</a>
            <a href="#instructor" className="transition hover:text-white">المحاضر</a>
            <a href="#faq" className="transition hover:text-white">الأسئلة الشائعة</a>
          </div>
          <a href="#register" className="group flex h-11 items-center gap-2 rounded-full bg-[#d52b2b] px-5 text-xs font-bold shadow-[0_14px_35px_rgba(213,43,43,.25)] transition hover:-translate-y-0.5 hover:bg-[#ec3434]">
            احجز مقعدك <ArrowLeft size={15} className="transition group-hover:-translate-x-1" />
          </a>
        </nav>

        <div id="top" className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-24 pt-16 lg:grid-cols-[1.06fr_.94fr] lg:px-8 lg:pb-32 lg:pt-24">
          <div className="max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#e63838]/25 bg-[#d62d2d]/10 px-4 py-2 text-[11px] font-bold text-[#ff7777] backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#ef4444]" />
              {course.eyebrow}
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.22] tracking-[-.045em] sm:text-6xl lg:text-[68px]">
              {course.heroHeading}
            </h1>
            <p className="mt-7 max-w-2xl text-sm leading-8 text-[#a4b8c8] sm:text-base sm:leading-9">{course.description}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#register" className="group flex h-14 items-center justify-center gap-3 rounded-full bg-[#d52b2b] px-8 text-sm font-bold shadow-[0_18px_55px_rgba(213,43,43,.3)] transition hover:-translate-y-1 hover:bg-[#eb3434]">
                سجل الآن مجانًا <ArrowLeft size={18} className="transition group-hover:-translate-x-1" />
              </a>
              <a href="#program" className="flex h-14 items-center justify-center gap-3 rounded-full border border-white/15 bg-white/[.045] px-8 text-sm font-bold backdrop-blur transition hover:border-white/30 hover:bg-white/[.08]">
                اكتشف برنامج الدورة <ChevronLeft size={18} />
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[11px] font-semibold text-[#8da7ba]">
              <span className="flex items-center gap-2"><Check size={15} className="text-[#4bd3a1]" /> مناسبة للمبتدئين</span>
              <span className="flex items-center gap-2"><Check size={15} className="text-[#4bd3a1]" /> حضور مباشر وتفاعلي</span>
              <span className="flex items-center gap-2"><Check size={15} className="text-[#4bd3a1]" /> التسجيل مجاني</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:mr-auto">
            <div className="absolute -inset-12 -z-10 rounded-full bg-[#126ba9]/15 blur-3xl" />
            <div className="overflow-hidden rounded-[32px] border border-white/12 bg-[#061b2c]/85 shadow-[0_40px_100px_rgba(0,0,0,.45)] backdrop-blur-xl">
              <div className="border-b border-white/8 p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-[#6f91a8]">الدورة القادمة</span>
                    <h2 className="mt-2 text-lg font-bold leading-7">{course.title}</h2>
                  </div>
                  <span className="rounded-full border border-[#41d8a4]/20 bg-[#41d8a4]/10 px-3 py-1.5 text-[9px] font-bold text-[#5ce1b2]">مباشر</span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 text-[11px]">
                  <div className="rounded-2xl bg-white/[.045] p-4"><CalendarDays size={17} className="mb-3 text-[#4da9e7]" /><span className="block text-[#7e9aae]">التاريخ</span><strong className="mt-1.5 block leading-5">{course.dateLabel}</strong></div>
                  <div className="rounded-2xl bg-white/[.045] p-4"><Clock3 size={17} className="mb-3 text-[#4da9e7]" /><span className="block text-[#7e9aae]">الوقت والمدة</span><strong className="latin mt-1.5 block text-right">{course.timeLabel} · {course.duration}</strong></div>
                  <div className="rounded-2xl bg-white/[.045] p-4"><MonitorPlay size={17} className="mb-3 text-[#4da9e7]" /><span className="block text-[#7e9aae]">مكان الحضور</span><strong className="mt-1.5 block">{location}</strong></div>
                  <div className="rounded-2xl bg-white/[.045] p-4"><Users size={17} className="mb-3 text-[#ef4d4d]" /><span className="block text-[#7e9aae]">أكدوا حضورهم</span><strong className="latin mt-1 block text-right text-xl">{displayedRegistrations}</strong></div>
                </div>
              </div>
              <div className="bg-[#041522]/85 p-5 sm:p-6">
                <p className="mb-3 text-center text-[10px] font-semibold text-[#7290a5]">متبقي على انطلاق الدورة</p>
                <Countdown target={course.isoStart} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/8 bg-[#061624]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-x-reverse divide-white/8 px-5 sm:grid-cols-4 lg:px-8">
          {[{ value: displayedRegistrations + "+", label: "مشارك مؤكد" }, { value: course.duration, label: "تدريب مباشر" }, { value: String(outcomes.length), label: "محاور عملية" }, { value: "Live", label: "أسئلة وإجابات" }].map((stat) => (
            <div key={stat.label} className="px-4 py-7 text-center"><strong className="latin block text-2xl font-black text-white">{stat.value}</strong><span className="mt-2 block text-[10px] font-semibold text-[#7894a8]">{stat.label}</span></div>
          ))}
        </div>
      </section>

      <section id="about" className="relative bg-[#f4f7f9] py-24 text-[#071827] sm:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
            <div>
              <p className="text-[11px] font-extrabold text-[#cf2929]">ماذا ستتعلم؟</p>
              <h2 className="mt-4 text-3xl font-extrabold leading-[1.35] tracking-[-.035em] sm:text-5xl">معرفة عملية تحوّل فهمك للسوق</h2>
            </div>
            <p className="max-w-2xl text-sm leading-8 text-[#5c7080]">برنامج مركز يمنحك الأدوات الأساسية لفهم حركة الأسواق، تقييم الفرص، وإدارة قراراتك بمنهج واضح بعيدًا عن العشوائية والوعود غير الواقعية.</p>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {outcomes.map((item, index) => {
              const Icon = featureIcons[index % featureIcons.length];
              return <article key={`${item.index}-${item.title}`} className="group rounded-[26px] border border-[#dfe6eb] bg-white p-6 shadow-[0_20px_55px_rgba(11,31,48,.06)] transition hover:-translate-y-1 hover:border-[#c9d7e1] hover:shadow-[0_25px_70px_rgba(11,31,48,.1)]">
                <div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf6fc] text-[#176fa8]"><Icon size={20} /></span><span className="latin text-xs font-bold text-[#b7c4cd]">{item.index}</span></div>
                <h3 className="mt-7 text-base font-extrabold">{item.title}</h3>
                <p className="mt-3 text-xs leading-7 text-[#637887]">{item.text}</p>
              </article>;
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#071b2b] py-24 sm:py-32">
        <div className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-[#166ba5]/10 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="text-[11px] font-extrabold text-[#ef4a4a]">هل هذه الدورة مناسبة لك؟</p>
            <h2 className="mt-4 text-3xl font-extrabold leading-[1.4] tracking-[-.035em] sm:text-5xl">بداية احترافية لمن يريد التداول بوضوح</h2>
            <p className="mt-6 max-w-xl text-sm leading-8 text-[#8fa8ba]">هذه الدورة مصممة لتمنحك نقطة بداية صحيحة، سواء كنت تدخل الأسواق لأول مرة أو تريد إعادة ترتيب معرفتك ضمن منهج عملي.</p>
          </div>
          <div className="grid gap-3">
            {audience.map((item, index) => <div key={item} className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[.035] p-4.5 backdrop-blur">
              <span className="latin flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#d52b2b] text-[10px] font-black">{String(index + 1).padStart(2, "0")}</span>
              <p className="text-xs font-semibold leading-6 text-[#d7e3eb]">{item}</p>
            </div>)}
          </div>
        </div>
      </section>

      <section id="program" className="bg-white py-24 text-[#071827] sm:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-extrabold text-[#cf2929]">برنامج الدورة</p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-[-.035em] sm:text-5xl">رحلة تعليمية واضحة من الفكرة إلى التطبيق</h2>
            <p className="mt-5 text-sm leading-8 text-[#647887]">محاور مرتبة بعناية حتى تبني معرفتك خطوة بخطوة وتخرج بخطة يمكنك تطبيقها.</p>
          </div>
          <div className="relative mx-auto mt-16 max-w-4xl">
            <div className="absolute bottom-8 right-[23px] top-8 hidden w-px bg-[#dce5eb] sm:block" />
            <div className="space-y-4">
              {agenda.map((item, index) => <article key={`${item.time}-${item.title}`} className="relative grid gap-4 rounded-[24px] border border-[#e2e8ed] bg-[#f9fbfc] p-6 sm:grid-cols-[48px_1fr_auto] sm:items-center sm:bg-white sm:pr-0">
                <span className="latin relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-[#08263d] text-xs font-black text-white shadow-lg">{index + 1}</span>
                <div><h3 className="text-sm font-extrabold">{item.title}</h3><p className="mt-2 text-xs leading-6 text-[#667b8a]">{item.text}</p></div>
                <span className="w-fit rounded-full bg-[#edf5fa] px-4 py-2 text-[10px] font-bold text-[#277cac]">{item.time}</span>
              </article>)}
            </div>
          </div>
        </div>
      </section>

      <section id="instructor" className="bg-[#eef3f6] py-24 text-[#071827] sm:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="overflow-hidden rounded-[34px] bg-[#071d2e] text-white shadow-[0_30px_80px_rgba(5,23,37,.18)]">
            <div className="grid lg:grid-cols-[.9fr_1.1fr]">
              <div className="relative min-h-[420px] overflow-hidden bg-[#0d2c45]">
                <div
                  role="img"
                  aria-label={course.instructor.name}
                  className="absolute inset-0 bg-cover bg-top"
                  style={{
                    backgroundImage: `url("${course.instructor.image || "/brand/instructor-ahmed-tamimi.png"}"), url("/brand/instructor-ahmed-tamimi.png")`,
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#071d2e] to-transparent lg:hidden" />
              </div>
              <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
                <p className="text-[11px] font-extrabold text-[#ef4a4a]">محاضرك في هذه الدورة</p>
                <h2 className="mt-4 text-3xl font-extrabold sm:text-5xl">{course.instructor.name}</h2>
                <p className="mt-3 text-sm font-bold text-[#57a9da]">{course.instructor.role}</p>
                <p className="mt-7 text-sm leading-8 text-[#9cb1c0]">{course.instructor.bio}</p>
                <div className="mt-9 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/8 bg-white/[.04] p-5"><GraduationCap size={20} className="text-[#58b3e9]" /><strong className="latin mt-4 block text-2xl">+10</strong><span className="mt-1 block text-[10px] text-[#7995a8]">سنوات خبرة</span></div>
                  <div className="rounded-2xl border border-white/8 bg-white/[.04] p-5"><Globe2 size={20} className="text-[#58b3e9]" /><strong className="latin mt-4 block text-2xl">LIVE</strong><span className="mt-1 block text-[10px] text-[#7995a8]">تفاعل مباشر</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-white py-24 text-[#071827] sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-[.72fr_1.28fr] lg:px-8">
          <div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf6fc] text-[#176fa8]"><MessageCircleQuestion size={22} /></span>
            <p className="mt-7 text-[11px] font-extrabold text-[#cf2929]">قبل أن تسجل</p>
            <h2 className="mt-4 text-3xl font-extrabold leading-[1.4] tracking-[-.035em] sm:text-5xl">إجابات واضحة عن أهم أسئلتك</h2>
          </div>
          <div className="divide-y divide-[#e4eaee] border-y border-[#e4eaee]">
            {faqs.map((faq, index) => <details key={faq.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center gap-4 text-sm font-extrabold"><span className="latin text-xs text-[#b3c0c8]">{String(index + 1).padStart(2, "0")}</span><span>{faq.question}</span><span className="mr-auto text-xl font-light text-[#cf2929] transition group-open:rotate-45">+</span></summary>
              <p className="pr-10 pt-4 text-xs leading-7 text-[#607584]">{faq.answer}</p>
            </details>)}
          </div>
        </div>
      </section>

      <section id="register" className="relative overflow-hidden bg-[#031421] py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(36,126,187,.16),transparent_28%),radial-gradient(circle_at_85%_60%,rgba(211,43,43,.12),transparent_24%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[.82fr_1.18fr] lg:items-center lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#ef4a4a]/20 bg-[#ef4a4a]/10 px-4 py-2 text-[10px] font-bold text-[#ff7070]"><Sparkles size={14} /> خطوتك التالية</span>
            <h2 className="mt-6 text-4xl font-extrabold leading-[1.35] tracking-[-.04em] sm:text-6xl">ابدأ رحلتك في الأسواق بخطوة صحيحة</h2>
            <p className="mt-6 max-w-xl text-sm leading-8 text-[#8fa8ba]">احجز مقعدك المجاني الآن. سنرسل إليك التأكيد، رابط الحضور، والتذكيرات المهمة عبر البريد الإلكتروني وواتساب.</p>
            <div className="mt-9 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[{ icon: CalendarDays, text: course.dateLabel }, { icon: Clock3, text: course.timeLabel }, { icon: MonitorPlay, text: location }].map(({ icon: Icon, text }) => <div key={text} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[.035] p-4 text-[10px] font-bold text-[#c8d7e1]"><Icon size={17} className="shrink-0 text-[#55aee3]" /><span>{text}</span></div>)}
            </div>
          </div>
          <div className="rounded-[30px] border border-white/10 bg-[#071f32]/90 p-6 shadow-[0_35px_100px_rgba(0,0,0,.35)] backdrop-blur sm:p-9">
            <div className="mb-7 flex items-start justify-between gap-5">
              <div><h3 className="text-xl font-extrabold">بيانات التسجيل</h3><p className="mt-2 text-[10px] text-[#7895aa]">جميع الحقول مطلوبة لإتمام الحجز</p></div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0d3a5b] text-[#54cba0]"><ShieldCheck size={21} /></span>
            </div>
            {course.registrationOpen === false ? <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5 text-center text-sm font-bold text-amber-100">التسجيل مغلق حاليًا</div> : <RegistrationForm courseId={course.id} />}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/8 bg-[#020d18] px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-right">
          <div className="relative h-9 w-32"><Image src="/brand/fiper-wordmark-drive.png" alt="Fiper Academy" fill sizes="128px" className="object-contain object-right" /></div>
          <p className="max-w-2xl text-[9px] leading-5 text-[#536f82]">محتوى تعليمي عام ولا يمثل نصيحة استثمارية. ينطوي تداول المنتجات المالية على مخاطر وقد يؤدي إلى خسارة رأس المال.</p>
          <span className="latin text-[9px] text-[#536f82]">© 2026 Fiper Academy</span>
        </div>
      </footer>
    </main>
  );
}
