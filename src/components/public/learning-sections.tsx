import { BarChart3, BookOpenCheck, Check, ShieldCheck, Target, TrendingUp } from "lucide-react";
import { SectionHeading } from "./section-heading";
import type { PublicCourseData } from "@/lib/data/courses";

const icons = [BarChart3, TrendingUp, ShieldCheck, Target];

export function LearningSections({ outcomes, audience }: Pick<PublicCourseData, "outcomes" | "audience">) {
  return (
    <>
      <section id="about" className="fine-grid bg-[#f4f8fb] py-24 text-[#071d2f] sm:py-30">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeading light eyebrow="ما الذي ستخرج به؟" title="معرفة تتحول إلى قرارات أوضح" description="كل محور مصمم ليمنحك أداة عملية تستخدمها بعد انتهاء الجلسة، بعيداً عن التعقيد والمعلومات المشتتة." />
            <div className="rounded-2xl border border-[#dce7ef] bg-white px-5 py-4 text-xs leading-6 text-[#597085] shadow-sm">
              <span className="latin ml-2 text-lg font-bold text-[#C32828]">90</span>
              دقيقة مركّزة من الشرح والتطبيق والأسئلة المباشرة
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {outcomes.map((item, index) => {
              const Icon = icons[index];
              return (
                <article key={item.index} className="group relative overflow-hidden rounded-[24px] border border-[#dce7ef] bg-white p-6 shadow-[0_16px_45px_rgba(12,43,65,.06)] transition hover:-translate-y-1 hover:border-[#b9cfde]">
                  <span className="latin absolute left-5 top-4 text-[38px] font-black tracking-[-0.07em] text-[#C32828]">{item.index}</span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef6fb] text-[#0e5587] transition group-hover:bg-[#C32828] group-hover:text-white"><Icon size={21} /></span>
                  <h3 className="mt-8 text-base font-bold">{item.title}</h3>
                  <p className="mt-3 text-xs leading-7 text-[#657c8e]">{item.text}</p>
                  <div className="mt-6 h-[2px] w-8 rounded-full bg-[#C32828] transition-all group-hover:w-16" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#041a2d] py-24 sm:py-30">
        <div className="pointer-events-none absolute left-0 top-0 hidden h-full w-1/2 bg-[radial-gradient(circle_at_center,rgba(18,91,142,.17),transparent_60%)] lg:block" />
        <div className="relative mx-auto grid max-w-[1240px] gap-12 px-5 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div className="relative mx-auto w-full max-w-md">
            <div className="glass rounded-[30px] p-7 sm:p-9">
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C32828] text-white"><BookOpenCheck size={22} /></span>
                <span className="rounded-full border border-[#62d5aa]/20 bg-[#62d5aa]/10 px-3 py-1.5 text-[10px] font-bold text-[#62d5aa]">مسار مناسب لك</span>
              </div>
              <p className="mt-9 text-xs font-semibold text-[#7696ad]">في نهاية الدورة ستكون قد بنيت</p>
              <p className="mt-3 text-3xl font-extrabold leading-[1.45] tracking-[-0.05em] text-white">نظاماً أولياً لاتخاذ قرار تداول أكثر انضباطاً.</p>
              <div className="mt-8 grid grid-cols-3 gap-2 border-t border-white/8 pt-7 text-center">
                <div><span className="latin block text-xl font-bold text-white">5</span><span className="text-[9px] text-[#6f8da4]">محاور</span></div>
                <div><span className="latin block text-xl font-bold text-white">1</span><span className="text-[9px] text-[#6f8da4]">خطة عملية</span></div>
                <div><span className="latin block text-xl font-bold text-white">Live</span><span className="text-[9px] text-[#6f8da4]">أسئلة مباشرة</span></div>
              </div>
            </div>
          </div>

          <div>
            <SectionHeading eyebrow="هل هذه الدورة لك؟" title="صُممت للباحثين عن بداية صحيحة" description="لا نعدك بنتائج سريعة. نمنحك الأساس الذي يساعدك على فهم السوق، تقييم المخاطر، وبناء قراراتك على منهج واضح." />
            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              {audience.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-4 text-xs leading-6 text-[#c9dbea]">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C32828]/12 text-[#D75A5A]"><Check size={14} strokeWidth={3} /></span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
