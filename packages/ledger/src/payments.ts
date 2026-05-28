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

export class ProcessorNotConfiguredError extends Error {
  constructor(processor: string) {
    super(
      `${processor} is selected (PAYMENTS_MODE) but API credentials are missing. ` +
        `Set processor env vars or use PAYMENTS_MODE=mock for demo. See docs/PAYMENTS.md.`
    );
    this.name = "ProcessorNotConfiguredError";
  }
}

/** Placeholder until CCBill REST credentials are wired — see docs/PAYMENTS.md */
export class CcbillPaymentProvider implements PaymentProvider {
  async createPayment(input: PaymentIntentInput): Promise<PaymentIntentResult> {
    if (!process.env.CCBILL_CLIENT_ACCOUNT || !process.env.CCBILL_SUBACCOUNT) {
      throw new ProcessorNotConfiguredError("CCBill");
    }
    const fees = calculateFees(input);
    return {
      provider: "ccbill",
      externalId: `ccbill_pending_${Date.now()}`,
      checkoutUrl: process.env.CCBILL_FLEXFORM_URL ?? null,
      status: "pending",
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
  if (mode === "ccbill") return new CcbillPaymentProvider();
  if (mode === "segpay") {
    throw new ProcessorNotConfiguredError("Segpay");
  }
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
