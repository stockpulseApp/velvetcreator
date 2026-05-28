# Deploy VelvetCreator

## Vercel (recommended for Next.js)

1. Import the repo and set **Root Directory** to the repository root (monorepo).
2. Build command: `npm run db:generate && npm run build`
3. Install command: `npm install`
4. Add a **PostgreSQL** database (Vercel Postgres or Neon) and set `DATABASE_URL`.
5. Set environment variables from `.env.example` (especially `NEXTAUTH_SECRET`, `NEXT_PUBLIC_APP_URL`).
6. Run migrations once: `npx prisma db push` against production DB (from `packages/db`).
7. Seed demo data only on staging — never seed production with demo passwords.

## Render

Use the included `render.yaml` Blueprint: web service + managed Postgres.

1. Connect repo → **New Blueprint**.
2. Set `NEXT_PUBLIC_APP_URL` to your Render web URL (e.g. `https://velvetcreator-web.onrender.com`).
3. After first deploy, run `npm run db:push` and `npm run db:seed` via Render shell (staging only).

## Local PostgreSQL

```bash
docker compose up -d
```

Set in `.env`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/creator_platform"
```

Change `packages/db/prisma/schema.prisma` datasource `provider` to `postgresql`, then:

```bash
npm run db:push
npm run db:seed
```

## Production checklist

- [ ] Lawyer-reviewed Terms, Privacy, Community Guidelines
- [ ] Adult payment processor (not Stripe) — see [PAYMENTS.md](./PAYMENTS.md)
- [ ] Real KYC provider on `/api/kyc/verify`
- [ ] LiveKit credentials for live video
- [ ] `NEXTAUTH_SECRET` rotated; cookies `secure` in production
- [ ] `NEXT_PUBLIC_APP_URL` matches public domain
- [ ] Media storage (R2/S3) for uploads
