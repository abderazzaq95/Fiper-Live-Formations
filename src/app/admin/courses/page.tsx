import Link from "next/link";
import { Plus } from "lucide-react";
import { CoursesBrowser } from "@/components/dashboard/courses-browser";
import { listDashboardCourses } from "@/lib/data/courses";

export default async function CoursesPage() {
  const courses = await listDashboardCourses();
  return (
    <div className="mx-auto max-w-[1450px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-[12px] font-bold text-[#c2182b]">إدارة المحتوى</p><h1 className="mt-2 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">الدورات</h1><p className="mt-2 text-xs text-[#64748b]">أنشئ صفحات الدورات، حدد السعة، وانشر التحديثات مباشرة.</p></div>
        <Link href="/admin/courses/new" className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#c2182b] px-5 text-[12px] font-bold text-white"><Plus size={16} /> إنشاء دورة جديدة</Link>
      </div>

      <CoursesBrowser courses={courses} />
    </div>
  );
}