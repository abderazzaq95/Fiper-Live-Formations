import { CourseEditor } from "@/components/dashboard/course-editor";
import { getCourseEditorData } from "@/lib/data/courses";
import { listActiveWhatsAppChannelOptions } from "@/lib/data/whatsapp-channels";
import { requireDashboardIdentity } from "@/lib/auth";
import { notFound } from "next/navigation";

export default async function CourseEditorPage({ params }: PageProps<"/admin/courses/[id]">) {
  await requireDashboardIdentity();
  const { id } = await params;
  const [initial, whatsappChannels] = await Promise.all([
    id === "new" ? Promise.resolve(null) : getCourseEditorData(id),
    listActiveWhatsAppChannelOptions(),
  ]);
  if (id !== "new" && !initial) notFound();
  const resolvedId = initial?.id ?? id;
  return <CourseEditor key={resolvedId} courseId={resolvedId} initial={initial} isNew={id === "new"} whatsappChannels={whatsappChannels} />;
}
