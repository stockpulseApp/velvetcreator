import { prisma } from "@creator/db";

export async function attributeReferral(
  referredUserId: string,
  code: string | null | undefined
) {
  if (!code) return;
  const referrer = await prisma.user.findUnique({
    where: { referralCode: code },
  });
  if (!referrer || referrer.id === referredUserId) return;

  await prisma.user.update({
    where: { id: referredUserId },
    data: { referredByUserId: referrer.id },
  });

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 12);

  await prisma.referralAttribution.upsert({
    where: { referredUserId },
    update: {},
    create: {
      code,
      referrerUserId: referrer.id,
      referredUserId,
      commissionShareBps: 500,
      expiresAt,
    },
  });
}

export function generateReferralCode(displayName: string): string {
  const base = displayName
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 8)
    .toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base || "CREATOR"}${suffix}`;
}
