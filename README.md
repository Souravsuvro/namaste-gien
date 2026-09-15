# Namasté Gien — Website + Mobile App

Indian restaurant platform for **2 place Foch, 45500 Gien** (phone 07 51 51 71 09).

## Features

- **Google reviews marquee** + Google Business profile links
- **Local delivery** limited to postcode **45500 Gien** (min. €18, €3.50 fee)
- **FR / EN** language toggle (persisted)
- Website: home, menu, order, checkout demo, reservations, contact
- Mobile app (`/app`): phone-frame UI with bottom tabs
- Google sign-in (demo) + email auth
- Customer dashboard: orders, tracking, delete/restore account
- Owner dashboard: live orders, status workflow, sold-out, revenue
- Secure payment demo (Stripe / Wix Payments ready)

## Quick start

```bash
npm install
npm run dev
```

## Demo accounts

| Role | How |
|------|-----|
| Customer | Continue with Google or email sign-up |
| Owner | `/auth?role=owner` or `owner@namaste-gien.fr` |

## Production notes

1. Google OAuth via Wix Members / Better Auth / Clerk
2. Postgres for orders/users
3. Stripe Payment Element or Wix Payments
4. PWA + optional Capacitor
