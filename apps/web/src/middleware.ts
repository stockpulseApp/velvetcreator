import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE = "creator_session";

type EdgeSession = {
  userId?: string;
  ageVerified?: boolean;
  role?: string;
  exp?: number;
};

function base64UrlDecode(input: string): Uint8Array {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function verifySessionToken(token: string): Promise<EdgeSession | null> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const data = new TextEncoder().encode(`${header}.${payload}`);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const sigBytes = new Uint8Array(base64UrlDecode(signature));
  const valid = await crypto.subtle.verify("HMAC", key, sigBytes, data);
  if (!valid) return null;

  try {
    const json = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(payload))
    ) as EdgeSession;
    if (json.exp && json.exp * 1000 < Date.now()) return null;
    return json;
  } catch {
    return null;
  }
}

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/explore",
  "/for-creators",
  "/terms",
  "/privacy",
  "/community",
  "/safety",
  "/fetishes",
  "/verify-age",
  "/creator-agreement",
  "/api/auth",
  "/api/webhooks",
  "/api/kyc",
  "/api/waitlist",
  "/api/health",
  "/api/fetishes",
];

const AGE_GATED_PREFIXES = [
  "/feed",
  "/messages",
  "/live",
  "/studio",
  "/wallet",
  "/settings",
  "/admin",
  "/notifications",
  "/u/",
];

function isPublic(pathname: string) {
  if (pathname.startsWith("/u/")) return true;
  if (pathname.startsWith("/community")) return true;
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isPublicApi(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => p.startsWith("/api") && (pathname === p || pathname.startsWith(p + "/"))
  );
}

function needsAgeGate(pathname: string) {
  return AGE_GATED_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const authed = !!session;
  const ageVerified = !!session?.ageVerified;

  if (
    (pathname.startsWith("/login") || pathname.startsWith("/signup")) &&
    authed
  ) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  if (!isPublic(pathname) && !authed) {
    if (pathname.startsWith("/api/") && !isPublicApi(pathname)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (authed && !ageVerified && needsAgeGate(pathname)) {
    return NextResponse.redirect(new URL("/verify-age", request.url));
  }

  if (pathname.startsWith("/admin") && session?.role !== "admin") {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  if (pathname.startsWith("/studio") && session?.role === "fan") {
    return NextResponse.redirect(new URL("/creator/apply", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
