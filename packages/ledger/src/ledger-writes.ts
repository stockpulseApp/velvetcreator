import type { LedgerAccount, TransactionType } from "@creator/shared";
import type { FeeBreakdown } from "./fees";

/** Describes ledger lines to persist after a completed payment */
export type LedgerLineInput = {
  account: LedgerAccount;
  amountCents: number;
  direction: "credit" | "debit";
  userId?: string;
  creatorProfileId?: string;
};

export function buildLedgerLines(
  fees: FeeBreakdown,
  opts: {
    transactionType: TransactionType;
    creatorProfileId: string;
    useEscrow: boolean;
  }
): LedgerLineInput[] {
  const lines: LedgerLineInput[] = [];
  const { creatorProfileId, useEscrow } = opts;

  if (fees.platformFeeCents > 0) {
    lines.push({
      account: "platform_revenue",
      amountCents: fees.platformFeeCents,
      direction: "credit",
    });
  }

  if (fees.creatorNetCents > 0) {
    lines.push({
      account: useEscrow ? "escrow_hold" : "creator_available",
      amountCents: fees.creatorNetCents,
      direction: "credit",
      creatorProfileId,
    });
  }

  return lines;
}

export function releaseEscrowToAvailable(
  amountCents: number,
  creatorProfileId: string
): LedgerLineInput[] {
  return [
    {
      account: "escrow_hold",
      amountCents,
      direction: "debit",
      creatorProfileId,
    },
    {
      account: "creator_available",
      amountCents,
      direction: "credit",
      creatorProfileId,
    },
  ];
}
