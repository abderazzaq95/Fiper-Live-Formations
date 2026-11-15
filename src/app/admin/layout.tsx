import type { Metadata } from "next";
import { AdminShell } from "@/components/dashboard/admin-shell";
import { requireDashboardIdentity } from "@/lib/auth";
import { listDashboardRegistrations } from "@/lib/data/courses";
import { getDashboardDeliveries } from "@/lib/data/dashboard";

export const metadata: Metadata = { title: "لوحة التحكم", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const identity = await requireDashboardIdentity();
  const [registrations, deliveries] = await Promise.all([listDashboardRegistrations(), getDashboardDeliveries()]);
  return <AdminShell identity={identity} counts={{ registrations: registrations.length, communications: deliveries.emailTotal + deliveries.whatsappTotal }}>{children}</AdminShell>;
}