import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { formatMoney } from "@creator/shared";
import { AppContainer } from "@/components/layout/AppContainer";
import { PayButton } from "@/components/PayButton";
import { FollowButton } from "@/components/FollowButton";
import { TipForm } from "@/components/TipForm";
import { CustomRequestForm } from "@/components/CustomRequestForm";

type Props = { params: Promise<{ handle: string }> };

export default async function CreatorProfilePage({ params }: Props) {
  const { handle } = await params;
  const session = await getSession();

  const creator = await prisma.creatorProfile.findUnique({
    where: { handle },
    include: {
      user: { select: { displayName: true } },
      tags: true,
      subscriptionTiers: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      listings: { where: { active: true }, take: 6 },
      liveSessions: { where: { status: "live" }, take: 1 },
      posts: { orderBy: { createdAt: "desc" }, take: 12 },
      _count: { select: { follows: true } },
    },
  });

  if (!creator) notFound();

  const live = creator.liveSessions[0];
  const displayName = creator.user.displayName;

  let messageHref = `/messages?creator=${creator.id}`;
  if (session) {
    const existing = await prisma.conversation.findUnique({
      where: {
        fanId_creatorProfileId: {
          fanId: session.userId,
          creatorProfileId: creator.id,
        },
      },
      select: { id: true },
    });
    if (existing) messageHref = `/messages?conversation=${existing.id}`;
  }

  return (
    <AppContainer wide>
      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)]">
        <div className="profile-banner relative">
          {creator.isLive && live && (
            <Link
              href={`/live/${live.id}`}
              className="badge badge-live absolute bottom-4 left-4"
            >
              Join live now
            </Link>
          )}
        </div>

        <div className="relative px-6 pb-8 pt-0 md:px-10">
          <div className="-mt-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-4">
              <div
                className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-[var(--surface)] font-display text-3xl font-semibold text-white md:h-28 md:w-28"
                style={{
                  background:
                    "linear-gradient(135deg, var(--rose), var(--accent-deep))",
                }}
              >
                {handle.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h1 className="font-display text-3xl font-semibold md:text-4xl">
                  @{creator.handle}
                </h1>
                <p className="text-[var(--text-secondary)]">{displayName}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {creator._count.follows} followers
                </p>
              </div>
            </div>
            {session && (
              <div className="flex flex-wrap gap-2">
                <FollowButton creatorProfileId={creator.id} />
                <Link href={`/u/${handle}/subscribe`} className="btn btn-primary">
                  Subscribe
                </Link>
                <Link href={messageHref} className="btn btn-secondary">
                  Message
                </Link>
              </div>
            )}
          </div>

          {creator.headline && (
            <p className="mt-6 text-lg text-[var(--accent-bright)]">{creator.headline}</p>
          )}
          <p className="mt-3 max-w-2xl whitespace-pre-wrap text-[var(--text-secondary)]">
            {creator.bio}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {creator.tags.map((t) => (
              <Link
                key={t.id}
                href={`/explore?tag=${encodeURIComponent(t.tag)}`}
                className="badge badge-muted hover:bg-[var(--surface-hover)]"
              >
                #{t.tag}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section>
            <h2 className="font-display text-2xl font-medium">Posts</h2>
            <div className="mt-4 space-y-4">
              {creator.posts.map((post) => (
                <article key={post.id} className="card">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-muted">{post.visibility}</span>
                    <time className="text-xs text-[var(--muted)]">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                  <p className="mt-3 leading-relaxed">{post.body}</p>
                  {post.visibility === "ppv" && post.ppvPriceCents && session?.ageVerified && (
                    <PayButton
                      endpoint="/api/pay/ppv"
                      payload={{ postId: post.id }}
                      label={`Unlock ${formatMoney(post.ppvPriceCents)}`}
                      className="btn btn-primary btn-sm mt-4"
                    />
                  )}
                </article>
              ))}
            </div>
          </section>

          {creator.listings.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-medium">Shop</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {creator.listings.map((item) => (
                  <div key={item.id} className="card">
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                      {item.description}
                    </p>
                    <p className="mt-3 font-display text-xl text-[var(--accent)]">
                      {formatMoney(item.priceCents)}
                    </p>
                    {session?.ageVerified && (
                      <PayButton
                        endpoint="/api/pay/shop"
                        payload={{ listingId: item.id, quantity: 1 }}
                        label="Buy now"
                        className="btn btn-primary btn-sm mt-4 w-full"
                      />
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          {creator.subscriptionTiers.length > 0 && (
            <div className="card-glass sticky top-24">
              <h2 className="font-display text-xl font-medium">Membership</h2>
              <div className="mt-4 space-y-3">
                {creator.subscriptionTiers.map((tier, i) => (
                  <div
                    key={tier.id}
                    className={`rounded-[var(--radius)] border p-4 ${
                      i === 1
                        ? "border-[var(--rose)]/40 bg-[var(--rose)]/5"
                        : "border-[var(--border)]"
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="font-semibold">{tier.name}</span>
                      <span className="font-display text-lg">
                        {formatMoney(tier.priceCents)}
                      </span>
                    </div>
                    {i === 1 && (
                      <span className="badge badge-gold mt-2">Most popular</span>
                    )}
                  </div>
                ))}
              </div>
              <Link
                href={`/u/${handle}/subscribe`}
                className="btn btn-primary mt-6 w-full"
              >
                Choose tier
              </Link>
            </div>
          )}

          {session?.ageVerified && (
            <>
              <div className="card">
                <h2 className="font-display text-lg font-medium">Send a tip</h2>
                <TipForm creatorProfileId={creator.id} minimum={creator.tipMinimumCents} />
              </div>
              <div className="card">
                <h2 className="font-display text-lg font-medium">Custom request</h2>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Paid upfront · held in escrow until complete
                </p>
                <CustomRequestForm creatorProfileId={creator.id} />
              </div>
            </>
          )}
        </aside>
      </div>
    </AppContainer>
  );
}
