"use client";

import { ArrowLeft, Check, ChevronDown, Loader2, LockKeyhole, Search, ShieldCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type RegistrationFormProps = {
  courseId: string;
  compact?: boolean;
};

type Country = { name: string; dial: string; flag: string };

const featuredCountries: Country[] = [
  { name: "العراق", dial: "+964", flag: "🇮🇶" },
  { name: "السعودية", dial: "+966", flag: "🇸🇦" },
  { name: "الإمارات العربية المتحدة", dial: "+971", flag: "🇦🇪" },
  { name: "قطر", dial: "+974", flag: "🇶🇦" },
  { name: "الكويت", dial: "+965", flag: "🇰🇼" },
  { name: "البحرين", dial: "+973", flag: "🇧🇭" },
  { name: "عُمان", dial: "+968", flag: "🇴🇲" },
  { name: "المغرب", dial: "+212", flag: "🇲🇦" },
  { name: "تركيا", dial: "+90", flag: "🇹🇷" },
];

const moreCountries: Country[] = [
  { name: "الأردن", dial: "+962", flag: "🇯🇴" },
  { name: "لبنان", dial: "+961", flag: "🇱🇧" },
  { name: "مصر", dial: "+20", flag: "🇪🇬" },
  { name: "فلسطين", dial: "+970", flag: "🇵🇸" },
  { name: "سوريا", dial: "+963", flag: "🇸🇾" },
  { name: "اليمن", dial: "+967", flag: "🇾🇪" },
  { name: "تونس", dial: "+216", flag: "🇹🇳" },
  { name: "الجزائر", dial: "+213", flag: "🇩🇿" },
  { name: "ليبيا", dial: "+218", flag: "🇱🇾" },
  { name: "السودان", dial: "+249", flag: "🇸🇩" },
  { name: "موريتانيا", dial: "+222", flag: "🇲🇷" },
  { name: "ألمانيا", dial: "+49", flag: "🇩🇪" },
  { name: "فرنسا", dial: "+33", flag: "🇫🇷" },
  { name: "المملكة المتحدة", dial: "+44", flag: "🇬🇧" },
  { name: "هولندا", dial: "+31", flag: "🇳🇱" },
  { name: "بلجيكا", dial: "+32", flag: "🇧🇪" },
  { name: "سويسرا", dial: "+41", flag: "🇨🇭" },
  { name: "النمسا", dial: "+43", flag: "🇦🇹" },
  { name: "إسبانيا", dial: "+34", flag: "🇪🇸" },
  { name: "إيطاليا", dial: "+39", flag: "🇮🇹" },
  { name: "البرتغال", dial: "+351", flag: "🇵🇹" },
  { name: "اليونان", dial: "+30", flag: "🇬🇷" },
  { name: "السويد", dial: "+46", flag: "🇸🇪" },
  { name: "النرويج", dial: "+47", flag: "🇳🇴" },
  { name: "الدنمارك", dial: "+45", flag: "🇩🇰" },
  { name: "إيرلندا", dial: "+353", flag: "🇮🇪" },
  { name: "بولندا", dial: "+48", flag: "🇵🇱" },
  { name: "رومانيا", dial: "+40", flag: "🇷🇴" },
  { name: "الولايات المتحدة", dial: "+1", flag: "🇺🇸" },
  { name: "كندا", dial: "+1", flag: "🇨🇦" },
  { name: "المكسيك", dial: "+52", flag: "🇲🇽" },
  { name: "البرازيل", dial: "+55", flag: "🇧🇷" },
  { name: "الأرجنتين", dial: "+54", flag: "🇦🇷" },
  { name: "أستراليا", dial: "+61", flag: "🇦🇺" },
  { name: "الهند", dial: "+91", flag: "🇮🇳" },
  { name: "باكستان", dial: "+92", flag: "🇵🇰" },
  { name: "بنغلاديش", dial: "+880", flag: "🇧🇩" },
  { name: "إندونيسيا", dial: "+62", flag: "🇮🇩" },
  { name: "ماليزيا", dial: "+60", flag: "🇲🇾" },
  { name: "الصين", dial: "+86", flag: "🇨🇳" },
  { name: "اليابان", dial: "+81", flag: "🇯🇵" },
  { name: "كوريا الجنوبية", dial: "+82", flag: "🇰🇷" },
  { name: "إيران", dial: "+98", flag: "🇮🇷" },
  { name: "روسيا", dial: "+7", flag: "🇷🇺" },
  { name: "أوكرانيا", dial: "+380", flag: "🇺🇦" },
  { name: "جنوب أفريقيا", dial: "+27", flag: "🇿🇦" },
  { name: "نيجيريا", dial: "+234", flag: "🇳🇬" },
];

const otherCountry = { name: "دولة أخرى", dial: "+", flag: "🌐" };
const allCountries = [...featuredCountries, ...moreCountries];

export function RegistrationForm({ courseId, compact = false }: RegistrationFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(featuredCountries[0].name);
  const [phoneCode, setPhoneCode] = useState(featuredCountries[0].dial);
  const [countryDialogOpen, setCountryDialogOpen] = useState(false);
  const [countryQuery, setCountryQuery] = useState("");
  const countrySelectRef = useRef<HTMLSelectElement>(null);
  const selectedCountryData = allCountries.find((item) => item.name === selectedCountry);
  const selectedIsAdditional = Boolean(selectedCountryData && !featuredCountries.some((item) => item.name === selectedCountry));
  const compactCountries = selectedIsAdditional && selectedCountryData ? [...featuredCountries, selectedCountryData] : featuredCountries;
  const filteredCountries = useMemo(() => {
    const query = countryQuery.trim().toLocaleLowerCase("ar");
    if (!query) return moreCountries;
    return moreCountries.filter((country) => `${country.name} ${country.dial}`.toLocaleLowerCase("ar").includes(query));
  }, [countryQuery]);

  useEffect(() => {
    if (!countryDialogOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCountryDialogOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [countryDialogOpen]);

  function handleCountryChange(value: string) {
    if (value === otherCountry.name) {
      setCountryQuery("");
      setCountryDialogOpen(true);
      return;
    }
    setSelectedCountry(value);
    const country = allCountries.find((item) => item.name === value);
    if (country) setPhoneCode(country.dial);
  }

  function selectAdditionalCountry(country: Country) {
    setSelectedCountry(country.name);
    setPhoneCode(country.dial);
    setCountryDialogOpen(false);
    window.setTimeout(() => countrySelectRef.current?.focus(), 0);
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
    <>
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
              <select aria-label="رمز الدولة" value={phoneCode} onChange={(event) => { const value = event.target.value; setPhoneCode(value); const country = compactCountries.find((item) => item.dial === value); if (country) setSelectedCountry(country.name); }} className="latin h-13 w-full appearance-none rounded-2xl border border-white/10 bg-[#06233a] pl-8 pr-7 text-transparent [&>option]:text-white focus:border-[#3e8ec7] focus:outline-none">
                {compactCountries.map((country) => <option key={`${country.name}-${country.dial}`} value={country.dial}>{country.flag} {country.dial}</option>)}
              </select>
              <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 flex items-center gap-1.5 text-xs font-semibold text-white"><span className="text-base leading-none">{selectedCountryData?.flag ?? "🌐"}</span><span className="latin">{phoneCode}</span></span>
              <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#8daac1]" />
            </div>
            <input id={`phone-${compact}`} name="phone" type="tel" required minLength={6} autoComplete="tel" inputMode="tel" dir="ltr" placeholder="770 000 0000" className={`${inputClass} latin min-w-0 flex-1 text-right`} />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor={`country-${compact}`} className={labelClass}>الدولة</label>
        <div className="relative">
          <select ref={countrySelectRef} id={`country-${compact}`} name="country" required value={selectedCountry} onChange={(event) => handleCountryChange(event.target.value)} className={`${inputClass} appearance-none`}>
            {compactCountries.map((country) => <option key={country.name} value={country.name}>{country.flag} {country.name}</option>)}
            <option value={otherCountry.name}>{otherCountry.flag} {otherCountry.name}</option>
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
    {countryDialogOpen && <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#020f1a]/80 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="presentation" onMouseDown={() => setCountryDialogOpen(false)}>
      <section role="dialog" aria-modal="true" aria-labelledby={`country-dialog-title-${compact}`} className="max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-t-3xl border border-white/10 bg-[#06233a] shadow-[0_30px_100px_rgba(0,0,0,.45)] sm:rounded-3xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-5 border-b border-white/10 p-5 sm:p-6">
          <div><h2 id={`country-dialog-title-${compact}`} className="text-base font-bold text-white">اختر دولتك</h2><p className="mt-2 text-xs leading-6 text-[#8daac1]">ابحث بالاسم أو برمز الاتصال الدولي.</p></div>
          <button type="button" onClick={() => setCountryDialogOpen(false)} aria-label="إغلاق قائمة الدول" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-[#9bb4c7] transition hover:bg-white/5 hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-5 sm:p-6">
          <div className="relative"><Search size={17} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7896ab]" /><input autoFocus value={countryQuery} onChange={(event) => setCountryQuery(event.target.value)} placeholder="ابحث عن دولة..." className="h-12 w-full rounded-xl border border-white/10 bg-[#031a2d] pr-11 pl-4 text-sm text-white placeholder:text-[#5f7e95] focus:border-[#3e8ec7] focus:outline-none" /></div>
          <div className="mt-4 max-h-[52vh] overflow-y-auto rounded-xl border border-white/10 scrollbar-thin">
            {filteredCountries.length ? filteredCountries.map((country) => <button key={country.name} type="button" onClick={() => selectAdditionalCountry(country)} className="flex w-full items-center gap-3 border-b border-white/8 px-4 py-3 text-right text-sm text-white transition last:border-0 hover:bg-white/5 focus:bg-white/5">
              <span className="text-xl" aria-hidden="true">{country.flag}</span><span className="font-semibold">{country.name}</span><span className="latin mr-auto text-xs text-[#8daac1]">{country.dial}</span>
            </button>) : <p className="px-5 py-10 text-center text-sm text-[#8daac1]">لم نعثر على دولة مطابقة.</p>}
          </div>
        </div>
      </section>
    </div>}
    </>
  );
}
