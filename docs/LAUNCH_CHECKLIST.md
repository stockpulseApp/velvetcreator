# Launch checklist

## Payments

- [ ] Adult merchant account approved (CCBill / Segpay / Epoch)
- [ ] Webhooks configured and idempotency tested
- [ ] Recurring subscriptions tested end-to-end
- [ ] Payout batches to creators verified

## Trust & safety

- [ ] Production KYC vendor (Veriff / Yoti) integrated
- [ ] Content moderation vendor or staffed queue
- [ ] 2257 / creator records process (counsel sign-off)
- [ ] Terms, Privacy, Creator Agreement published

## Product

- [ ] LiveKit token API and TURN configured
- [ ] Media storage on R2/S3 with signed URLs
- [ ] Rate limiting on auth and pay routes
- [ ] Staging environment with access control

## Ops

- [ ] Error monitoring (Sentry)
- [ ] Database backups
- [ ] `NEXTAUTH_SECRET` rotated for production
- [ ] Geo-blocking rules configured

## Revenue verification

- [ ] Commission splits match [REVENUE_MODEL.md](./REVENUE_MODEL.md)
- [ ] Creator Pro reduces commission in ledger
- [ ] Escrow releases only on custom request complete
- [ ] Admin dashboard gross vs platform revenue reconciles
