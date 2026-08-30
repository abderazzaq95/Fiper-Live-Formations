import { AgendaInstructor } from "@/components/public/agenda-instructor";
import { CourseHero } from "@/components/public/course-hero";
import { LearningSections } from "@/components/public/learning-sections";
import { RegistrationSection } from "@/components/public/registration-section";
import { getPublicCourse } from "@/lib/data/courses";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { course, outcomes, agenda, audience, faqs } = await getPublicCourse();

  return (
    <main>
      <CourseHero course={course} />
      <LearningSections outcomes={outcomes} audience={audience} />
      <AgendaInstructor course={course} agenda={agenda} />
      <RegistrationSection course={course} faqs={faqs} />
    </main>
  );
}