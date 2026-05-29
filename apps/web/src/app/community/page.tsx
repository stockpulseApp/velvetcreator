import Link from "next/link";
import { prisma } from "@creator/db";
import { AppContainer } from "@/components/layout/AppContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { WaitlistForm } from "@/components/marketing/WaitlistForm";
import { TRENDING_POST_LIMIT, EXPLORE_CREATOR_LIMIT } from "@/lib/constants";
import { allFetishTags, tagLabel } from "@/lib/fetishes";

export const metadata = {
  title: "Community",
  description:
    "Join VelvetCreator — discover creators, trending niches, and public conversation.",
};

export default async function CommunityHubPage() {
  const tagPool = allFetishTags().slice(0, 12);

  const [creators, publicPosts, memberCount, followCount] = await Promise.all([
    prisma.creatorProfile.findMany({
      where: { approvedAt: { not: null } },
      orderBy: [{ displayFollowerCount: "desc" }, { createdAt: "desc" }],
      take: EXPLORE_CREATOR_LIMIT,
      select: {
        handle: true,
        headline: true,
        isDemo: true,
        displayFollowerCount: true,
        tags: { take: 3 },
        _count: { select: { follows: true } },
      },
    }),
    prisma.post.findMany({
      where: { visibility: "public" },
      orderBy: { createdAt: "desc" },
      take: TRENDING_POST_LIMIT,
      include: {
        creator: { select: { handle: true } },
        _count: { select: { comments: true, likes: true } },
      },
    }),
    prisma.user.count(),
    prisma.follow.count(),
  ]);

  return (
    <AppContainer wide>
      <PageHeader
        title="Community"
        subtitle="Discover creators, join the conversation, and grow with a platform built for adult niches — not generic social."
        action={
          <Link href="/community/guidelines" className="btn btn-secondary btn-sm">
            Guidelines
          </Link>
        }
      />

      <div className="mb-12 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Members", value: memberCount },
          { label: "Creator follows", value: followCount },
          { label: "Public posts", value: publicPosts.length },
        ].map((s) => (
          <div key={s.label} className="card-glass text-center">
            <p className="font-display text-3xl text-[var(--accent-bright)]">
              {s.value.toLocaleString()}
            </p>
            <p className="mt-1 text-xs uppercase tracking-widest text-[var(--muted)]">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <section className="mb-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-2xl">Trending niches</h2>
          <Link href="/fetishes" className="text-sm text-[var(--accent-bright)] hover:underline">
            Full catalog →
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {tagPool.map((tag) => (
            <Link
              key={tag}
              href={`/explore?tag=${encodeURIComponent(tag)}`}
              className="rounded-full bg-[var(--surface)] px-4 py-2 text-sm capitalize hover:bg-[var(--surface-hover)]"
            >
              #{tagLabel(tag)}
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-14 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl">Public pulse</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Teasers from creators — subscribe or unlock for the full feed.
          </p>
          <ul className="mt-6 space-y-4">
            {publicPosts.map((post) => (
              <li key={post.id} className="card">
                <Link
                  href={`/u/${post.creator.handle}`}
                  className="text-sm font-medium text-[var(--accent-bright)] hover:underline"
                >
                  @{post.creator.handle}
                </Link>
                <p className="mt-2 line-clamp-3 text-[var(--text-secondary)]">
                  {post.body}
                </p>
                <p className="mt-3 text-xs text-[var(--muted)]">
                  {post._count.likes} likes · {post._count.comments} comments
                </p>
              </li>
            ))}
            {!publicPosts.length && (
              <p className="text-sm text-[var(--muted)]">No public posts yet.</p>
            )}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-2xl">Featured creators</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Follow to build your personalized feed.
          </p>
          <ul className="mt-6 space-y-3">
            {creators.slice(0, 8).map((c) => (
              <li key={c.handle}>
                <Link
                  href={`/u/${c.handle}`}
                  className="card-interactive flex items-center justify-between gap-4 p-4"
                >
                  <div>
                    <span className="font-medium text-[var(--accent-bright)]">
                      @{c.handle}
                    </span>
                    {c.headline && (
                      <p className="mt-1 line-clamp-1 text-sm text-[var(--muted)]">
                        {c.headline}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-[var(--muted)]">
                    {(c.displayFollowerCount ?? c._count.follows).toLocaleString()}{" "}
                    followers
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/explore" className="btn btn-primary mt-6 w-full">
            Discover all creators
          </Link>
        </div>
      </section>

      <section className="card-glass mx-auto max-w-xl text-center">
        <h2 className="font-display text-2xl">Join the waitlist</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Early access, creator onboarding, and community updates.
        </p>
        <div className="mt-6">
          <WaitlistForm />
        </div>
      </section>
    </AppContainer>
  );
}
