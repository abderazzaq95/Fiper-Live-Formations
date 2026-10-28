export type AcademyEvent =
  | { name: "academy_cta_click"; source: string; courseSlug?: string }
  | { name: "academy_filter_use"; filter: string; value: string }
  | { name: "academy_register_start"; source: string; courseSlug: string };

declare global {
  interface Window {
    gtag?: (command: "event", name: string, parameters: Record<string, string>) => void;
  }
}

export function trackAcademyEvent(event: AcademyEvent) {
  if (typeof window === "undefined") return;
  const { name, ...detail } = event;
  const parameters = Object.fromEntries(Object.entries(detail).map(([key, value]) => [key, String(value)]));
  window.dispatchEvent(new CustomEvent("fiper:analytics", { detail: event }));
  window.gtag?.("event", name, parameters);
}
