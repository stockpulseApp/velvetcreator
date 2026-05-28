import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { instantPayoutFee } from "@creator/ledger";
import { getSession } from "@/lib/session";
import { getCreatorBalance } from "@/lib/transactions";

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

  const { amountCents, instant } = await request.json();
  const balance = await getCreatorBalance(profile.id);

  const amount = Math.min(Number(amountCents) || 0, balance.availableCents);
  if (amount < 1000) {
    return NextResponse.json({ error: "Minimum payout $10" }, { status: 400 });
  }

  const feeCents = instant ? instantPayoutFee(amount) : 0;

  await prisma.payout.create({
    data: {
      creatorProfileId: profile.id,
      amountCents: amount - feeCents,
      feeCents,
      status: "pending",
    },
  });

  await prisma.ledgerEntry.create({
    data: {
      creatorProfileId: profile.id,
      account: "creator_available",
      amountCents: amount,
      direction: "debit",
      note: "payout_requested",
    },
  });

  return NextResponse.json({ ok: true, feeCents });
}
