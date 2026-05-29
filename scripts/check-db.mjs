import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
try {
  const [creators, users, txs] = await Promise.all([
    prisma.creatorProfile.count({ where: { approvedAt: { not: null } } }),
    prisma.user.count(),
    prisma.transaction.count({ where: { status: "completed" } }),
  ]);
  console.log(JSON.stringify({ ok: true, creators, users, txs }));
} finally {
  await prisma.$disconnect();
}
