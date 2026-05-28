import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/explore", "/u/", "/for-creators", "/terms", "/privacy"],
        disallow: [
          "/admin",
          "/studio",
          "/messages",
          "/wallet",
          "/api/",
          "/settings",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
