export type CourseReplay = {
  id: string;
  title: string;
  recordedAt: string;
  duration: string;
  url: string;
  coverImage?: string;
};

// Deliberately hidden until Fiper supplies real, publishable replay records.
export const courseReplays: CourseReplay[] = [];
