import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.userId },
  });
  if (!profile) {
    return NextResponse.json({ error: "Creator profile required" }, { status: 403 });
  }

  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const priceCents = Math.round(Number(body.priceCents) || 0);

  if (!name || priceCents < 100) {
    return NextResponse.json(
      { error: "Name and price (min $1) required" },
      { status: 400 }
    );
  }

  const count = await prisma.subscriptionTier.count({
    where: { creatorProfileId: profile.id },
  });

  const tier = await prisma.subscriptionTier.create({
    data: {
      creatorProfileId: profile.id,
      name,
      priceCents,
      sortOrder: count,
      perks: { feed: true, dmQuota: 10 },
    },
  });

  return NextResponse.json({ ok: true, tier });
}
