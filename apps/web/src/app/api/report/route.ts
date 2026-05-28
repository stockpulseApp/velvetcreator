import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { targetType, targetId, reason } = await request.json();

  await prisma.report.create({
    data: {
      reporterId: session.userId,
      targetType,
      targetId,
      reason,
    },
  });

  return NextResponse.json({ ok: true });
}
