# Scaling VelvetCreator toward 1M+ users

This document describes how the codebase is prepared for growth and what to enable in production.

## Application layer

- **Bounded queries**: Feed, messages, explore, and admin lists use explicit `take` limits (`apps/web/src/lib/constants.ts`).
- **Batch access checks**: Feed and profiles resolve PPV/subscriber access in O(1) queries per page, not per post (`batchPostAccess` in `apps/web/src/lib/access.ts`).
- **PostUnlock table**: PPV purchases write a row for fast lookups; legacy transactions are still checked as fallback.
- **Ledger balances**: Creator balances use SQL `groupBy` instead of loading all ledger rows.
- **Payouts**: Wrapped in `prisma.$transaction` with balance read inside the transaction.

## Database

Indexes added for hot paths: `Follow.followerId`, `Transaction.payerId+type+status`, `CreatorProfile.approvedAt`, `Report.status`, `Message.conversationId`, etc. See `packages/db/prisma/schema.prisma`.

**Production checklist**

1. Use Neon (or Postgres) with **connection pooling** (pooler URL for serverless).
2. Run `npx prisma migrate deploy` on every release.
3. Enable read replicas for explore/community when read QPS dominates (route read-only pages to replica).
4. Archive old `Message` and `AuditLog` rows to cold storage after 12–18 months.

## Rate limiting

`apps/web/src/lib/rate-limit.ts` is in-memory per instance. For multi-region / high traffic:

1. Add **Upstash Redis** (or Vercel KV).
2. Replace bucket storage with Redis `INCR` + `EXPIRE`.
3. Apply limits on: auth, pay, messages, comments, report, payout.

## Media & live

- Store images/video on **S3 / Vercel Blob** with CDN; never serve large binaries from Postgres.
- LiveKit: dedicated project, region close to users, enable **egress** only when recording.

## Caching

- Cache public pages (`/explore`, `/fetishes`, `/community`) with Next.js `revalidate` (60–300s).
- Tag `unstable_cache` for creator profile shells where content is mostly static.

## Observability

- Wire **Sentry** (errors) and **Vercel Analytics** or Datadog (latency).
- Alert on: 5xx rate, payout failures, KYC webhook errors, payment webhook lag.

## Creator approval

Set `AUTO_APPROVE_CREATORS=false` in production when manual review is required. Default in dev is auto-approve for faster iteration.

## Horizontal scale

The app is stateless; scale Vercel instances freely once Redis rate limits and DB pooler are configured. No sticky sessions required.
