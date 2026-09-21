"use client";

import { Copy, Eye, Loader2, MoreHorizontal, Power, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type CourseCardActionsProps = {
  courseId: string;
  courseSlug?: string;
  registrationOpen: boolean;
  featured: boolean;
  courseTitle?: string;
  variant: "menu" | "quick";
};

export function CourseCardActions({ courseId, courseSlug, registrationOpen, featured, courseTitle, variant }: CourseCardActionsProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"copy" | "toggle" | "featured" | "delete" | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutsidePointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("pointerdown", handleOutsidePointerDown);
    return () => document.removeEventListener("pointerdown", handleOutsidePointerDown);
  }, [menuOpen]);

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

  async function deleteCourse() {
    const confirmationMessage = [
      "\u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u062d\u0630\u0641 \u0647\u0630\u0647 \u0627\u0644\u062f\u0648\u0631\u0629\u061f",
      courseTitle || courseId,
      "\u0633\u064a\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u062a\u0633\u062c\u064a\u0644\u0627\u062a \u0648\u0627\u0644\u062a\u0630\u0643\u064a\u0631\u0627\u062a \u0648\u0627\u0644\u062d\u0636\u0648\u0631 \u0627\u0644\u0645\u0631\u062a\u0628\u0637 \u0628\u0647\u0627."
    ].join("\n\n");
    if (!window.confirm(confirmationMessage)) return;
    setBusy("delete");
    try {
      const response = await fetch("/api/admin/courses/" + encodeURIComponent(courseId), { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.message === "string" ? result.message : "\u062a\u0639\u0630\u0631 \u062d\u0630\u0641 \u0627\u0644\u062f\u0648\u0631\u0629.");
      setMenuOpen(false);
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "\u062a\u0639\u0630\u0631 \u062d\u0630\u0641 \u0627\u0644\u062f\u0648\u0631\u0629.");
    } finally {
      setBusy(null);
    }
  }

  if (variant === "menu") {
    return (
      <div ref={menuRef} className="relative flex items-center gap-1.5">
        <button type="button" aria-label={featured ? "إلغاء تمييز الدورة" : "تعيين كدورة مميزة"} title={featured ? "الدورة المميزة" : "تعيين كدورة مميزة"} onClick={() => void toggleFeatured()} disabled={busy !== null} className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${featured ? "bg-[#d99b1e] text-white" : "bg-black/15 text-white/80 hover:bg-black/30"}`}>
          <Star size={15} className={featured ? "fill-current" : ""} />
        </button>
        <button type="button" aria-label="خيارات الدورة" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/15 text-white/80 transition hover:bg-black/30">
          {busy ? <Loader2 size={15} className="animate-spin" /> : <MoreHorizontal size={17} />}
        </button>
        {menuOpen && <div className="absolute left-0 top-10 z-30 w-44 rounded-xl border border-[#dce5eb] bg-white p-1 text-right shadow-[0_16px_35px_rgba(15,42,61,.2)]">
          <button type="button" onClick={() => void toggleFeatured()} disabled={busy !== null} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-[9px] font-bold text-[#203b4e] hover:bg-[#f4f8fa] disabled:opacity-50"><Star size={13} className={featured ? "fill-[#d99b1e] text-[#d99b1e]" : "text-[#a36b00]"} />{featured ? "إلغاء تمييز الدورة" : "تعيين كدورة مميزة"}</button>
          <button type="button" onClick={() => void toggleRegistration()} disabled={busy !== null} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-[9px] font-bold text-[#203b4e] hover:bg-[#f4f8fa] disabled:opacity-50"><Power size={13} className={registrationOpen ? "text-[#C32828]" : "text-[#168a65]"} />{registrationOpen ? "إغلاق التسجيل" : "فتح التسجيل"}</button>
          <button type="button" onClick={() => void duplicateCourse()} disabled={busy !== null} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-[9px] font-bold text-[#203b4e] hover:bg-[#f4f8fa] disabled:opacity-50"><Copy size={13} />نسخ الدورة</button>
          <button type="button" onClick={() => void deleteCourse()} disabled={busy !== null} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-[9px] font-bold text-[#C32828] hover:bg-[#fff3f3] disabled:opacity-50"><Trash2 size={13} />{"\u062d\u0630\u0641 \u0627\u0644\u062f\u0648\u0631\u0629"}</button>
        </div>}
      </div>
    );
  }

  return (
    <>
      <Link href={`/courses/${encodeURIComponent(courseSlug || courseId)}`} target="_blank" aria-label="معاينة الدورة" className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dfe7ec] text-[#607686] transition hover:border-[#8eb8d2] hover:bg-[#f5f9fb]"><Eye size={15} /></Link>
      <button type="button" onClick={() => void duplicateCourse()} disabled={busy !== null} aria-label="نسخ الدورة" className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dfe7ec] text-[#607686] transition hover:border-[#8eb8d2] hover:bg-[#f5f9fb] disabled:cursor-wait disabled:opacity-60">{busy === "copy" ? <Loader2 size={15} className="animate-spin" /> : <Copy size={15} />}</button>
    </>
  );
}