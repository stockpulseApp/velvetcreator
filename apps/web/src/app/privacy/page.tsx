import { AppContainer } from "@/components/layout/AppContainer";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <AppContainer>
      <article className="mx-auto max-w-3xl">
        <h1 className="font-display text-4xl font-semibold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Last updated: May 2026</p>
        <div className="mt-8 space-y-6 text-[var(--text-secondary)]">
          <p>
            We collect account information, verification data, transaction records, and
            usage data necessary to operate payments, safety, and creator tools.
          </p>
          <p>
            Payment card data is processed by our payment partners — we do not store
            full card numbers on our servers.
          </p>
          <p>
            Shipping addresses for physical goods are encrypted and visible only to
            creators fulfilling orders.
          </p>
          <p className="text-sm text-[var(--muted)]">
            Replace with counsel-reviewed privacy policy before production launch.
          </p>
        </div>
      </article>
    </AppContainer>
  );
}
