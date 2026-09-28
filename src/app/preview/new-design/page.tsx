import { LandingRedesign } from "@/components/preview/landing-redesign";
import { getPublicCourseById } from "@/lib/data/courses";

export const dynamic = "force-dynamic";

export default async function NewDesignPreview({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>;
}) {
  const data = await getPublicCourseById((await searchParams).courseId ?? "");

  return <LandingRedesign {...data} />;
}
