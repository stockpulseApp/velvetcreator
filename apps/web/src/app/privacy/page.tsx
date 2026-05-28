import { AppContainer } from "@/components/layout/AppContainer";
import { LegalProse, LegalSection } from "@/components/legal/LegalProse";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <AppContainer>
      <h1 className="font-display text-4xl font-semibold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Last updated: May 28, 2026</p>
      <LegalProse>
        <p>
          VelvetCreator (&quot;we&quot;) explains here how we collect, use, and protect
          personal information when you use our website and services.
        </p>

        <LegalSection title="Information we collect">
          <p>
            Account data (email, display name, role), age verification status and
            verification metadata, transaction and ledger records, messages, posts,
            shipping addresses for physical orders, device and log data, and cookies
            necessary for authentication and security.
          </p>
        </LegalSection>

        <LegalSection title="Age verification">
          <p>
            We use identity vendors (e.g. Veriff, Yoti) or automated checks in
            development. Government ID images are processed by the vendor; we store
            verification status, date of birth, and non-reversible document fingerprints
            where applicable — not raw ID images in production configuration.
          </p>
        </LegalSection>

        <LegalSection title="Payments">
          <p>
            Payment card data is collected and stored by our payment processors. We
            receive tokens, transaction IDs, and settlement status — not full card
            numbers.
          </p>
        </LegalSection>

        <LegalSection title="How we use data">
          <p>
            To operate accounts, process payments, prevent fraud, enforce policies,
            provide creator analytics, improve the product, and comply with law.
          </p>
        </LegalSection>

        <LegalSection title="Sharing">
          <p>
            We share data with payment processors, identity verification providers,
            hosting and database providers, and authorities when legally required. We do
            not sell personal information to advertisers.
          </p>
        </LegalSection>

        <LegalSection title="Retention">
          <p>
            We retain account and transaction data as needed for operations, tax, and
            legal obligations. You may request deletion subject to limits (e.g. records
            we must keep for financial compliance).
          </p>
        </LegalSection>

        <LegalSection title="Security">
          <p>
            We use encryption in transit, access controls, and industry-standard
            hosting. No method of transmission is 100% secure.
          </p>
        </LegalSection>

        <LegalSection title="Your rights">
          <p>
            Depending on your region you may have rights to access, correct, delete, or
            port data, and to object to certain processing. Contact us to exercise
            these rights.
          </p>
        </LegalSection>

        <LegalSection title="International users">
          <p>
            Data may be processed in the United States and other countries where our
            providers operate. By using the Platform you consent to transfer where
            permitted by law.
          </p>
        </LegalSection>

        <LegalSection title="Children">
          <p>
            The Platform is not directed to anyone under 18. We do not knowingly collect
            data from minors.
          </p>
        </LegalSection>

        <LegalSection title="Contact">
          <p>
            Privacy requests: use the contact method published on the Platform.
          </p>
        </LegalSection>
      </LegalProse>
    </AppContainer>
  );
}
