import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

function simpleHash(password: string): string {
  return createHash("sha256")
    .update(password + "creator-platform-salt")
    .digest("hex");
}

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@platform.local" },
    update: {},
    create: {
      email: "admin@platform.local",
      displayName: "Platform Admin",
      role: "admin",
      passwordHash: simpleHash("admin123"),
      ageVerifiedAt: new Date(),
    },
  });

  const creatorUser = await prisma.user.upsert({
    where: { email: "creator@platform.local" },
    update: {},
    create: {
      email: "creator@platform.local",
      displayName: "Demo Creator",
      role: "creator",
      passwordHash: simpleHash("creator123"),
      ageVerifiedAt: new Date(),
      referralCode: "DEMOCREATOR",
    },
  });

  const fan = await prisma.user.upsert({
    where: { email: "fan@platform.local" },
    update: {},
    create: {
      email: "fan@platform.local",
      displayName: "Demo Fan",
      role: "fan",
      passwordHash: simpleHash("fan123"),
      ageVerifiedAt: new Date(),
    },
  });

  const profile = await prisma.creatorProfile.upsert({
    where: { userId: creatorUser.id },
    update: {},
    create: {
      userId: creatorUser.id,
      handle: "democreator",
      headline: "Fetish creator demo",
      bio: "Welcome to the platform demo profile.",
      approvedAt: new Date(),
      promoEndsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      tags: {
        create: [{ tag: "feet" }, { tag: "lingerie" }],
      },
    },
  });

  await prisma.subscriptionTier.deleteMany({ where: { creatorProfileId: profile.id } });
  await prisma.subscriptionTier.createMany({
    data: [
      {
        creatorProfileId: profile.id,
        name: "Bronze",
        priceCents: 999,
        sortOrder: 0,
        perks: { feed: true, dmQuota: 5 },
      },
      {
        creatorProfileId: profile.id,
        name: "Silver",
        priceCents: 1999,
        sortOrder: 1,
        perks: { feed: true, dmUnlimited: true, shopDiscountBps: 1000 },
      },
      {
        creatorProfileId: profile.id,
        name: "Gold",
        priceCents: 4999,
        sortOrder: 2,
        perks: { feed: true, liveAccess: true, priorityRequests: true },
      },
    ],
  });

  await prisma.platformPlan.upsert({
    where: { slug: "creator_pro" },
    update: {},
    create: {
      slug: "creator_pro",
      name: "Creator Pro",
      priceCents: 2900,
      perks: { commissionBps: 1500, analytics: true, promoCodes: true },
    },
  });

  await prisma.platformPlan.upsert({
    where: { slug: "fan_platform_plus" },
    update: {},
    create: {
      slug: "fan_platform_plus",
      name: "Fan Platform+",
      priceCents: 999,
      perks: { adFreeDiscover: true, shopDiscountCapBps: 500 },
    },
  });

  const postCount = await prisma.post.count({ where: { creatorProfileId: profile.id } });
  if (postCount === 0) {
    await prisma.post.create({
      data: {
        authorId: creatorUser.id,
        creatorProfileId: profile.id,
        body: "Teaser post — subscribe for the full feed.",
        visibility: "public",
      },
    });
    await prisma.post.create({
      data: {
        authorId: creatorUser.id,
        creatorProfileId: profile.id,
        body: "Subscriber-only drop",
        visibility: "subscribers",
      },
    });
    await prisma.post.create({
      data: {
        authorId: creatorUser.id,
        creatorProfileId: profile.id,
        body: "PPV exclusive set",
        visibility: "ppv",
        ppvPriceCents: 1499,
      },
    });
  }

  const listingExists = await prisma.listing.findFirst({
    where: { creatorProfileId: profile.id, title: "Custom worn item" },
  });
  if (!listingExists) {
    await prisma.listing.create({
      data: {
        creatorProfileId: profile.id,
        title: "Custom worn item",
        description: "Discreet shipping. 3–5 day handling.",
        priceCents: 4999,
        quantity: 3,
        shippingNotes: "Plain packaging, no branding.",
      },
    });
  }

  console.log("Seed complete:");
  console.log("  admin@platform.local / admin123");
  console.log("  creator@platform.local / creator123");
  console.log("  fan@platform.local / fan123");
  console.log("  Creator handle: @democreator");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
