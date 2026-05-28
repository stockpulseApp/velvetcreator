import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.userId },
  });
  if (!profile?.approvedAt) {
    return NextResponse.json({ error: "Creator not approved" }, { status: 403 });
  }

  const { title, ticketPriceCents, isPrivate } = await request.json();
  const roomName = `live_${profile.handle}_${Date.now()}`;

  const live = await prisma.liveSession.create({
    data: {
      creatorProfileId: profile.id,
      title: title || "Live now",
      roomName,
      ticketPriceCents: Number(ticketPriceCents) || 0,
      status: "live",
      isPrivate: !!isPrivate,
      startedAt: new Date(),
    },
  });

  await prisma.creatorProfile.update({
    where: { id: profile.id },
    data: { isLive: true },
  });

  return NextResponse.json({ ok: true, liveSessionId: live.id, roomName });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { liveSessionId } = await request.json();
  const live = await prisma.liveSession.findUnique({
    where: { id: liveSessionId },
    include: { creator: true },
  });
  if (!live || live.creator.userId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.liveSession.update({
    where: { id: live.id },
    data: { status: "ended", endedAt: new Date() },
  });
  await prisma.creatorProfile.update({
    where: { id: live.creatorProfileId },
    data: { isLive: false },
  });

  return NextResponse.json({ ok: true });
}
