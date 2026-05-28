import { AppContainer } from "@/components/layout/AppContainer";

export const metadata = { title: "Community Guidelines" };

export default function CommunityPage() {
  return (
    <AppContainer>
      <article className="mx-auto max-w-3xl">
        <h1 className="font-display text-4xl font-semibold">Community guidelines</h1>
        <p className="mt-4 text-[var(--text-secondary)]">
          VelvetCreator exists for consensual adult expression between adults. These
          rules protect creators, fans, and the community we are building.
        </p>
        <ul className="mt-8 space-y-4">
          {[
            "All participants must be 18+ and verified before NSFW access or payments.",
            "Consent is non-negotiable — in content, customs, and private sessions.",
            "No harassment, doxing, or pressure tactics in DMs or live chat.",
            "Physical goods must ship legally with discreet packaging as described.",
            "Report suspicious activity — our team reviews every flag.",
          ].map((rule) => (
            <li key={rule} className="card flex gap-3 text-[var(--text-secondary)]">
              <span className="text-[var(--rose)]">◆</span>
              {rule}
            </li>
          ))}
        </ul>
      </article>
    </AppContainer>
  );
}
