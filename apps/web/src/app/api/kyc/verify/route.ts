import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession, createSession } from "@/lib/session";

/** Dev/mock age verification — production swaps for Veriff/Yoti webhook */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const confirm = body.confirm === true;

  if (!confirm) {
    return NextResponse.json(
      { error: "You must confirm you are 18+" },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: {
      ageVerifiedAt: new Date(),
      dateOfBirth: body.dateOfBirth
        ? new Date(body.dateOfBirth)
        : undefined,
    },
  });

  await createSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    ageVerified: true,
  });

  return NextResponse.json({ ok: true });
}
