import type { Metadata } from "next";

import { CoursesIndexPage } from "@/app/courses/page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الدورات المباشرة المتاحة",
  description: "اكتشف دورات Fiper Academy المباشرة، وراجع المواعيد والمحاضرين ثم سجّل حضورك مجانًا.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <CoursesIndexPage isHome />;
}
