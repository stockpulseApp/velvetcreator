import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { attributeReferral, generateReferralCode } from "@/lib/referral";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const limited = rateLimit(`signup:${ip}`, 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many signups from this network. Try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  const body = await request.json();
  const email = String(body.email ?? "").toLowerCase().trim();
  const password = String(body.password ?? "");
  const displayName = String(body.displayName ?? "").trim();
  const role = body.role === "creator" ? "creator" : "fan";
  const referralCode = body.referralCode as string | undefined;

  if (!email || !password || !displayName) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      displayName,
      role,
      referralCode:
        role === "creator" ? generateReferralCode(displayName) : undefined,
    },
  });

  await attributeReferral(user.id, referralCode);

  if (role === "creator") {
    await prisma.creatorApplication.create({
      data: { userId: user.id, status: "pending", bio: "" },
    });
  }

  await createSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    ageVerified: false,
  });

  return NextResponse.json({ ok: true, role: user.role });
}
