import type { Metadata } from "next";
import { SimpleCoursesDirectory } from "@/components/courses/simple-courses-directory";
import { listPublicActiveCourses } from "@/lib/data/courses";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الدورات المباشرة المجانية",
  description: "اكتشف دورات Fiper Academy المباشرة، قارن المواعيد والمحاضرين، واحجز مقعدك مجانًا لتصلك تفاصيل الحضور والتذكيرات.",
  alternates: { canonical: "/courses" },
  openGraph: {
    title: "الدورات المباشرة المجانية | Fiper Academy",
    description: "اختر دورتك المباشرة القادمة واحجز مقعدك مجانًا.",
    url: "/courses",
    type: "website",
    locale: "ar_MA",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Fiper Academy للدورات المباشرة" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "الدورات المباشرة المجانية | Fiper Academy",
    description: "اختر دورتك المباشرة القادمة واحجز مقعدك مجانًا.",
    images: ["/opengraph-image"],
  },
};

export default async function CoursesPage() {
  const courses = await listPublicActiveCourses();
  return <SimpleCoursesDirectory courses={courses} />;
}
