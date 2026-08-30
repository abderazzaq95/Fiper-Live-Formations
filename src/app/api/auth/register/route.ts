import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().trim().min(3).max(100),
  email: z.string().trim().toLowerCase().email().max(180),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ message: "Invalid request data." }, { status: 400 }); }
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) return Response.json({ message: "Enter your name, email, and a password of at least 8 characters." }, { status: 422 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return Response.json({ message: "Get Access is not configured yet." }, { status: 503 });
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.name, dashboard_access: true },
    app_metadata: { role: "admin", dashboard_access: true },
  });
  if (error || !data.user) {
    if (error?.message?.toLowerCase().includes("already") || error?.code === "email_exists") return Response.json({ message: "An account with this email already exists. Please sign in." }, { status: 409 });
    console.error("dashboard_signup_failed", { code: error?.code, message: error?.message });
    return Response.json({ message: "Unable to create the account right now." }, { status: 400 });
  }
  const { error: profileError } = await supabase.from("profiles").upsert({ id: data.user.id, full_name: parsed.data.name, role: "admin" }, { onConflict: "id" });
  if (profileError && profileError.code !== "PGRST205") {
    await supabase.auth.admin.deleteUser(data.user.id);
    console.error("dashboard_profile_create_failed", { code: profileError.code, message: profileError.message });
    return Response.json({ message: "Unable to prepare Admin access right now." }, { status: 500 });
  }
  if (profileError?.code === "PGRST205") {
    console.warn("dashboard_profiles_table_missing", { userId: data.user.id });
  }
  return Response.json({ ok: true, email: parsed.data.email });
}