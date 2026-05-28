import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE = "creator_session";

function readSessionPayload(token: string): { ageVerified?: boolean; role?: string } | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = JSON.parse(
      Buffer.from(part.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()
    );
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
  "/api/auth",
  "/api/webhooks",
  "/api/kyc",
  "/api/waitlist",
  "/api/health",
];

const AGE_GATED_PREFIXES = [
  "/feed",
  "/messages",
  "/live",
  "/studio",
  "/wallet",
  "/settings",
  "/admin",
  "/u/",
];

function isPublic(pathname: string) {
  if (pathname.startsWith("/u/")) return true;
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
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
  let session: { ageVerified?: boolean; role?: string } | null = null;

  if (token) {
    session = readSessionPayload(token);
  }

  const authed = !!session;
  const ageVerified = !!session?.ageVerified;

  if (
    (pathname.startsWith("/login") || pathname.startsWith("/signup")) &&
    authed
  ) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  if (!isPublic(pathname) && !authed) {
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
