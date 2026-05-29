import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { AppContainer } from "@/components/layout/AppContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { MarkNotificationsRead } from "@/components/MarkNotificationsRead";

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <AppContainer>
      <PageHeader
        title="Notifications"
        subtitle="Comments, subscriptions, and activity on your account"
        action={<MarkNotificationsRead />}
      />
      <ul className="space-y-3">
        {notifications.map((n) => (
          <li key={n.id}>
            <Link
              href={n.href || "#"}
              className={`card block ${!n.readAt ? "border-[var(--rose)]/30" : ""}`}
            >
              <p className="font-medium">{n.title}</p>
              {n.body && (
                <p className="mt-1 text-sm text-[var(--muted)] line-clamp-2">{n.body}</p>
              )}
              <time className="mt-2 block text-xs text-[var(--muted)]">
                {new Date(n.createdAt).toLocaleString()}
              </time>
            </Link>
          </li>
        ))}
        {!notifications.length && (
          <p className="text-center text-[var(--muted)]">No notifications yet.</p>
        )}
      </ul>
    </AppContainer>
  );
}
