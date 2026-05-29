import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function parseJson<T = Record<string, unknown>>(
  request: Request
): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export function withRateLimit(
  key: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  const result = rateLimit(key, limit, windowMs);
  if (!result.ok) {
    return NextResponse.json(
      { error: "Too many requests", retryAfterSec: result.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(result.retryAfterSec) } }
    );
  }
  return null;
}
