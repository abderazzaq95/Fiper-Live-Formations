import Image from "next/image";
import type { Course } from "@/lib/demo-data";

export function CourseCover({ course, priority = false, className = "" }: { course: Course; priority?: boolean; className?: string }) {
  const image = course.coverImage || "/brand/hero-reference.png";

  return (
    <div className={`relative overflow-hidden bg-[#071f31] ${className}`}>
      <Image
        src={image}
        alt={`صورة دورة ${course.title}`}
        fill
        priority={priority}
        sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 620px"
        className="object-cover object-center transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.025]"
      />
    </div>
  );
}
