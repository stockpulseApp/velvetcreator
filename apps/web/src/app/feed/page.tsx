import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { batchPostAccess } from "@/lib/access";
import { FEED_PAGE_SIZE } from "@/lib/constants";
import { formatMoney } from "@creator/shared";
import { AppContainer } from "@/components/layout/AppContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { PayButton } from "@/components/PayButton";
import { LikeButton } from "@/components/LikeButton";
import { ReportButton } from "@/components/ReportButton";
import { PostComments } from "@/components/PostComments";

export default async function FeedPage() {
  const session = await getSession();
  if (!session) return null;

  if (session.role === "creator") {
    const ownProfile = await prisma.creatorProfile.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });
    if (!ownProfile) redirect("/creator/apply");
  }

  const follows = await prisma.follow.findMany({
    where: { followerId: session.userId },
    select: { creatorProfileId: true },
  });
  const creatorIds = follows.map((f) => f.creatorProfileId);

  const posts = creatorIds.length
    ? await prisma.post.findMany({
        where: { creatorProfileId: { in: creatorIds } },
        include: {
          creator: { select: { handle: true } },
          _count: { select: { likes: true } },
        },
        orderBy: { createdAt: "desc" },
        take: FEED_PAGE_SIZE,
      })
    : [];

  const accessMap = await batchPostAccess(
    session.userId,
    session.ageVerified,
    posts
  );
  const enriched = posts.map((post) => ({
    post,
    access: accessMap.get(post.id) ?? { allowed: false, reason: "login" },
  }));

  return (
    <AppContainer>
      <PageHeader
        title="Your feed"
        subtitle="Posts from creators you follow."
        action={
          <Link href="/explore" className="btn btn-secondary btn-sm">
            Find more
          </Link>
        }
      />

      {!creatorIds.length ? (
        <div className="card py-20 text-center">
          <p className="font-display text-2xl">Your feed is quiet</p>
          <p className="mt-2 text-[var(--text-secondary)]">
            Follow creators to see their posts here.
          </p>
          <Link href="/explore" className="btn btn-primary mt-8">
            Discover creators
          </Link>
        </div>
      ) : (
        <div className="mx-auto max-w-2xl space-y-6">
          {enriched.map(({ post, access }) => (
            <article key={post.id} className="card overflow-hidden p-0">
              <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
                <Link
                  href={`/u/${post.creator.handle}`}
                  className="font-display text-lg font-medium hover:text-[var(--accent-bright)]"
                >
                  @{post.creator.handle}
                </Link>
                <span className="badge badge-muted">{post.visibility}</span>
              </div>
              <div className="px-5 py-5">
                {access.allowed ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{post.body}</p>
                ) : (
                  <div className="rounded-[var(--radius)] bg-[var(--bg-elevated)] px-6 py-10 text-center">
                    <p className="text-[var(--muted)]">
                      {access.reason === "subscribe" && "Subscribers only"}
                      {access.reason === "ppv" && "Unlock to view"}
                      {access.reason === "age_gate" && "Verify age to view"}
                    </p>
                    {access.needsPpv && post.ppvPriceCents && (
                      <PayButton
                        endpoint="/api/pay/ppv"
                        payload={{ postId: post.id }}
                        label={`Unlock ${formatMoney(post.ppvPriceCents)}`}
                        className="btn btn-primary btn-sm mt-4"
                      />
                    )}
                    {access.reason === "subscribe" && (
                      <Link
                        href={`/u/${post.creator.handle}/subscribe`}
                        className="btn btn-primary btn-sm mt-4 inline-flex"
                      >
                        Subscribe
                      </Link>
                    )}
                  </div>
                )}
                {access.allowed && (
                  <div className="px-5 pb-2">
                    <PostComments postId={post.id} canComment />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-[var(--border)] px-5 py-3 text-sm text-[var(--muted)]">
                <div className="flex items-center gap-4">
                  <LikeButton postId={post.id} count={post._count.likes} />
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <ReportButton targetType="post" targetId={post.id} label="Report" />
              </div>
            </article>
          ))}
        </div>
      )}
    </AppContainer>
  );
}
