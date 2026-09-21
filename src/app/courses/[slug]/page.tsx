import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AgendaInstructor } from "@/components/public/agenda-instructor";
import { CourseHero } from "@/components/public/course-hero";
import { LearningSections } from "@/components/public/learning-sections";
import { RegistrationSection } from "@/components/public/registration-section";
import { getPublicCourseByPath } from "@/lib/data/courses";

export const dynamic = "force-dynamic";

type CoursePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicCourseByPath(slug);
  return data ? { title: data.course.title, description: data.course.description } : { title: "Course not found" };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const data = await getPublicCourseByPath(slug);
  if (!data) notFound();
  if (slug !== data.course.slug) redirect(`/courses/${encodeURIComponent(data.course.slug)}`);

  return (
    <main>
      <CourseHero course={data.course} landing={data.landing} />
      <LearningSections outcomes={data.outcomes} audience={data.audience} landing={data.landing} duration={data.course.duration} />
      <AgendaInstructor course={data.course} agenda={data.agenda} landing={data.landing} />
      <RegistrationSection course={data.course} faqs={data.faqs} landing={data.landing} />
    </main>
  );
}
