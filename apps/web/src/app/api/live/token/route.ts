import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { AccessToken } from "livekit-server-sdk";
import { hasLiveTicket } from "@/lib/live-access";
import { jsonError, parseJson } from "@/lib/api-utils";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.ageVerified) {
    return jsonError("Age verification required", 403);
  }

  const body = await parseJson<{ liveSessionId?: string }>(request);
  if (!body?.liveSessionId) {
    return jsonError("liveSessionId required", 400);
  }

  const live = await prisma.liveSession.findUnique({
    where: { id: body.liveSessionId },
    include: { creator: true },
  });
  if (!live || live.status === "ended") {
    return jsonError("Session not found", 404);
  }

  const isHost = live.creator.userId === session.userId;

  if (
    !isHost &&
    live.ticketPriceCents > 0 &&
    !(await hasLiveTicket(session.userId, live.id))
  ) {
    return jsonError("Ticket required", 402);
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

  const at = new AccessToken(apiKey, apiSecret, {
    identity: session.userId,
    name: session.email.split("@")[0],
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
