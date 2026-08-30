import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { FiperLogo } from "@/components/brand/fiper-logo";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Get Access", robots: { index: false, follow: false } };

export default function GetAccessPage() {
  return (
    <main className="noise-grid min-h-screen bg-[#031a2d] px-5 py-10 sm:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center">
        <FiperLogo />
        <div className="mt-10 rounded-[28px] border border-white/10 bg-[#06233a]/90 p-6 shadow-2xl shadow-black/20 sm:p-8">
          <div className="flex items-center gap-3 text-[#C32828]"><ShieldCheck size={20} /><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8dbddd]">Dashboard access</span></div>
          <h1 className="mt-5 text-3xl font-extrabold tracking-[-0.04em] text-white">Create your Admin account</h1>
          <p className="mt-3 text-xs leading-6 text-[#7896ac]">Use this private Get Access link to create your Fiper dashboard account.</p>
          <SignupForm />
        </div>
        <Link href="/" className="mt-6 flex items-center justify-center gap-2 text-[10px] text-[#66869d] hover:text-white"><ArrowRight size={14} /> Back to Fiper Academy</Link>
      </div>
    </main>
  );
}