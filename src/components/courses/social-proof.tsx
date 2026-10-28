import Image from "next/image";
import type { CourseTestimonial } from "@/lib/course-social-proof";

export function SocialProof({ testimonials }: { testimonials: CourseTestimonial[] }) {
  if (!testimonials.length) return null;
  return (
    <section aria-labelledby="social-proof-title" className="bg-[#f2f5f6]">
      <div className="mx-auto max-w-[1280px] px-5 py-20 sm:px-8">
        <h2 id="social-proof-title" className="text-balance text-3xl font-bold text-[#071d2f] sm:text-4xl">ماذا يقول المشاركون</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {testimonials.map((item) => <blockquote key={item.id} className="rounded-2xl bg-white p-6 ring-1 ring-[#dfe7ec]"><p className="text-pretty text-lg leading-8 text-[#263c4d]">“{item.quote}”</p><footer className="mt-6 flex items-center gap-3">{item.avatar ? <Image src={item.avatar} alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover" /> : null}<div><cite className="not-italic text-sm font-bold text-[#071d2f]">{item.name}</cite>{item.role ? <p className="mt-1 text-xs text-[#718391]">{item.role}</p> : null}</div></footer></blockquote>)}
        </div>
      </div>
    </section>
  );
}
