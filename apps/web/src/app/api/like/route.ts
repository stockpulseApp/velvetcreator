import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await request.json();

  await prisma.like.upsert({
    where: { userId_postId: { userId: session.userId, postId } },
    create: { userId: session.userId, postId },
    update: {},
  });

  return NextResponse.json({ ok: true });
}
