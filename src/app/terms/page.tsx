import type { Metadata } from "next";
import Link from "next/link";
import { FiperLogo } from "@/components/brand/fiper-logo";

export const metadata: Metadata = { title: "الشروط والأحكام", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return <main className="min-h-screen bg-[#f7f8f8] text-[#071d2f]"><header className="bg-[#031a2d]"><div className="mx-auto flex h-20 max-w-4xl items-center justify-between px-5"><FiperLogo variant="drive" /><Link href="/courses" className="text-sm font-semibold text-white">العودة إلى الدورات</Link></div></header><article className="mx-auto max-w-4xl px-5 py-16"><h1 className="text-balance text-4xl font-bold">الشروط والأحكام</h1><div className="mt-8 space-y-6 text-pretty text-base leading-8 text-[#526575]"><p>تقدّم Fiper Academy محتوى تعليميًا عامًا. لا يمثل المحتوى نصيحة استثمارية أو توصية بشراء أو بيع أي أداة مالية.</p><p>ينطوي التداول على مخاطر، وتبقى قراراتك ومسؤولية تقييم ملاءمة أي نشاط مالي لك مسؤوليتك الشخصية.</p><p>قد تتغير مواعيد الجلسات عند الضرورة. في هذه الحالة نستخدم بيانات التسجيل لإرسال التحديثات إلى المشاركين.</p></div></article></main>;
}
