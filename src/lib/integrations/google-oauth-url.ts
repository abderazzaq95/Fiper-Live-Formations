import "server-only";

const GOOGLE_CALLBACK_PATH = "/api/admin/integrations/google/callback";

export function googleOAuthOrigin(request: Request) {
  const requestOrigin = new URL(request.url).origin;
  const configuredUrl = (
    process.env.GOOGLE_OAUTH_BASE_URL || process.env.NEXT_PUBLIC_APP_URL
  )?.trim();
  if (!configuredUrl) return requestOrigin;

  try {
    return new URL(configuredUrl).origin;
  } catch {
    console.error("google_oauth_invalid_base_url");
    return requestOrigin;
  }
}

export function googleOAuthCallbackUri(request: Request) {
  return `${googleOAuthOrigin(request)}${GOOGLE_CALLBACK_PATH}`;
}
