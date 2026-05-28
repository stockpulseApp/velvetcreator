export type UserRole = "fan" | "creator" | "agency" | "admin";

export type TransactionType =
  | "tip"
  | "ppv"
  | "subscription"
  | "live"
  | "custom_request"
  | "shop"
  | "paid_dm"
  | "platform_plan"
  | "listing_fee"
  | "payout"
  | "instant_payout_fee";

export type TransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "disputed";

export type LedgerAccount =
  | "creator_pending"
  | "creator_available"
  | "creator_escrow"
  | "platform_revenue"
  | "escrow_hold"
  | "fan_wallet";

export type PostVisibility = "public" | "subscribers" | "ppv";

export type CustomRequestStatus =
  | "draft"
  | "paid"
  | "accepted"
  | "in_session"
  | "completed"
  | "disputed"
  | "refunded"
  | "cancelled";

export type OrderStatus =
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PlatformPlanSlug = "creator_pro" | "fan_platform_plus";

export const BASE_COMMISSION_BPS = 2000;
export const PROMO_COMMISSION_BPS = 1500;
export const CREATOR_PRO_COMMISSION_BPS = 1500;
export const ESCROW_FEE_CENTS = 200;
export const LISTING_FEE_CENTS = 100;

export function formatMoney(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}
