# Two steps only you can complete (≈2 minutes)

Everything else is deployed. Finish these so the custom domain and database are permanent.

## 1. Claim your Neon database (before 31 May 2026)

Open: **https://neon.new/claim/e8074136-b0c3-41e6-82f8-d4b57a96b16a**

Sign in with Google or GitHub. Click claim. Without this, the production database may be deleted.

## 2. Bluehost DNS for custom URL

In **Bluehost → wealthybrainiac.com → DNS** add:

| Type | Host | Value |
|------|------|-------|
| A | `velvetcreator` | `76.76.21.21` |

Then wait ~15 minutes. Your app will be at:

**https://velvetcreator.wealthybrainiac.com**

(Vercel project already configured; `NEXT_PUBLIC_APP_URL` already set.)

---

Until DNS propagates, use: https://creator-platform-eight-pi.vercel.app
