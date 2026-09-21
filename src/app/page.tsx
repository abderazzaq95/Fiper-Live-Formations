import { AgendaInstructor } from "@/components/public/agenda-instructor";
import { CourseHero } from "@/components/public/course-hero";
import { LearningSections } from "@/components/public/learning-sections";
import { RegistrationSection } from "@/components/public/registration-section";
import { getPublicCourseById } from "@/lib/data/courses";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ courseId?: string }> }) {
  const { course, outcomes, agenda, audience, faqs, landing } = await getPublicCourseById((await searchParams).courseId ?? "");

  return (
    <main>
      <CourseHero course={course} landing={landing} />
      <LearningSections outcomes={outcomes} audience={audience} landing={landing} duration={course.duration} />
      <AgendaInstructor course={course} agenda={agenda} landing={landing} />
      <RegistrationSection course={course} faqs={faqs} landing={landing} />
    </main>
  );
}