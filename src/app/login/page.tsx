import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ArrowRight, LockKeyhole, ShieldCheck, UserPlus } from "lucide-react";
import { FiperLogo } from "@/components/brand/fiper-logo";
import { LoginForm } from "@/components/auth/login-form";
import { isAdminPreview } from "@/lib/auth";

export const metadata: Metadata = { title: "دخول لوحة التحكم", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const nextPath = typeof params.next === "string" ? params.next : "/admin";
  const configurationError = params.error === "configuration";

  return (
    <main className="noise-grid grid min-h-screen bg-[#031a2d] lg:grid-cols-[1.08fr_.92fr]">
      <section className="relative hidden overflow-hidden border-l border-white/8 p-12 lg:flex lg:flex-col">
        <FiperLogo />
        <div className="my-auto max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#62d5aa]/15 bg-[#62d5aa]/8 px-4 py-2 text-[10px] font-bold text-[#62d5aa]"><span className="h-2 w-2 rounded-full bg-[#62d5aa]" /> منصة العمليات متاحة</span>
          <h1 className="mt-8 text-5xl font-extrabold leading-[1.35] tracking-[-0.055em] text-white">كل دورة.<br />كل مشارك.<br /><span className="text-[#86bddd]">في مكان واحد.</span></h1>
          <p className="mt-6 max-w-md text-sm leading-8 text-[#8ca8bc]">لوحة تشغيل آمنة لإدارة تجربة Fiper Academy من النشر إلى الحضور والمتابعة.</p>
          <div className="mt-10 grid max-w-md grid-cols-2 gap-3"><div className="glass rounded-2xl p-4"><Activity size={18} className="text-[#C32828]" /><p className="mt-4 text-[9px] text-[#7696ad]">متابعة مباشرة</p><strong className="mt-1 block text-xs">التسجيل والتواصل</strong></div><div className="glass rounded-2xl p-4"><ShieldCheck size={18} className="text-[#62d5aa]" /><p className="mt-4 text-[9px] text-[#7696ad]">صلاحيات محكمة</p><strong className="mt-1 block text-xs latin">ADMIN / USER</strong></div></div>
        </div>
        <p className="latin text-[9px] text-[#4f7189]">FIPER ACADEMY · SECURE OPERATIONS</p>
      </section>
      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden"><FiperLogo /></div>
          <span className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#0d3554] text-[#C32828]"><LockKeyhole size={24} /></span>
          <h2 className="mt-7 text-3xl font-extrabold tracking-[-0.045em] text-white">مرحباً بعودتك</h2>
          <p className="mt-3 text-xs leading-6 text-[#7896ac]">استخدم حساب Fiper المصرح له للوصول إلى لوحة التحكم.</p>
          <LoginForm nextPath={nextPath} preview={isAdminPreview()} configurationError={configurationError} />
          <Link href={`/get-access${nextPath !== "/admin" ? `?next=${encodeURIComponent(nextPath)}` : ""}`} className="group relative mt-6 flex min-h-14 items-center justify-center gap-3 overflow-hidden rounded-2xl border border-[#C32828]/60 bg-gradient-to-r from-[#C32828]/20 via-[#C32828]/10 to-[#0d3554] px-5 text-xs font-extrabold text-white shadow-[0_12px_30px_rgba(195,40,40,.14)] transition hover:-translate-y-0.5 hover:border-[#f06b6b] hover:from-[#C32828]/35 hover:to-[#12476e] hover:shadow-[0_16px_36px_rgba(195,40,40,.24)]"><span className="absolute inset-y-0 right-0 w-1/3 bg-[#C32828]/10 blur-2xl transition group-hover:bg-[#C32828]/20" /><UserPlus size={18} className="relative text-[#ff8d8d]" /><span className="relative">Get Access <span className="mx-1 text-[#9cb6c8]">·</span> Create Admin account</span><ArrowRight size={16} className="relative text-[#ff8d8d] transition group-hover:-translate-x-1" /></Link>
        </div>
      </section>
    </main>
  );
}
