import { prisma, type TransactionType } from "@creator/db";
import {
  buildLedgerLines,
  getPaymentProvider,
  releaseEscrowToAvailable,
} from "@creator/ledger";
import type { FeeContext } from "@creator/ledger";

export type CreatePaymentInput = FeeContext & {
  payerId: string;
  payeeCreatorId: string;
  type: TransactionType;
  metadata?: Record<string, string>;
};

export async function createAndSettlePayment(input: CreatePaymentInput) {
  const provider = getPaymentProvider();
  const isPlatformPlan = input.type === "platform_plan";

  const creator = isPlatformPlan
    ? null
    : await prisma.creatorProfile.findUnique({
        where: { id: input.payeeCreatorId },
      });
  if (!isPlatformPlan && !creator) throw new Error("Creator not found");

  const now = new Date();
  const creatorPromoActive =
    !!creator?.promoEndsAt && creator.promoEndsAt > now;
  const creatorHasPro =
    !!creator?.creatorProAt && creator.creatorProAt <= now;

  const payment = await provider.createPayment({
    ...input,
    payerUserId: input.payerId,
    payeeCreatorId: input.payeeCreatorId,
    creatorHasPro,
    creatorPromoActive,
  });

  const status =
    payment.status === "completed" ? "completed" : "pending";

  const tx = await prisma.transaction.create({
    data: {
      type: input.type,
      status,
      grossCents: payment.fees.grossCents,
      platformFeeCents: payment.fees.platformFeeCents,
      processorFeeCents: payment.fees.processorFeeCents,
      creatorNetCents: payment.fees.creatorNetCents,
      escrowFeeCents: payment.fees.escrowFeeCents,
      payerId: input.payerId,
      payeeCreatorId: isPlatformPlan ? null : input.payeeCreatorId,
      externalId: payment.externalId,
      metadata: input.metadata ?? {},
    },
  });

  if (status === "completed") {
    const useEscrow = input.type === "custom_request";
    const lines = buildLedgerLines(payment.fees, {
      transactionType: input.type,
      creatorProfileId: input.payeeCreatorId,
      useEscrow,
    }).filter((line) => isPlatformPlan || line.creatorProfileId);
    await prisma.ledgerEntry.createMany({
      data: lines.map((line) => ({
        transactionId: tx.id,
        creatorProfileId: line.creatorProfileId,
        account: line.account,
        amountCents: line.amountCents,
        direction: line.direction,
      })),
    });
  }

  return { transaction: tx, payment };
}

export async function releaseCustomRequestEscrow(
  transactionId: string,
  creatorProfileId: string,
  amountCents: number
) {
  const lines = releaseEscrowToAvailable(amountCents, creatorProfileId);
  await prisma.ledgerEntry.createMany({
    data: lines.map((line) => ({
      transactionId,
      creatorProfileId: line.creatorProfileId,
      account: line.account,
      amountCents: line.amountCents,
      direction: line.direction,
      note: "custom_request_completed",
    })),
  });
}

export async function getCreatorBalance(creatorProfileId: string) {
  const entries = await prisma.ledgerEntry.findMany({
    where: { creatorProfileId },
  });

  let available = 0;
  let escrow = 0;

  for (const e of entries) {
    const sign = e.direction === "credit" ? 1 : -1;
    const amt = e.amountCents * sign;
    if (e.account === "creator_available") available += amt;
    if (e.account === "escrow_hold") escrow += amt;
  }

  return { availableCents: available, escrowCents: escrow };
}

export async function getPlatformRevenue() {
  const entries = await prisma.ledgerEntry.findMany({
    where: { account: "platform_revenue" },
  });
  return entries.reduce(
    (sum, e) => sum + (e.direction === "credit" ? e.amountCents : -e.amountCents),
    0
  );
}
