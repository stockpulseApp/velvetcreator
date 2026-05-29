import { prisma } from "@creator/db";

/** True if either user has blocked the other. */
export async function usersAreBlocked(
  userA: string,
  userB: string
): Promise<boolean> {
  if (userA === userB) return false;
  const block = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: userA, blockedId: userB },
        { blockerId: userB, blockedId: userA },
      ],
    },
    select: { id: true },
  });
  return !!block;
}
