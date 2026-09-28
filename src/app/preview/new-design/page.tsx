import { AtelierLanding as LandingRedesign } from "@/components/preview/atelier-landing";
import { getPublicCourseById } from "@/lib/data/courses";

export const dynamic = "force-dynamic";
export const metadata = { title: "Fiper Live | Design preview", robots: { index: false, follow: false } };

export default async function NewDesignPreview({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>;
}) {
  const data = await getPublicCourseById((await searchParams).courseId ?? "");

  return <LandingRedesign {...data} />;
}
