import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { canMessageCreator } from "@/lib/access";
import { usersAreBlocked } from "@/lib/blocks";
import { jsonError, parseJson, withRateLimit } from "@/lib/api-utils";
import { CONVERSATION_LIST_LIMIT } from "@/lib/constants";

type LoadedConv = NonNullable<Awaited<ReturnType<typeof loadConv>>>;

async function participant(
  conversationId: string,
  userId: string
): Promise<{ conv: LoadedConv; isCreator: boolean } | null> {
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
    take: CONVERSATION_LIST_LIMIT,
  });

  return NextResponse.json({ conversations });
}

export async function POST(request: Request) {
  const limited = withRateLimit(`msg:${(await getSession())?.userId ?? "anon"}`, 40, 60_000);
  if (limited) return limited;

  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);
  if (!session.ageVerified) return jsonError("Age verification required", 403);

  const body = await parseJson<{
    body?: string;
    conversationId?: string;
    creatorProfileId?: string;
  }>(request);
  if (!body) return jsonError("Invalid JSON", 400);
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
    const { conv: foundConv, isCreator: creatorSide } = part;
    conv = foundConv;
    isCreator = creatorSide;
    const otherUserId = creatorSide ? foundConv.fanId : foundConv.creator.userId;
    if (await usersAreBlocked(session.userId, otherUserId)) {
      return jsonError("Cannot message this user", 403);
    }
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

    if (await usersAreBlocked(session.userId, conv.creator.userId)) {
      return jsonError("Cannot message this user", 403);
    }
  } else {
    return jsonError("conversationId or creatorProfileId required", 400);
  }

  if (!conv) {
    return jsonError("Conversation not found", 404);
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
