import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { jsonError, parseJson, withRateLimit } from "@/lib/api-utils";

export async function POST(request: Request) {
  const limited = withRateLimit("block", 20, 60_000);
  if (limited) return limited;

  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const body = await parseJson<{ userId?: string }>(request);
  if (!body?.userId || body.userId === session.userId) {
    return jsonError("Invalid user", 400);
  }

  await prisma.userBlock.upsert({
    where: {
      blockerId_blockedId: {
        blockerId: session.userId,
        blockedId: body.userId,
      },
    },
    create: { blockerId: session.userId, blockedId: body.userId },
    update: {},
  });

  await prisma.follow.deleteMany({
    where: {
      OR: [
        { followerId: session.userId, creator: { userId: body.userId } },
        { followerId: body.userId, creator: { userId: session.userId } },
      ],
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const body = await parseJson<{ userId?: string }>(request);
  if (!body?.userId) return jsonError("userId required", 400);

  await prisma.userBlock.deleteMany({
    where: { blockerId: session.userId, blockedId: body.userId },
  });

  return NextResponse.json({ ok: true });
}
