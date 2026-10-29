import type { Metadata } from "next";
import { SimpleCoursesDirectory } from "@/components/courses/simple-courses-directory";
import { listPublicActiveCourses } from "@/lib/data/courses";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الدورات المباشرة المجانية",
  description: "اختر من دورات Fiper Academy المباشرة واحجز مقعدك المجاني.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const courses = await listPublicActiveCourses();
  return <SimpleCoursesDirectory courses={courses} />;
}
