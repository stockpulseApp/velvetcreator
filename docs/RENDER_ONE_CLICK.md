# One-click deploy on Render (recommended)

VelvetCreator is configured as a **Render Blueprint**: one web service + free PostgreSQL.

## Steps (about 5 minutes)

1. Open **[Create Blueprint from GitHub](https://dashboard.render.com/blueprint/new?repo=https://github.com/stockpulseApp/velvetcreator)**.
2. Connect your GitHub account if prompted and select **stockpulseApp/velvetcreator**.
3. When asked for **NEXT_PUBLIC_APP_URL**, leave blank for now — you will set it after the first deploy.
4. Click **Apply** and wait for the web service and database to provision (first build ~5–8 min).
5. When the deploy is **Live**, copy your service URL (e.g. `https://velvetcreator.onrender.com`).
6. In the Render Dashboard → **velvetcreator** web service → **Environment**:
   - Set `NEXT_PUBLIC_APP_URL` to your URL (no trailing slash).
   - Save — Render will redeploy automatically.
7. Open the **Shell** tab on the web service and run:
   ```bash
   npm run db:seed
   ```
   This creates demo accounts (staging only).

## Demo logins (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@platform.local | admin123 |
| Creator | creator@platform.local | creator123 |
| Fan | fan@platform.local | fan123 |

Creator profile: **@democreator**

## After go-live

- Replace mock payments with CCBill/Segpay — [PAYMENTS.md](./PAYMENTS.md)
- Add real KYC — [COMPLIANCE.md](./COMPLIANCE.md)
- Optional LiveKit env vars for real video

## Alternative: Vercel + Neon

If you prefer Vercel for the frontend:

1. Import https://github.com/stockpulseApp/velvetcreator in Vercel.
2. Set **Root Directory** to `apps/web`.
3. Create a [Neon](https://neon.tech) Postgres database and set `DATABASE_URL`.
4. Set `NEXTAUTH_SECRET` (32+ random bytes) and `NEXT_PUBLIC_APP_URL`.
5. Deploy, then run `npm run db:push` and `npm run db:seed` against production once.
