import { prisma } from "@creator/db";
import type { PostVisibility } from "@creator/shared";

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

export async function canViewPost(
  userId: string | null,
  ageVerified: boolean,
  post: {
    visibility: PostVisibility;
    creatorProfileId: string;
    ppvPriceCents: number | null;
    id: string;
  }
): Promise<{ allowed: boolean; reason?: string; needsPpv?: boolean }> {
  if (!ageVerified) {
    return { allowed: false, reason: "age_gate" };
  }

  if (post.visibility === "public") {
    return { allowed: true };
  }

  if (!userId) {
    return { allowed: false, reason: "login" };
  }

  if (post.visibility === "subscribers") {
    const subbed = await fanHasActiveSubscription(userId, post.creatorProfileId);
    return subbed ? { allowed: true } : { allowed: false, reason: "subscribe" };
  }

  if (post.visibility === "ppv") {
    const ppvTxs = await prisma.transaction.findMany({
      where: {
        payerId: userId,
        type: "ppv",
        status: "completed",
        payeeCreatorId: post.creatorProfileId,
      },
      take: 50,
    });
    const unlocked = ppvTxs.some((t) => {
      const meta = t.metadata as { postId?: string } | null;
      return meta?.postId === post.id;
    });
    if (unlocked) return { allowed: true };
    return { allowed: false, reason: "ppv", needsPpv: true };
  }

  return { allowed: true };
}

export async function canMessageCreator(
  fanId: string,
  creatorProfileId: string,
  subscribersOnly: boolean
) {
  if (!subscribersOnly) return true;
  return fanHasActiveSubscription(fanId, creatorProfileId);
}
