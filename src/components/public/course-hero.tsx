import Image from "next/image";
import { ArrowLeft, CalendarDays, Clock3, Menu, Sparkles, Users, Video } from "lucide-react";
import { FiperLogo } from "@/components/brand/fiper-logo";
import { Countdown } from "@/components/public/countdown";
import { featuredCourse, type Course } from "@/lib/demo-data";

function getFacts(course: Course) {
  return [
    { icon: CalendarDays, label: "الموعد", value: course.dateLabel },
    { icon: Clock3, label: "التوقيت", value: course.timeLabel },
    { icon: Video, label: "نوع الدورة", value: "مباشرة عبر " + course.platform },
    { icon: Users, label: "المقاعد المتاحة", value: String(course.capacity - course.registrations) + " مقعداً فقط" },
  ];
}

export function CourseHero({ course = featuredCourse }: { course?: Course }) {
  const percentage = Math.round((course.registrations / course.capacity) * 100);
  const heroLines = course.heroHeading.split(/\r?\n/).filter(Boolean);
  const now = new Date().getTime();
  const startsAt = new Date(course.isoStart).getTime();
  const endsAt = new Date(course.isoEnd).getTime();
  const scheduleState = now < startsAt ? "upcoming" : now <= endsAt ? "live" : "ended";

  return (
    <section className="noise-grid relative min-h-screen overflow-hidden bg-[#031a2d]">
      <div className="pointer-events-none absolute -right-40 top-10 h-96 w-96 rounded-full bg-[#0b5a91]/15 blur-[100px]" />
      <header className="sticky top-0 z-30 border-b border-white/8 bg-[#031a2d]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <FiperLogo />
          <nav className="hidden items-center gap-8 text-xs font-semibold text-[#9bb3c5] md:flex" aria-label="التنقل الرئيسي">
            <a href="#about" className="transition hover:text-white">عن الدورة</a>
            <a href="#agenda" className="transition hover:text-white">المحاور</a>
            <a href="#instructor" className="transition hover:text-white">المحاضر</a>
            <a href="#faq" className="transition hover:text-white">الأسئلة</a>
          </nav>
          <a href="#register" className="hidden h-11 items-center gap-2 rounded-xl bg-[#C32828] px-5 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#A92121] sm:flex">
            احجز مقعدك <ArrowLeft size={15} />
          </a>
          <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 sm:hidden" aria-label="فتح القائمة">
            <Menu size={20} />
          </button>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid max-w-[1240px] gap-12 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.04fr_.96fr] lg:items-center lg:gap-14 lg:pb-24 lg:pt-20">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#D96B6B]/25 bg-[#C32828]/10 px-4 py-2 text-[11px] font-bold text-[#E6A2A2]">
            <span className="pulse-dot h-2 w-2 rounded-full bg-[#C32828]" />
            {course.eyebrow}
            <Sparkles size={13} />
          </div>
          <h1 className="max-w-2xl bg-gradient-to-b from-white via-white to-[#b9d4e7] bg-clip-text text-[40px] font-extrabold leading-[1.32] tracking-[-0.055em] text-transparent sm:text-[54px] lg:text-[62px]">
            {heroLines.map((line, index) => <span key={`${line}-${index}`} className={index === 0 ? "" : "relative mt-1 block text-[#dceeff]"}>{line}{index < heroLines.length - 1 ? "." : ""}{index === heroLines.length - 1 && <span className="absolute -bottom-2 right-0 h-1.5 w-24 rounded-full bg-[#C32828]" />}</span>)}
          </h1>
          <h2 className="mt-9 max-w-xl text-lg font-bold leading-8 text-white sm:text-xl">{course.title}</h2>
          <p className="mt-4 max-w-xl text-sm leading-8 text-[#91adc2] sm:text-base">{course.description}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#register" className="red-glow group flex h-14 items-center justify-center gap-3 rounded-2xl bg-[#C32828] px-7 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#A92121]">
              سجل الآن مجاناً <ArrowLeft size={18} className="transition group-hover:-translate-x-1" />
            </a>
            <a href="#agenda" className="flex h-14 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] px-7 text-sm font-bold text-white transition hover:bg-white/[0.08]">
              استكشف محاور الدورة
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] text-[#7f9cb2]">
            <span className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1f8d67]/15 text-[#62d5aa]">✓</span> لا تحتاج خبرة سابقة</span>
            <span className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1f8d67]/15 text-[#62d5aa]">✓</span> حضور مباشر وتفاعلي</span>
          </div>
        </div>

        <div className="relative">
          <div className="glass relative overflow-hidden rounded-[30px] p-2.5 shadow-[0_30px_90px_rgba(0,10,20,.42)]">
            <div className="relative aspect-[1.22/1] overflow-hidden rounded-[23px] bg-[#d9eaf6]">
              <Image src={course.coverImage || "/brand/hero-reference.png"} alt="منصة Fiper لتحليل الأسواق على الحاسوب والهاتف" fill priority sizes="(max-width: 1024px) 100vw, 46vw" className="object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#021525] via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-2 sm:p-4">
                <div className="rounded-2xl border border-white/10 bg-[#031a2d]/85 p-2.5 sm:p-3 backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold text-[#7594ab]">{scheduleState === "upcoming" ? "الانطلاقة بعد" : scheduleState === "live" ? "الحالة الآن" : "حالة الدورة"}</p>
                      <p className="mt-1 text-xs font-bold text-white sm:text-sm">{course.dateLabel}</p>
                    </div>
                    <span className={`rounded-xl border px-2 py-1.5 text-[10px] sm:px-3 sm:py-2 font-bold ${scheduleState === "live" ? "border-[#23c99a]/25 bg-[#23c99a]/10 text-[#8af0cb]" : scheduleState === "ended" ? "border-white/15 bg-white/10 text-[#a9bdca]" : "border-[#C32828]/25 bg-[#C32828]/10 text-[#E6A2A2]"}`}>{scheduleState === "live" ? "مباشر" : scheduleState === "ended" ? "انتهت" : "قادمة"}</span>
                  </div>
                  <div className="mt-2 sm:mt-3">{scheduleState === "upcoming" ? <Countdown target={course.isoStart} /> : <div className="flex h-[66px] items-center justify-center rounded-2xl border border-white/10 bg-[#031a2d]/75 px-3 text-center text-sm font-bold text-white">{scheduleState === "live" ? "الدورة جارية الآن" : "انتهت هذه الدورة"}</div>}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="float-slow absolute -left-3 top-8 hidden w-44 rounded-2xl border border-white/12 bg-[#082740]/90 p-4 backdrop-blur-xl sm:block">
            <div className="flex items-center justify-between text-[10px] text-[#8ba7ba]"><span>الحجوزات</span><span className="latin">{percentage}%</span></div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#C32828]" style={{ width: `${percentage}%` }} /></div>
            <p className="mt-3 text-xs font-bold text-white"><span className="latin">{course.registrations}</span> شخصاً أكد حضوره</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1240px] gap-3 px-5 pb-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        {getFacts(course).map(({ icon: Icon, label, value }) => (
          <div key={label} className="group flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0d3554] text-[#C32828]"><Icon size={19} /></span>
            <span><span className="block text-[10px] text-[#6f8da4]">{label}</span><span className="mt-1 block text-[11px] font-bold text-white">{value}</span></span>
          </div>
        ))}
      </div>
    </section>
  );
}
