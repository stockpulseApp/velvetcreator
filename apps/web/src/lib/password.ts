import { createHash, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";

const LEGACY_SALT = "creator-platform-salt";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  stored: string | null | undefined
): Promise<boolean> {
  if (!stored) return false;
  if (stored.length === 64 && !stored.startsWith("$2")) {
    const legacy = createHash("sha256")
      .update(password + LEGACY_SALT)
      .digest("hex");
    try {
      return timingSafeEqual(Buffer.from(legacy), Buffer.from(stored));
    } catch {
      return false;
    }
  }
  return bcrypt.compare(password, stored);
}
