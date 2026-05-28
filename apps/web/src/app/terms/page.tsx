import { AppContainer } from "@/components/layout/AppContainer";
import { LegalProse, LegalSection } from "@/components/legal/LegalProse";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <AppContainer>
      <h1 className="font-display text-4xl font-semibold">Terms of Service</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Last updated: May 28, 2026</p>
      <LegalProse>
        <p>
          These Terms of Service (&quot;Terms&quot;) govern access to VelvetCreator
          (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;). By creating an account or using
          the Platform you agree to these Terms.
        </p>

        <LegalSection title="1. Eligibility">
          <p>
            You must be at least 18 years old (or the age of majority in your
            jurisdiction, whichever is higher) and legally permitted to access adult
            content where you are located. Creators must complete identity and age
            verification before receiving payouts or publishing subscriber-only content.
          </p>
        </LegalSection>

        <LegalSection title="2. Accounts">
          <p>
            You are responsible for safeguarding your credentials. One person per
            account unless you operate an approved agency relationship. We may suspend
            accounts that violate these Terms or our Community Guidelines.
          </p>
        </LegalSection>

        <LegalSection title="3. Platform role">
          <p>
            VelvetCreator provides technology for creators to publish content, sell
            subscriptions, receive tips, run live sessions, fulfill custom requests,
            and sell physical goods. Except where we act as payment facilitator, we
            are not a party to agreements between fans and creators.
          </p>
        </LegalSection>

        <LegalSection title="4. Fees and payments">
          <p>
            Platform commission, escrow fees on custom requests, payout fees, listing
            fees, and optional platform plans (e.g. Creator Pro, Fan Platform+) are
            disclosed at checkout and in the creator studio. Promotional commission
            rates may apply for new creators for a limited period.
          </p>
          <p>
            Payments are processed by third-party adult payment processors. You agree
            to their terms and chargeback rules. We do not store full payment card
            numbers on our servers.
          </p>
        </LegalSection>

        <LegalSection title="5. Creator obligations">
          <p>
            Creators represent that they own or have rights to all content they upload;
            that all depicted persons are adults who have consented to distribution;
            and that they maintain records required by applicable law (including U.S.
            18 U.S.C. § 2257 where applicable). Creators are responsible for taxes on
            their earnings.
          </p>
        </LegalSection>

        <LegalSection title="6. Fan conduct">
          <p>
            Fans may not harass creators, share login credentials, attempt to circumvent
            paywalls, or use the Platform for illegal activity. Paid messages and custom
            requests must respect creator boundaries stated on their profile.
          </p>
        </LegalSection>

        <LegalSection title="7. Prohibited content and conduct">
          <p>
            Zero tolerance for illegal content, minors, non-consensual material,
            trafficking, bestiality, or content that violates our Community Guidelines.
            We may remove content, withhold payouts, terminate accounts, and report
            to authorities where required.
          </p>
        </LegalSection>

        <LegalSection title="8. Intellectual property">
          <p>
            Creators retain ownership of their content and grant the Platform a limited
            license to host, display, and deliver content to authorized fans. The
            VelvetCreator name, logo, and software are our property.
          </p>
        </LegalSection>

        <LegalSection title="9. Disputes and refunds">
          <p>
            Chargebacks and payment disputes are handled per processor rules. Custom
            request escrow releases when the creator marks work complete or per dispute
            resolution. Physical goods disputes follow the creator&apos;s stated policy
            and applicable consumer law.
          </p>
        </LegalSection>

        <LegalSection title="10. Disclaimer">
          <p>
            The Platform is provided &quot;as is&quot; without warranties of
            uninterrupted service. We are not liable for indirect damages to the extent
            permitted by law. Our aggregate liability is limited to fees you paid us in
            the prior twelve months.
          </p>
        </LegalSection>

        <LegalSection title="11. Changes">
          <p>
            We may update these Terms. Material changes will be posted with an updated
            date. Continued use after changes constitutes acceptance.
          </p>
        </LegalSection>

        <LegalSection title="12. Contact">
          <p>
            Legal and support inquiries: use the contact method listed on the Platform
            or your account settings once published.
          </p>
        </LegalSection>
      </LegalProse>
    </AppContainer>
  );
}
