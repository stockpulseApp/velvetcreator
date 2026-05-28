import { NextResponse } from "next/server";
import { prisma } from "@creator/db";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ status: "degraded" }, { status: 503 });
  }
}
