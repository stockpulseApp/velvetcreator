import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { creatorProfileId } = await request.json();

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
