import type { Metadata } from "next";
import { CoursesDirectory } from "@/components/courses/courses-directory";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الدورات المباشرة المجانية",
  description: "اختر من دورات Fiper Academy المباشرة واحجز مقعدك المجاني.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <CoursesDirectory isHome />;
}
