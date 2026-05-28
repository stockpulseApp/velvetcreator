import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { formatMoney } from "@creator/shared";
import { PayButton } from "@/components/PayButton";
import { LiveViewer } from "@/components/LiveViewer";
import { AppContainer } from "@/components/layout/AppContainer";

type Props = { params: Promise<{ id: string }> };

export default async function LivePage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();

  const live = await prisma.liveSession.findUnique({
    where: { id },
    include: { creator: true },
  });
  if (!live) notFound();

  const isLive = live.status === "live" || live.status === "scheduled";

  return (
    <AppContainer wide>
      <div className="space-y-6">
        <Link
          href={`/u/${live.creator.handle}`}
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--accent-bright)]"
        >
          ← @{live.creator.handle}
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            {isLive && (
              <span className="badge mb-2 inline-flex items-center gap-1.5 bg-[var(--danger)]/20 text-[var(--danger)]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--danger)]" />
                Live
              </span>
            )}
            <h1 className="font-display text-3xl text-[var(--accent-bright)]">
              {live.title}
            </h1>
            {live.ticketPriceCents > 0 && (
              <p className="mt-1 text-sm text-[var(--muted)]">
                Ticket {formatMoney(live.ticketPriceCents)}
              </p>
            )}
          </div>
        </div>

        {live.status === "ended" ? (
          <div className="card py-16 text-center">
            <p className="text-[var(--muted)]">This session has ended.</p>
            <Link
              href={`/u/${live.creator.handle}`}
              className="btn btn-primary mt-6"
            >
              View @{live.creator.handle}
            </Link>
          </div>
        ) : session?.ageVerified ? (
          <div className="space-y-4">
            {live.ticketPriceCents > 0 && (
              <PayButton
                endpoint="/api/pay/live"
                payload={{ liveSessionId: live.id }}
                label={`Join for ${formatMoney(live.ticketPriceCents)}`}
                className="btn btn-primary"
              />
            )}
            <LiveViewer
              liveSessionId={live.id}
              roomName={live.roomName}
              title={live.title}
              isHost={session?.userId === live.creator.userId}
            />
          </div>
        ) : (
          <div className="card py-16 text-center">
            <p className="text-[var(--text-secondary)]">
              Verify your age to join live sessions.
            </p>
            <Link href="/verify-age" className="btn btn-primary mt-6">
              Verify age
            </Link>
          </div>
        )}
      </div>
    </AppContainer>
  );
}
