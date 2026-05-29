# Operations runbook

## Production URLs

| URL | When to use |
|-----|-------------|
| https://creator-platform-eight-pi.vercel.app | Always works (primary until DNS) |
| https://velvetcreator.wealthybrainiac.com | After Bluehost A record (see [DNS_SETUP.md](./DNS_SETUP.md)) |

## Health checks

```bash
# Database record counts (requires DATABASE_URL)
npm run db:check

# HTTP smoke test
npm run smoke:prod
PRODUCTION_URL=https://velvetcreator.wealthybrainiac.com npm run smoke:prod
```

## Reseed production data

```bash
# Uses DATABASE_URL from .env.production or shell
npm run seed:production
```

## Deploy

Push to `master` → GitHub CI → Vercel auto-deploy.

Manual:

```bash
npx vercel --prod
```

## Environment (Vercel `creator-platform`)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon Postgres pooler |
| `NEXTAUTH_SECRET` | Session JWT |
| `NEXT_PUBLIC_APP_URL` | Canonical site URL for OG/sitemap |
| `PAYMENTS_MODE` | `mock` (demo) or `ccbill` when live |

## Admin

- Login: `admin@platform.local` / `admin123`
- Waitlist CSV: `/api/admin/waitlist-export`
- Approve creators, resolve reports at `/admin`

## Incident checklist

1. Check `/api/health`
2. Run `npm run db:check`
3. Vercel → Deployments → latest logs
4. Neon console → connection / compute status
