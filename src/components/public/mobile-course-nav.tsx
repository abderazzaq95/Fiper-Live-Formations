"use client";

import { ArrowLeft, Menu, X } from "lucide-react";
import { useState } from "react";
import type { LandingContent } from "@/lib/landing-content";

export function MobileCourseNav({ landing }: { landing: LandingContent }) {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#course", label: landing.hero.navAbout },
    { href: "#agenda", label: landing.hero.navAgenda },
    { href: "#instructor", label: landing.hero.navInstructor },
    { href: "#faq", label: landing.hero.navFaq },
  ];

  return (
    <div className="relative sm:hidden">
      <button type="button" aria-label="فتح القائمة" aria-expanded={open} onClick={() => setOpen((current) => !current)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10">
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {open && (
        <div className="absolute left-0 top-14 z-50 w-56 rounded-2xl border border-white/10 bg-[#082740]/[.98] p-2 text-right shadow-[0_18px_45px_rgba(0,8,15,.35)] backdrop-blur-xl">
          <nav className="space-y-1" aria-label="التنقل الرئيسي">
            {links.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-xs font-semibold text-[#c9dbea] transition hover:bg-white/10 hover:text-white">{link.label}</a>
            ))}
          </nav>
          <a href="#register" onClick={() => setOpen(false)} className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#C32828] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#A92121]">{landing.hero.primaryCta} <ArrowLeft size={14} /></a>
        </div>
      )}
    </div>
  );
}
