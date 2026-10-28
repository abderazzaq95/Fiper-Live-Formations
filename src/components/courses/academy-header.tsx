"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useReducedMotion } from "framer-motion";

import { FiperLogo } from "@/components/brand/fiper-logo";
import { trackAcademyEvent } from "@/lib/analytics";

const links = [
  { label: "الدورات", href: "#courses" },
  { label: "لماذا Fiper", href: "#why-fiper" },
  { label: "المحاضرون", href: "#instructors" },
  { label: "الأسئلة الشائعة", href: "#faq" },
];

export function AcademyHeader({ registerHref, courseSlug }: { registerHref: string; courseSlug?: string }) {
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const reduceMotion = useReducedMotion();
  useMotionValueEvent(scrollY, "change", (value) => setCompact(value > 28));

  return (
    <header className={`sticky top-0 z-50 border-b border-white/10 bg-[#031a2d]/90 backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${compact ? "shadow-[0_16px_48px_rgba(1,15,27,.18)]" : ""}`}>
      <div className={`mx-auto flex max-w-[1280px] items-center justify-between px-5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] sm:px-8 ${compact ? "h-16" : "h-20"}`}>
        <FiperLogo variant="drive" href="/" />
        <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-8 text-sm font-semibold text-[#a9bdcb] lg:flex">
          {links.map((link) => <a key={link.href} href={link.href} className="rounded-lg px-1 py-2 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">{link.label}</a>)}
        </nav>
        <div className="flex items-center gap-3">
          <Link href={registerHref} onClick={() => trackAcademyEvent({ name: "academy_register_start", source: "header", courseSlug: courseSlug ?? "none" })} className="hidden h-11 items-center rounded-xl bg-[#c32828] px-3 text-sm font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-[#a92121] active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:inline-flex">سجّل الآن مجانًا</Link>
          <button type="button" aria-label={open ? "إغلاق القائمة" : "فتح القائمة"} aria-expanded={open} onClick={() => setOpen((value) => !value)} className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white lg:hidden">
            <span className={`absolute h-0.5 w-5 bg-current transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "rotate-45" : "-translate-y-1.5"}`} />
            <span className={`absolute h-0.5 w-5 bg-current transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "-rotate-45" : "translate-y-1.5"}`} />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open ? (
          <motion.div initial={reduceMotion ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }} className="overflow-hidden border-t border-white/10 bg-[#031a2d]/95 lg:hidden">
            <nav aria-label="قائمة الهاتف" className="mx-auto flex max-w-[1280px] flex-col px-5 py-6">
              {links.map((link, index) => <motion.a key={link.href} href={link.href} onClick={() => setOpen(false)} initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06, duration: 0.55, ease: [0.32, 0.72, 0, 1] }} className="border-b border-white/10 py-4 text-lg font-semibold text-white">{link.label}</motion.a>)}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
