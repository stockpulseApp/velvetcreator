import Link from "next/link";
import { prisma } from "@creator/db";
import { WaitlistForm } from "@/components/marketing/WaitlistForm";
import { CreatorShowcase } from "@/components/marketing/CreatorShowcase";

async function getPublicStats() {
  try {
    const [creators, members, transactions, follows] = await Promise.all([
      prisma.creatorProfile.count({ where: { approvedAt: { not: null } } }),
      prisma.user.count(),
      prisma.transaction.count({ where: { status: "completed" } }),
      prisma.follow.count(),
    ]);
    return { creators, members, transactions, follows };
  } catch {
    return { creators: 0, members: 0, transactions: 0, follows: 0 };
  }
}

function formatStat(n: number) {
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

export default async function HomePage() {
  const stats = await getPublicStats();

  return (
    <>
      <section className="relative overflow-hidden pb-20 pt-12 md:pb-32 md:pt-20">
        <div className="container-wide">
          <div className="mx-auto max-w-4xl text-center">
            <p className="animate-fade-up badge badge-gold mb-6 opacity-0">
              Launching the next creator economy
            </p>
            <h1 className="animate-fade-up font-display text-5xl font-medium leading-[1.1] tracking-tight opacity-0 stagger-1 md:text-7xl lg:text-8xl">
              Your audience.
              <br />
              <span className="bg-gradient-to-r from-[var(--accent-bright)] via-[var(--rose)] to-[var(--accent)] bg-clip-text text-transparent">
                Every way they pay.
              </span>
            </h1>
            <p className="animate-fade-up mx-auto mt-8 max-w-2xl text-lg text-[var(--text-secondary)] opacity-0 stagger-2 md:text-xl">
              Subscriptions, tips, PPV, live tickets, escrow custom requests, and a
              physical fetish shop — one profile, one wallet, one studio that shows
              where every dollar comes from.
            </p>
            <div className="animate-fade-up mt-10 flex flex-col items-center justify-center gap-4 opacity-0 stagger-3 sm:flex-row">
              <Link href="/signup?role=creator" className="btn btn-primary min-w-[200px]">
                Start as a creator
              </Link>
              <Link href="/explore" className="btn btn-secondary min-w-[200px]">
                Explore creators
              </Link>
              <Link href="/fetishes" className="btn btn-ghost min-w-[200px]">
                Browse fetish catalog
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-4 md:mt-24 md:gap-8">
            {[
              { label: "Verified creators", value: formatStat(stats.creators) },
              {
                label: "Community members",
                value: formatStat(stats.members),
              },
              {
                label: "Creator follows",
                value: formatStat(stats.follows),
              },
            ].map((stat) => (
              <div key={stat.label} className="card-glass text-center">
                <p className="font-display text-3xl font-semibold text-[var(--accent-bright)] md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs uppercase tracking-widest text-[var(--muted)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--bg-elevated)] py-20 md:py-28">
        <div className="container-wide">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold md:text-4xl">
              Not another dating app with a paywall bolted on
            </h2>
            <p className="mt-4 text-[var(--text-secondary)]">
              VelvetCreator is built for fetish-native commerce and community — not
              swipes, not ads, not opaque fees.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "OnlyFans gives you one price",
                body: "We give you Bronze, Silver, Gold — perks for feed, DMs, live access, and shop discounts.",
                vs: true,
              },
              {
                title: "Dating apps sell attention",
                body: "We sell trust: 18+ verification, escrow on customs, discreet shipping workflows.",
                vs: true,
              },
              {
                title: "Social feeds sell ads",
                body: "Your fans subscribe to you. Promoted slots are optional — you control the funnel.",
                vs: false,
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`card ${item.vs ? "border-[var(--rose)]/20" : ""}`}
              >
                <h3 className="font-display text-xl font-medium">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CreatorShowcase />

      <section className="py-20 md:py-28">
        <div className="container-wide">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-semibold md:text-4xl">
                Studio that treats you like a business
              </h2>
              <ul className="mt-8 space-y-4">
                {[
                  "Earnings split by stream — subs, tips, PPV, live, shop, customs",
                  "15% launch commission for your first 90 days",
                  "Promote your profile in Discover when you're ready to scale",
                  "Refer creators — earn on platform fees for 12 months",
                ].map((line) => (
                  <li
                    key={line}
                    className="flex gap-3 text-[var(--text-secondary)]"
                  >
                    <span className="text-[var(--accent)]">✦</span>
                    {line}
                  </li>
                ))}
              </ul>
              <Link href="/for-creators" className="btn btn-primary mt-10">
                See creator economics
              </Link>
            </div>
            <div className="card-glass p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                Example split · $100 custom request
              </p>
              <div className="mt-6 space-y-4">
                <div className="flex justify-between border-b border-[var(--border)] pb-3">
                  <span>Fan pays</span>
                  <span className="font-semibold">$102</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Platform (20% + escrow)</span>
                  <span>−$22</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-[var(--accent-bright)]">
                  <span>You receive</span>
                  <span>$80</span>
                </div>
              </div>
              <p className="mt-6 text-xs text-[var(--muted)]">
                Funds held in escrow until you mark the request complete.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--surface)] py-20">
        <div className="container-wide mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl font-semibold">Join the waitlist</h2>
          <p className="mt-3 text-[var(--text-secondary)]">
            Be first when we open new creator slots in your category. No spam — launch
            updates and early-access invites only.
          </p>
          <div className="mt-8">
            <WaitlistForm />
          </div>
        </div>
      </section>
    </>
  );
}
