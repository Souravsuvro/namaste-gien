# Namasté Gien — Website + Mobile App

Indian restaurant platform for **2 place Foch, 45500 Gien** (phone 07 51 51 71 09).

## Features

- **Google reviews marquee** (animated loop) + links to the live Google Business profile
- **Local delivery** limited to postcode **45500 Gien** (min. €18, €3.50 fee) on website and mobile app

- **FR / EN language toggle** in the header (and mobile app header) — persists in localStorage
- **Website**: home, menu, order + secure checkout demo, table reservation, contact footer
- **Mobile app** (`/app`): phone-frame UI with bottom tabs (home, menu, basket, reserve, account)
- **Google sign-in (demo)** + email sign-up / sign-in
- **Customer dashboard** (`/account`): orders, tracking, reservations, delete account, restore within 30 days
- **Owner dashboard** (`/owner`): live orders, status workflow, reservations, revenue stats
- **Online payment (demo)**: card form; marks order paid — production wires to **Stripe / Wix Payments**

## Quick start

```bash
cd namaste-gien
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Demo accounts

| Role | How |
|------|-----|
| Customer | **Continue with Google** or email sign-up |
| Owner | `/auth?role=owner` or email `owner@namaste-gien.fr` + any password ≥ 4 chars |

## Production notes (Wix / 2026)

1. Replace demo auth with **Google OAuth** via Wix Members / Better Auth / Clerk  
2. Replace localStorage store with **Postgres** (orders, users, soft-delete)  
3. Connect **Stripe Payment Element** or **Wix Payments** for real charges  
4. Deploy mobile as **PWA** + optional Capacitor/Wix mobile shell  
5. Owner routes must use server-side role checks (never client-only)

## Scripts

- `npm run dev` — development server  
- `npm run build` — production build  
- `npm run preview` — preview build  
