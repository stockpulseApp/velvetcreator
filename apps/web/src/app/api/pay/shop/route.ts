import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { createAndSettlePayment } from "@/lib/transactions";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.ageVerified) {
    return NextResponse.json({ error: "Age verification required" }, { status: 403 });
  }

  const { listingId, quantity = 1, shippingLine1, shippingCity, shippingCountry } =
    await request.json();

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });
  if (!listing?.active || listing.quantity < quantity) {
    return NextResponse.json({ error: "Unavailable" }, { status: 400 });
  }

  const totalCents = listing.priceCents * quantity;

  const result = await createAndSettlePayment({
    transactionType: "shop",
    grossCents: totalCents,
    payerId: session.userId,
    payeeCreatorId: listing.creatorProfileId,
    type: "shop",
    includeListingFee: true,
    metadata: { listingId },
  });

  const order = await prisma.order.create({
    data: {
      listingId: listing.id,
      buyerId: session.userId,
      creatorProfileId: listing.creatorProfileId,
      quantity,
      totalCents,
      status: "paid",
      shippingLine1,
      shippingCity,
      shippingCountry,
      transactionId: result.transaction.id,
    },
  });

  await prisma.listing.update({
    where: { id: listing.id },
    data: { quantity: { decrement: quantity } },
  });

  return NextResponse.json({ ok: true, orderId: order.id });
}
