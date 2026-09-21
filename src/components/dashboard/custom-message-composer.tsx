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
    try {
      const response = await fetch("/api/admin/messages/custom", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ registrationIds: eligible.map((item) => item.id), message, email, whatsapp }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "Unable to send");
      setResult("تم الإرسال بالبريد: " + body.emailSent + " · واتساب: " + body.whatsappSent + (body.skipped ? " · غير متاح: " + body.skipped : ""));
      setMessage("");
    } catch (error) { setResult(error instanceof Error ? error.message : "تعذر الإرسال"); } finally { setSending(false); }
  }
  return <section className="mt-5 rounded-[22px] border border-[#dfe7ec] bg-white p-5">
    <div className="flex items-center gap-2"><MessageCircle size={17} className="text-[#C32828]" /><div><h2 className="text-sm font-bold">رسالة مخصصة للمشاركين</h2><p className="mt-1 text-[10px] text-[#91a2ae]">اختر الفئة واكتب الرسالة، وسيتم إرسالها عبر القنوات المتاحة.</p></div></div>
    <div className="mt-4 grid gap-3 sm:grid-cols-[220px_1fr]">
      <select value={audience} onChange={(event) => setAudience(event.target.value)} className="h-11 rounded-xl border border-[#dfe7ec] bg-[#f8fafb] px-3 text-[11px] font-bold"><option value="all">كل المشاركين ({recipients.length})</option><option value="email">لديهم بريد إلكتروني ({recipients.filter((item) => item.email).length})</option><option value="whatsapp">لديهم WhatsApp ({recipients.filter((item) => item.phone).length})</option><option value="attended">الحاضرون ({recipients.filter((item) => item.status === "attended").length})</option><option value="absent">من لم يحضروا ({recipients.filter((item) => item.status === "absent").length})</option></select>
      <textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={4000} rows={3} placeholder="اكتب رسالتك هنا... يمكنك استخدام {{name}} للاسم" className="w-full rounded-xl border border-[#dfe7ec] bg-[#f8fafb] p-3 text-[11px] leading-6 focus:outline-none" dir="rtl" />
    </div>
    <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px]"><label className="flex items-center gap-2"><input type="checkbox" checked={email} onChange={(event) => setEmail(event.target.checked)} className="accent-[#C32828]" /> البريد الإلكتروني</label><label className="flex items-center gap-2"><input type="checkbox" checked={whatsapp} onChange={(event) => setWhatsapp(event.target.checked)} className="accent-[#C32828]" /> WhatsApp (بموافقة المشترك)</label><button type="button" disabled={sending || !message.trim() || !eligible.length || (!email && !whatsapp)} onClick={() => void send()} className="mr-auto flex h-10 items-center gap-2 rounded-xl bg-[#C32828] px-4 text-[11px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"><Send size={14} />{sending ? "جارٍ الإرسال..." : "إرسال إلى " + eligible.length}</button></div>
    {result && <p className="mt-3 rounded-xl bg-[#f1f8f5] px-3 py-2 text-[10px] text-[#168a65]">{result}</p>}
  </section>;
}
