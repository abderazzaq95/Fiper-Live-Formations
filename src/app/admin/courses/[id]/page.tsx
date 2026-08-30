import { CourseEditor } from "@/components/dashboard/course-editor";
import { getCourseEditorData } from "@/lib/data/courses";

export default async function CourseEditorPage({ params }: PageProps<"/admin/courses/[id]">) {
  const { id } = await params;
  const initial = id === "new" ? null : await getCourseEditorData(id);
  return <CourseEditor courseId={id} initial={initial} isNew={id === "new"} />;
}
