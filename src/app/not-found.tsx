import Link from "next/link";
import { FiperLogo } from "@/components/brand/fiper-logo";

export default function NotFound() {
  return <main className="flex min-h-screen items-center bg-[#031a2d] px-5 text-white"><div className="mx-auto w-full max-w-3xl text-center"><div className="flex justify-center"><FiperLogo variant="drive" /></div><p className="latin mt-10 text-sm font-bold text-[#ef8b8b]">404</p><h1 className="mt-4 text-balance text-4xl font-bold sm:text-5xl">لم نجد الصفحة التي تبحث عنها</h1><p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-8 text-[#a9bdcb]">قد يكون الرابط قديمًا أو تغير عنوان الصفحة. يمكنك العودة إلى الدورات النشطة واختيار موعد جديد.</p><Link href="/courses" className="mt-8 inline-flex h-12 items-center rounded-xl bg-[#c32828] px-3 text-base font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#a92121] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">عرض الدورات المتاحة</Link></div></main>;
}
