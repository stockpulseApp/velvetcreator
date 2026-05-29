import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await prisma.waitlistEntry.findMany({
    orderBy: { createdAt: "desc" },
  });

  const header = "email,role,referral,created_at";
  const lines = rows.map((w) =>
    [
      w.email,
      w.role ?? "",
      w.source ?? "",
      w.createdAt.toISOString(),
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );

  const csv = [header, ...lines].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="waitlist-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
