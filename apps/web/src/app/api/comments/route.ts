import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { canViewPost } from "@/lib/access";
import { usersAreBlocked } from "@/lib/blocks";
import { COMMENT_PAGE_SIZE } from "@/lib/constants";
import { jsonError, parseJson, withRateLimit } from "@/lib/api-utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");
  if (!postId) return jsonError("postId required", 400);

  const comments = await prisma.postComment.findMany({
    where: { postId },
    include: {
      author: { select: { id: true, displayName: true } },
    },
    orderBy: { createdAt: "asc" },
    take: COMMENT_PAGE_SIZE,
  });

  return NextResponse.json({ comments });
}

export async function POST(request: Request) {
  const limited = withRateLimit("comment", 30, 60_000);
  if (limited) return limited;

  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);
  if (!session.ageVerified) return jsonError("Age verification required", 403);

  const body = await parseJson<{ postId?: string; text?: string }>(request);
  const text = String(body?.text ?? "").trim();
  if (!body?.postId || text.length < 1 || text.length > 2000) {
    return jsonError("Invalid comment", 400);
  }

  const post = await prisma.post.findUnique({
    where: { id: body.postId },
    include: { creator: { select: { userId: true, handle: true } } },
  });
  if (!post) return jsonError("Post not found", 404);

  if (await usersAreBlocked(session.userId, post.creator.userId)) {
    return jsonError("Cannot comment", 403);
  }

  const access = await canViewPost(session.userId, session.ageVerified, post);
  if (!access.allowed) {
    return jsonError("Unlock post to comment", 403);
  }

  const comment = await prisma.postComment.create({
    data: {
      postId: post.id,
      authorId: session.userId,
      body: text,
    },
    include: {
      author: { select: { id: true, displayName: true } },
    },
  });

  if (post.authorId !== session.userId) {
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        type: "comment",
        title: "New comment on your post",
        body: text.slice(0, 120),
        href: `/u/${post.creator.handle}`,
        meta: { postId: post.id, commentId: comment.id },
      },
    });
  }

  return NextResponse.json({ ok: true, comment });
}
