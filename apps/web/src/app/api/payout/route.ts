import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import type { Prisma } from "@creator/db";
import { instantPayoutFee } from "@creator/ledger";
import { getSession } from "@/lib/session";
import { jsonError, parseJson, withRateLimit } from "@/lib/api-utils";

async function availableFromEntries(
  tx: Prisma.TransactionClient,
  creatorProfileId: string
) {
  const grouped = await tx.ledgerEntry.groupBy({
    by: ["account", "direction"],
    where: { creatorProfileId },
    _sum: { amountCents: true },
  });
  let available = 0;
  for (const row of grouped) {
    const sign = row.direction === "credit" ? 1 : -1;
    const amt = (row._sum.amountCents ?? 0) * sign;
    if (row.account === "creator_available") available += amt;
  }
  return available;
}

export async function POST(request: Request) {
  const limited = withRateLimit("payout", 5, 60_000);
  if (limited) return limited;

  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const body = await parseJson<{ amountCents?: number; instant?: boolean }>(
    request
  );
  if (!body) return jsonError("Invalid JSON", 400);

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.userId },
  });
  if (!profile) return jsonError("Not a creator", 403);

  const requested = Number(body.amountCents) || 0;
  const feeCents = body.instant ? instantPayoutFee(requested) : 0;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const available = await availableFromEntries(tx, profile.id);
      const amount = Math.min(requested, available);
      if (amount < 1000) {
        throw new Error("INSUFFICIENT");
      }

      await tx.payout.create({
        data: {
          creatorProfileId: profile.id,
          amountCents: amount - feeCents,
          feeCents,
          status: "pending",
        },
      });

      await tx.ledgerEntry.create({
        data: {
          creatorProfileId: profile.id,
          account: "creator_available",
          amountCents: amount,
          direction: "debit",
          note: "payout_requested",
        },
      });

      return { amount, feeCents };
    });

    return NextResponse.json({ ok: true, feeCents: result.feeCents });
  } catch (e) {
    if (e instanceof Error && e.message === "INSUFFICIENT") {
      return jsonError("Insufficient balance", 400);
    }
    throw e;
  }
}
