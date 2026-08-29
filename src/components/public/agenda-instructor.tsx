import Image from "next/image";
import { Award, CheckCircle2, MessageCircleQuestion, Quote, TimerReset } from "lucide-react";
import { agenda, featuredCourse } from "@/lib/demo-data";
import { SectionHeading } from "./section-heading";

export function AgendaInstructor() {
  return (
    <>
      <section id="agenda" className="bg-[#f4f8fb] py-24 text-[#071d2f] sm:py-30">
        <div className="mx-auto grid max-w-[1240px] gap-14 px-5 sm:px-8 lg:grid-cols-[.75fr_1.25fr]">
          <div>
            <div className="lg:sticky lg:top-12">
              <SectionHeading light eyebrow="برنامج الدورة" title="تسعون دقيقة، من الفكرة إلى الخطة" description="إيقاع مركز يحافظ على الجانب العملي ويترك مساحة كافية للأسئلة المباشرة." />
              <div className="mt-8 hidden rounded-[24px] bg-[#071f34] p-6 text-white lg:block">
                <TimerReset className="text-[#C32828]" size={24} />
                <p className="mt-6 text-xs text-[#8ca8bc]">المدة الإجمالية</p>
                <p className="mt-2 text-2xl font-bold">{featuredCourse.duration}</p>
                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-full bg-gradient-to-l from-[#C32828] to-[#D96B6B]" /></div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {agenda.map((item, index) => (
              <article key={item.title} className="group grid gap-4 rounded-[22px] border border-[#dce7ef] bg-white p-5 transition hover:border-[#b9cfde] hover:shadow-[0_16px_45px_rgba(12,43,65,.06)] sm:grid-cols-[95px_1fr] sm:items-center sm:p-6">
                <div className="flex items-center gap-3 sm:block">
                  <span className="latin text-[10px] font-bold text-[#C32828]">0{index + 1}</span>
                  <span className="mr-auto rounded-full bg-[#edf4f8] px-3 py-1.5 text-[10px] font-semibold text-[#567084] sm:mt-3 sm:inline-block">{item.time}</span>
                </div>
                <div className="border-[#e3ebf1] sm:border-r sm:pr-6">
                  <h3 className="text-sm font-bold sm:text-base">{item.title}</h3>
                  <p className="mt-2 text-xs leading-7 text-[#657c8e]">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="instructor" className="noise-grid relative overflow-hidden bg-[#031a2d] py-24 sm:py-30">
        <div className="mx-auto grid max-w-[1120px] gap-12 px-5 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div className="relative mx-auto w-full max-w-sm">
            <div className="glass relative overflow-hidden rounded-[32px] p-5">
              <div className="relative flex aspect-[.92/1] items-end overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_50%_25%,#155786_0%,#092b47_42%,#031a2d_78%)]">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                <div className="absolute left-8 top-8 h-28 w-28 rounded-full border border-white/8" />
                <div className="absolute right-10 top-20 h-16 w-16 rounded-full border border-[#C32828]/15" />
                <div className="relative mx-auto mb-0 flex h-[90%] w-[90%] items-center justify-center rounded-[24px] bg-gradient-to-b from-[#164f76] to-[#061e33] shadow-[0_-20px_80px_rgba(57,143,204,.14)]">
                  {featuredCourse.instructor.image ? <Image src={featuredCourse.instructor.image} alt={featuredCourse.instructor.name} fill sizes="(max-width: 1024px) 80vw, 320px" className="object-cover object-top" /> : <span className="text-6xl font-black tracking-[-0.08em] text-white/90">{featuredCourse.instructor.initials}</span>}
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#031a2d] to-transparent px-6 pb-6 pt-20">
                  <p className="text-lg font-bold text-white">{featuredCourse.instructor.name}</p>
                  <p className="mt-1 text-[10px] text-[#7f9cb2]">{featuredCourse.instructor.role}</p>
                </div>
              </div>
            </div>
            <span className="absolute -left-4 top-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C32828] text-white shadow-[0_16px_45px_rgba(195,40,40,.25)]"><Award size={25} /></span>
          </div>

          <div>
            <SectionHeading eyebrow="محاضرك في هذه الدورة" title={featuredCourse.instructor.name} description={featuredCourse.instructor.role} />
            <div className="mt-7 flex gap-4">
              <Quote className="mt-1 shrink-0 text-[#C32828]" size={26} />
              <p className="max-w-xl text-sm leading-8 text-[#c3d6e5] sm:text-base">{featuredCourse.instructor.bio}</p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                <CheckCircle2 size={19} className="text-[#62d5aa]" /><span><strong className="latin block text-lg text-white">+10</strong><small className="text-[10px] text-[#7f9cb2]">سنوات في الأسواق المالية</small></span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                <MessageCircleQuestion size={19} className="text-[#62d5aa]" /><span><strong className="latin block text-lg text-white">LIVE</strong><small className="text-[10px] text-[#7f9cb2]">إجابات مباشرة على أسئلتك</small></span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
