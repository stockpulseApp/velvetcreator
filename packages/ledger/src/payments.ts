import type { TransactionType } from "@creator/shared";
import { calculateFees, type FeeContext } from "./fees";

export type PaymentIntentInput = FeeContext & {
  payerUserId: string;
  payeeCreatorId: string;
  metadata?: Record<string, string>;
};

export type PaymentIntentResult = {
  provider: "mock" | "ccbill" | "segpay";
  externalId: string;
  checkoutUrl: string | null;
  status: "pending" | "completed" | "failed";
  fees: ReturnType<typeof calculateFees>;
};

export interface PaymentProvider {
  createPayment(input: PaymentIntentInput): Promise<PaymentIntentResult>;
  verifyWebhook(
    body: string,
    signature: string | null
  ): Promise<{ event: string; externalId: string; status: string } | null>;
}

export class MockPaymentProvider implements PaymentProvider {
  async createPayment(input: PaymentIntentInput): Promise<PaymentIntentResult> {
    const fees = calculateFees(input);
    const autoSucceed = process.env.MOCK_PAYMENT_AUTO_SUCCEED !== "false";
    const externalId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    return {
      provider: "mock",
      externalId,
      checkoutUrl: null,
      status: autoSucceed ? "completed" : "pending",
      fees,
    };
  }

  async verifyWebhook(): Promise<null> {
    return null;
  }
}

export function getPaymentProvider(): PaymentProvider {
  const mode = process.env.PAYMENTS_MODE ?? "mock";
  if (mode === "mock") return new MockPaymentProvider();
  // Production: swap for CCBill/Segpay adapter
  return new MockPaymentProvider();
}

export function transactionTypeLabel(type: TransactionType): string {
  const labels: Record<TransactionType, string> = {
    tip: "Tip",
    ppv: "PPV unlock",
    subscription: "Subscription",
    live: "Live session",
    custom_request: "Custom request",
    shop: "Shop order",
    paid_dm: "Paid message",
    platform_plan: "Platform plan",
    listing_fee: "Listing fee",
    payout: "Payout",
    instant_payout_fee: "Instant payout fee",
  };
  return labels[type] ?? type;
}
