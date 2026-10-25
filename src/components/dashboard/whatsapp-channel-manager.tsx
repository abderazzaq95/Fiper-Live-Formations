"use client";

import { Check, CirclePlus, Loader2, MessageCircleMore, Pencil, Power, RefreshCw, Send, ShieldCheck, Star, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Templates = { registration: string; reminderDay: string; reminderToday: string; joinNow: string; custom: string };
type Channel = {
  id: string; label: string; countryName: string; countryCode: string; phoneE164: string; callbellChannelUuid: string;
  active: boolean; isDefault: boolean; templates: Templates; verifiedAt: string | null; verificationError: string | null;
};
type CallbellResources = {
  channels: { uuid: string; title: string; type: string; main: boolean }[];
  templates: { uuid: string; title: string; status: string; text: string; category: string }[];
};

const templateFields: { key: keyof Templates; label: string; hint: string }[] = [
  { key: "registration", label: "تأكيد التسجيل", hint: "Registration confirmation" },
  { key: "reminderDay", label: "تذكير قبل يوم", hint: "One day reminder" },
  { key: "reminderToday", label: "تذكير يوم الدورة", hint: "Same day reminder" },
  { key: "joinNow", label: "تذكير قبل البدء", hint: "10 minute reminder" },
  { key: "custom", label: "الرسالة المخصصة", hint: "Custom message" },
];
const inputClass = "h-11 w-full rounded-xl border border-[#dce5eb] bg-[#fafbfc] px-4 text-sm text-[#203b4e] placeholder:text-[#a5b3bc] focus:border-[#8eb8d2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1779b5]/15";
const actionClass = "flex h-10 items-center justify-center gap-2 rounded-xl border border-[#dce5eb] px-3 text-sm font-semibold text-[#526a7a] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#f3f6f8] active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-[#1779b5]/20 disabled:cursor-not-allowed disabled:opacity-40";

function templatePayload(form: FormData): Templates {
  return Object.fromEntries(templateFields.map(({ key }) => [key, String(form.get(`template_${key}`) ?? "").trim()])) as Templates;
}

function TemplateInputs({ defaults, resources }: { defaults?: Templates; resources: CallbellResources | null }) {
  const approved = resources?.templates.filter((template) => template.status === "approved") ?? [];
  return <div className="grid gap-4 sm:grid-cols-2">
    {templateFields.map(({ key, label, hint }) => <label key={key} className={key === "custom" ? "sm:col-span-2" : ""}>
      <span className="mb-2 block text-xs font-semibold text-[#425d70]">{label}</span>
      {approved.length ? <select name={`template_${key}`} required defaultValue={defaults?.[key] ?? ""} className={inputClass}>
        <option value="">اختر قالبًا معتمدًا</option>
        {approved.map((template) => <option key={template.uuid} value={template.uuid}>{template.title} · {template.uuid.slice(0, 8)}</option>)}
      </select> : <input name={`template_${key}`} required defaultValue={defaults?.[key]} minLength={32} maxLength={32} pattern="[a-fA-F0-9]{32}" dir="ltr" className={inputClass} placeholder={`${hint} UUID`} />}
    </label>)}
  </div>;
}

export function WhatsAppChannelManager({ channels }: { channels: Channel[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [resources, setResources] = useState<CallbellResources | null>(null);
  const [testPhones, setTestPhones] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function feedback(success = "", failure = "") { setMessage(success); setError(failure); }

  async function syncCallbell() {
    setPending("sync"); feedback();
    try {
      const response = await fetch("/api/admin/whatsapp-channels/callbell", { cache: "no-store" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.message === "string" ? result.message : "تعذرت مزامنة Callbell.");
      setResources(result as CallbellResources);
      feedback(`تم جلب ${result.channels?.length ?? 0} قناة و${result.templates?.length ?? 0} قالب من Callbell.`);
    } catch (syncError) { feedback("", syncError instanceof Error ? syncError.message : "تعذرت مزامنة Callbell."); }
    finally { setPending(null); }
  }

  async function update(id: string, body: Record<string, unknown>, success = "تم تحديث قناة واتساب.") {
    setPending(id); feedback();
    try {
      const response = await fetch(`/api/admin/whatsapp-channels/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.message === "string" ? result.message : "تعذر تحديث القناة.");
      feedback(success); setEditing(null); router.refresh();
    } catch (updateError) { feedback("", updateError instanceof Error ? updateError.message : "تعذر تحديث القناة."); }
    finally { setPending(null); }
  }

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const element = event.currentTarget; const form = new FormData(element);
    setPending("new"); feedback();
    try {
      const response = await fetch("/api/admin/whatsapp-channels", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        label: form.get("label"), countryName: form.get("countryName"), countryCode: form.get("countryCode"), phoneE164: form.get("phoneE164"),
        callbellChannelUuid: form.get("callbellChannelUuid"), templates: templatePayload(form),
      }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.message === "string" ? result.message : "تعذرت إضافة القناة.");
      element.reset(); setAdding(false); feedback("تم حفظ القناة. تحقق منها ثم فعّلها."); router.refresh();
    } catch (addError) { feedback("", addError instanceof Error ? addError.message : "تعذرت إضافة القناة."); }
    finally { setPending(null); }
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>, channel: Channel) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    await update(channel.id, {
      label: form.get("label"), countryName: form.get("countryName"), countryCode: form.get("countryCode"), phoneE164: form.get("phoneE164"),
      callbellChannelUuid: form.get("callbellChannelUuid"), templates: templatePayload(form),
    }, "تم حفظ الإعدادات. اضغط تحقق وتفعيل لاستخدام الرقم.");
  }

  async function sendTest(channel: Channel) {
    const phoneE164 = testPhones[channel.id]?.trim();
    if (!phoneE164) { feedback("", "أدخل رقم واتساب لاستلام رسالة الاختبار."); return; }
    setPending(`test_${channel.id}`); feedback();
    try {
      const response = await fetch(`/api/admin/whatsapp-channels/${encodeURIComponent(channel.id)}/test`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phoneE164 }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.message === "string" ? result.message : "تعذر إرسال رسالة الاختبار.");
      feedback("تم إرسال رسالة الاختبار من الرقم المحدد.");
    } catch (testError) { feedback("", testError instanceof Error ? testError.message : "تعذر إرسال رسالة الاختبار."); }
    finally { setPending(null); }
  }

  return <section className="mt-5 rounded-2xl border border-[#dfe7ec] bg-white p-5 sm:p-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eaf8f3] text-[#168a65]"><MessageCircleMore size={20} /></span>
      <div className="min-w-0"><h2 className="text-base font-bold text-balance">أرقام وقوالب واتساب</h2><p className="mt-1 text-sm text-pretty text-[#718695]">زامن Callbell، اربط القوالب المعتمدة بكل رقم، ثم اختبره وفعّله للاستخدام في الدورات.</p></div>
      <div className="flex flex-wrap gap-2 lg:mr-auto">
        <button type="button" onClick={() => void syncCallbell()} disabled={pending === "sync"} className={actionClass}>{pending === "sync" ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}مزامنة Callbell</button>
        <button type="button" onClick={() => setAdding((value) => !value)} aria-expanded={adding} className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#102f47] px-4 text-sm font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#183f5b] active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-[#1779b5]/30"><CirclePlus size={16} />{adding ? "إغلاق" : "إضافة رقم"}</button>
      </div>
    </div>

    {(message || error) && <p role="status" className={`mt-4 rounded-xl p-3 text-sm ${error ? "bg-[#fff0f1] text-[#a51f1f]" : "bg-[#eaf8f3] text-[#167657]"}`}>{error || message}</p>}

    {resources && <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#526a7a]"><span className="rounded-full bg-[#f3f6f8] px-3 py-2">{resources.channels.length} قناة واتساب</span><span className="rounded-full bg-[#f3f6f8] px-3 py-2">{resources.templates.filter((item) => item.status === "approved").length} قالب معتمد</span><span className="rounded-full bg-[#fff6df] px-3 py-2 text-[#8a6500]">{resources.templates.filter((item) => item.status !== "approved").length} قيد المراجعة أو غير متاح</span></div>}

    {adding && <form onSubmit={add} className="mt-5 rounded-2xl bg-[#f7f9fa] p-4 sm:p-6">
      <h3 className="mb-4 text-sm font-bold">إضافة قناة جديدة</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <label><span className="mb-2 block text-xs font-semibold text-[#425d70]">اسم القناة</span><input name="label" required maxLength={120} className={inputClass} placeholder="مثال: Fiper Iraq" /></label>
        <label><span className="mb-2 block text-xs font-semibold text-[#425d70]">الدولة</span><input name="countryName" required maxLength={120} className={inputClass} placeholder="مثال: العراق" /></label>
        <label><span className="mb-2 block text-xs font-semibold text-[#425d70]">رمز الدولة</span><input name="countryCode" required minLength={2} maxLength={2} dir="ltr" className={inputClass} placeholder="IQ" /></label>
        <label><span className="mb-2 block text-xs font-semibold text-[#425d70]">رقم واتساب</span><input name="phoneE164" required dir="ltr" pattern="\+[1-9][0-9]{6,14}" className={inputClass} placeholder="+964..." /></label>
        <label className="sm:col-span-2"><span className="mb-2 block text-xs font-semibold text-[#425d70]">قناة Callbell</span>{resources?.channels.length ? <select name="callbellChannelUuid" required className={inputClass}><option value="">اختر قناة واتساب</option>{resources.channels.map((channel) => <option key={channel.uuid} value={channel.uuid}>{channel.title} · {channel.uuid.slice(0, 8)}</option>)}</select> : <input name="callbellChannelUuid" required minLength={32} maxLength={32} pattern="[a-fA-F0-9]{32}" dir="ltr" className={inputClass} placeholder="Callbell Channel UUID" />}</label>
      </div>
      <div className="my-5 h-px bg-[#e2e9ed]" /><TemplateInputs resources={resources} />
      <button type="submit" disabled={pending === "new"} className="mt-5 flex h-10 items-center justify-center gap-2 rounded-xl bg-[#C32828] px-4 text-sm font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#a92121] active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-[#C32828]/25 disabled:opacity-60">{pending === "new" ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}حفظ القناة</button>
    </form>}

    <div className="mt-5 grid gap-3">{channels.map((channel) => {
      const configured = Object.values(channel.templates).filter(Boolean).length;
      const legacyDefault = channel.isDefault && configured === 0;
      return <article key={channel.id} className="rounded-2xl border border-[#e0e8ed] p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${channel.active ? "bg-[#eaf8f3] text-[#168a65]" : "bg-[#f1f3f5] text-[#8799a6]"}`}><MessageCircleMore size={18} /></span>
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-bold">{channel.countryName} · {channel.label}</h3>{channel.isDefault && <span className="rounded-full bg-[#fff0f1] px-3 py-1 text-xs font-semibold text-[#C32828]">الافتراضي</span>}{channel.active ? <span className="rounded-full bg-[#eaf8f3] px-3 py-1 text-xs font-semibold text-[#167657]">نشط</span> : <span className="rounded-full bg-[#f1f3f5] px-3 py-1 text-xs font-semibold text-[#687b89]">غير مفعّل</span>}</div><p dir="ltr" className="mt-2 text-left text-sm text-[#607686]">{channel.phoneE164}</p><p className={`mt-2 text-xs ${configured === 5 || legacyDefault ? "text-[#168a65]" : "text-[#a36b00]"}`}>{legacyDefault ? "يستخدم إعدادات Vercel الانتقالية" : `${configured} من 5 قوالب مربوطة`}{channel.verifiedAt ? " · تم التحقق" : ""}</p>{channel.verificationError && <p className="mt-2 text-xs text-[#a51f1f]">{channel.verificationError}</p>}</div>
          <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setEditing(editing === channel.id ? null : channel.id)} className={actionClass}>{editing === channel.id ? <X size={15} /> : <Pencil size={15} />}{editing === channel.id ? "إغلاق" : "الإعداد"}</button>{configured === 5 && !channel.verifiedAt && <button type="button" disabled={pending === channel.id} onClick={() => void update(channel.id, { active: true }, "تم التحقق من القناة وتفعيلها.")} className={actionClass}><ShieldCheck size={15} />تحقق وتفعيل</button>}{!channel.isDefault && channel.active && <button type="button" disabled={pending === channel.id} onClick={() => void update(channel.id, { isDefault: true }, "تم تعيين الرقم افتراضيًا.")} className={actionClass}><Star size={15} />جعله افتراضيًا</button>}<button type="button" disabled={pending === channel.id || channel.isDefault || (!channel.active && !channel.verifiedAt)} onClick={() => void update(channel.id, { active: !channel.active })} className={actionClass}><Power size={15} />{channel.active ? "تعطيل" : "تفعيل"}</button></div>
        </div>

        {editing === channel.id && <div className="mt-4 rounded-xl bg-[#f7f9fa] p-4 sm:p-6">
          <form onSubmit={(event) => void saveEdit(event, channel)}>
            <div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-2 block text-xs font-semibold text-[#425d70]">اسم القناة</span><input name="label" required defaultValue={channel.label} className={inputClass} /></label><label><span className="mb-2 block text-xs font-semibold text-[#425d70]">الدولة</span><input name="countryName" required defaultValue={channel.countryName} className={inputClass} /></label><label><span className="mb-2 block text-xs font-semibold text-[#425d70]">رمز الدولة</span><input name="countryCode" required defaultValue={channel.countryCode} minLength={2} maxLength={2} dir="ltr" className={inputClass} /></label><label><span className="mb-2 block text-xs font-semibold text-[#425d70]">رقم واتساب</span><input name="phoneE164" required defaultValue={channel.phoneE164} dir="ltr" className={inputClass} /></label><label className="sm:col-span-2"><span className="mb-2 block text-xs font-semibold text-[#425d70]">Callbell Channel UUID</span><input name="callbellChannelUuid" required defaultValue={channel.callbellChannelUuid} minLength={32} maxLength={32} pattern="[a-fA-F0-9]{32}" dir="ltr" className={inputClass} /></label></div>
            <div className="my-5 h-px bg-[#e2e9ed]" /><TemplateInputs defaults={channel.templates} resources={resources} />
            <button type="submit" disabled={pending === channel.id} className="mt-5 flex h-10 items-center gap-2 rounded-xl bg-[#102f47] px-4 text-sm font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#183f5b] active:scale-[.98] disabled:opacity-50"><Check size={15} />حفظ الإعدادات</button>
          </form>
          {configured === 5 && <div className="mt-5 border-t border-[#e2e9ed] pt-5"><p className="mb-3 text-xs font-semibold text-[#425d70]">اختبار الإرسال</p><div className="flex flex-col gap-2 sm:flex-row"><input value={testPhones[channel.id] ?? ""} onChange={(event) => setTestPhones((current) => ({ ...current, [channel.id]: event.target.value }))} dir="ltr" className={inputClass} placeholder="+491..." /><button type="button" onClick={() => void sendTest(channel)} disabled={pending === `test_${channel.id}`} className={actionClass}>{pending === `test_${channel.id}` ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}إرسال اختبار</button></div></div>}
        </div>}
      </article>;
    })}</div>
  </section>;
}
