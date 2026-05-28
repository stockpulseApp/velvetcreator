import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@creator/db";
import { formatMoney } from "@creator/shared";
import { PayButton } from "@/components/PayButton";
import { AppContainer } from "@/components/layout/AppContainer";
import { PageHeader } from "@/components/layout/PageHeader";

type Props = { params: Promise<{ handle: string }> };

export default async function SubscribePage({ params }: Props) {
  const { handle } = await params;
  const creator = await prisma.creatorProfile.findUnique({
    where: { handle },
    include: {
      subscriptionTiers: {
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  if (!creator) notFound();

  return (
    <AppContainer>
      <Link
        href={`/u/${handle}`}
        className="text-sm text-[var(--muted)] hover:text-[var(--accent-bright)]"
      >
        ← @{handle}
      </Link>
      <PageHeader
        title="Membership tiers"
        subtitle="Subscriber perks, DMs, and exclusive drops — cancel anytime"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {creator.subscriptionTiers.map((tier) => {
          const perks = tier.perks as Record<string, unknown>;
          return (
            <div key={tier.id} className="card-glass flex flex-col">
              <p className="font-display text-xl text-[var(--accent-bright)]">
                {tier.name}
              </p>
              <p className="mt-2 font-display text-4xl">
                {formatMoney(tier.priceCents)}
                <span className="text-base font-normal text-[var(--muted)]">
                  /month
                </span>
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-[var(--text-secondary)]">
                {Object.entries(perks).map(([k, v]) => (
                  <li key={k} className="flex gap-2">
                    <span className="text-[var(--accent)]">✓</span>
                    <span>
                      {k}: {String(v)}
                    </span>
                  </li>
                ))}
              </ul>
              <PayButton
                endpoint="/api/pay/subscribe"
                payload={{ tierId: tier.id }}
                label={`Subscribe — ${tier.name}`}
                className="btn btn-primary mt-6 w-full"
              />
            </div>
          );
        })}
      </div>
    </AppContainer>
  );
}
