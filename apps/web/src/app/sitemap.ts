import type { MetadataRoute } from "next";
import { prisma } from "@creator/db";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/explore",
    "/for-creators",
    "/terms",
    "/privacy",
    "/creator-agreement",
    "/community",
    "/safety",
    "/fetishes",
    "/login",
    "/signup",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  let creators: MetadataRoute.Sitemap = [];
  try {
    const profiles = await prisma.creatorProfile.findMany({
      where: { approvedAt: { not: null } },
      select: { handle: true, updatedAt: true },
      take: 500,
    });
    creators = profiles.map((p) => ({
      url: `${base}/u/${p.handle}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    /* DB unavailable at build time */
  }

  return [...staticRoutes, ...creators];
}
