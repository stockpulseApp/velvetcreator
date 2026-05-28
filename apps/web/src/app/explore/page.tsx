import Link from "next/link";
import { prisma } from "@creator/db";
import { AppContainer } from "@/components/layout/AppContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatMoney } from "@creator/shared";
import { TagFilter } from "@/components/explore/TagFilter";

type Props = { searchParams: Promise<{ tag?: string }> };

export default async function ExplorePage({ searchParams }: Props) {
  const { tag } = await searchParams;
  const now = new Date();

  const allTags = await prisma.creatorTag.findMany({
    distinct: ["tag"],
    select: { tag: true },
    take: 24,
  });

  const promoted = await prisma.promotion.findMany({
    where: { active: true, startsAt: { lte: now }, endsAt: { gte: now } },
    include: { creator: { include: { tags: true, subscriptionTiers: { where: { active: true }, orderBy: { priceCents: "asc" }, take: 1 } } } },
    take: 4,
  });

  const creators = await prisma.creatorProfile.findMany({
    where: {
      approvedAt: { not: null },
      ...(tag ? { tags: { some: { tag } } } : {}),
    },
    include: {
      tags: true,
      subscriptionTiers: { where: { active: true }, orderBy: { priceCents: "asc" }, take: 1 },
      _count: { select: { follows: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 48,
  });

  const promotedIds = new Set(promoted.map((p) => p.creatorProfileId));
  const sorted = [...creators].sort((a, b) => {
    const ab = promotedIds.has(a.id) ? 1 : 0;
    const bb = promotedIds.has(b.id) ? 1 : 0;
    return bb - ab;
  });

  return (
    <AppContainer wide>
      <PageHeader
        title="Discover"
        subtitle="Browse by fetish tag. Subscribe, tip, or request something made just for you."
      />

      <TagFilter tags={allTags.map((t) => t.tag)} active={tag} />

      {promoted.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
            Featured tonight
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {promoted.map((p) => (
              <CreatorTile key={p.id} creator={p.creator} featured />
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sorted.map((c) => (
          <CreatorTile key={c.id} creator={c} />
        ))}
      </div>

      {!sorted.length && (
        <div className="card py-16 text-center">
          <p className="text-[var(--text-secondary)]">No creators match this tag yet.</p>
          <Link href="/explore" className="btn btn-secondary mt-4">
            Clear filter
          </Link>
        </div>
      )}
    </AppContainer>
  );
}

function CreatorTile({
  creator,
  featured,
}: {
  creator: {
    id: string;
    handle: string;
    headline: string | null;
    bio: string | null;
    isLive: boolean;
    tags: { tag: string }[];
    subscriptionTiers: { priceCents: number }[];
    _count?: { follows: number };
  };
  featured?: boolean;
}) {
  return (
    <Link
      href={`/u/${creator.handle}`}
      className={`card card-interactive group overflow-hidden p-0 ${
        featured ? "ring-1 ring-[var(--rose)]/30" : ""
      }`}
    >
      <div className="relative aspect-[4/3] bg-gradient-to-br from-[var(--rose)]/25 via-[var(--surface)] to-[var(--bg)]">
        {creator.isLive && (
          <span className="badge badge-live absolute left-3 top-3">Live</span>
        )}
        {featured && (
          <span className="badge badge-gold absolute right-3 top-3">Featured</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-display text-xl font-medium group-hover:text-[var(--accent-bright)]">
            @{creator.handle}
          </p>
          {creator._count && (
            <span className="text-xs text-[var(--muted)]">
              {creator._count.follows} fans
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
          {creator.headline || creator.bio}
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
          {creator.tags.slice(0, 4).map((t) => (
            <span key={t.tag} className="badge badge-muted">
              #{t.tag}
            </span>
          ))}
        </div>
        {creator.subscriptionTiers[0] && (
          <p className="mt-3 text-sm font-medium text-[var(--accent)]">
            From {formatMoney(creator.subscriptionTiers[0].priceCents)}/mo
          </p>
        )}
      </div>
    </Link>
  );
}
