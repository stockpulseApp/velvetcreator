import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { handle, bio, headline } = await request.json();
  const cleanHandle = String(handle)
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 24);

  if (!cleanHandle) {
    return NextResponse.json({ error: "Invalid handle" }, { status: 400 });
  }

  const taken = await prisma.creatorProfile.findUnique({
    where: { handle: cleanHandle },
  });
  if (taken) {
    return NextResponse.json({ error: "Handle taken" }, { status: 409 });
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { role: "creator" },
  });

  await prisma.creatorProfile.create({
    data: {
      userId: session.userId,
      handle: cleanHandle,
      bio,
      headline,
      promoEndsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.creatorApplication.upsert({
    where: { userId: session.userId },
    create: { userId: session.userId, bio, status: "pending" },
    update: { bio, status: "pending" },
  });

  return NextResponse.json({ ok: true, handle: cleanHandle });
}
