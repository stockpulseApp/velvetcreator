# VelvetCreator — live deployment

## Production (Vercel)

**URL:** https://creator-platform-eight-pi.vercel.app

**GitHub:** https://github.com/stockpulseApp/velvetcreator

**Vercel project:** `stock-pulse1/creator-platform` (auto-deploys on push to `master`)

**CI:** https://github.com/stockpulseApp/velvetcreator/actions

### Demo accounts (seeded in production DB)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@platform.local | admin123 |
| Creator | creator@platform.local | creator123 |
| Fan | fan@platform.local | fan123 |

**Preview community** (labeled “Preview creator” on profiles):

- Password for all: `preview123`
- Example: `velvetsoles@preview.velvetcreator.local`, `mistressnova@preview.velvetcreator.local`
- Full list: run `npm run db:seed` locally or browse [/explore](https://creator-platform-eight-pi.vercel.app/explore)

### Key URLs

| Page | Path |
|------|------|
| Discover | `/explore` |
| Fetish catalog (100+ tags) | `/fetishes` |
| Age verification | `/verify-age` |
| Demo creator | `/u/democreator` |
| Creator studio | `/studio` (creator login) |
| Admin | `/admin` (admin login) |

### Database (Neon)

Production uses Neon Postgres. Claim before expiry if you have `PUBLIC_POSTGRES_CLAIM_URL` in local `.env.production` (not committed).

Re-seed production:

```bash
npm run seed:production
```

### Environment (Vercel)

Required: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `PAYMENTS_MODE=mock`

Before real money: `VERIFF_*` or `YOTI_*`, adult processor keys — see [.env.example](../.env.example) and [PAYMENTS.md](./PAYMENTS.md).

### Custom domain (optional)

Vercel → Project → Settings → Domains → add `velvetcreator.com` (or your domain) and set `NEXT_PUBLIC_APP_URL` to match.

## Alternative: Render

[RENDER_ONE_CLICK.md](./RENDER_ONE_CLICK.md)
