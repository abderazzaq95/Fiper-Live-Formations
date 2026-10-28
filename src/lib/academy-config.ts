const parsedThreshold = Number(process.env.NEXT_PUBLIC_REGISTRATION_TRUST_THRESHOLD ?? "10");

export const registrationTrustThreshold = Number.isFinite(parsedThreshold) && parsedThreshold > 0 ? parsedThreshold : 10;

export const whatsappCommunityUrl = process.env.NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL?.trim() || "";

export type AcademySocialNetwork = "instagram" | "facebook" | "youtube" | "linkedin";

const socialCandidates: Array<{ network: AcademySocialNetwork; label: string; href?: string }> = [
  { network: "instagram", label: "Instagram", href: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL },
  { network: "facebook", label: "Facebook", href: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL },
  { network: "youtube", label: "YouTube", href: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE_URL },
  { network: "linkedin", label: "LinkedIn", href: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN_URL },
];

export const academySocialLinks = socialCandidates
  .filter((item): item is { network: AcademySocialNetwork; label: string; href: string } => Boolean(item.href?.trim()))
  .map((item) => ({ ...item, href: item.href.trim() }));
