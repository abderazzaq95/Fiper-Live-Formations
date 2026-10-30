export type PublicationCandidate = {
  title: string;
  heroHeading: string;
  description: string;
  slug: string;
  date: string;
  startTime: string;
  endTime: string;
  deliveryType: "online" | "onsite";
  meetUrl: string;
  venueName: string;
  venueAddress: string;
  instructorName: string;
  instructorTitle: string;
  instructorBio: string;
  coverImage: string;
  instructorImage: string;
  agenda: Array<{ title: string }>;
  faqs: Array<{ question: string; answer: string }>;
  landingContent: { visibility?: { agenda?: boolean; faq?: boolean } };
};

export function hasCompleteSchedule(value: Pick<PublicationCandidate, "date" | "startTime" | "endTime">) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.date)
    && /^\d{2}:\d{2}$/.test(value.startTime)
    && /^\d{2}:\d{2}$/.test(value.endTime)
    && value.endTime > value.startTime;
}

export function publicationMissingFields(value: PublicationCandidate) {
  const missing: string[] = [];
  const requireText = (input: string, label: string) => { if (!input.trim()) missing.push(label); };

  requireText(value.title, "اسم الدورة");
  requireText(value.heroHeading, "العنوان الرئيسي");
  requireText(value.description, "وصف الدورة");
  if (!/^id\d+$/.test(value.slug.trim().toLowerCase())) missing.push("الرابط المختصر بصيغة id06");
  requireText(value.date, "التاريخ");
  requireText(value.startTime, "وقت البداية");
  requireText(value.endTime, "وقت النهاية");
  if (value.date && value.startTime && value.endTime && !hasCompleteSchedule(value)) missing.push("وقت نهاية صحيح بعد وقت البداية");
  requireText(value.coverImage, "صورة الدورة");
  requireText(value.instructorName, "اسم المحاضر");
  requireText(value.instructorTitle, "المسمى المهني للمحاضر");
  requireText(value.instructorBio, "نبذة المحاضر");
  requireText(value.instructorImage, "صورة المحاضر");

  if (value.deliveryType === "online") requireText(value.meetUrl, "رابط Google Meet");
  else {
    requireText(value.venueName, "اسم المكان");
    requireText(value.venueAddress, "عنوان المكان");
  }

  if (value.landingContent.visibility?.agenda !== false && !value.agenda.some((item) => item.title.trim())) missing.push("برنامج الدورة");
  if (value.landingContent.visibility?.faq !== false && !value.faqs.some((item) => item.question.trim() && item.answer.trim())) missing.push("سؤال شائع واحد على الأقل");

  return [...new Set(missing)];
}
