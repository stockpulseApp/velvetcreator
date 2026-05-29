# VelvetCreator Platform

OnlyFans-scale adult creator economy: subscriptions, tips, PPV, live, custom requests (escrow), physical fetish shop, DMs, and platform revenue (commission, Creator Pro, Fan Platform+, promoted discover, referrals).

## Monorepo

```
apps/web          Next.js 15 app
packages/db       Prisma (SQLite local, PostgreSQL for production)
packages/ledger   Fee engine + mock payments
packages/shared   Types and constants
docs/             Revenue, compliance, payments
```

## Quick start

1. **Env**:

```bash
cp .env.example .env
# DATABASE_URL defaults to SQLite in packages/db for local dev
# Set NEXTAUTH_SECRET and NEXT_PUBLIC_SITE_URL for production
```

3. **Install & DB**:

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run smoke:prod    # hit production URLs
npm run db:check      # Neon record counts (needs DATABASE_URL)
```

4. **Run**:

```bash
npm run dev
```

Open http://localhost:3000

### Demo accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@platform.local | admin123 |
| Creator | creator@platform.local | creator123 |
| Fan | fan@platform.local | fan123 |

Creator handle: `@democreator`

Preview creators: `*@preview.velvetcreator.local` / `preview123` (see [/explore](https://creator-platform-eight-pi.vercel.app/explore))

## Live site

**https://creator-platform-eight-pi.vercel.app** — auto-deploys from `master`. See [docs/LIVE_URL.md](docs/LIVE_URL.md).

## Payments

Development uses **mock payments** (`PAYMENTS_MODE=mock`). All pay endpoints settle immediately and write to the unified `Transaction` + `LedgerEntry` tables.

Production: integrate CCBill/Segpay per [docs/PAYMENTS.md](docs/PAYMENTS.md).

## Launch & marketing

- Landing page with waitlist (`/api/waitlist`) — export signups from **Admin → Launch waitlist**
- Public creator profiles at `/u/[handle]` and **Discover** at `/explore` (SEO: `/sitemap.xml`, `/robots.txt`)
- Marketing pages: `/for-creators`, `/fetishes`, `/community`, `/safety`, `/terms`, `/privacy`
- Automated 18+ verification at `/verify-age` (ID upload + DOB)
- Set `NEXT_PUBLIC_APP_URL` to your production domain before deploy

See [docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md), [docs/DEPLOY.md](docs/DEPLOY.md), and [docs/OPERATIONS.md](docs/OPERATIONS.md).

## Deploy

| Platform | Config |
|----------|--------|
| Vercel | Root `vercel.json` |
| Render | `render.yaml` (web + Postgres) |
| CI | `.github/workflows/ci.yml` |

```bash
npm run start   # after npm run build
```

## Live video (optional)

Set `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET`. Tokens are issued at `/api/live/token`; without credentials the live page shows a polished preview UI.

## Legal

Adult platform — require lawyer-reviewed terms, 18+ KYC in production, and an approved high-risk merchant account before launch. See [docs/COMPLIANCE.md](docs/COMPLIANCE.md).

For production database, use PostgreSQL (`docker compose up -d` or a managed host) and point `DATABASE_URL` at it before `db:push`.
