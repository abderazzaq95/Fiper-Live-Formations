"use client";

import { ArrowLeft, Check, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type RegistrationFormProps = {
  courseId: string;
  compact?: boolean;
};

const countries = ["المغرب", "الإمارات العربية المتحدة", "السعودية", "قطر", "الكويت", "فرنسا", "بلجيكا", "دولة أخرى"];

export function RegistrationForm({ courseId, compact = false }: RegistrationFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      courseId,
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
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
      router.push(`/confirmation?status=${result.status}&name=${name}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "حدث خطأ غير متوقع.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "space-y-4" : "space-y-5"}>
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="company">الشركة</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor={`name-${compact}`} className="mb-2 block text-xs font-semibold text-[#cfe2f0]">الاسم الكامل</label>
        <input
          id={`name-${compact}`}
          name="name"
          required
          minLength={3}
          autoComplete="name"
          placeholder="مثال: محمد العلوي"
          className="h-13 w-full rounded-2xl border border-white/10 bg-[#06233a] px-4 text-sm text-white placeholder:text-[#5f7e95] transition focus:border-[#3e8ec7] focus:bg-[#082943] focus:outline-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`email-${compact}`} className="mb-2 block text-xs font-semibold text-[#cfe2f0]">البريد الإلكتروني</label>
          <input
            id={`email-${compact}`}
            name="email"
            type="email"
            required
            autoComplete="email"
            dir="ltr"
            placeholder="name@email.com"
            className="latin h-13 w-full rounded-2xl border border-white/10 bg-[#06233a] px-4 text-right text-sm text-white placeholder:text-[#5f7e95] transition focus:border-[#3e8ec7] focus:bg-[#082943] focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor={`phone-${compact}`} className="mb-2 block text-xs font-semibold text-[#cfe2f0]">رقم واتساب</label>
          <div className="relative">
            <span className="latin absolute right-4 top-1/2 -translate-y-1/2 border-l border-white/10 pl-3 text-xs font-semibold text-[#b5cadd]">+212</span>
            <input
              id={`phone-${compact}`}
              name="phone"
              type="tel"
              required
              minLength={8}
              autoComplete="tel"
              inputMode="tel"
              dir="ltr"
              placeholder="6 00 00 00 00"
              className="latin h-13 w-full rounded-2xl border border-white/10 bg-[#06233a] pr-18 pl-4 text-right text-sm text-white placeholder:text-[#5f7e95] transition focus:border-[#3e8ec7] focus:bg-[#082943] focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor={`country-${compact}`} className="mb-2 block text-xs font-semibold text-[#cfe2f0]">الدولة</label>
        <select
          id={`country-${compact}`}
          name="country"
          required
          defaultValue="المغرب"
          className="h-13 w-full rounded-2xl border border-white/10 bg-[#06233a] px-4 text-sm text-white transition focus:border-[#3e8ec7] focus:outline-none"
        >
          {countries.map((country) => <option key={country}>{country}</option>)}
        </select>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.025] p-3.5">
        <input name="whatsappConsent" type="checkbox" required className="peer sr-only" />
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-[#54738a] text-transparent transition peer-checked:border-[#C32828] peer-checked:bg-[#C32828] peer-checked:text-white">
          <Check size={13} strokeWidth={3} />
        </span>
        <span className="text-[11px] leading-6 text-[#8daac1]">
          أوافق على استلام تأكيد التسجيل وتذكيرات هذه الدورة عبر واتساب والبريد الإلكتروني.
        </span>
      </label>

      {error && (
        <p role="alert" className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs leading-6 text-red-100">{error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="red-glow group flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#C32828] px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#A92121] disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? <Loader2 className="animate-spin" size={18} /> : <ArrowLeft size={18} className="transition group-hover:-translate-x-1" />}
        {pending ? "جارٍ تأكيد مقعدك..." : "أكد مقعدك المجاني"}
      </button>

      <div className="flex items-center justify-center gap-2 text-[10px] text-[#6f8ba0]">
        <ShieldCheck size={14} />
        <span>بياناتك محمية ولن تستخدم خارج تواصل هذه الدورة</span>
        <LockKeyhole size={11} />
      </div>
    </form>
  );
}
