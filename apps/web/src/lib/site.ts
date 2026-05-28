/** Canonical public site URL for metadata, sitemap, and OG tags. */
export function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";
  return url.replace(/\/$/, "");
}
