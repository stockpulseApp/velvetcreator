# Remaining manual step: DNS only

Neon database is connected and seeded. Production runs on Vercel.

## Custom domain (Bluehost)

`velvetcreator.wealthybrainiac.com` does **not** resolve yet (no DNS record).

In **Bluehost → wealthybrainiac.com → DNS** add:

| Type | Host | Value |
|------|------|-------|
| A | `velvetcreator` | `76.76.21.21` |

After propagation (~15–60 min), run:

```bash
PRODUCTION_URL=https://velvetcreator.wealthybrainiac.com npm run smoke:prod
npx vercel env rm NEXT_PUBLIC_APP_URL production --yes
printf '%s' 'https://velvetcreator.wealthybrainiac.com' | npx vercel env add NEXT_PUBLIC_APP_URL production
npx vercel --prod
```

Until then the live app is:

**https://creator-platform-eight-pi.vercel.app**

See [OPERATIONS.md](./OPERATIONS.md) for runbook.
