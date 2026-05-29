/**
 * Smoke-test production (or staging) URLs.
 * Usage: PRODUCTION_URL=https://creator-platform-eight-pi.vercel.app node scripts/smoke-production.mjs
 */
const base =
  process.env.PRODUCTION_URL?.replace(/\/$/, "") ||
  "https://creator-platform-eight-pi.vercel.app";

const routes = [
  "/api/health",
  "/",
  "/explore",
  "/fetishes",
  "/for-creators",
  "/terms",
  "/privacy",
  "/u/democreator",
  "/login",
  "/signup",
];

let failed = 0;

for (const path of routes) {
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "VelvetCreator-Smoke/1.0" },
    });
    const ok = res.status >= 200 && res.status < 400;
    console.log(`${ok ? "✓" : "✗"} ${res.status} ${path}`);
    if (!ok) failed++;
    if (path === "/api/health") {
      const body = await res.json().catch(() => null);
      if (body?.status !== "ok") {
        console.log("  health body invalid", body);
        failed++;
      }
    }
  } catch (err) {
    console.log(`✗ ERR ${path}`, err instanceof Error ? err.message : err);
    failed++;
  }
}

if (failed) {
  console.error(`\n${failed} check(s) failed against ${base}`);
  process.exit(1);
}

console.log(`\nAll ${routes.length} routes OK on ${base}`);
