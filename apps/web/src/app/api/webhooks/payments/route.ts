import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getPaymentProvider } from "@creator/ledger";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-webhook-signature");
  const provider = getPaymentProvider();
  const event = await provider.verifyWebhook(body, signature);

  if (!event) {
    return NextResponse.json({ received: true });
  }

  const tx = await prisma.transaction.findFirst({
    where: { externalId: event.externalId },
  });

  if (tx && event.status === "completed" && tx.status === "pending") {
    await prisma.transaction.update({
      where: { id: tx.id },
      data: { status: "completed" },
    });
  }

  return NextResponse.json({ received: true });
}
