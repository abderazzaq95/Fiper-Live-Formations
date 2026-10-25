"use client";

import { Check, CirclePlus, Loader2, MessageCircleMore, Power, Star } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Channel = {
  id: string;
  label: string;
  countryName: string;
  countryCode: string;
  phoneE164: string;
  callbellChannelUuid: string;
  active: boolean;
  isDefault: boolean;
};

const inputClass = "h-11 w-full rounded-xl border border-[#dce5eb] bg-[#fafbfc] px-4 text-sm text-[#203b4e] placeholder:text-[#a5b3bc] focus:border-[#8eb8d2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1779b5]/15";

export function WhatsAppChannelManager({ channels }: { channels: Channel[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function update(id: string, body: { active?: boolean; isDefault?: boolean }) {
    setPending(id);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/whatsapp-channels/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.message === "string" ? result.message : "تعذر تحديث القناة.");
      setMessage("تم تحديث قناة واتساب.");
      router.refresh();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "تعذر تحديث القناة.");
    } finally {
      setPending(null);
    }
  }

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setPending("new");
    setError("");
    setMessage("");
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/admin/whatsapp-channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: form.get("label"),
          countryName: form.get("countryName"),
          countryCode: form.get("countryCode"),
          phoneE164: form.get("phoneE164"),
          callbellChannelUuid: form.get("callbellChannelUuid"),
          isDefault: form.get("isDefault") === "on",
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.message === "string" ? result.message : "تعذر إضافة القناة.");
      formElement.reset();
      setAdding(false);
      setMessage("تمت إضافة قناة واتساب.");
      router.refresh();
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : "تعذر إضافة القناة.");
    } finally {
      setPending(null);
    }
  }

  return (
    <section className="mt-5 rounded-2xl border border-[#dfe7ec] bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eaf8f3] text-[#168a65]"><MessageCircleMore size={20} /></span>
        <div className="min-w-0"><h2 className="text-base font-bold text-balance">أرقام واتساب للإرسال</h2><p className="mt-1 text-sm text-pretty text-[#718695]">أضف الأرقام المرتبطة في Callbell، ثم اختر الرقم المناسب داخل كل دورة.</p></div>
        <button type="button" onClick={() => setAdding((value) => !value)} aria-expanded={adding} className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#102f47] px-4 text-sm font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#183f5b] active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-[#1779b5]/30 sm:mr-auto"><CirclePlus size={16} />{adding ? "إغلاق النموذج" : "إضافة رقم"}</button>
      </div>

      {(message || error) && <p role="status" className={`mt-4 rounded-xl p-3 text-sm ${error ? "bg-[#fff0f1] text-[#a51f1f]" : "bg-[#eaf8f3] text-[#167657]"}`}>{error || message}</p>}

      {adding && <form onSubmit={add} className="mt-5 rounded-2xl bg-[#f7f9fa] p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className="mb-2 block text-xs font-semibold text-[#425d70]">اسم القناة</span><input name="label" required maxLength={120} className={inputClass} placeholder="مثال: Fiper Iraq" /></label>
          <label><span className="mb-2 block text-xs font-semibold text-[#425d70]">الدولة</span><input name="countryName" required maxLength={120} className={inputClass} placeholder="مثال: العراق" /></label>
          <label><span className="mb-2 block text-xs font-semibold text-[#425d70]">رمز الدولة</span><input name="countryCode" required minLength={2} maxLength={2} dir="ltr" className={inputClass} placeholder="IQ" /></label>
          <label><span className="mb-2 block text-xs font-semibold text-[#425d70]">رقم واتساب</span><input name="phoneE164" required dir="ltr" pattern="\+[1-9][0-9]{6,14}" className={inputClass} placeholder="+964..." /></label>
          <label className="sm:col-span-2"><span className="mb-2 block text-xs font-semibold text-[#425d70]">Callbell Channel UUID</span><input name="callbellChannelUuid" required minLength={32} maxLength={32} dir="ltr" className={inputClass} placeholder="32 حرفًا ورقمًا" /></label>
        </div>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center"><label className="flex items-center gap-2 text-sm text-[#526a7a]"><input name="isDefault" type="checkbox" className="h-4 w-4 accent-[#C32828]" /> اجعل هذا الرقم افتراضيًا</label><button type="submit" disabled={pending === "new"} className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#C32828] px-4 text-sm font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#a92121] active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60 sm:mr-auto">{pending === "new" ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}حفظ الرقم</button></div>
      </form>}

      <div className="mt-5 grid gap-3">
        {channels.map((channel) => <article key={channel.id} className="flex flex-col gap-4 rounded-2xl border border-[#e0e8ed] p-4 sm:flex-row sm:items-center">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${channel.active ? "bg-[#eaf8f3] text-[#168a65]" : "bg-[#f1f3f5] text-[#8799a6]"}`}><MessageCircleMore size={18} /></span>
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-bold">{channel.countryName} · {channel.label}</h3>{channel.isDefault && <span className="rounded-full bg-[#fff0f1] px-3 py-1 text-xs font-semibold text-[#C32828]">الافتراضي</span>}{!channel.active && <span className="rounded-full bg-[#f1f3f5] px-3 py-1 text-xs font-semibold text-[#687b89]">متوقف</span>}</div><p dir="ltr" className="mt-2 text-left text-sm text-[#607686]">{channel.phoneE164}</p></div>
          <div className="flex flex-wrap gap-2">
            {!channel.isDefault && channel.active && <button type="button" disabled={pending === channel.id} onClick={() => void update(channel.id, { isDefault: true })} className="flex h-10 items-center gap-2 rounded-xl border border-[#dce5eb] px-3 text-sm font-semibold text-[#526a7a] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#f3f6f8] active:scale-[.98] disabled:opacity-50"><Star size={15} />جعله افتراضيًا</button>}
            <button type="button" disabled={pending === channel.id || channel.isDefault} onClick={() => void update(channel.id, { active: !channel.active })} className="flex h-10 items-center gap-2 rounded-xl border border-[#dce5eb] px-3 text-sm font-semibold text-[#526a7a] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#f3f6f8] active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40"><Power size={15} />{channel.active ? "تعطيل" : "تفعيل"}</button>
          </div>
        </article>)}
      </div>
    </section>
  );
}
