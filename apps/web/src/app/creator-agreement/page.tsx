import Link from "next/link";
import { AppContainer } from "@/components/layout/AppContainer";
import { LegalProse, LegalSection } from "@/components/legal/LegalProse";

export const metadata = { title: "Creator Agreement" };

export default function CreatorAgreementPage() {
  return (
    <AppContainer>
      <h1 className="font-display text-4xl font-semibold">Creator Agreement</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Last updated: May 28, 2026</p>
      <LegalProse>
        <p>
          This Creator Agreement supplements the{" "}
          <Link href="/terms" className="text-[var(--accent-bright)] underline">
            Terms of Service
          </Link>{" "}
          for anyone approved as a monetizing creator on VelvetCreator.
        </p>

        <LegalSection title="Approval">
          <p>
            You must apply and be approved before charging fans. We may reject or revoke
            approval for policy violations or incomplete verification.
          </p>
        </LegalSection>

        <LegalSection title="Content standards">
          <p>
            All content must comply with our{" "}
            <Link href="/community" className="text-[var(--accent-bright)] underline">
              Community Guidelines
            </Link>
            . You are solely responsible for obtaining and documenting consent from
            every person depicted.
          </p>
        </LegalSection>

        <LegalSection title="Payouts">
          <p>
            Earnings accrue per our fee schedule. Payouts require completed identity
            verification and minimum thresholds. We may hold funds during disputes,
            chargebacks, or compliance review.
          </p>
        </LegalSection>

        <LegalSection title="Taxes">
          <p>
            You are responsible for income tax and VAT/sales tax in your jurisdictions.
            We may request tax forms before payouts exceed applicable thresholds.
          </p>
        </LegalSection>

        <LegalSection title="Physical goods">
          <p>
            If you sell items through the shop, you must ship as described, use discreet
            packaging where stated, and comply with shipping and customs laws.
          </p>
        </LegalSection>
      </LegalProse>
    </AppContainer>
  );
}
