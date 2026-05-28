import Link from "next/link";
import { prisma } from "@creator/db";
import { formatMoney } from "@creator/shared";

export async function CreatorShowcase() {
  let creators: Awaited<ReturnType<typeof loadCreators>> = [];
  try {
    creators = await loadCreators();
  } catch {
    creators = [];
  }

  if (!creators.length) return null;

  return (
    <section className="py-20 md:py-28">
      <div className="container-wide">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold md:text-4xl">
              Discover creators
            </h2>
            <p className="mt-2 text-[var(--text-secondary)]">
              Live now on VelvetCreator — follow, subscribe, or request something custom.
            </p>
          </div>
          <Link href="/explore" className="btn btn-secondary btn-sm hidden md:inline-flex">
            View all
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {creators.map((c) => (
            <Link
              key={c.id}
              href={`/u/${c.handle}`}
              className="card card-interactive group overflow-hidden p-0"
            >
              <div
                className="relative h-36 bg-gradient-to-br from-[var(--rose)]/30 to-[var(--surface)]"
              >
                {c.isLive && (
                  <span className="badge badge-live absolute left-3 top-3">Live</span>
                )}
              </div>
              <div className="p-4">
                <p className="font-display text-lg font-medium group-hover:text-[var(--accent-bright)]">
                  @{c.handle}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                  {c.headline || c.bio}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {c.tags.slice(0, 3).map((t) => (
                    <span key={t.tag} className="badge badge-muted">
                      #{t.tag}
                    </span>
                  ))}
                </div>
                {c.subscriptionTiers[0] && (
                  <p className="mt-3 text-xs text-[var(--text-secondary)]">
                    From {formatMoney(c.subscriptionTiers[0].priceCents)}/mo
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/explore" className="btn btn-secondary">
            View all creators
          </Link>
        </div>
      </div>
    </section>
  );
}

async function loadCreators() {
  return prisma.creatorProfile.findMany({
    where: { approvedAt: { not: null } },
    include: {
      tags: true,
      subscriptionTiers: { where: { active: true }, orderBy: { priceCents: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
}
