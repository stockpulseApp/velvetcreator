import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { jsonError, parseJson, withRateLimit } from "@/lib/api-utils";

export async function POST(request: Request) {
  const limited = withRateLimit("report", 15, 60_000);
  if (limited) return limited;

  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const body = await parseJson<{ targetType?: string; targetId?: string; reason?: string }>(
    request
  );
  if (!body?.targetType || !body?.targetId || !body?.reason) {
    return jsonError("Invalid report", 400);
  }

  const { targetType, targetId, reason } = body;

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
