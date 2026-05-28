# Payments

## Processor strategy

**Do not use Stripe** for adult/fetish marketplace without written approval.

Recommended categories: **CCBill**, **Segpay**, **Epoch** — must support:

- One-time charges
- Recurring subscriptions (fan → creator, platform SKUs)
- Webhooks for success/fail/refund/chargeback
- Creator/payout splits or platform-settled model

## Integration modes

### Production

1. Fan checkout → processor hosted page or API tokenization.
2. Webhook → `POST /api/webhooks/payments` → idempotent `Transaction` + `LedgerEntry` writes.
3. Creator payout → batch export or processor mass payout API.

### Development (`PAYMENTS_MODE=mock`)

- `MockPaymentProvider` in `packages/ledger` simulates success.
- No external API keys required.
- Set `MOCK_PAYMENT_AUTO_SUCCEED=true` (default).

## Webhook events (map per processor)

| Event | Action |
|-------|--------|
| `payment.succeeded` | Complete transaction, credit ledger |
| `payment.failed` | Mark transaction failed |
| `subscription.renewed` | New transaction row, extend `FanSubscription` |
| `subscription.cancelled` | Update subscription status |
| `refund` | Reverse ledger entries |
| `chargeback` | Hold creator funds, open dispute |

## Environment variables

See `.env.example` in repo root.

## Subscription billing

- Fan → creator: `FanSubscription.processorSubscriptionId` synced on webhook.
- Platform SKUs (Creator Pro / Fan Platform+): separate processor plan IDs or internal mock.
