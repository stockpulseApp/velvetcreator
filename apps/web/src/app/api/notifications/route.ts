import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { jsonError, parseJson } from "@/lib/api-utils";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const [items, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.notification.count({
      where: { userId: session.userId, readAt: null },
    }),
  ]);

  return NextResponse.json({ notifications: items, unread });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const body = await parseJson<{ all?: boolean; id?: string }>(request);

  if (body?.all) {
    await prisma.notification.updateMany({
      where: { userId: session.userId, readAt: null },
      data: { readAt: new Date() },
    });
  } else if (body?.id) {
    await prisma.notification.updateMany({
      where: { id: body.id, userId: session.userId },
      data: { readAt: new Date() },
    });
  }

  return NextResponse.json({ ok: true });
}
