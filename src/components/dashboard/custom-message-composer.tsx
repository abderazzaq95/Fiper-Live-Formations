"use client";
import { useMemo, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
type Recipient = { id: string; name: string; email?: string; phone?: string; status?: string };
export function CustomMessageComposer({ recipients }: { recipients: Recipient[] }) {
  const [audience, setAudience] = useState("all"), [message, setMessage] = useState(""), [email, setEmail] = useState(true), [whatsapp, setWhatsapp] = useState(true), [sending, setSending] = useState(false), [result, setResult] = useState("");
  const eligible = useMemo(() => recipients.filter((item) => audience === "email" ? Boolean(item.email) : audience === "whatsapp" ? Boolean(item.phone) : audience === "attended" ? item.status === "attended" : audience === "absent" ? item.status === "absent" : true), [recipients, audience]);
  async function send() {
    if (!message.trim() || !eligible.length || (!email && !whatsapp)) return;
    setSending(true); setResult("");
    // Send in batches of 200 so any number of recipients works (the server accepts up to 500 per request).
    const ids = eligible.map((item) => item.id);
    const totals = { emailSent: 0, whatsappSent: 0, skipped: 0 };
    const summary = () => "تم الإرسال بالبريد: " + totals.emailSent + " · واتساب: " + totals.whatsappSent + (totals.skipped ? " · غير متاح: " + totals.skipped : "");
    let done = 0;
    try {
      for (let index = 0; index < ids.length; index += 200) {
        const response = await fetch("/api/admin/messages/custom", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ registrationIds: ids.slice(index, index + 200), message, email, whatsapp }) });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.message || "Unable to send");
        totals.emailSent += Number(body.emailSent) || 0;
        totals.whatsappSent += Number(body.whatsappSent) || 0;
        totals.skipped += Number(body.skipped) || 0;
        done = Math.min(ids.length, index + 200);
        if (done < ids.length) setResult("جارٍ الإرسال... " + done + " / " + ids.length);
      }
      setResult(summary());
      setMessage("");
    } catch (error) {
      const reason = error instanceof Error ? error.message : "تعذر الإرسال";
      setResult(done ? "توقف الإرسال بعد " + done + " / " + ids.length + " (" + summary() + "): " + reason : reason);
    } finally { setSending(false); }
  }
  return <section className="mt-5 rounded-[12px] border border-[#dfe6f0] bg-white shadow-[0_1px_2px_rgba(15,23,42,.05)] p-5">
    <div className="flex items-center gap-2"><MessageCircle size={17} className="text-[#c2182b]" /><div><h2 className="text-sm font-bold">رسالة مخصصة للمشاركين</h2><p className="mt-1 text-[12px] text-[#64748b]">اختر الفئة واكتب الرسالة، وسيتم إرسالها عبر القنوات المتاحة.</p></div></div>
    <div className="mt-4 grid gap-3 sm:grid-cols-[220px_1fr]">
      <select value={audience} onChange={(event) => setAudience(event.target.value)} className="h-11 rounded-lg border border-[#dfe6f0] bg-[#f8fafc] px-3 text-[12.5px] font-bold"><option value="all">كل المشاركين ({recipients.length})</option><option value="email">لديهم بريد إلكتروني ({recipients.filter((item) => item.email).length})</option><option value="whatsapp">لديهم WhatsApp ({recipients.filter((item) => item.phone).length})</option><option value="attended">الحاضرون ({recipients.filter((item) => item.status === "attended").length})</option><option value="absent">من لم يحضروا ({recipients.filter((item) => item.status === "absent").length})</option></select>
      <textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={4000} rows={3} placeholder="اكتب رسالتك هنا... يمكنك استخدام {{name}} للاسم" className="w-full rounded-lg border border-[#dfe6f0] bg-[#f8fafc] p-3 text-[12.5px] leading-6 focus:outline-none" dir="rtl" />
    </div>
    <div className="mt-3 flex flex-wrap items-center gap-4 text-[12.5px]"><label className="flex items-center gap-2"><input type="checkbox" checked={email} onChange={(event) => setEmail(event.target.checked)} className="accent-[#c2182b]" /> البريد الإلكتروني</label><label className="flex items-center gap-2"><input type="checkbox" checked={whatsapp} onChange={(event) => setWhatsapp(event.target.checked)} className="accent-[#c2182b]" /> WhatsApp (بموافقة المشترك)</label><button type="button" disabled={sending || !message.trim() || !eligible.length || (!email && !whatsapp)} onClick={() => void send()} className="mr-auto flex h-10 items-center gap-2 rounded-lg bg-[#c2182b] px-4 text-[12.5px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"><Send size={14} />{sending ? "جارٍ الإرسال..." : "إرسال إلى " + eligible.length}</button></div>
    {result && <p className="mt-3 rounded-lg bg-[#f1f8f5] px-3 py-2 text-[12px] text-[#047857]">{result}</p>}
  </section>;
}
