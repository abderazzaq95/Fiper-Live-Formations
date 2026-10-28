import type { Metadata } from "next";

import { SimpleCoursesDirectory } from "@/components/courses/simple-courses-directory";
import { listPublicActiveCourses } from "@/lib/data/courses";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الدورات المباشرة | Fiper Academy",
  description: "استعرض دورات Fiper Academy المباشرة واختر الدورة المناسبة لك ثم انتقل إلى صفحة التفاصيل والتسجيل.",
  alternates: { canonical: "/courses" },
};

export default async function CoursesPage() {
  const courses = await listPublicActiveCourses();
  return <SimpleCoursesDirectory courses={courses} />;
}
