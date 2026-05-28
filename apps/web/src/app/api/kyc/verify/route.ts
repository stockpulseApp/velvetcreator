import { NextResponse } from "next/server";
import { prisma, Prisma } from "@creator/db";
import { getSession, createSession } from "@/lib/session";
import {
  fingerprintDocument,
  runAgeVerification,
  validateDateOfBirth,
} from "@/lib/age-verification";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  let dateOfBirth: Date;
  let documentFingerprint: string | undefined;

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const dobRaw = String(form.get("dateOfBirth") ?? "");
    dateOfBirth = new Date(dobRaw);
    const file = form.get("document");
    if (file && file instanceof File && file.size > 0) {
      const buf = Buffer.from(await file.arrayBuffer());
      if (buf.length > 8 * 1024 * 1024) {
        return NextResponse.json({ error: "Image must be under 8MB" }, { status: 400 });
      }
      documentFingerprint = fingerprintDocument(buf);
    }
  } else {
    const body = await request.json().catch(() => ({}));
    dateOfBirth = new Date(String(body.dateOfBirth ?? ""));
    if (body.documentBase64) {
      const buf = Buffer.from(String(body.documentBase64), "base64");
      documentFingerprint = fingerprintDocument(buf);
    }
  }

  const dobCheck = validateDateOfBirth(dateOfBirth);
  if (!dobCheck.ok) {
    return NextResponse.json({ error: dobCheck.reason }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      ageVerificationStatus: "processing",
      dateOfBirth,
    },
  });

  const result = await runAgeVerification({
    userId: session.userId,
    dateOfBirth,
    documentFingerprint,
  });

  if (result.status === "rejected") {
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        ageVerificationStatus: "rejected",
        ageVerificationProvider: result.provider,
        ageVerificationMeta: {
          reason: result.rejectionReason,
          ...(result.meta ?? {}),
        } as Prisma.InputJsonValue,
      },
    });
    return NextResponse.json(
      { error: result.rejectionReason ?? "Verification failed" },
      { status: 400 }
    );
  }

  if (result.status === "processing") {
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        ageVerificationStatus: "processing",
        ageVerificationProvider: result.provider,
        ageVerificationId: result.externalId,
        ageVerificationMeta: (result.meta ?? {}) as Prisma.InputJsonValue,
      },
    });
    return NextResponse.json({
      ok: true,
      status: "processing",
      sessionUrl: (result.meta as { sessionUrl?: string })?.sessionUrl,
    });
  }

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: {
      ageVerifiedAt: new Date(),
      ageVerificationStatus: "verified",
      ageVerificationProvider: result.provider,
      ageVerificationId: result.externalId,
      ageVerificationMeta: (result.meta ?? {}) as Prisma.InputJsonValue,
      dateOfBirth,
    },
  });

  await createSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    ageVerified: true,
  });

  return NextResponse.json({ ok: true, status: "verified" });
}
