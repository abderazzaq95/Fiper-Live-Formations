import type { Metadata } from "next";
import Link from "next/link";
import { FiperLogo } from "@/components/brand/fiper-logo";

export const metadata: Metadata = { title: "سياسة الخصوصية", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return <main className="min-h-screen bg-[#f7f8f8] text-[#071d2f]"><header className="bg-[#031a2d]"><div className="mx-auto flex h-20 max-w-4xl items-center justify-between px-5"><FiperLogo variant="drive" /><Link href="/courses" className="text-sm font-semibold text-white">العودة إلى الدورات</Link></div></header><article className="mx-auto max-w-4xl px-5 py-16"><h1 className="text-balance text-4xl font-bold">سياسة الخصوصية</h1><div className="mt-8 space-y-6 text-pretty text-base leading-8 text-[#526575]"><p>تستخدم Fiper Academy بيانات التسجيل لإدارة مقعدك، وإرسال التأكيد ورابط الحضور والتذكيرات المتعلقة بالدورة التي اخترتها.</p><p>قد تشمل البيانات الاسم والبريد الإلكتروني ورقم واتساب والدولة. لا نستخدم هذه البيانات لتقديم نصيحة استثمارية، ولا نبيعها لأطراف أخرى.</p><p>يمكنك طلب الاستفسار عن بياناتك أو تحديثها عبر البريد <a className="latin font-semibold text-[#c32828] underline" href="mailto:meetings@fiperacademy.com">meetings@fiperacademy.com</a>.</p></div></article></main>;
}
