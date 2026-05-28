import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { createAndSettlePayment } from "@/lib/transactions";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.ageVerified) {
    return NextResponse.json({ error: "Age verification required" }, { status: 403 });
  }

  const { postId } = await request.json();
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post?.ppvPriceCents) {
    return NextResponse.json({ error: "Invalid post" }, { status: 400 });
  }

  const result = await createAndSettlePayment({
    transactionType: "ppv",
    grossCents: post.ppvPriceCents,
    payerId: session.userId,
    payeeCreatorId: post.creatorProfileId,
    type: "ppv",
    metadata: { postId: String(postId) },
  });

  return NextResponse.json({ ok: true, transactionId: result.transaction.id });
}
