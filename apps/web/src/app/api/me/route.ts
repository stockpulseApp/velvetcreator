import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.userId },
    select: { id: true, handle: true, approvedAt: true },
  });

  return NextResponse.json({
    userId: session.userId,
    email: session.email,
    role: session.role,
    ageVerified: session.ageVerified,
    hasCreatorProfile: !!profile,
    creatorHandle: profile?.handle ?? null,
    approved: !!profile?.approvedAt,
  });
}
