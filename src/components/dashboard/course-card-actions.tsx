"use client";

import { Copy, Eye, Loader2, MoreHorizontal, Power, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type CourseCardActionsProps = {
  courseId: string;
  registrationOpen: boolean;
  featured: boolean;
  variant: "menu" | "quick";
};

export function CourseCardActions({ courseId, registrationOpen, featured, variant }: CourseCardActionsProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState<"copy" | "toggle" | "featured" | null>(null);

  async function duplicateCourse() {
    setBusy("copy");
    try {
      const response = await fetch(`/api/admin/courses/${encodeURIComponent(courseId)}/duplicate`, { method: "POST" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.message === "string" ? result.message : "تعذر نسخ الدورة.");
      setMenuOpen(false);
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "تعذر نسخ الدورة.");
    } finally {
      setBusy(null);
    }
  }

  async function toggleFeatured() {
    setBusy("featured");
    try {
      const response = await fetch(`/api/admin/courses/${encodeURIComponent(courseId)}/featured`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ featured: !featured }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.message === "string" ? result.message : "Unable to update featured course.");
      setMenuOpen(false);
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to update featured course.");
    } finally {
      setBusy(null);
    }
  }
  async function toggleRegistration() {
    setBusy("toggle");
    try {
      const response = await fetch(`/api/admin/courses/${encodeURIComponent(courseId)}/registration`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ open: !registrationOpen }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.message === "string" ? result.message : "تعذر تحديث حالة التسجيل.");
      setMenuOpen(false);
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "تعذر تحديث حالة التسجيل.");
    } finally {
      setBusy(null);
    }
  }

  if (variant === "menu") {
    return (
      <div className="relative">
        <button type="button" aria-label="خيارات الدورة" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/15 text-white/80 transition hover:bg-black/30">
          {busy ? <Loader2 size={15} className="animate-spin" /> : <MoreHorizontal size={17} />}
        </button>
        {menuOpen && <div className="absolute left-0 top-10 z-30 w-44 rounded-xl border border-[#dce5eb] bg-white p-1 text-right shadow-[0_16px_35px_rgba(15,42,61,.2)]">
          <button type="button" onClick={() => void toggleFeatured()} disabled={busy !== null} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-[9px] font-bold text-[#203b4e] hover:bg-[#f4f8fa] disabled:opacity-50"><Star size={13} className={featured ? "fill-[#d99b1e] text-[#d99b1e]" : "text-[#a36b00]"} />{featured ? "إلغاء تمييز الدورة" : "تعيين كدورة مميزة"}</button>
          <button type="button" onClick={() => void toggleRegistration()} disabled={busy !== null} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-[9px] font-bold text-[#203b4e] hover:bg-[#f4f8fa] disabled:opacity-50"><Power size={13} className={registrationOpen ? "text-[#C32828]" : "text-[#168a65]"} />{registrationOpen ? "إغلاق التسجيل" : "فتح التسجيل"}</button>
          <button type="button" onClick={() => void duplicateCourse()} disabled={busy !== null} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-[9px] font-bold text-[#203b4e] hover:bg-[#f4f8fa] disabled:opacity-50"><Copy size={13} />نسخ الدورة</button>
        </div>}
      </div>
    );
  }

  return (
    <>
      <Link href={`/?courseId=${encodeURIComponent(courseId)}`} target="_blank" aria-label="معاينة الدورة" className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dfe7ec] text-[#607686] transition hover:border-[#8eb8d2] hover:bg-[#f5f9fb]"><Eye size={15} /></Link>
      <button type="button" onClick={() => void duplicateCourse()} disabled={busy !== null} aria-label="نسخ الدورة" className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dfe7ec] text-[#607686] transition hover:border-[#8eb8d2] hover:bg-[#f5f9fb] disabled:cursor-wait disabled:opacity-60">{busy === "copy" ? <Loader2 size={15} className="animate-spin" /> : <Copy size={15} />}</button>
    </>
  );
}