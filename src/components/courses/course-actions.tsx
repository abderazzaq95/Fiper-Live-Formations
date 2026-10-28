"use client";

import { useState } from "react";
import { Check, ShareNetwork } from "@phosphor-icons/react";
import { trackAcademyEvent } from "@/lib/analytics";

export function ShareCourseButton({ slug, title, dark = false }: { slug: string; title: string; dark?: boolean }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = `${window.location.origin}/courses/${encodeURIComponent(slug)}`;
    if (navigator.share) {
      await navigator.share({ title, url });
      trackAcademyEvent({ name: "academy_share", method: "native", courseSlug: slug });
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    trackAcademyEvent({ name: "academy_share", method: "copy", courseSlug: slug });
    window.setTimeout(() => setCopied(false), 1800);
  }
  return <button type="button" onClick={() => void share()} className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 ${dark ? "border border-white/15 text-white hover:bg-white/10 focus-visible:ring-white" : "border border-[#d9e2e7] text-[#526575] hover:border-[#b8c7d0] hover:bg-[#f2f5f6] focus-visible:ring-[#c32828]"}`}>{copied ? <Check size={18} /> : <ShareNetwork size={18} weight="duotone" />}{copied ? "تم نسخ الرابط" : "مشاركة"}</button>;
}

export function CalendarAction({ href, provider, courseSlug, children, className }: { href: string; provider: "google" | "ics"; courseSlug: string; children: React.ReactNode; className: string }) {
  return <a href={href} target={provider === "google" ? "_blank" : undefined} rel={provider === "google" ? "noreferrer" : undefined} onClick={() => trackAcademyEvent({ name: "academy_calendar_add", provider, courseSlug })} className={className}>{children}</a>;
}

export function CommunityLink({ href, children, className }: { href: string; children: React.ReactNode; className: string }) {
  return <a href={href} target="_blank" rel="noreferrer" onClick={() => trackAcademyEvent({ name: "academy_community_click", source: "courses_directory" })} className={className}>{children}</a>;
}
