import type { Metadata } from "next";
import { AdminShell } from "@/components/dashboard/admin-shell";
import { requireDashboardIdentity } from "@/lib/auth";
import { listDashboardRegistrations } from "@/lib/data/courses";
import { getDashboardDeliveries } from "@/lib/data/dashboard";

export const metadata: Metadata = { title: "لوحة التحكم", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// Applies the saved day/night choice (or the computer's setting) before the page paints, so night mode does not flash white.
const themeScript = `(function(){try{var t=localStorage.getItem("fiper_admin_theme");if(t!=="light"&&t!=="dark")t=window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-admin-theme",t)}catch(e){}})();`;

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const identity = await requireDashboardIdentity();
  const [registrations, deliveries] = await Promise.all([listDashboardRegistrations(), getDashboardDeliveries()]);
  return <><script dangerouslySetInnerHTML={{ __html: themeScript }} /><AdminShell identity={identity} counts={{ registrations: registrations.length, communications: deliveries.emailTotal + deliveries.whatsappTotal }}>{children}</AdminShell></>;
}