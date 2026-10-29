import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ReferenceLanding } from "@/components/preview/reference-landing";
import { getPublicCourseByPath } from "@/lib/data/courses";

export const dynamic = "force-dynamic";

type CoursePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicCourseByPath(slug);
  return data ? {
    title: data.course.title,
    description: data.course.description,
    alternates: { canonical: `/courses/${encodeURIComponent(data.course.slug)}` },
    openGraph: {
      title: data.course.title,
      description: data.course.description,
      url: `/courses/${encodeURIComponent(data.course.slug)}`,
      locale: "ar_MA",
      type: "website",
      images: [{ url: data.course.coverImage || "/opengraph-image", alt: data.course.title }],
    },
    twitter: { card: "summary_large_image", title: data.course.title, description: data.course.description, images: [data.course.coverImage || "/opengraph-image"] },
  } : { title: "الدورة غير موجودة", robots: { index: false, follow: false } };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const data = await getPublicCourseByPath(slug);
  if (!data) notFound();
  if (slug !== data.course.slug) redirect(`/courses/${encodeURIComponent(data.course.slug)}`);

  return <ReferenceLanding {...data} />;
}
