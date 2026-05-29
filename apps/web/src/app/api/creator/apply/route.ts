import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { handle, bio, headline, tags: rawTags } = await request.json();
  const tags = Array.isArray(rawTags)
    ? rawTags.map((t) => String(t).toLowerCase().slice(0, 32)).slice(0, 8)
    : [];
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

  const autoApprove = process.env.AUTO_APPROVE_CREATORS !== "false";

  const profile = await prisma.creatorProfile.create({
    data: {
      userId: session.userId,
      handle: cleanHandle,
      bio,
      headline,
      approvedAt: autoApprove ? new Date() : null,
      promoEndsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      tags: tags.length
        ? { create: tags.map((tag) => ({ tag })) }
        : undefined,
    },
  });

  await prisma.subscriptionTier.create({
    data: {
      creatorProfileId: profile.id,
      name: "Bronze",
      priceCents: 999,
      sortOrder: 0,
      perks: { feed: true, dmQuota: 5 },
    },
  });

  await prisma.creatorApplication.upsert({
    where: { userId: session.userId },
    create: {
      userId: session.userId,
      bio,
      status: autoApprove ? "approved" : "pending",
      reviewedAt: autoApprove ? new Date() : null,
    },
    update: {
      bio,
      status: autoApprove ? "approved" : "pending",
      reviewedAt: autoApprove ? new Date() : null,
    },
  });

  return NextResponse.json({ ok: true, handle: cleanHandle });
}
