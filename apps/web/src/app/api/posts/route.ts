import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!session.ageVerified) {
    return NextResponse.json({ error: "Age verification required" }, { status: 403 });
  }

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.userId },
  });
  if (!profile) {
    return NextResponse.json({ error: "Creator profile required" }, { status: 403 });
  }

  const body = await request.json();
  const text = String(body.body ?? "").trim();
  const visibility = body.visibility as "public" | "subscribers" | "ppv";
  const ppvPriceCents =
    visibility === "ppv" ? Number(body.ppvPriceCents) || 0 : undefined;

  if (!text) {
    return NextResponse.json({ error: "Post body required" }, { status: 400 });
  }
  if (!["public", "subscribers", "ppv"].includes(visibility)) {
    return NextResponse.json({ error: "Invalid visibility" }, { status: 400 });
  }
  if (visibility === "ppv" && (!ppvPriceCents || ppvPriceCents < 100)) {
    return NextResponse.json({ error: "PPV price must be at least $1" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      authorId: session.userId,
      creatorProfileId: profile.id,
      body: text,
      visibility,
      ppvPriceCents: visibility === "ppv" ? ppvPriceCents : null,
    },
  });

  return NextResponse.json({ ok: true, post });
}
