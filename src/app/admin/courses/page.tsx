import Link from "next/link";
import { ArrowLeft, CalendarDays, Plus, Search, UsersRound } from "lucide-react";
import { CourseCardActions } from "@/components/dashboard/course-card-actions";
import { listDashboardCourses } from "@/lib/data/courses";

const statusMap: Record<string, string> = {
  green: "bg-[var(--adm-good-soft)] text-[var(--adm-good)]",
  amber: "bg-[var(--adm-mid-soft)] text-[var(--adm-mid-ink)]",
  slate: "bg-[var(--adm-sunken)] text-[var(--adm-ink-3)]",
  red: "bg-[var(--adm-brand-soft)] text-[var(--adm-brand)]",
};

export default async function CoursesPage() {
  const courses = await listDashboardCourses();
  return (
    <div className="mx-auto max-w-[1450px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-[12px] font-bold text-[var(--adm-brand)]">إدارة المحتوى</p><h1 className="mt-2 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">الدورات</h1><p className="mt-2 text-xs text-[var(--adm-ink-4)]">أنشئ صفحات الدورات، حدد السعة، وانشر التحديثات مباشرة.</p></div>
        <Link href="/admin/courses/new" className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[var(--adm-brand)] px-5 text-[12px] font-bold text-white"><Plus size={16} /> إنشاء دورة جديدة</Link>
      </div>

      <div className="mt-7 flex flex-col gap-3 rounded-[12px] border border-[var(--adm-line)] bg-[var(--adm-panel)] shadow-[0_1px_2px_rgba(15,23,42,.05)] p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1"><Search size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--adm-ink-4)]" /><input placeholder="ابحث باسم الدورة..." className="h-11 w-full rounded-lg border border-[var(--adm-line)] bg-[var(--adm-panel-2)] pr-10 pl-4 text-[12px] focus:border-[var(--adm-focus-line)] focus:outline-none" /></div>
        <select aria-label="حالة الدورة" className="h-11 rounded-lg border border-[var(--adm-line)] bg-[var(--adm-panel-2)] px-4 text-[12px] text-[var(--adm-ink-3)]"><option>جميع الحالات</option><option>مفتوح</option><option>مغلق</option><option>مسودة</option><option>مكتمل</option></select>
        <span className="text-[11.5px] text-[var(--adm-ink-4)] sm:px-3"><span className="latin font-bold text-[var(--adm-ink)]">{courses.length}</span> دورات</span>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        {courses.map((course, index) => (
          <article key={course.id} className="group overflow-hidden rounded-[12px] border border-[var(--adm-line)] bg-[var(--adm-panel)] shadow-[0_1px_2px_rgba(15,23,42,.05)]">
            <div className={`relative h-32 overflow-visible p-5 ${index === 0 ? "bg-[var(--adm-deep-1)]" : index === 1 ? "bg-[var(--adm-deep-2)]" : "bg-[var(--adm-deep-3)]"}`}>
              <div className="absolute -left-10 -top-16 h-40 w-40 rounded-full border-[28px] border-white/[0.035]" />
              <div className="absolute bottom-0 right-0 h-16 w-full bg-[linear-gradient(110deg,transparent_20%,rgba(42,134,194,.2)_21%,transparent_22%,transparent_48%,rgba(195,40,40,.15)_49%,transparent_50%)]" />
              <div className="relative flex items-start justify-between"><span className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${statusMap[course.tone]}`}>{course.status}</span><CourseCardActions courseId={course.id} courseSlug={course.slug} registrationOpen={course.registrationOpen} featured={course.featured} courseTitle={course.title} variant="menu" /></div>
              <span className="latin absolute bottom-4 left-5 text-[11.5px] font-semibold text-white/35">FIPER ACADEMY</span>
            </div>
            <div className="p-5">
              <Link href={`/admin/courses/${course.id}`} aria-label={`تعديل ${course.title}`} className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[var(--adm-blue)]">
              <h2 className="min-h-12 text-sm font-bold leading-6">{course.title}</h2>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-lg bg-[var(--adm-panel-2)] p-3 text-[11.5px] text-[var(--adm-ink-3)]"><CalendarDays size={14} className="text-[var(--adm-blue)]" />{course.date}</div>
                <div className="flex items-center gap-2 rounded-lg bg-[var(--adm-panel-2)] p-3 text-[11.5px] text-[var(--adm-ink-3)]"><UsersRound size={14} className="text-[var(--adm-blue)]" /><span className="latin font-bold">{course.registrations}/{course.capacity}</span></div>
              </div>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[var(--adm-sunken)]"><div className={`h-full rounded-full ${course.registrations >= course.capacity ? "bg-[var(--adm-mid)]" : "bg-[var(--adm-blue)]"}`} style={{ width: `${Math.min(100, (course.registrations / course.capacity) * 100)}%` }} /></div>
              </Link>
              <div className="mt-5 flex items-center gap-2 border-t border-[var(--adm-sunken)] pt-4">
                <Link href={`/admin/courses/${course.id}`} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--adm-strong)] py-3 text-[11.5px] font-bold text-white">تعديل الدورة <ArrowLeft size={13} /></Link>
                <CourseCardActions courseId={course.id} courseSlug={course.slug} registrationOpen={course.registrationOpen} featured={course.featured} courseTitle={course.title} variant="quick" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}