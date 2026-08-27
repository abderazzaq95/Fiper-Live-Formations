import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type DashboardIdentity = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
};

export function isAdminPreview() {
  return process.env.ADMIN_PREVIEW_MODE === "true";
}

export async function getDashboardIdentity(): Promise<DashboardIdentity | null> {
  if (isAdminPreview()) {
    return { id: "preview", name: "Khalid Admin", email: "preview@fiper.me", role: "admin" };
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const subject = typeof claims?.sub === "string" ? claims.sub : null;
  if (!subject) return null;
  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", subject).single();
  return {
    id: subject,
    name: profile?.full_name ?? String(claims?.email ?? "Fiper User"),
    email: String(claims?.email ?? ""),
    role: profile?.role === "admin" ? "admin" : "user",
  };
}

export async function requireDashboardIdentity(requiredRole?: "admin") {
  const identity = await getDashboardIdentity();
  if (!identity) redirect("/login");
  if (requiredRole === "admin" && identity.role !== "admin") redirect("/admin");
  return identity;
}
