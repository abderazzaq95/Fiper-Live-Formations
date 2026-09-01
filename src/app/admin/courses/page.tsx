import Link from "next/link";
import { ArrowLeft, CalendarDays, Plus, Search, UsersRound } from "lucide-react";
import { CourseCardActions } from "@/components/dashboard/course-card-actions";
import { listDashboardCourses } from "@/lib/data/courses";

const statusMap: Record<string, string> = {
  green: "bg-[#eaf8f3] text-[#168a65]",
  amber: "bg-[#fff6df] text-[#a36b00]",
  slate: "bg-[#eef2f4] text-[#617585]",
  red: "bg-[#fff0f1] text-[#C32828]",
};

export default async function CoursesPage() {
  const courses = await listDashboardCourses();
  return (
    <div className="mx-auto max-w-[1450px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-[10px] font-bold text-[#C32828]">إدارة المحتوى</p><h1 className="mt-2 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">الدورات</h1><p className="mt-2 text-xs text-[#788d9c]">أنشئ صفحات الدورات، حدد السعة، وانشر التحديثات مباشرة.</p></div>
        <Link href="/admin/courses/new" className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#C32828] px-5 text-[10px] font-bold text-white"><Plus size={16} /> إنشاء دورة جديدة</Link>
      </div>

      <div className="mt-7 flex flex-col gap-3 rounded-[20px] border border-[#dfe7ec] bg-white p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1"><Search size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8ba0ae]" /><input placeholder="ابحث باسم الدورة..." className="h-11 w-full rounded-xl border border-[#dfe7ec] bg-[#f8fafb] pr-10 pl-4 text-[10px] focus:border-[#9ebfd5] focus:outline-none" /></div>
        <select aria-label="حالة الدورة" className="h-11 rounded-xl border border-[#dfe7ec] bg-[#f8fafb] px-4 text-[10px] text-[#617585]"><option>جميع الحالات</option><option>مفتوح</option><option>مغلق</option><option>مسودة</option><option>مكتمل</option></select>
        <span className="text-[9px] text-[#8ba0ae] sm:px-3"><span className="latin font-bold text-[#102536]">{courses.length}</span> دورات</span>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        {courses.map((course, index) => (
          <article key={course.id} className="group overflow-hidden rounded-[22px] border border-[#dfe7ec] bg-white shadow-[0_12px_35px_rgba(15,42,61,.035)]">
            <div className={`relative h-32 overflow-visible p-5 ${index === 0 ? "bg-[#082943]" : index === 1 ? "bg-[#102d45]" : "bg-[#17374e]"}`}>
              <div className="absolute -left-10 -top-16 h-40 w-40 rounded-full border-[28px] border-white/[0.035]" />
              <div className="absolute bottom-0 right-0 h-16 w-full bg-[linear-gradient(110deg,transparent_20%,rgba(42,134,194,.2)_21%,transparent_22%,transparent_48%,rgba(195,40,40,.15)_49%,transparent_50%)]" />
              <div className="relative flex items-start justify-between"><span className="rounded-full bg-[#fff6df] px-3 py-1.5 text-[8px] font-bold text-[#a36b00]">{course.featured ? "دورة مميزة" : ""}</span><span className={`rounded-full px-3 py-1.5 text-[8px] font-bold ${statusMap[course.tone]}`}>{course.status}</span><CourseCardActions courseId={course.id} registrationOpen={course.registrationOpen} featured={course.featured} variant="menu" /></div>
              <span className="latin absolute bottom-4 left-5 text-[9px] font-semibold text-white/35">FIPER ACADEMY</span>
            </div>
            <div className="p-5">
              <h2 className="min-h-12 text-sm font-bold leading-6">{course.title}</h2>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-xl bg-[#f5f8fa] p-3 text-[9px] text-[#607686]"><CalendarDays size={14} className="text-[#1779b5]" />{course.date}</div>
                <div className="flex items-center gap-2 rounded-xl bg-[#f5f8fa] p-3 text-[9px] text-[#607686]"><UsersRound size={14} className="text-[#1779b5]" /><span className="latin font-bold">{course.registrations}/{course.capacity}</span></div>
              </div>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#e9eff3]"><div className={`h-full rounded-full ${course.registrations >= course.capacity ? "bg-[#e0a11b]" : "bg-[#1779b5]"}`} style={{ width: `${Math.min(100, (course.registrations / course.capacity) * 100)}%` }} /></div>
              <div className="mt-5 flex items-center gap-2 border-t border-[#edf2f5] pt-4">
                <Link href={`/admin/courses/${course.id}`} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#102f47] py-3 text-[9px] font-bold text-white">تعديل الدورة <ArrowLeft size={13} /></Link>
                <CourseCardActions courseId={course.id} registrationOpen={course.registrationOpen} featured={course.featured} variant="quick" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}