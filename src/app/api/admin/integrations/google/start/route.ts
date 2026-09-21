import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getDashboardIdentity } from "@/lib/auth";

const STATE_COOKIE = "fiper_google_oauth_state";
const SCOPES = [
  "https://www.googleapis.com/auth/meetings.space.readonly",
  "https://www.googleapis.com/auth/contacts.readonly",
  "https://www.googleapis.com/auth/profile.emails.read",
  "https://www.googleapis.com/auth/admin.directory.user.readonly",
  "https://www.googleapis.com/auth/admin.reports.audit.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

function redirectUri(request: Request) {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const origin = configuredOrigin ? new URL(configuredOrigin).origin : new URL(request.url).origin;
  return `${origin}/api/admin/integrations/google/callback`;
}

export async function GET(request: Request) {
  const identity = await getDashboardIdentity();
  if (!identity) return Response.redirect(new URL("/login", request.url));
  if (identity.role !== "admin") return Response.redirect(new URL("/admin", request.url));

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return Response.redirect(new URL("/admin/settings?google=error", request.url));

  const state = randomBytes(32).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri(request),
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    scope: SCOPES,
    state,
  });
  return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
