import Link from "next/link";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { MessageThread } from "@/components/MessageThread";
import { NewMessageComposer } from "@/components/NewMessageComposer";
import { AppContainer } from "@/components/layout/AppContainer";
import { PageHeader } from "@/components/layout/PageHeader";

type Props = { searchParams: Promise<{ conversation?: string; creator?: string }> };

export default async function MessagesPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) return null;
  const userId = session.userId;

  const { conversation: conversationId, creator: legacyCreatorId } =
    await searchParams;

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ fanId: session.userId }, { creator: { userId: session.userId } }],
    },
    include: {
      creator: true,
      fan: { select: { displayName: true, id: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  let active = conversationId
    ? await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          creator: true,
          fan: { select: { displayName: true, id: true } },
          messages: { orderBy: { createdAt: "asc" } },
        },
      })
    : null;

  if (!active && legacyCreatorId) {
    active = await prisma.conversation.findUnique({
      where: {
        fanId_creatorProfileId: {
          fanId: session.userId,
          creatorProfileId: legacyCreatorId,
        },
      },
      include: {
        creator: true,
        fan: { select: { displayName: true, id: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
  }

  const canViewActive =
    active &&
    (active.fanId === userId || active.creator.userId === userId);

  const isCreatorInActive =
    canViewActive && active!.creator.userId === userId;

  let composeTarget: { id: string; handle: string } | null = null;
  if (!canViewActive && legacyCreatorId) {
    const target = await prisma.creatorProfile.findUnique({
      where: { id: legacyCreatorId },
      select: { id: true, handle: true },
    });
    if (target) composeTarget = target;
  }

  function threadLabel(c: (typeof conversations)[0]) {
    const iAmCreator = c.creator.userId === userId;
    return iAmCreator
      ? c.fan.displayName || "Fan"
      : `@${c.creator.handle}`;
  }

  return (
    <AppContainer wide>
      <PageHeader
        title="Messages"
        subtitle="Private DMs, paid unlocks, and subscriber threads"
      />

      <div className="grid min-h-[520px] gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-2">
          {conversations.map((c) => {
            const last = c.messages[0];
            const selected =
              canViewActive && active?.id === c.id;
            return (
              <Link
                key={c.id}
                href={`/messages?conversation=${c.id}`}
                className={`card block p-4 text-sm transition-colors ${
                  selected
                    ? "border-[var(--accent)]/50 bg-[var(--surface-2)]"
                    : "card-interactive"
                }`}
              >
                <span className="font-medium text-[var(--accent-bright)]">
                  {threadLabel(c)}
                </span>
                <span className="mt-1 block truncate text-[var(--muted)]">
                  {last?.body ?? "Start the conversation"}
                </span>
              </Link>
            );
          })}
          {!conversations.length && (
            <p className="text-sm text-[var(--muted)]">
              Follow a creator and subscribe or tip to open DMs.
            </p>
          )}
        </aside>

        <div>
          {canViewActive && active ? (
            <>
              <p className="mb-3 text-sm text-[var(--muted)]">
                {isCreatorInActive
                  ? `Chat with ${active.fan.displayName || "fan"}`
                  : (
                    <Link
                      href={`/u/${active.creator.handle}`}
                      className="text-[var(--accent-bright)] hover:underline"
                    >
                      @{active.creator.handle}
                    </Link>
                  )}
              </p>
              <MessageThread
                conversationId={active.id}
                currentUserId={userId}
                unlockPriceCents={active.unlockPriceCents}
                unlocked={
                  !!active.unlockedAt || active.creator.userId === session.userId
                }
                initialMessages={active.messages.map((m) => ({
                  id: m.id,
                  body: m.body,
                  senderId: m.senderId,
                  createdAt: m.createdAt.toISOString(),
                }))}
              />
            </>
          ) : composeTarget ? (
            <NewMessageComposer
              creatorProfileId={composeTarget.id}
              creatorHandle={composeTarget.handle}
            />
          ) : (
            <div className="card flex min-h-[400px] flex-col items-center justify-center text-center">
              <p className="font-display text-xl text-[var(--accent-bright)]">
                Select a conversation
              </p>
              <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
                Your inbox stays private. Creators can set a paid unlock for new
                fans.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppContainer>
  );
}
