import type { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";

function simpleHash(password: string): string {
  return createHash("sha256")
    .update(password + "creator-platform-salt")
    .digest("hex");
}

const CREATOR_PERSONAS: {
  handle: string;
  displayName: string;
  headline: string;
  bio: string;
  tags: string[];
  tierPrice: number;
  followers: number;
  isLive?: boolean;
}[] = [
  { handle: "velvetsoles", displayName: "Velvet Soles", headline: "Foot worship & sole POV", bio: "Daily sole content, customs, and worn items.", tags: ["feet", "soles", "foot-worship", "worn-items"], tierPrice: 1299, followers: 2840 },
  { handle: "mistressnova", displayName: "Mistress Nova", headline: "Femdom · tasks · denial", bio: "Power exchange with clear boundaries. Tribute via tips.", tags: ["femdom", "findom", "denial", "humiliation"], tierPrice: 2499, followers: 5120, isLive: true },
  { handle: "latexlynx", displayName: "Latex Lynx", headline: "Shiny gear & harness sets", bio: "Latex, PVC, and custom clip orders.", tags: ["latex", "pvc", "harness", "custom-clips"], tierPrice: 1999, followers: 3910 },
  { handle: "ropeandrose", displayName: "Rope & Rose", headline: "Shibari-inspired art", bio: "Rope, impact, and aftercare-focused sessions.", tags: ["shibari", "bondage", "impact", "bdsm"], tierPrice: 1799, followers: 2200 },
  { handle: "giantessgia", displayName: "Gia Giant", headline: "Macro fantasies & voice", bio: "Giantess POV, ASMR, and custom scripts.", tags: ["giantess", "macro", "asmr", "voice"], tierPrice: 1499, followers: 4100 },
  { handle: "stockingstella", displayName: "Stella Stockings", headline: "Nylons & garter sets", bio: "Lingerie drops every Friday. Shop open.", tags: ["stockings", "nylons", "lingerie", "garter"], tierPrice: 999, followers: 3670 },
  { handle: "puppyjax", displayName: "Pup Jax", headline: "Pet play · playful sub energy", bio: "Collars, tasks, and wholesome pet dynamics.", tags: ["pet-play", "submissive", "collars"], tierPrice: 1199, followers: 1890 },
  { handle: "musclemaeve", displayName: "Maeve Muscle", headline: "Fit dom · worship", bio: "Gym content, flex clips, and coaching customs.", tags: ["muscle", "fitness", "body-worship", "dominant"], tierPrice: 2199, followers: 2980 },
  { handle: "smokesiren", displayName: "Smoke Siren", headline: "Fetish aesthetic · slow burn", bio: "Smoking fetish (21+), mood reels, and GFE chat.", tags: ["smoking", "gfe", "lingerie"], tierPrice: 1599, followers: 1540 },
  { handle: "cuckqueenelle", displayName: "Elle", headline: "Hotwife narratives · POV", bio: "Story-driven customs with discretion first.", tags: ["hotwife", "cuckolding", "roleplay", "custom-clips"], tierPrice: 2999, followers: 4420 },
  { handle: "bootblack", displayName: "Boot Black", headline: "Leather boots & polish", bio: "Boot worship, trample-safe content, orders via shop.", tags: ["boots", "leather", "foot-worship"], tierPrice: 1399, followers: 2100 },
  { handle: "oiloracle", displayName: "Oil Oracle", headline: "Oil · massage · sensory", bio: "Oil play, massage customs, and slow sensory clips.", tags: ["oil", "massage", "sensory-deprivation"], tierPrice: 1699, followers: 1750 },
  { handle: "cosplaykira", displayName: "Kira Cosplay", headline: "Cosplay lewds & characters", bio: "Character sets, ratings, and event calendars.", tags: ["cosplay", "roleplay", "rating"], tierPrice: 1899, followers: 5200 },
  { handle: "findomfaye", displayName: "Faye", headline: "Financial domination", bio: "Tributes, tasks, and loyalty tiers. Respect the throne.", tags: ["findom", "femdom", "tasks", "humiliation"], tierPrice: 4999, followers: 6100 },
  { handle: "tickletessa", displayName: "Tessa Tickle", headline: "Tickling · laughter · bondage", bio: "Consensual tickle sessions and preview packs.", tags: ["tickling", "bondage", "sensory-deprivation"], tierPrice: 1299, followers: 980 },
  { handle: "bbwblossom", displayName: "Blossom", headline: "BBW body positivity", bio: "Soft dominance, belly worship, and affirming feed.", tags: ["bbw", "body-worship", "dominant"], tierPrice: 999, followers: 3400 },
  { handle: "joi_jade", displayName: "Jade", headline: "JOI · edging · control", bio: "Instructional audio and live ticket shows.", tags: ["joi", "edging", "orgasm-control", "cam"], tierPrice: 1999, followers: 4550, isLive: true },
  { handle: "maidmila", displayName: "Mila Maid", headline: "Service sub maid aesthetic", bio: "Uniform content, tasks, and submissive GFE.", tags: ["maid", "submissive", "uniforms", "gfe"], tierPrice: 1499, followers: 2650 },
  { handle: "sploshsky", displayName: "Sky Splosh", headline: "Sploshing · food play", bio: "Messy art sets — outdoor cleanup always.", tags: ["sploshing", "food-play"], tierPrice: 1799, followers: 1120 },
  { handle: "transcendtia", displayName: "Tia", headline: "Trans femme · intimate chat", bio: "Authentic connection, customs, and subs-only diary.", tags: ["trans", "gfe", "custom-clips"], tierPrice: 1599, followers: 2890 },
  { handle: "chastitycole", displayName: "Cole Keys", headline: "Chastity keyholder", bio: "Locktober year-round. Remote tasks.", tags: ["chastity", "denial", "dominant", "tasks"], tierPrice: 2499, followers: 1980 },
  { handle: "armpitava", displayName: "Ava", headline: "Armpit · body worship", bio: "Niche body worship with scheduled live Q&A.", tags: ["armpits", "body-worship"], tierPrice: 1199, followers: 870 },
  { handle: "couplecove", displayName: "Cove Couple", headline: "Real couple · dual POV", bio: "We post together. Customs by request only.", tags: ["couples", "roleplay", "custom-clips"], tierPrice: 3499, followers: 7200 },
];

export async function seedCommunity(prisma: PrismaClient) {
  const catalogCandidates = [
    join(process.cwd(), "config", "fetishes.json"),
    join(process.cwd(), "../../config/fetishes.json"),
  ];
  let allTags: string[] = [];
  for (const catalogPath of catalogCandidates) {
    try {
      const raw = JSON.parse(readFileSync(catalogPath, "utf8")) as {
        categories: { tags: string[] }[];
      };
      allTags = raw.categories.flatMap((c) => c.tags);
      break;
    } catch {
      /* try next path */
    }
  }
  if (!allTags.length) {
    allTags = ["feet", "femdom", "latex", "lingerie", "bdsm"];
  }

  const fanCount = 48;
  const fanIds: string[] = [];

  for (let i = 1; i <= fanCount; i++) {
    const email = `member${i}@preview.velvetcreator.local`;
    const fan = await prisma.user.upsert({
      where: { email },
      update: { isDemo: true, ageVerifiedAt: new Date(), ageVerificationStatus: "verified" },
      create: {
        email,
        displayName: `Member ${i}`,
        role: "fan",
        passwordHash: simpleHash("preview123"),
        ageVerifiedAt: new Date(),
        ageVerificationStatus: "verified",
        isDemo: true,
      },
    });
    fanIds.push(fan.id);
  }

  for (const persona of CREATOR_PERSONAS) {
    const email = `${persona.handle}@preview.velvetcreator.local`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        displayName: persona.displayName,
        isDemo: true,
        ageVerifiedAt: new Date(),
        ageVerificationStatus: "verified",
      },
      create: {
        email,
        displayName: persona.displayName,
        role: "creator",
        passwordHash: simpleHash("preview123"),
        ageVerifiedAt: new Date(),
        ageVerificationStatus: "verified",
        isDemo: true,
      },
    });

    const profile = await prisma.creatorProfile.upsert({
      where: { userId: user.id },
      update: {
        headline: persona.headline,
        bio: persona.bio,
        isLive: persona.isLive ?? false,
        isDemo: true,
        approvedAt: new Date(),
        displayFollowerCount: persona.followers,
      },
      create: {
        userId: user.id,
        handle: persona.handle,
        headline: persona.headline,
        bio: persona.bio,
        approvedAt: new Date(),
        isLive: persona.isLive ?? false,
        isDemo: true,
        displayFollowerCount: persona.followers,
        promoEndsAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.creatorTag.deleteMany({ where: { creatorProfileId: profile.id } });
    await prisma.creatorTag.createMany({
      data: persona.tags.map((tag) => ({ creatorProfileId: profile.id, tag })),
    });

    const tierExists = await prisma.subscriptionTier.findFirst({
      where: { creatorProfileId: profile.id },
    });
    if (!tierExists) {
      await prisma.subscriptionTier.create({
        data: {
          creatorProfileId: profile.id,
          name: "VIP",
          priceCents: persona.tierPrice,
          sortOrder: 0,
          perks: { feed: true, dmUnlimited: true, liveAccess: true },
        },
      });
    }

    const postCount = await prisma.post.count({
      where: { creatorProfileId: profile.id },
    });
    if (postCount < 2) {
      await prisma.post.createMany({
        data: [
          {
            authorId: user.id,
            creatorProfileId: profile.id,
            body: `Welcome to @${persona.handle} — new drops weekly.`,
            visibility: "public",
          },
          {
            authorId: user.id,
            creatorProfileId: profile.id,
            body: "Subscriber vault unlock — tips appreciated.",
            visibility: "subscribers",
          },
        ],
      });
    }

    const followFans = fanIds.slice(0, Math.min(8, fanIds.length));
    await prisma.follow.createMany({
      data: followFans.map((fanId) => ({
        followerId: fanId,
        creatorProfileId: profile.id,
      })),
      skipDuplicates: true,
    });

    const post = await prisma.post.findFirst({
      where: { creatorProfileId: profile.id, visibility: "public" },
    });
    if (post) {
      await prisma.like.createMany({
        data: followFans.slice(0, 5).map((fanId) => ({
          userId: fanId,
          postId: post.id,
        })),
        skipDuplicates: true,
      });
    }
  }

  const txCount = await prisma.transaction.count();
  if (txCount < 80) {
    const creators = await prisma.creatorProfile.findMany({
      where: { isDemo: true },
      take: 12,
      select: { id: true },
    });
    await prisma.transaction.createMany({
      data: creators.flatMap((c, ci) =>
        [0, 1, 2, 3, 4].map((t) => ({
          type: "tip" as const,
          status: "completed" as const,
          payerId: fanIds[(ci + t) % fanIds.length],
          payeeCreatorId: c.id,
          grossCents: 500 + t * 200,
          platformFeeCents: 100,
          creatorNetCents: 400 + t * 180,
        }))
      ),
    });
  }

  console.log(`Community seed: ${CREATOR_PERSONAS.length} creators, ${fanCount} preview members`);
  void allTags;
}
