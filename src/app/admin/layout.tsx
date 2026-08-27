import type { Metadata } from "next";
import { AdminShell } from "@/components/dashboard/admin-shell";
import { requireDashboardIdentity } from "@/lib/auth";

export const metadata: Metadata = { title: "لوحة التحكم", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const identity = await requireDashboardIdentity();
  return <AdminShell identity={identity}>{children}</AdminShell>;
}
