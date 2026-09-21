import { cookies } from "next/headers";
import { getDashboardIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { encryptGoogleConfig } from "@/lib/integrations/google";
import { googleOAuthCallbackUri, googleOAuthOrigin } from "@/lib/integrations/google-oauth-url";

const STATE_COOKIE = "fiper_google_oauth_state";

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" ? value as JsonRecord : {};
}

function redirectResult(request: Request, result: "connected" | "error") {
  return Response.redirect(new URL(`/admin/settings?google=${result}`, googleOAuthOrigin(request)));
}

export async function GET(request: Request) {
  const identity = await getDashboardIdentity();
  if (!identity || identity.role !== "admin") return redirectResult(request, "error");

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);
  if (error || !code || !state || !expectedState || state !== expectedState) return redirectResult(request, "error");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return redirectResult(request, "error");

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: googleOAuthCallbackUri(request),
        grant_type: "authorization_code",
      }),
      cache: "no-store",
    });
    const tokenData = record(await tokenResponse.json().catch(() => ({})));
    if (!tokenResponse.ok || typeof tokenData.refresh_token !== "string" || !tokenData.refresh_token) {
      console.error(
        "google_oauth_token_exchange_failed",
        tokenResponse.status,
        tokenData.error,
        tokenData.error_description,
      );
      return redirectResult(request, "error");
    }

    const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${String(tokenData.access_token || "")}` },
      cache: "no-store",
    });
    const userData = record(await userResponse.json().catch(() => ({})));
    const email = typeof userData.email === "string" ? userData.email.trim().toLowerCase() : "";
    if (!userResponse.ok || !email) {
      console.error("google_oauth_userinfo_failed", userResponse.status);
      return redirectResult(request, "error");
    }

    const connectedAt = new Date().toISOString();
    const encryptedConfig = encryptGoogleConfig({
      refreshToken: tokenData.refresh_token,
      email,
      scopes: typeof tokenData.scope === "string" ? tokenData.scope.split(" ").filter(Boolean) : [],
      connectedAt,
    });
    const supabase = await createClient();
    const { error: saveError } = await supabase.from("integrations").upsert({
      provider: "google",
      state: "connected",
      encrypted_config: encryptedConfig,
      connected_by: identity.id === "preview" ? null : identity.id,
      connected_at: connectedAt,
      updated_at: connectedAt,
    }, { onConflict: "provider" });
    if (saveError) {
      console.error("google_oauth_save_failed", saveError.message);
      return redirectResult(request, "error");
    }
    return redirectResult(request, "connected");
  } catch (callbackError) {
    console.error("google_oauth_callback_failed", callbackError);
    return redirectResult(request, "error");
  }
}
