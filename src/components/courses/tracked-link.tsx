"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { trackAcademyEvent } from "@/lib/analytics";

type Props = ComponentProps<typeof Link> & {
  source: string;
  courseSlug?: string;
};

export function TrackedLink({ source, courseSlug, onClick, ...props }: Props) {
  return <Link {...props} onClick={(event) => { trackAcademyEvent({ name: "academy_cta_click", source, courseSlug }); onClick?.(event); }} />;
}
