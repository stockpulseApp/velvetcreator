import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { action, userId, creatorProfileId, reportId } = await request.json();

  if (action === "approve_creator" && userId) {
    await prisma.creatorApplication.update({
      where: { userId },
      data: { status: "approved", reviewedAt: new Date() },
    });
    await prisma.creatorProfile.updateMany({
      where: { userId },
      data: { approvedAt: new Date() },
    });
    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "approve_creator",
        target: userId,
      },
    });
  }

  if (action === "ban_user" && userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { bannedAt: new Date() },
    });
    await prisma.auditLog.create({
      data: { actorId: session.userId, action: "ban_user", target: userId },
    });
  }

  if (action === "resolve_report" && reportId) {
    await prisma.report.update({
      where: { id: reportId },
      data: { status: "actioned" },
    });
  }

  return NextResponse.json({ ok: true });
}
