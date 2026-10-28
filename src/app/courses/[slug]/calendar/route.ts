import { getPublicCourseByPath } from "@/lib/data/courses";

function icsDate(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeIcs(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const data = await getPublicCourseByPath(slug);
  if (!data) return new Response("Course not found", { status: 404 });
  const { course } = data;
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fiper Academy//Live Courses//AR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${escapeIcs(course.id)}@fiperacademy.com`,
    `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `DTSTART:${icsDate(course.isoStart)}`,
    `DTEND:${icsDate(course.isoEnd)}`,
    `SUMMARY:${escapeIcs(course.title)}`,
    `DESCRIPTION:${escapeIcs(course.description)}`,
    `LOCATION:${escapeIcs(course.type === "online" ? course.platform : course.venueName || "")}`,
    `URL:https://fiperacademy.com/courses/${encodeURIComponent(course.slug)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="fiper-${course.slug}.ics"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
