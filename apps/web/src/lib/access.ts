import { prisma } from "@creator/db";
import type { PostVisibility } from "@creator/shared";

export type PostAccessInput = {
  id: string;
  visibility: PostVisibility;
  creatorProfileId: string;
  ppvPriceCents: number | null;
};

export type PostAccessResult = {
  allowed: boolean;
  reason?: string;
  needsPpv?: boolean;
};

export async function fanHasActiveSubscription(
  fanId: string,
  creatorProfileId: string
): Promise<boolean> {
  const sub = await prisma.fanSubscription.findUnique({
    where: {
      fanId_creatorProfileId: { fanId, creatorProfileId },
    },
  });
  return (
    !!sub &&
    sub.status === "active" &&
    sub.currentPeriodEnd > new Date()
  );
}

export async function batchPostAccess(
  userId: string | null,
  ageVerified: boolean,
  posts: PostAccessInput[]
): Promise<Map<string, PostAccessResult>> {
  const results = new Map<string, PostAccessResult>();

  if (!ageVerified) {
    for (const p of posts) {
      results.set(p.id, { allowed: false, reason: "age_gate" });
    }
    return results;
  }

  if (!userId) {
    for (const p of posts) {
      if (p.visibility === "public") {
        results.set(p.id, { allowed: true });
      } else {
        results.set(p.id, { allowed: false, reason: "login" });
      }
    }
    return results;
  }

  const creatorIds = [
    ...new Set(
      posts
        .filter((p) => p.visibility === "subscribers")
        .map((p) => p.creatorProfileId)
    ),
  ];

  const subs =
    creatorIds.length > 0
      ? await prisma.fanSubscription.findMany({
          where: {
            fanId: userId,
            creatorProfileId: { in: creatorIds },
            status: "active",
            currentPeriodEnd: { gt: new Date() },
          },
          select: { creatorProfileId: true },
        })
      : [];
  const subbedCreators = new Set(subs.map((s) => s.creatorProfileId));

  const ppvPostIds = posts.filter((p) => p.visibility === "ppv").map((p) => p.id);
  const unlocks =
    ppvPostIds.length > 0
      ? await prisma.postUnlock.findMany({
          where: { userId, postId: { in: ppvPostIds } },
          select: { postId: true },
        })
      : [];
  const unlockedPosts = new Set(unlocks.map((u) => u.postId));

  const lockedPpv = posts.filter(
    (p) => p.visibility === "ppv" && !unlockedPosts.has(p.id)
  );
  if (lockedPpv.length > 0) {
    const legacyTxs = await prisma.transaction.findMany({
      where: {
        payerId: userId,
        type: "ppv",
        status: "completed",
        payeeCreatorId: {
          in: [...new Set(lockedPpv.map((p) => p.creatorProfileId))],
        },
      },
      select: { metadata: true },
      take: 100,
      orderBy: { createdAt: "desc" },
    });
    for (const post of lockedPpv) {
      const ok = legacyTxs.some((t) => {
        const meta = t.metadata as { postId?: string } | null;
        return meta?.postId === post.id;
      });
      if (ok) unlockedPosts.add(post.id);
    }
  }

  for (const post of posts) {
    if (post.visibility === "public") {
      results.set(post.id, { allowed: true });
      continue;
    }
    if (post.visibility === "subscribers") {
      results.set(
        post.id,
        subbedCreators.has(post.creatorProfileId)
          ? { allowed: true }
          : { allowed: false, reason: "subscribe" }
      );
      continue;
    }
    if (post.visibility === "ppv") {
      results.set(
        post.id,
        unlockedPosts.has(post.id)
          ? { allowed: true }
          : { allowed: false, reason: "ppv", needsPpv: true }
      );
      continue;
    }
    results.set(post.id, { allowed: true });
  }

  return results;
}

export async function canViewPost(
  userId: string | null,
  ageVerified: boolean,
  post: PostAccessInput
): Promise<PostAccessResult> {
  const map = await batchPostAccess(userId, ageVerified, [post]);
  return map.get(post.id) ?? { allowed: false, reason: "login" };
}

export async function canMessageCreator(
  fanId: string,
  creatorProfileId: string,
  subscribersOnly: boolean
) {
  if (!subscribersOnly) return true;
  return fanHasActiveSubscription(fanId, creatorProfileId);
}
