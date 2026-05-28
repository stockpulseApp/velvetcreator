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
    return NextResponse.json({ error: "Not a creator" }, { status: 403 });
  }

  const { title, description, priceCents, quantity, shippingNotes } =
    await request.json();

  const listing = await prisma.listing.create({
    data: {
      creatorProfileId: profile.id,
      title,
      description,
      priceCents: Math.max(100, Number(priceCents) || 0),
      quantity: Math.max(1, Number(quantity) || 1),
      shippingNotes,
    },
  });

  return NextResponse.json({ ok: true, listingId: listing.id });
}
