import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAndSettlePayment } from "@/lib/transactions";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.ageVerified) {
    return NextResponse.json({ error: "Age verification required" }, { status: 403 });
  }

  const { creatorProfileId, amountCents } = await request.json();
  const cents = Math.max(100, Number(amountCents) || 0);

  const result = await createAndSettlePayment({
    transactionType: "tip",
    grossCents: cents,
    payerId: session.userId,
    payeeCreatorId: creatorProfileId,
    type: "tip",
  });

  return NextResponse.json({ ok: true, transactionId: result.transaction.id });
}
