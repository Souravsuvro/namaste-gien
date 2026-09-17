import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MENU_BY_ID, RESTAURANT, formatEuro } from "../lib/restaurant";
import { useLocale, tx } from "../lib/i18n";
import { cartSubtotal, useApp } from "../lib/store";
import { addDays, isoDate, orderSlots, parisNow } from "../lib/hours";
import { isDemoCardValid, isGienAddress } from "../lib/validation";

export function OrderPage() {
  const locale = useLocale((s) => s.locale);
  const cart = useApp((s) => s.cart);
  const setQty = useApp((s) => s.setQty);
  const placeOrder = useApp((s) => s.placeOrder);
  const user = useApp((s) => s.user);
  const unavailable = useApp((s) => s.unavailableIds);
  const navigate = useNavigate();
  const now = useMemo(() => parisNow(), []);
  const today = isoDate(now);
  const tomorrow = isoDate(addDays(now, 1));

  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [date, setDate] = useState(() => {
    // Prefer today if slots remain, else tomorrow (Mondays closed handled by orderSlots)
    const todaySlots = orderSlots(new Date(`${today}T12:00:00`), "pickup", now);
    return todaySlots.length ? today : tomorrow;
  });
  const [time, setTime] = useState("");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [card, setCard] = useState("4242 4242 4242 4242");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const slots = useMemo(
    () => orderSlots(new Date(`${date}T12:00:00`), fulfillment, now),
    [date, fulfillment, now],
  );

  useEffect(() => {
    setTime((prev) => (prev && slots.includes(prev) ? prev : slots[0] ?? ""));
  }, [slots]);
  const subtotal = cartSubtotal(cart);
  const fee = fulfillment === "delivery" ? RESTAURANT.deliveryFeeCents : 0;
  const total = subtotal + fee;

  async function onPay(e: FormEvent) {
    e.preventDefault();
    setErr("");
    if (!user || user.deletedAt) {
      navigate("/auth");
      return;
    }
    if (!time) {
      setErr(locale === "fr" ? "Choisissez un créneau." : "Pick a time slot.");
      return;
    }
    if (fulfillment === "delivery" && !isGienAddress(address)) {
      setErr(locale === "fr" ? "Livraison réservée au 45500 Gien." : "Delivery limited to 45500 Gien.");
      return;
    }
    if (!isDemoCardValid(card)) {
      setErr(locale === "fr" ? "Numéro de carte invalide." : "Invalid card number.");
      return;
    }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = placeOrder({
      fulfillment,
      phone,
      address: fulfillment === "delivery" ? address : undefined,
      slotAt: new Date(`${date}T${time}:00`).toISOString(),
      payOnline: true,
      notes: notes || undefined,
    });
    setBusy(false);
    if (result.error === "phone") {
      setErr(locale === "fr" ? "Téléphone français invalide." : "Invalid French phone.");
      return;
    }
    if (result.error === "min") {
      setErr(locale === "fr" ? "Minimum livraison 18 €." : "Delivery minimum €18.");
      return;
    }
    if (result.error === "unavailable") {
      setErr(locale === "fr" ? "Un plat n'est plus disponible." : "An item is unavailable.");
      return;
    }
    if (result.order) navigate(`/account?order=${result.order.id}`);
  }

  if (!cart.length) {
    return (
      <div className="section">
        <h1>{tx("cart", "title", locale)}</h1>
        <p className="muted">{tx("cart", "empty", locale)}</p>
        <Link to="/menu" className="btn btn-primary" style={{ marginTop: "1rem" }}>
          {tx("nav", "menu", locale)}
        </Link>
      </div>
    );
  }

  return (
    <div className="section layout-2">
      <div>
        <h1>{tx("cart", "title", locale)}</h1>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {cart.map((line) => {
            const item = MENU_BY_ID[line.itemId];
            if (!item) return null;
            const blocked = unavailable.includes(line.itemId);
            return (
              <li
                key={line.key}
                className="card"
                style={{
                  marginBottom: "0.6rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "0.75rem",
                  opacity: blocked ? 0.5 : 1,
                }}
              >
                <div>
                  <strong>{locale === "fr" ? item.nameFr : item.nameEn}</strong>
                  <div className="muted">{formatEuro(item.priceCents * line.quantity, locale)}</div>
                  {blocked && (
                    <span className="badge">{locale === "fr" ? "Indisponible" : "Unavailable"}</span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <button type="button" className="btn btn-outline qty-btn" onClick={() => setQty(line.key, line.quantity - 1)}>−</button>
                  <span className="price">{line.quantity}</span>
                  <button type="button" className="btn btn-outline qty-btn" onClick={() => setQty(line.key, line.quantity + 1)}>+</button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <form className="card form" onSubmit={onPay}>
        <h2 style={{ margin: 0 }}>{tx("payment", "title", locale)}</h2>
        <p className="muted">{tx("payment", "demo", locale)}</p>
        <div className="delivery-banner" style={{ marginTop: 0 }}>
          <strong>{locale === "fr" ? "Zone de livraison" : "Delivery zone"}</strong>
          <span className="zone-chip">45500 Gien</span>
          <span className="muted" style={{ fontSize: "0.85rem" }}>
            {locale === "fr" ? "Min. 18 € · 3,50 €" : "€18 min · €3.50"}
          </span>
        </div>
        <div className="tabs">
          <button type="button" className={`chip ${fulfillment === "pickup" ? "active" : ""}`} onClick={() => { setFulfillment("pickup"); setTime(""); }}>
            {tx("order", "pickup", locale)}
          </button>
          <button type="button" className={`chip ${fulfillment === "delivery" ? "active" : ""}`} onClick={() => { setFulfillment("delivery"); setTime(""); }}>
            {tx("order", "delivery", locale)}
          </button>
        </div>
        <div className="tabs">
          <button type="button" className={`chip ${date === today ? "active" : ""}`} onClick={() => { setDate(today); setTime(""); }}>
            {locale === "fr" ? "Aujourd'hui" : "Today"}
          </button>
          <button type="button" className={`chip ${date === tomorrow ? "active" : ""}`} onClick={() => { setDate(tomorrow); setTime(""); }}>
            {locale === "fr" ? "Demain" : "Tomorrow"}
          </button>
        </div>
        {slots.length === 0 ? (
          <p className="alert">{locale === "fr" ? "Plus de créneau ce jour-là." : "No slots left that day."}</p>
        ) : (
          <div className="slot-grid">
            {slots.map((s) => (
              <button key={s} type="button" className={`chip ${time === s ? "active" : ""}`} onClick={() => setTime(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
        <label>
          {locale === "fr" ? "Téléphone" : "Phone"}
          <input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="06 12 34 56 78" inputMode="tel" />
        </label>
        {fulfillment === "delivery" && (
          <label>
            {locale === "fr" ? "Adresse complète (45500)" : "Full address (45500)"}
            <input value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="12 rue …, 45500 Gien" />
          </label>
        )}
        <label>
          {locale === "fr" ? "Note cuisine" : "Kitchen note"}
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={locale === "fr" ? "Allergies, sans oignon…" : "Allergies, no onion…"} />
        </label>
        <label>
          {tx("payment", "card", locale)}
          <input value={card} onChange={(e) => setCard(e.target.value)} required autoComplete="cc-number" />
        </label>
        <div className="totals">
          <div><span className="muted">{tx("cart", "subtotal", locale)}</span><span className="price">{formatEuro(subtotal, locale)}</span></div>
          {fee > 0 && <div><span className="muted">{tx("cart", "delivery", locale)}</span><span className="price">{formatEuro(fee, locale)}</span></div>}
          <div className="total-row"><span>{tx("cart", "total", locale)}</span><span className="price">{formatEuro(total, locale)}</span></div>
        </div>
        {err && <p className="alert">{err}</p>}
        {!user && (
          <p className="alert">
            {locale === "fr" ? "Connectez-vous pour payer." : "Sign in to pay."}{" "}
            <Link to="/auth">{tx("nav", "signIn", locale)}</Link>
          </p>
        )}
        <button type="submit" className="btn btn-primary" disabled={busy || !user || !!user.deletedAt}>
          {busy ? tx("common", "loading", locale) : `${tx("payment", "pay", locale)} ${formatEuro(total, locale)}`}
        </button>
      </form>
    </div>
  );
}
