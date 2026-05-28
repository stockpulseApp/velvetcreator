import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession, createSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      ageVerificationStatus: true,
      ageVerifiedAt: true,
      ageVerificationMeta: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: user.ageVerificationStatus,
    verified: !!user.ageVerifiedAt,
    meta: user.ageVerificationMeta,
  });
}

/** Poll endpoint — completes mock processing if webhook not used */
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (user.ageVerifiedAt) {
    return NextResponse.json({ status: "verified", verified: true });
  }

  if (user.ageVerificationStatus === "processing") {
    const meta = user.ageVerificationMeta as { sessionUrl?: string } | null;
    if (meta?.sessionUrl) {
      return NextResponse.json({
        status: "processing",
        verified: false,
        sessionUrl: meta.sessionUrl,
      });
    }
  }

  return NextResponse.json({
    status: user.ageVerificationStatus,
    verified: false,
  });
}
