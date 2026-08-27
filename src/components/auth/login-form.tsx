"use client";

import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Loader2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ nextPath = "/admin", preview = false, configurationError = false }: { nextPath?: string; preview?: boolean; configurationError?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(configurationError ? "يجب إضافة بيانات Supabase قبل تسجيل الدخول." : "");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      });
      if (authError) throw authError;
      router.replace(nextPath.startsWith("/admin") ? nextPath : "/admin");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error && loginError.message === "supabase_browser_not_configured" ? "الاتصال بنظام الدخول غير مهيأ بعد." : "البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      <label className="block"><span className="mb-2 block text-[10px] font-bold text-[#c9dbea]">البريد الإلكتروني</span><div className="relative"><Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64849b]" /><input name="email" type="email" required dir="ltr" autoComplete="email" placeholder="admin@fiper.me" className="latin h-13 w-full rounded-2xl border border-white/10 bg-[#06233a] pr-11 pl-4 text-right text-sm text-white placeholder:text-[#5f7e95] focus:border-[#3e8ec7] focus:outline-none" /></div></label>
      <label className="block"><span className="mb-2 block text-[10px] font-bold text-[#c9dbea]">كلمة المرور</span><div className="relative"><LockKeyhole size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64849b]" /><input name="password" type={showPassword ? "text" : "password"} required minLength={8} dir="ltr" autoComplete="current-password" className="latin h-13 w-full rounded-2xl border border-white/10 bg-[#06233a] pr-11 pl-12 text-sm text-white focus:border-[#3e8ec7] focus:outline-none" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64849b]" aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>
      <div className="flex items-center justify-between text-[9px]"><label className="flex items-center gap-2 text-[#8ca8bc]"><input type="checkbox" className="accent-[#C32828]" /> تذكرني على هذا الجهاز</label><button type="button" className="font-bold text-[#8dbddd]">نسيت كلمة المرور؟</button></div>
      {error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-[10px] leading-5 text-red-100">{error}</p>}
      <button disabled={pending} className="red-glow flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#C32828] text-xs font-bold text-white transition hover:bg-[#A92121] disabled:opacity-70">{pending ? <Loader2 size={17} className="animate-spin" /> : <ArrowLeft size={17} />}{pending ? "جارٍ التحقق..." : "دخول آمن"}</button>
      {preview && <Link href="/admin" className="flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[10px] font-bold text-[#a9bfce]">الدخول إلى وضع المعاينة</Link>}
      <p className="flex items-center justify-center gap-2 text-[9px] text-[#66869d]"><ShieldCheck size={13} /> وصول مخصص لفريق Fiper فقط</p>
    </form>
  );
}
