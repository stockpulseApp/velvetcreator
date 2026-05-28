/**
 * Run once after first production deploy (Render shell or local with prod DATABASE_URL):
 *   node scripts/post-deploy-seed.mjs
 */
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
execSync("npm run db:seed", { stdio: "inherit", env: process.env });

console.log("\nDemo accounts seeded:");
console.log("  admin@platform.local / admin123");
console.log("  creator@platform.local / creator123  (@democreator)");
console.log("  fan@platform.local / fan123");
