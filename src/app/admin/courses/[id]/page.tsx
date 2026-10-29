import { CourseEditor } from "@/components/dashboard/course-editor";
import { getCourseEditorData } from "@/lib/data/courses";
import { listActiveWhatsAppChannelOptions } from "@/lib/data/whatsapp-channels";

export default async function CourseEditorPage({ params }: PageProps<"/admin/courses/[id]">) {
  const { id } = await params;
  const [initial, whatsappChannels] = await Promise.all([
    id === "new" ? Promise.resolve(null) : getCourseEditorData(id),
    listActiveWhatsAppChannelOptions(),
  ]);
  return <CourseEditor key={id} courseId={id} initial={initial} isNew={id === "new"} whatsappChannels={whatsappChannels} />;
}
