import {
  BASE_COMMISSION_BPS,
  CREATOR_PRO_COMMISSION_BPS,
  ESCROW_FEE_CENTS,
  LISTING_FEE_CENTS,
  PROMO_COMMISSION_BPS,
  type TransactionType,
} from "@creator/shared";

export type FeeContext = {
  transactionType: TransactionType;
  grossCents: number;
  creatorHasPro?: boolean;
  creatorPromoActive?: boolean;
  passEscrowFeeToFan?: boolean;
  includeListingFee?: boolean;
};

export type FeeBreakdown = {
  grossCents: number;
  platformFeeCents: number;
  escrowFeeCents: number;
  listingFeeCents: number;
  processorFeeCents: number;
  creatorNetCents: number;
  fanTotalCents: number;
  commissionBps: number;
};

export function resolveCommissionBps(ctx: {
  creatorHasPro?: boolean;
  creatorPromoActive?: boolean;
}): number {
  if (ctx.creatorHasPro) return CREATOR_PRO_COMMISSION_BPS;
  if (ctx.creatorPromoActive) return PROMO_COMMISSION_BPS;
  return BASE_COMMISSION_BPS;
}

/** Platform-owned plans: no creator commission split */
const PLATFORM_KEEP_TYPES: TransactionType[] = ["platform_plan", "payout"];

export function calculateFees(ctx: FeeContext): FeeBreakdown {
  const { grossCents, transactionType } = ctx;

  if (PLATFORM_KEEP_TYPES.includes(transactionType)) {
    return {
      grossCents,
      platformFeeCents: grossCents,
      escrowFeeCents: 0,
      listingFeeCents: 0,
      processorFeeCents: 0,
      creatorNetCents: 0,
      fanTotalCents: grossCents,
      commissionBps: 10000,
    };
  }

  const commissionBps = resolveCommissionBps(ctx);
  const platformFeeCents = Math.round((grossCents * commissionBps) / 10000);

  const escrowFeeCents =
    transactionType === "custom_request" ? ESCROW_FEE_CENTS : 0;
  const listingFeeCents =
    ctx.includeListingFee && transactionType === "shop"
      ? LISTING_FEE_CENTS
      : 0;

  const processorFeeCents = Math.round(grossCents * 0.029 + 30);

  const creatorNetCents = grossCents - platformFeeCents - listingFeeCents;
  const fanEscrow =
    ctx.passEscrowFeeToFan !== false ? escrowFeeCents : 0;
  const fanTotalCents = grossCents + fanEscrow;

  return {
    grossCents,
    platformFeeCents: platformFeeCents + escrowFeeCents,
    escrowFeeCents,
    listingFeeCents,
    processorFeeCents,
    creatorNetCents,
    fanTotalCents,
    commissionBps,
  };
}

export function instantPayoutFee(amountCents: number): number {
  const percent = Math.round(amountCents * 0.02);
  return Math.max(percent, 200);
}
