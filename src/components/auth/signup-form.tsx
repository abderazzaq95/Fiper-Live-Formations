"use client";

import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Loader2, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignupForm({ nextPath = "/admin" }: { nextPath?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");
    if (password !== confirmation) {
      setError("Password confirmation does not match.");
      setPending(false);
      return;
    }
    try {
      const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name"), email, password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Unable to create the account.");
      const { error: loginError } = await createClient().auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;
      router.replace(nextPath.startsWith("/admin") ? nextPath : "/admin");
      router.refresh();
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : "Unable to create the account right now.");
      setPending(false);
    }
  }

  const inputClass = "h-13 w-full rounded-2xl border border-white/10 bg-[#06233a] px-4 text-sm text-white placeholder:text-[#5f7e95] transition focus:border-[#3e8ec7] focus:bg-[#082943] focus:outline-none";
  const labelClass = "mb-2 block text-[10px] font-bold text-[#c9dbea]";

  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      <label className="block"><span className={labelClass}>Full name</span><div className="relative"><UserRound size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64849b]" /><input name="name" required minLength={3} autoComplete="name" placeholder="Ahmed Al-Tamimi" className={`${inputClass} pr-11`} /></div></label>
      <label className="block"><span className={labelClass}>Email</span><div className="relative"><Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64849b]" /><input name="email" type="email" required dir="ltr" autoComplete="email" placeholder="admin@fiper.me" className={`${inputClass} latin pr-11 text-right`} /></div></label>
      <label className="block"><span className={labelClass}>Password</span><div className="relative"><LockKeyhole size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64849b]" /><input name="password" type={showPassword ? "text" : "password"} required minLength={8} autoComplete="new-password" className={`${inputClass} latin pr-11 pl-12`} /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64849b]" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>
      <label className="block"><span className={labelClass}>Confirm password</span><input name="confirmation" type="password" required minLength={8} autoComplete="new-password" className={`${inputClass} latin`} /></label>
      {error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-[10px] leading-5 text-red-100">{error}</p>}
      <button disabled={pending} className="red-glow flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#C32828] text-xs font-bold text-white transition hover:bg-[#A92121] disabled:opacity-70">{pending ? <Loader2 size={17} className="animate-spin" /> : <ArrowLeft size={17} />}{pending ? "Creating account..." : "Create Admin account"}</button>
      <p className="flex items-center justify-center gap-2 text-[9px] text-[#66869d]"><ShieldCheck size={13} /> Every account created through Get Access is an Admin</p>
      <Link href="/login" className="block text-center text-[10px] font-semibold text-[#8dbddd] hover:text-white">Already have an account? Sign in</Link>
    </form>
  );
}