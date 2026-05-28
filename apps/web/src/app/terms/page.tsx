import { AppContainer } from "@/components/layout/AppContainer";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <AppContainer>
      <article className="prose prose-invert mx-auto max-w-3xl">
        <h1 className="font-display text-4xl font-semibold">Terms of Service</h1>
        <p className="text-sm text-[var(--muted)]">Last updated: May 2026</p>
        <div className="mt-8 space-y-6 text-[var(--text-secondary)]">
          <section>
            <h2 className="text-lg font-semibold text-[var(--text)]">1. Eligibility</h2>
            <p>
              You must be at least 18 years old and legally permitted to access adult
              content in your jurisdiction. Creators must complete identity verification
              before receiving payouts.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text)]">2. Platform role</h2>
            <p>
              VelvetCreator provides technology for creators to monetize content and
              commerce. We are not a party to transactions between fans and creators
              except as payment facilitator per our fee schedule.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text)]">3. Fees</h2>
            <p>
              Platform commission, escrow fees, payout fees, and optional subscriptions
              (Creator Pro, Fan Platform+) are disclosed at checkout and in the creator
              studio. Promotional rates may apply for new creators.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text)]">4. Prohibited content</h2>
            <p>
              Zero tolerance for illegal content, minors, non-consensual material, or
              content violating our Community Guidelines. Violations result in
              immediate termination and reporting where required by law.
            </p>
          </section>
          <p className="text-sm text-[var(--muted)]">
            This is a summary for launch. Replace with counsel-reviewed terms before
            production marketing.
          </p>
        </div>
      </article>
    </AppContainer>
  );
}
