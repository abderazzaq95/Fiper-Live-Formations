import { CourseEditor } from "@/components/dashboard/course-editor";
import { getCourseEditorData } from "@/lib/data/courses";
import { listActiveWhatsAppChannelOptions } from "@/lib/data/whatsapp-channels";
import { requireDashboardIdentity } from "@/lib/auth";
import Link from "next/link";

export default async function CourseEditorPage({ params }: PageProps<"/admin/courses/[id]">) {
  await requireDashboardIdentity();
  const { id } = await params;
  const [initial, whatsappChannels] = await Promise.all([
    id === "new" ? Promise.resolve(null) : getCourseEditorData(id),
    listActiveWhatsAppChannelOptions(),
  ]);
  if (id !== "new" && !initial) {
    return <section className="mx-auto max-w-2xl rounded-2xl border border-[#e7caca] bg-white p-8 text-center"><h1 className="text-2xl font-bold text-[#102f47]">تعذر تحميل بيانات الدورة</h1><p className="mt-3 text-sm leading-7 text-[#607686]">لم نعرض قيماً افتراضية حتى لا تُستبدل بياناتك الحقيقية. ارجع إلى قائمة الدورات وحاول فتحها مرة أخرى.</p><Link href="/admin/courses" className="mt-6 inline-flex h-11 items-center rounded-xl bg-[#C32828] px-3 text-sm font-semibold text-white">العودة إلى الدورات</Link></section>;
  }
  const resolvedId = initial?.id ?? id;
  return <CourseEditor key={resolvedId} courseId={resolvedId} initial={initial} isNew={id === "new"} whatsappChannels={whatsappChannels} />;
}
