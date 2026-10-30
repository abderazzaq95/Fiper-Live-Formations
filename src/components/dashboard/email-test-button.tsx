"use client";

import { useState } from "react";
import { Loader2, Send, X } from "lucide-react";

export function EmailTestButton() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  async function sendTest() {
    setPending(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/admin/messages/test-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const result = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) throw new Error(result.message || "تعذر إرسال رسالة الاختبار.");
      setFeedback({ tone: "success", message: result.message || "تم إرسال رسالة الاختبار." });
    } catch (error) {
      setFeedback({ tone: "error", message: error instanceof Error ? error.message : "تعذر إرسال رسالة الاختبار." });
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => { setOpen(true); setFeedback(null); }} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#102f47] px-5 text-sm font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#174462] active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-[#C32828] focus:ring-offset-2">
        <Send size={16} /> رسالة تجريبية
      </button>
      {open ? <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="email-test-title">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div><h2 id="email-test-title" className="text-lg font-bold text-[#102f47]">إرسال بريد تجريبي</h2><p className="mt-2 text-sm leading-6 text-[#788d9c]">سيُرسل قالب تأكيد التسجيل باستخدام بيانات دورة منشورة.</p></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="إغلاق" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#788d9c] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#f0f4f6] focus:outline-none focus:ring-2 focus:ring-[#C32828]"><X size={18} /></button>
          </div>
          <label htmlFor="test-email" className="mt-6 block text-sm font-semibold text-[#425d70]">البريد الإلكتروني</label>
          <input id="test-email" type="email" dir="ltr" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className="mt-2 h-11 w-full rounded-xl border border-[#dce5eb] px-3 text-sm outline-none transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] focus:border-[#C32828] focus:ring-2 focus:ring-[#C32828]/15" />
          {feedback ? <p className={`mt-4 rounded-xl px-3 py-2 text-sm ${feedback.tone === "success" ? "bg-[#eaf8f3] text-[#168a65]" : "bg-[#fff0f1] text-[#a51f1f]"}`}>{feedback.message}</p> : null}
          <button type="button" onClick={() => void sendTest()} disabled={pending || !email.trim()} className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#C32828] px-3 text-base font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#a92121] active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-[#C32828] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            {pending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />} إرسال الاختبار
          </button>
        </div>
      </div> : null}
    </>
  );
}
