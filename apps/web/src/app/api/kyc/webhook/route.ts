import { NextResponse } from "next/server";
import { prisma } from "@creator/db";

/** Veriff / Yoti webhooks — verify signature in production */
export async function POST(request: Request) {
  const secret = process.env.KYC_WEBHOOK_SECRET;
  const signature = request.headers.get("x-webhook-signature");
  if (secret && signature !== secret) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const userId = body.userId ?? body.vendorData;
  const status = body.status ?? body.verification?.status;

  if (!userId) {
    return NextResponse.json({ received: true });
  }

  const approved =
    status === "approved" ||
    status === "verified" ||
    status === "success" ||
    body.decision === "approved";

  if (approved) {
    await prisma.user.update({
      where: { id: String(userId) },
      data: {
        ageVerifiedAt: new Date(),
        ageVerificationStatus: "verified",
        ageVerificationMeta: body,
      },
    });
  } else if (status === "declined" || status === "rejected") {
    await prisma.user.update({
      where: { id: String(userId) },
      data: {
        ageVerificationStatus: "rejected",
        ageVerificationMeta: body,
      },
    });
  }

  return NextResponse.json({ received: true });
}
