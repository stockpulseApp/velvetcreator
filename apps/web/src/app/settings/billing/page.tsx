import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { formatMoney } from "@creator/shared";
import { PayButton } from "@/components/PayButton";
import { LogoutButton } from "./LogoutButton";
import { AppContainer } from "@/components/layout/AppContainer";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function BillingPage() {
  const session = await getSession();
  if (!session) return null;

  const plans = await prisma.platformPlan.findMany({ where: { active: true } });
  const myPlans = await prisma.userPlatformPlan.findMany({
    where: { userId: session.userId, status: "active" },
    include: { plan: true },
  });

  return (
    <AppContainer>
      <PageHeader
        title="Billing & plans"
        subtitle="Fan Platform+ and Creator Pro — fewer fees, more discoverability"
      />

      {myPlans.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-display text-lg text-[var(--accent-bright)]">
            Your platform plans
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {myPlans.map((p) => (
              <li key={p.id} className="text-[var(--text-secondary)]">
                {p.plan.name} — expires{" "}
                {p.expiresAt?.toLocaleDateString() ?? "—"}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {plans.map((plan) => {
          const perks = plan.perks as Record<string, unknown>;
          return (
            <div key={plan.id} className="card-glass flex flex-col">
              <p className="font-display text-xl text-[var(--accent-bright)]">
                {plan.name}
              </p>
              <p className="mt-2 font-display text-3xl">
                {formatMoney(plan.priceCents)}
                <span className="text-base text-[var(--muted)]">/mo</span>
              </p>
              <ul className="mt-4 flex-1 space-y-1 text-sm text-[var(--text-secondary)]">
                {Object.entries(perks).map(([k, v]) => (
                  <li key={k}>
                    {k}: {String(v)}
                  </li>
                ))}
              </ul>
              <PayButton
                endpoint="/api/pay/platform-plan"
                payload={{ planSlug: plan.slug }}
                label={`Get ${plan.name}`}
                className="btn btn-primary mt-6 w-full"
              />
            </div>
          );
        })}
      </div>

      <div className="mt-10 border-t border-[var(--border)] pt-8">
        <LogoutButton />
      </div>
    </AppContainer>
  );
}
