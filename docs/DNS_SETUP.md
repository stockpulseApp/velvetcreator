# Custom domain — velvetcreator.wealthybrainiac.com

The domain is **already added** to the Vercel project `creator-platform`.

## Bluehost DNS (wealthybrainiac.com uses Bluehost nameservers)

In **Bluehost → Domains → DNS** add:

| Type | Host | Points to |
|------|------|-----------|
| **A** | `velvetcreator` | `76.76.21.21` |

Or use a CNAME if your panel prefers it (Vercel may also accept `cname.vercel-dns.com` — check Vercel → Domains for this hostname).

Propagation usually takes 5–60 minutes.

## After DNS is green in Vercel

1. Vercel → **creator-platform** → Settings → Domains — confirm **Valid**
2. Production env `NEXT_PUBLIC_APP_URL` should be `https://velvetcreator.wealthybrainiac.com` (already set if you ran the setup script below)

```bash
npx vercel env rm NEXT_PUBLIC_APP_URL production
printf '%s' 'https://velvetcreator.wealthybrainiac.com' | npx vercel env add NEXT_PUBLIC_APP_URL production
npx vercel --prod
```

## Neon database claim (required before 31 May 2026)

Open and sign in with your Neon account:

https://neon.new/claim/e8074136-b0c3-41e6-82f8-d4b57a96b16a

Until claimed, the free provisioned database may be deleted.
