# VelvetCreator — live deployment

## Production (Vercel)

**URL:** https://creator-platform-eight-pi.vercel.app

**GitHub:** https://github.com/stockpulseApp/velvetcreator

**Vercel project:** `stock-pulse1/creator-platform` (auto-deploys on push to `master`)

### Demo accounts (seeded in production DB)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@platform.local | admin123 |
| Creator | creator@platform.local | creator123 |
| Fan | fan@platform.local | fan123 |

Public creator profile: https://creator-platform-eight-pi.vercel.app/u/democreator

### Database (Neon)

Production uses a **claimable Neon** Postgres instance. Claim before **31 May 2026** so the database is not deleted:

See `PUBLIC_POSTGRES_CLAIM_URL` in local `.env.production` (not committed).

### Custom domain (optional)

In Vercel → Project → Settings → Domains, add e.g. `velvetcreator.com` and update `NEXT_PUBLIC_APP_URL`.

## Alternative: Render

One-click Blueprint (web + Postgres): [docs/RENDER_ONE_CLICK.md](./RENDER_ONE_CLICK.md)
