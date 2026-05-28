# Compliance

**Not legal advice.** Engage counsel before public launch.

## Age and identity

- All users: **18+** verified via KYC vendor webhook before NSFW or payments.
- Creators: government ID + payout KYC before first payout.
- US creators: maintain records per **18 U.S.C. § 2257** requirements (counsel to define retention).

## Prohibited content (zero tolerance)

- Minors or implied minors
- Non-consensual content
- Illegal acts in jurisdiction of user/creator
- Bestiality where prohibited
- Trafficking or coercion

Enforcement: upload scanning, report queue, immediate ban, law enforcement cooperation.

## Moderation

- New creators: manual approval queue (first N or risk score).
- Automated scan on upload (integrate vendor in production).
- User report → admin queue → action within SLA.

## Physical goods

- Shipping only where legal.
- Discreet packaging guidance in creator terms.
- Prohibited items list (weapons, controlled substances, etc.).

## Regional restrictions

- Geo-block via config `BLOCKED_COUNTRY_CODES`.
- Payment and payout limited to supported regions per processor.

## Data retention

- Payment IDs and consent timestamps retained per processor agreement.
- No storage of full card numbers (processor vault only).

## Disputes

- Custom requests: escrow until `completed` or dispute resolution.
- Chargebacks: deduct from creator balance; dispute fee per REVENUE_MODEL.
