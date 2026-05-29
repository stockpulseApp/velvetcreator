import { prisma } from "@creator/db";

export async function hasLiveTicket(
  userId: string,
  liveSessionId: string
): Promise<boolean> {
  const txs = await prisma.transaction.findMany({
    where: {
      payerId: userId,
      type: "live",
      status: "completed",
    },
    select: { metadata: true },
    take: 50,
    orderBy: { createdAt: "desc" },
  });

  return txs.some((t) => {
    const meta = t.metadata as { liveSessionId?: string } | null;
    return meta?.liveSessionId === liveSessionId;
  });
}
