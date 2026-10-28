import type { MetadataRoute } from "next";
import { listPublicActiveCourses } from "@/lib/data/courses";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courses = await listPublicActiveCourses();
  const now = new Date();
  return [
    { url: "https://fiperacademy.com", lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: "https://fiperacademy.com/courses", lastModified: now, changeFrequency: "daily", priority: 1 },
    ...courses.map((course) => ({ url: `https://fiperacademy.com/courses/${encodeURIComponent(course.slug)}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
