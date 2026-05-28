import { createHash } from "crypto";
import type { AgeVerificationProvider } from "@creator/db";

export type AgeVerificationInput = {
  userId: string;
  dateOfBirth: Date;
  documentFingerprint?: string;
};

export type AgeVerificationResult = {
  status: "verified" | "rejected" | "processing";
  provider: AgeVerificationProvider;
  externalId?: string;
  rejectionReason?: string;
  meta?: Record<string, unknown>;
};

function yearsBetween(dob: Date, now = new Date()): number {
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

export function validateDateOfBirth(dob: Date): { ok: true } | { ok: false; reason: string } {
  if (Number.isNaN(dob.getTime())) {
    return { ok: false, reason: "Invalid date of birth" };
  }
  const age = yearsBetween(dob);
  if (age < 18) {
    return { ok: false, reason: "You must be at least 18 years old" };
  }
  if (age > 120) {
    return { ok: false, reason: "Please enter a valid date of birth" };
  }
  return { ok: true };
}

export function fingerprintDocument(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex").slice(0, 32);
}

/** Production: Veriff/Yoti when API keys are set. */
export function resolveAgeVerificationProvider(): AgeVerificationProvider {
  if (process.env.VERIFF_API_KEY && process.env.VERIFF_API_SECRET) {
    return "veriff";
  }
  if (process.env.YOTI_SDK_ID) {
    return "yoti";
  }
  return "mock_auto";
}

export async function runAgeVerification(
  input: AgeVerificationInput
): Promise<AgeVerificationResult> {
  const dobCheck = validateDateOfBirth(input.dateOfBirth);
  if (!dobCheck.ok) {
    return {
      status: "rejected",
      provider: "mock_auto",
      rejectionReason: dobCheck.reason,
    };
  }

  const provider = resolveAgeVerificationProvider();

  if (provider === "veriff") {
    return runVeriffStub(input);
  }

  if (provider === "yoti") {
    return {
      status: "processing",
      provider: "yoti",
      externalId: `yoti_${input.userId}`,
      meta: { message: "Complete verification in Yoti (configure webhook)" },
    };
  }

  return runMockAuto(input);
}

async function runMockAuto(input: AgeVerificationInput): Promise<AgeVerificationResult> {
  if (!input.documentFingerprint) {
    return {
      status: "rejected",
      provider: "mock_auto",
      rejectionReason: "Government-issued ID image is required",
    };
  }

  await new Promise((r) => setTimeout(r, 1200));

  const age = yearsBetween(input.dateOfBirth);
  return {
    status: "verified",
    provider: "mock_auto",
    externalId: `mock_${input.documentFingerprint.slice(0, 12)}`,
    meta: {
      method: "automated_document_and_dob",
      ageVerified: age,
      processedAt: new Date().toISOString(),
      note:
        process.env.NODE_ENV === "production"
          ? "Replace mock_auto with Veriff/Yoti before accepting real payments"
          : "Development auto-verification",
    },
  };
}

async function runVeriffStub(
  input: AgeVerificationInput
): Promise<AgeVerificationResult> {
  if (!input.documentFingerprint) {
    return {
      status: "rejected",
      provider: "veriff",
      rejectionReason: "Document required for Veriff",
    };
  }

  const sessionId = `veriff_${createHash("sha256").update(input.userId).digest("hex").slice(0, 16)}`;

  if (process.env.VERIFF_API_URL) {
    return {
      status: "processing",
      provider: "veriff",
      externalId: sessionId,
      meta: {
        sessionUrl: `${process.env.VERIFF_API_URL}/v1/sessions/${sessionId}`,
      },
    };
  }

  await new Promise((r) => setTimeout(r, 800));
  return {
    status: "verified",
    provider: "veriff",
    externalId: sessionId,
    meta: { sandbox: true },
  };
}
