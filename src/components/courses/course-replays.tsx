import Link from "next/link";
import type { CourseReplay } from "@/lib/course-replays";

export function CourseReplays({ replays }: { replays: CourseReplay[] }) {
  if (!replays.length) return null;
  return <section aria-labelledby="replays-title" className="bg-white"><div className="mx-auto max-w-[1280px] px-5 py-20 sm:px-8"><p className="text-sm font-semibold text-[#c32828]">شاهد ما فاتك</p><h2 id="replays-title" className="mt-3 text-balance text-4xl font-bold text-[#071d2f]">جلسات سابقة متاحة للمشاهدة</h2><div className="mt-10 grid gap-6 md:grid-cols-2">{replays.map((replay) => <article key={replay.id} className="rounded-2xl bg-[#f2f5f6] p-6 ring-1 ring-[#dfe7ec]"><h3 className="text-balance text-2xl font-bold text-[#071d2f]">{replay.title}</h3><p className="mt-3 text-sm text-[#617485]">{replay.recordedAt} · {replay.duration}</p><Link href={replay.url} className="mt-5 inline-flex h-11 items-center rounded-xl bg-[#031a2d] px-3 text-sm font-semibold text-white">مشاهدة الجلسة</Link></article>)}</div></div></section>;
}
