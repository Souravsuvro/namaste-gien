# Namasté Gien — Feature audit & improvements (2026)

## Inventory (before upgrade)

| Area | Status |
|------|--------|
| Marketing home | Hero, signatures, delivery banner, Google reviews marquee |
| Menu | Categories, add to cart |
| Order / payment | Pickup + 45500 delivery, card demo, auth-gated pay |
| Reservations | Date/party/time form |
| Auth | Google demo + email, owner role |
| Customer dashboard | Orders, reservations, delete/restore |
| Owner dashboard | Live orders, status workflow, tables, revenue |
| Mobile app `/app` | Phone frame, tabs, menu, delivery CTA |
| i18n FR/EN | Header toggle + persist |
| Reviews | Animated marquee + Google links |

## Gaps closed in this pass

### Backend / domain logic
- Paris timezone **hours**, Monday closed, open-now
- **Order slots** (15 min) with pickup 20 min / delivery 40 min lead
- **Reservation slots** with 45 min same-day lead
- French **phone normalisation**
- Gien **45500 address** check
- Demo **card length** validation
- Stable **user ids** from email (re-login continuity)
- Order **notes**, **cancel**, **sold-out** menu flags
- **Toast** feedback bus
- Persist version **v2** (cart, orders, user, unavailable)

### Frontend
- **Contact** page + map + hours
- **Order tracker** timeline on customer account
- Slot pickers on order & reserve
- Owner **sold-out** controls
- Profile edit (name/phone)
- Header **open/closed** pill
- Richer footer, SEO `index.html`, favicon
- Toast host (website + app)

## Production Wix roadmap
1. Replace localStorage with Wix Data / Neon + server functions  
2. Google OAuth via Wix Members or Better Auth  
3. Stripe / Wix Payments Payment Element  
4. Real Google Reviews API or Elfsight widget  
5. SMS order status (Twilio) optional  

## Pass 2026-09-16 — quality hardening

- Mobile hamburger drawer + skip-to-content + focus-visible
- ErrorBoundary + DocumentTitle + ScrollToTop
- Owner: delivery orders close as **delivered**, pickup as **collected**
- Mobile app respects sold-out items + open/closed pill
- Home signatures: one-tap add to cart
- Order: auto-select first available time slot
- Cart badge count in header
- Menu: dal tadka + mango chutney
- Bilingual toast messages
