import { CourseEditor } from "@/components/dashboard/course-editor";

export default async function CourseEditorPage({ params }: PageProps<"/admin/courses/[id]">) {
  const { id } = await params;
  return <CourseEditor isNew={id === "new"} />;
}
