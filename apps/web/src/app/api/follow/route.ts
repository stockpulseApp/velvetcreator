import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { usersAreBlocked } from "@/lib/blocks";
import { jsonError, parseJson, withRateLimit } from "@/lib/api-utils";

export async function POST(request: Request) {
  const limited = withRateLimit("follow", 60, 60_000);
  if (limited) return limited;

  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const body = await parseJson<{ creatorProfileId?: string }>(request);
  const creatorProfileId = body?.creatorProfileId;
  if (!creatorProfileId) return jsonError("creatorProfileId required", 400);

  const creator = await prisma.creatorProfile.findUnique({
    where: { id: creatorProfileId },
    select: { userId: true, approvedAt: true },
  });
  if (!creator?.approvedAt) return jsonError("Creator not found", 404);
  if (creator.userId === session.userId) return jsonError("Cannot follow yourself", 400);
  if (await usersAreBlocked(session.userId, creator.userId)) {
    return jsonError("Blocked", 403);
  }

  await prisma.follow.upsert({
    where: {
      followerId_creatorProfileId: {
        followerId: session.userId,
        creatorProfileId,
      },
    },
    create: { followerId: session.userId, creatorProfileId },
    update: {},
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { creatorProfileId } = await request.json();

  await prisma.follow.deleteMany({
    where: { followerId: session.userId, creatorProfileId },
  });

  return NextResponse.json({ ok: true });
}
