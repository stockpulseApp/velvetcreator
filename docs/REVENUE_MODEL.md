# Revenue model

Platform fee engine: all monetized actions flow through `packages/ledger` with `calculateFees()`.

## Commission schedule

| Transaction type | Base commission (bps) | Notes |
|------------------|----------------------|--------|
| `tip` | 2000 (20%) | From creator gross |
| `ppv` | 2000 | Post unlock |
| `subscription` | 2000 | Fan → creator recurring |
| `live` | 2000 | Ticket or per-minute |
| `custom_request` | 2000 | Plus escrow fee below |
| `shop` | 2000 | Physical marketplace |
| `paid_dm` | 2000 | Thread or message unlock |
| `platform_plan` | 0 | Platform keeps 100% (Creator Pro, Fan Platform+) |

### Launch promo

- New creators: **1500 bps (15%)** for first **90 days** (`creator.promoEndsAt`).
- **Creator Pro** subscribers: **1500 bps** while active.

## Fixed fees (platform revenue, cents)

| Fee | Amount | Applied to |
|-----|--------|------------|
| Escrow (custom request) | 200 ($2.00) | Fan pays on top OR split via config |
| Listing (physical) | 100 ($1.00) | Optional per listing publish |
| Instant payout | 200 min or 2% | Creator withdrawal |
| Dispute lost | 500 ($5.00) | Deducted from creator balance |

## Platform-owned subscriptions

| SKU | Price | Benefits |
|-----|-------|----------|
| **Creator Pro** | $29/mo | 15% commission, analytics, promo codes, bulk DM |
| **Fan Platform+** | $9.99/mo | Ad-free discover, 5% shop discount cap, badge |

## Fan → creator tiers (per creator)

Creators define 1–3 tiers. Example defaults:

| Tier | Price | Perks |
|------|-------|-------|
| Bronze | $9.99/mo | Subscriber feed, 5 DMs/mo |
| Silver | $19.99/mo | Full feed, unlimited DM, 10% shop discount |
| Gold | $49.99/mo | All + live access + priority requests |

Perks stored as JSON on `SubscriptionTier.perks`.

## Ledger split example

**$100 custom request**, 20% commission, $2 escrow (fan-paid):

```
Gross:           $100.00
Escrow fee:        $2.00  → platform_revenue
Platform fee:     $20.00  → platform_revenue
Creator net:      $80.00  → escrow_hold → creator_available on complete
Fan total:       $102.00
```

## Referral (phase 2)

- Creator refers creator: **5% of platform commission** for **12 months** on referred creator's transactions.
- Attributed via `Referral.code` at signup.

## Promoted discover

- Fixed daily slots: **$5–$50** by category (config in admin).
