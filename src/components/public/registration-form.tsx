"use client";

import { ArrowLeft, Check, ChevronDown, Loader2, LockKeyhole, Search, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type RegistrationFormProps = {
  courseId: string;
  compact?: boolean;
};

type Country = { name: string; dial: string; flag: string };

const countries: Country[] = [
  { name: "العراق", dial: "+964", flag: "🇮🇶" },
  { name: "السعودية", dial: "+966", flag: "🇸🇦" },
  { name: "الإمارات العربية المتحدة", dial: "+971", flag: "🇦🇪" },
  { name: "قطر", dial: "+974", flag: "🇶🇦" },
  { name: "الكويت", dial: "+965", flag: "🇰🇼" },
  { name: "البحرين", dial: "+973", flag: "🇧🇭" },
  { name: "عُمان", dial: "+968", flag: "🇴🇲" },
  { name: "المغرب", dial: "+212", flag: "🇲🇦" },
  { name: "تركيا", dial: "+90", flag: "🇹🇷" },
  { name: "دولة أخرى", dial: "+", flag: "🌐" },
];

const previewCountries: Country[] = [
  ...countries.slice(0, -1),
  { name: "الأردن", dial: "+962", flag: "🇯🇴" },
  { name: "لبنان", dial: "+961", flag: "🇱🇧" },
  { name: "مصر", dial: "+20", flag: "🇪🇬" },
  { name: "سوريا", dial: "+963", flag: "🇸🇾" },
  { name: "فلسطين", dial: "+970", flag: "🇵🇸" },
  { name: "تونس", dial: "+216", flag: "🇹🇳" },
  { name: "الجزائر", dial: "+213", flag: "🇩🇿" },
  { name: "ليبيا", dial: "+218", flag: "🇱🇾" },
  { name: "اليمن", dial: "+967", flag: "🇾🇪" },
  { name: "السودان", dial: "+249", flag: "🇸🇩" },
  { name: "ألمانيا", dial: "+49", flag: "🇩🇪" },
  { name: "النمسا", dial: "+43", flag: "🇦🇹" },
  { name: "سويسرا", dial: "+41", flag: "🇨🇭" },
  { name: "فرنسا", dial: "+33", flag: "🇫🇷" },
  { name: "هولندا", dial: "+31", flag: "🇳🇱" },
  { name: "بلجيكا", dial: "+32", flag: "🇧🇪" },
  { name: "المملكة المتحدة", dial: "+44", flag: "🇬🇧" },
  { name: "إيطاليا", dial: "+39", flag: "🇮🇹" },
  { name: "إسبانيا", dial: "+34", flag: "🇪🇸" },
  { name: "البرتغال", dial: "+351", flag: "🇵🇹" },
  { name: "السويد", dial: "+46", flag: "🇸🇪" },
  { name: "النرويج", dial: "+47", flag: "🇳🇴" },
  { name: "الدنمارك", dial: "+45", flag: "🇩🇰" },
  { name: "فنلندا", dial: "+358", flag: "🇫🇮" },
  { name: "بولندا", dial: "+48", flag: "🇵🇱" },
  { name: "اليونان", dial: "+30", flag: "🇬🇷" },
  { name: "رومانيا", dial: "+40", flag: "🇷🇴" },
  { name: "أوكرانيا", dial: "+380", flag: "🇺🇦" },
  { name: "الولايات المتحدة", dial: "+1", flag: "🇺🇸" },
  { name: "كندا", dial: "+1", flag: "🇨🇦" },
  { name: "أستراليا", dial: "+61", flag: "🇦🇺" },
  { name: "نيوزيلندا", dial: "+64", flag: "🇳🇿" },
  { name: "الهند", dial: "+91", flag: "🇮🇳" },
  { name: "باكستان", dial: "+92", flag: "🇵🇰" },
  { name: "بنغلاديش", dial: "+880", flag: "🇧🇩" },
  { name: "الصين", dial: "+86", flag: "🇨🇳" },
  { name: "اليابان", dial: "+81", flag: "🇯🇵" },
  { name: "كوريا الجنوبية", dial: "+82", flag: "🇰🇷" },
  { name: "إندونيسيا", dial: "+62", flag: "🇮🇩" },
  { name: "ماليزيا", dial: "+60", flag: "🇲🇾" },
  { name: "سنغافورة", dial: "+65", flag: "🇸🇬" },
  { name: "تايلاند", dial: "+66", flag: "🇹🇭" },
  { name: "الفلبين", dial: "+63", flag: "🇵🇭" },
  { name: "إيران", dial: "+98", flag: "🇮🇷" },
  { name: "أفغانستان", dial: "+93", flag: "🇦🇫" },
  { name: "جنوب أفريقيا", dial: "+27", flag: "🇿🇦" },
  { name: "نيجيريا", dial: "+234", flag: "🇳🇬" },
  countries[countries.length - 1],
];

export function RegistrationForm({ courseId, compact = false }: RegistrationFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(countries[0].name);
  const [phoneCode, setPhoneCode] = useState(countries[0].dial);
  const [phonePickerOpen, setPhonePickerOpen] = useState(false);
  const [phoneSearch, setPhoneSearch] = useState("");
  const phonePickerRef = useRef<HTMLDivElement>(null);
  const availableCountries = compact ? previewCountries : countries;
  const filteredPhoneCountries = useMemo(() => {
    const query = phoneSearch.trim().toLocaleLowerCase("ar");
    if (!query) return availableCountries;
    return availableCountries.filter((country) => `${country.name} ${country.dial}`.toLocaleLowerCase("ar").includes(query));
  }, [availableCountries, phoneSearch]);

  useEffect(() => {
    if (!compact || !phonePickerOpen) return;
    function closePicker(event: MouseEvent) {
      if (!phonePickerRef.current?.contains(event.target as Node)) setPhonePickerOpen(false);
    }
    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setPhonePickerOpen(false);
    }
    document.addEventListener("mousedown", closePicker);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("mousedown", closePicker);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [compact, phonePickerOpen]);

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

      <div className={compact ? "grid gap-4" : "grid gap-4 sm:grid-cols-2"}>
        <div>
          <label htmlFor={`email-${compact}`} className={labelClass}>البريد الإلكتروني</label>
          <input id={`email-${compact}`} name="email" type="email" required autoComplete="email" dir="ltr" placeholder="name@email.com" className={`${inputClass} latin text-right`} />
        </div>
        <div>
          <label htmlFor={`phone-${compact}`} className={labelClass}>رقم واتساب</label>
          <div className="flex gap-2" dir="ltr">
            {compact ? <div ref={phonePickerRef} className="relative w-40 shrink-0">
              <button type="button" aria-label="اختيار رمز الدولة" aria-haspopup="listbox" aria-expanded={phonePickerOpen} onClick={() => setPhonePickerOpen((open) => !open)} className="flex h-13 w-full items-center justify-between rounded border border-[#d7d7d7] bg-white px-3 text-sm text-[#333] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] focus:border-[#C32828] focus:outline-none">
                <span className="flex items-center gap-2"><span>{availableCountries.find((country) => country.name === selectedCountry)?.flag ?? "🌐"}</span><span className="latin font-semibold">{phoneCode}</span></span>
                <ChevronDown size={14} className={`transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${phonePickerOpen ? "rotate-180" : ""}`} />
              </button>
              {phonePickerOpen ? <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-72 overflow-hidden rounded-lg border border-[#d7d7d7] bg-white p-2 text-right shadow-[0_20px_50px_rgba(7,29,47,.18)]" dir="rtl">
                <div className="relative mb-2">
                  <Search size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7a838b]" />
                  <input type="search" value={phoneSearch} onChange={(event) => setPhoneSearch(event.target.value)} placeholder="ابحث عن دولة أو رمز" autoFocus className="h-11 w-full rounded border border-[#d7d7d7] bg-white pr-9 pl-3 text-sm text-[#333] outline-none focus:border-[#C32828]" />
                </div>
                <div role="listbox" aria-label="رموز الاتصال الدولية" className="max-h-64 overflow-y-auto overscroll-contain">
                  {filteredPhoneCountries.length ? filteredPhoneCountries.map((country) => <button key={`${country.name}-${country.dial}`} type="button" role="option" aria-selected={country.name === selectedCountry} onClick={() => { setPhoneCode(country.dial); setSelectedCountry(country.name); setPhonePickerOpen(false); setPhoneSearch(""); }} className={`flex w-full items-center justify-between rounded px-3 py-2 text-sm transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#f4f4f4] ${country.name === selectedCountry ? "bg-[#fbe9ea] text-[#C32828]" : "text-[#333]"}`}>
                    <span className="flex items-center gap-2"><span>{country.flag}</span><span>{country.name}</span></span><span className="latin" dir="ltr">{country.dial}</span>
                  </button>) : <p className="px-3 py-6 text-center text-sm text-[#6b7280]">لا توجد نتيجة مطابقة</p>}
                </div>
              </div> : null}
            </div> : <div className="relative w-[116px] shrink-0">
              <select aria-label="رمز الدولة" value={phoneCode} onChange={(event) => { const value = event.target.value; setPhoneCode(value); const country = countries.find((item) => item.dial === value); if (country) setSelectedCountry(country.name); }} className="latin h-13 w-full appearance-none rounded-2xl border border-white/10 bg-[#06233a] pl-8 pr-7 text-transparent [&>option]:text-white focus:border-[#3e8ec7] focus:outline-none">
                {countries.map((country) => <option key={`${country.name}-${country.dial}`} value={country.dial}>{country.flag} {country.dial}</option>)}
              </select>
              <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 flex items-center gap-1.5 text-xs font-semibold text-white"><span className="text-base leading-none">{countries.find((country) => country.dial === phoneCode)?.flag ?? "🌐"}</span><span className="latin">{phoneCode}</span></span>
              <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#8daac1]" />
            </div>}
            <input id={`phone-${compact}`} name="phone" type="tel" required minLength={6} autoComplete="tel" inputMode="tel" dir="ltr" placeholder="770 000 0000" className={`${inputClass} latin min-w-0 flex-1 text-right`} />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor={`country-${compact}`} className={labelClass}>الدولة</label>
        <div className="relative">
          <select id={`country-${compact}`} name="country" required value={selectedCountry} onChange={(event) => handleCountryChange(event.target.value)} className={`${inputClass} appearance-none`}>
            {availableCountries.map((country) => <option key={country.name} value={country.name}>{country.flag} {country.name}</option>)}
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
