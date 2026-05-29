import Link from "next/link";
import { AppContainer } from "@/components/layout/AppContainer";

export const metadata = { title: "Safety & Trust" };

export default function SafetyPage() {
  return (
    <AppContainer>
      <article className="mx-auto max-w-3xl">
        <h1 className="font-display text-4xl font-semibold">Safety & trust</h1>
        <p className="mt-4 text-lg text-[var(--text-secondary)]">
          We built verification, escrow, and moderation into the product — not as
          afterthoughts.
        </p>
        <div className="mt-10 grid gap-4">
          {[
            {
              title: "Age verification",
              body: "Every user confirms 18+ before viewing adult content or paying. Production uses certified ID vendors.",
            },
            {
              title: "Creator verification",
              body: "Identity check before first payout. Creator review can be manual or automatic depending on platform settings.",
            },
            {
              title: "Escrow on customs",
              body: "Fan funds are held until the creator completes the agreed request.",
            },
            {
              title: "Block & report",
              body: "Available on profiles, posts, and messages. Admin queue for urgent reports.",
            },
          ].map((item) => (
            <div key={item.title} className="card">
              <h2 className="font-display text-xl">{item.title}</h2>
              <p className="mt-2 text-[var(--text-secondary)]">{item.body}</p>
            </div>
          ))}
        </div>
        <Link href="/community" className="btn btn-secondary mt-10">
          Read community guidelines
        </Link>
      </article>
    </AppContainer>
  );
}
