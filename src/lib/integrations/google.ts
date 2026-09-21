import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { createClient } from "@/lib/supabase/server";

type JsonRecord = Record<string, unknown>;
type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const GOOGLE_PROVIDER = "google";
const ENCRYPTION_VERSION = 1;

function encryptionKey() {
  const secret = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY || process.env.GOOGLE_CLIENT_SECRET;
  if (!secret) throw new Error("Google token encryption is not configured.");
  return createHash("sha256").update(`fiper-google-oauth:${secret}`).digest();
}

export type GoogleOAuthConfig = {
  refreshToken: string;
  email: string;
  scopes: string[];
  connectedAt: string;
};

export function encryptGoogleConfig(config: GoogleOAuthConfig): JsonRecord {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(config), "utf8"), cipher.final()]);
  return {
    version: ENCRYPTION_VERSION,
    algorithm: "aes-256-gcm",
    iv: iv.toString("base64url"),
    tag: cipher.getAuthTag().toString("base64url"),
    ciphertext: ciphertext.toString("base64url"),
  };
}

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" ? value as JsonRecord : {};
}

export function decryptGoogleConfig(value: unknown): GoogleOAuthConfig | null {
  const stored = asRecord(value);
  if (stored.version !== ENCRYPTION_VERSION || stored.algorithm !== "aes-256-gcm") return null;
  const iv = typeof stored.iv === "string" ? Buffer.from(stored.iv, "base64url") : null;
  const tag = typeof stored.tag === "string" ? Buffer.from(stored.tag, "base64url") : null;
  const ciphertext = typeof stored.ciphertext === "string" ? Buffer.from(stored.ciphertext, "base64url") : null;
  if (!iv || !tag || !ciphertext || iv.length !== 12 || tag.length !== 16 || !ciphertext.length) return null;
  try {
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
    const parsed = JSON.parse(plaintext) as Partial<GoogleOAuthConfig>;
    if (typeof parsed.refreshToken !== "string" || !parsed.refreshToken) return null;
    return {
      refreshToken: parsed.refreshToken,
      email: typeof parsed.email === "string" ? parsed.email : "",
      scopes: Array.isArray(parsed.scopes) ? parsed.scopes.filter((scope): scope is string => typeof scope === "string") : [],
      connectedAt: typeof parsed.connectedAt === "string" ? parsed.connectedAt : "",
    };
  } catch {
    return null;
  }
}

export async function getStoredGoogleConfig(supabase: SupabaseServerClient) {
  const { data, error } = await supabase
    .from("integrations")
    .select("state,connected_at,encrypted_config")
    .eq("provider", GOOGLE_PROVIDER)
    .maybeSingle();
  if (error) throw error;
  const config = decryptGoogleConfig(data?.encrypted_config);
  return { state: data?.state ?? "disconnected", connectedAt: data?.connected_at ?? null, config };
}

export async function getGoogleRefreshToken(supabase: SupabaseServerClient) {
  // Prefer the explicitly configured production token. This allows the
  // service account token generated in OAuth Playground to be rotated from
  // Vercel without being shadowed by an older dashboard OAuth connection.
  const configured = process.env.GOOGLE_REFRESH_TOKEN?.trim();
  if (configured) return configured;
  const stored = await getStoredGoogleConfig(supabase);
  if (stored.state === "connected" && stored.config?.refreshToken) return stored.config.refreshToken;
  return "";
}
