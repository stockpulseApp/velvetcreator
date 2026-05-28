# Launch checklist

## Demo launch (complete)

- [x] Next.js app on Vercel with Neon Postgres
- [x] Automated age gate (DOB + ID upload, `mock_auto` / Veriff / Yoti hooks)
- [x] Public Discover, profiles, fetish catalog, marketing pages
- [x] Preview creator community seeded (labeled, not impersonation bots)
- [x] Mock payments + ledger for tips, subs, PPV, shop, customs, live
- [x] GitHub CI (build, lint, Postgres migrate)
- [x] Sitemap, robots, OG metadata

## Payments (before real revenue)

- [ ] Adult merchant account approved (CCBill / Segpay / Epoch)
- [ ] Set `PAYMENTS_MODE` to production processor (not `mock`)
- [ ] Webhooks configured and idempotency tested
- [ ] Recurring subscriptions tested end-to-end
- [ ] Payout batches to creators verified

## Trust & safety

- [ ] Production KYC vendor (Veriff / Yoti) API keys on Vercel
- [ ] Content moderation vendor or staffed queue
- [ ] 2257 / creator records process (counsel sign-off)
- [ ] Terms, Privacy, Creator Agreement reviewed by counsel

## Product

- [ ] LiveKit token API and TURN configured
- [ ] Media storage on R2/S3 with signed URLs
- [x] Rate limiting on auth and pay routes
- [ ] Staging environment with access control

## Ops

- [ ] Error monitoring (Sentry)
- [ ] Database backups / Neon plan
- [ ] `NEXTAUTH_SECRET` rotated for production
- [ ] Geo-blocking rules configured

## Revenue verification

- [ ] Commission splits match [REVENUE_MODEL.md](./REVENUE_MODEL.md)
- [ ] Creator Pro reduces commission in ledger
- [ ] Escrow releases only on custom request complete
- [ ] Admin dashboard gross vs platform revenue reconciles
