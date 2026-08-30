"use client";

import { ArrowLeft, Check, ChevronDown, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type RegistrationFormProps = {
  courseId: string;
  compact?: boolean;
};

type Country = { name: string; dial: string; flag: string };

const countries: Country[] = [
  { name: "السعودية", dial: "+966", flag: "🇸🇦" },
  { name: "الإمارات العربية المتحدة", dial: "+971", flag: "🇦🇪" },
  { name: "قطر", dial: "+974", flag: "🇶🇦" },
  { name: "الكويت", dial: "+965", flag: "🇰🇼" },
  { name: "البحرين", dial: "+973", flag: "🇧🇭" },
  { name: "عُمان", dial: "+968", flag: "🇴🇲" },
  { name: "المغرب", dial: "+212", flag: "🇲🇦" },
  { name: "فرنسا", dial: "+33", flag: "🇫🇷" },
  { name: "ألمانيا", dial: "+49", flag: "🇩🇪" },
  { name: "تركيا", dial: "+90", flag: "🇹🇷" },
  { name: "إسبانيا", dial: "+34", flag: "🇪🇸" },
  { name: "إيطاليا", dial: "+39", flag: "🇮🇹" },
  { name: "المملكة المتحدة", dial: "+44", flag: "🇬🇧" },
  { name: "دولة أخرى", dial: "+", flag: "🌐" },
];

export function RegistrationForm({ courseId, compact = false }: RegistrationFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(countries[0].name);
  const [phoneCode, setPhoneCode] = useState(countries[0].dial);

  function handleCountryChange(value: string) {
    setSelectedCountry(value);
    const country = countries.find((item) => item.name === value);
    if (country) setPhoneCode(country.dial);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const localPhone = String(form.get("phone") ?? "").trim();
    const payload = {
      courseId,
      name: form.get("name"),
      email: form.get("email"),
      phone: `${phoneCode}${localPhone.replace(/^0+/, "")}`,
      country: form.get("country"),
      whatsappConsent: form.get("whatsappConsent") === "on",
      company: form.get("company"),
    };

    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "تعذر إتمام التسجيل.");
      const name = encodeURIComponent(String(payload.name ?? ""));
      router.push(`/confirmation?status=${encodeURIComponent(String(result.status))}&name=${name}&courseId=${encodeURIComponent(courseId)}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "حدث خطأ غير متوقع.");
      setPending(false);
    }
  }

  const inputClass = "h-13 w-full rounded-2xl border border-white/10 bg-[#06233a] px-4 text-sm text-white placeholder:text-[#5f7e95] transition focus:border-[#3e8ec7] focus:bg-[#082943] focus:outline-none";
  const labelClass = "mb-2 block text-xs font-semibold text-[#cfe2f0]";

  return (
    <form onSubmit={handleSubmit} className={compact ? "space-y-4" : "space-y-5"}>
      <div className="sr-only" aria-hidden="true">
        <label htmlFor={`company-${compact}`}>الشركة</label>
        <input id={`company-${compact}`} name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor={`name-${compact}`} className={labelClass}>الاسم الكامل</label>
        <input id={`name-${compact}`} name="name" required minLength={3} autoComplete="name" placeholder="مثال: أحمد التميمي" className={inputClass} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`email-${compact}`} className={labelClass}>البريد الإلكتروني</label>
          <input id={`email-${compact}`} name="email" type="email" required autoComplete="email" dir="ltr" placeholder="name@email.com" className={`${inputClass} latin text-right`} />
        </div>
        <div>
          <label htmlFor={`phone-${compact}`} className={labelClass}>رقم واتساب</label>
          <div className="flex gap-2" dir="ltr">
            <div className="relative w-[116px] shrink-0">
              <select aria-label="رمز الدولة" value={phoneCode} onChange={(event) => { const value = event.target.value; setPhoneCode(value); const country = countries.find((item) => item.dial === value); if (country) setSelectedCountry(country.name); }} className="latin h-13 w-full appearance-none rounded-2xl border border-white/10 bg-[#06233a] pl-8 pr-7 text-transparent [&>option]:text-white focus:border-[#3e8ec7] focus:outline-none">
                {countries.map((country) => <option key={`${country.name}-${country.dial}`} value={country.dial}>{country.flag} {country.dial}</option>)}
              </select>
              <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 flex items-center gap-1.5 text-xs font-semibold text-white"><span className="text-base leading-none">{countries.find((country) => country.dial === phoneCode)?.flag ?? "🌐"}</span><span className="latin">{phoneCode}</span></span>
              <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#8daac1]" />
            </div>
            <input id={`phone-${compact}`} name="phone" type="tel" required minLength={6} autoComplete="tel" inputMode="tel" dir="ltr" placeholder="50 000 0000" className={`${inputClass} latin min-w-0 flex-1 text-right`} />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor={`country-${compact}`} className={labelClass}>الدولة</label>
        <div className="relative">
          <select id={`country-${compact}`} name="country" required value={selectedCountry} onChange={(event) => handleCountryChange(event.target.value)} className={`${inputClass} appearance-none`}>
            {countries.map((country) => <option key={country.name} value={country.name}>{country.flag} {country.name}</option>)}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8daac1]" />
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.025] p-3.5">
        <input name="whatsappConsent" type="checkbox" required className="peer sr-only" />
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-[#54738a] text-transparent transition peer-checked:border-[#C32828] peer-checked:bg-[#C32828] peer-checked:text-white"><Check size={13} strokeWidth={3} /></span>
        <span className="text-[11px] leading-6 text-[#8daac1]">أوافق على استلام تأكيد التسجيل وتذكيرات هذه الدورة عبر واتساب والبريد الإلكتروني.</span>
      </label>

      {error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs leading-6 text-red-100">{error}</p>}

      <button type="submit" disabled={pending} className="red-glow group flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#C32828] px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#A92121] disabled:cursor-wait disabled:opacity-70">
        {pending ? <Loader2 className="animate-spin" size={18} /> : <ArrowLeft size={18} className="transition group-hover:-translate-x-1" />}
        {pending ? "جارٍ تأكيد مقعدك..." : "أكد مقعدك المجاني"}
      </button>

      <div className="flex items-center justify-center gap-2 text-[10px] text-[#6f8ba0]"><ShieldCheck size={14} /><span>بياناتك محمية ولن تستخدم خارج تواصل هذه الدورة</span><LockKeyhole size={11} /></div>
    </form>
  );
}
