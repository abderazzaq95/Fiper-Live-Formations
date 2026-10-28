import Image from "next/image";
import type { Course } from "@/lib/demo-data";

const accents = ["#c32828", "#0f8f6f", "#d49a3a", "#4a8fb8", "#8b5fbf"] as const;
const levelLabels = { beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم" } as const;

function accentFor(value: string) {
  const hash = Array.from(value).reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 0);
  return accents[hash % accents.length];
}

export function CourseCover({ course, priority = false, className = "" }: { course: Course; priority?: boolean; className?: string }) {
  if (course.coverImage) {
    return <div className={`relative overflow-hidden bg-[#d8e7f0] ${className}`}><Image src={course.coverImage} alt={`صورة دورة ${course.title}`} fill priority={priority} sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 620px" className="object-cover transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.025]" /></div>;
  }

  const accent = accentFor(course.topic || course.slug);
  return (
    <div className={`relative isolate overflow-hidden bg-[#08243a] text-white ${className}`}>
      <div aria-hidden="true" className="absolute inset-0 opacity-30 fine-grid" />
      <svg aria-hidden="true" viewBox="0 0 640 360" preserveAspectRatio="none" className="absolute inset-0 h-full w-full opacity-75">
        <path d="M0 290 C70 270 105 302 165 240 S270 250 325 185 S430 200 492 120 S575 145 640 70" fill="none" stroke={accent} strokeWidth="5" />
        <path d="M0 330 C90 315 145 335 215 285 S330 295 390 245 S520 258 640 175" fill="none" stroke="#88abc0" strokeWidth="2" opacity=".55" />
        {Array.from({ length: 10 }).map((_, index) => <circle key={index} cx={54 + index * 62} cy={82 + (index % 3) * 45} r="3" fill={index % 2 ? accent : "#88abc0"} opacity=".8" />)}
      </svg>
      <div className="relative flex h-full min-h-56 flex-col justify-between p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-bold">Fiper Live Academy</span>
          {course.level ? <span className="rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ backgroundColor: accent }}>{levelLabels[course.level]}</span> : null}
        </div>
        <div className="max-w-md">
          {course.topic ? <p className="text-sm font-semibold" style={{ color: accent }}>{course.topic}</p> : null}
          <p className="mt-2 text-balance text-2xl font-bold leading-tight sm:text-3xl">{course.title}</p>
          <p className="mt-4 text-sm font-semibold text-[#b7c7d2]">{course.dateLabel}</p>
        </div>
      </div>
    </div>
  );
}
