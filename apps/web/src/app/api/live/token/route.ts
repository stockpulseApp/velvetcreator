import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { AccessToken } from "livekit-server-sdk";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.ageVerified) {
    return NextResponse.json({ error: "Age verification required" }, { status: 403 });
  }

  const { liveSessionId } = await request.json();
  if (!liveSessionId) {
    return NextResponse.json({ error: "liveSessionId required" }, { status: 400 });
  }

  const live = await prisma.liveSession.findUnique({
    where: { id: liveSessionId },
    include: { creator: true },
  });
  if (!live || live.status === "ended") {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !livekitUrl) {
    return NextResponse.json(
      { error: "LiveKit not configured", configured: false },
      { status: 503 }
    );
  }

  const isHost = live.creator.userId === session.userId;
  const identity = session.userId;
  const name = session.email.split("@")[0];

  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    name,
    ttl: "4h",
  });
  at.addGrant({
    roomJoin: true,
    room: live.roomName,
    canPublish: isHost,
    canSubscribe: true,
  });

  const token = await at.toJwt();

  return NextResponse.json({
    configured: true,
    token,
    url: livekitUrl,
    roomName: live.roomName,
    isHost,
  });
}
