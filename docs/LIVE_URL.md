# VelvetCreator — live deployment

## Production (Vercel)

**URLs:**

| URL | Status |
|-----|--------|
| https://creator-platform-eight-pi.vercel.app | Live (Vercel default) |
| https://velvetcreator.wealthybrainiac.com | Added to Vercel — **finish DNS** in [DNS_SETUP.md](./DNS_SETUP.md) |

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

### Database (Neon) — action required

**Claim before 31 May 2026:** https://neon.new/claim/e8074136-b0c3-41e6-82f8-d4b57a96b16a

(Sign in with Google/GitHub in the browser — we cannot claim without your Neon account.)

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
