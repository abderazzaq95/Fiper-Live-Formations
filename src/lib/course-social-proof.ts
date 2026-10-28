export type CourseTestimonial = {
  id: string;
  quote: string;
  name: string;
  role?: string;
  avatar?: string;
};

// Intentionally empty until Fiper supplies verified, publishable testimonials.
export const courseTestimonials: CourseTestimonial[] = [];

export const academySocialLinks: Array<{ label: string; href: string }> = [];
