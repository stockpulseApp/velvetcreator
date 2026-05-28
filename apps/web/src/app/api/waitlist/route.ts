import { NextResponse } from "next/server";
import { prisma } from "@creator/db";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email ?? "")
    .toLowerCase()
    .trim();
  const role = body.role === "creator" ? "creator" : "fan";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  try {
    await prisma.waitlistEntry.upsert({
      where: { email },
      create: { email, role, source: "landing" },
      update: { role },
    });
  } catch {
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
