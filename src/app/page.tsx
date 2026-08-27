import { AgendaInstructor } from "@/components/public/agenda-instructor";
import { CourseHero } from "@/components/public/course-hero";
import { LearningSections } from "@/components/public/learning-sections";
import { RegistrationSection } from "@/components/public/registration-section";

export default function Home() {
  return (
    <main>
      <CourseHero />
      <LearningSections />
      <AgendaInstructor />
      <RegistrationSection />
    </main>
  );
}
