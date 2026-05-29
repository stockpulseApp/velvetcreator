import Link from "next/link";
import { AppContainer } from "@/components/layout/AppContainer";

export default function ForCreatorsPage() {
  return (
    <AppContainer wide>
      <div className="mx-auto max-w-3xl">
        <p className="badge badge-gold mb-4">For creators</p>
        <h1 className="font-display text-4xl font-semibold md:text-5xl">
          Keep more. Earn more ways. Own the relationship.
        </h1>
        <p className="mt-6 text-lg text-[var(--text-secondary)]">
          VelvetCreator is built for fetish creators who have outgrown a single
          subscription button — without the chaos of dating apps or the opacity of
          legacy platforms.
        </p>

        <div className="mt-12 space-y-6">
          {[
            {
              title: "15% commission for your first 90 days",
              body: "Then 20% — or 15% with Creator Pro. Transparent splits on every transaction type.",
            },
            {
              title: "Seven revenue streams, one studio",
              body: "Subs, tips, PPV, live tickets, paid DMs, physical shop, escrow customs.",
            },
            {
              title: "Fetish-native discovery",
              body: "Tag your niche. Fans find you by kink, not by luck on a generic timeline.",
            },
            {
              title: "Escrow on custom requests",
              body: "Fans pay upfront. You deliver. Funds release when you mark complete.",
            },
          ].map((item) => (
            <div key={item.title} className="card">
              <h2 className="font-display text-xl font-medium">{item.title}</h2>
              <p className="mt-2 text-[var(--text-secondary)]">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link href="/signup?role=creator" className="btn btn-primary">
            Apply to create
          </Link>
          <Link href="/fetishes" className="btn btn-secondary">
            Browse fetish tags
          </Link>
          <Link href="/creator/apply" className="btn btn-ghost">
            I already have an account
          </Link>
        </div>
      </div>
    </AppContainer>
  );
}
