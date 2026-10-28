"use client";

import Link from "next/link";
import { trackAcademyEvent } from "@/lib/analytics";

export function MobileRegisterBar({ href, slug, title }: { href: string; slug: string; title: string }) {
  return (
    <aside aria-label="التسجيل في الدورة القادمة" className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#031a2d]/95 p-3 shadow-[0_-16px_45px_rgba(3,26,45,.22)] backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="min-w-0 flex-1"><p className="text-xs font-semibold text-[#8daac1]">الدورة القادمة</p><p className="mt-1 truncate text-sm font-bold text-white">{title}</p></div>
        <Link href={href} onClick={() => trackAcademyEvent({ name: "academy_register_start", source: "mobile_sticky", courseSlug: slug })} className="inline-flex h-11 shrink-0 items-center rounded-xl bg-[#c32828] px-3 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">سجّل مجانًا</Link>
      </div>
    </aside>
  );
}
