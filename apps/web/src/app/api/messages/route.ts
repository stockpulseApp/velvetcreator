import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { canMessageCreator } from "@/lib/access";

async function participant(
  conversationId: string,
  userId: string
): Promise<{ conv: Awaited<ReturnType<typeof loadConv>>; isCreator: boolean } | null> {
  const conv = await loadConv(conversationId);
  if (!conv) return null;
  if (conv.fanId === userId) return { conv, isCreator: false };
  if (conv.creator.userId === userId) return { conv, isCreator: true };
  return null;
}

function loadConv(id: string) {
  return prisma.conversation.findUnique({
    where: { id },
    include: { creator: true },
  });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ fanId: session.userId }, { creator: { userId: session.userId } }],
    },
    include: {
      creator: { select: { handle: true, avatarUrl: true, userId: true } },
      fan: { select: { displayName: true, id: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ conversations });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!session.ageVerified) {
    return NextResponse.json({ error: "Age verification required" }, { status: 403 });
  }

  const body = await request.json();
  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  let conv: Awaited<ReturnType<typeof loadConv>> = null;
  let isCreator = false;

  if (body.conversationId) {
    const part = await participant(body.conversationId, session.userId);
    if (!part) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }
    conv = part.conv;
    isCreator = part.isCreator;
  } else if (body.creatorProfileId) {
    conv = await prisma.conversation.findUnique({
      where: {
        fanId_creatorProfileId: {
          fanId: session.userId,
          creatorProfileId: body.creatorProfileId,
        },
      },
      include: { creator: true },
    });
    if (!conv) {
      conv = await prisma.conversation.create({
        data: {
          fanId: session.userId,
          creatorProfileId: body.creatorProfileId,
          unlockPriceCents: null,
        },
        include: { creator: true },
      });
    }
    isCreator = false;
  } else {
    return NextResponse.json(
      { error: "conversationId or creatorProfileId required" },
      { status: 400 }
    );
  }

  if (!conv) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  if (!isCreator) {
    const allowed = await canMessageCreator(
      session.userId,
      conv.creatorProfileId,
      conv.subscribersOnly
    );
    if (!allowed) {
      return NextResponse.json({ error: "Subscribers only" }, { status: 403 });
    }
    if (conv.unlockPriceCents && !conv.unlockedAt) {
      return NextResponse.json({ error: "Pay to unlock thread" }, { status: 402 });
    }
  }

  const message = await prisma.message.create({
    data: {
      conversationId: conv.id,
      senderId: session.userId,
      body: text,
    },
  });

  await prisma.conversation.update({
    where: { id: conv.id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ ok: true, message, conversationId: conv.id });
}
