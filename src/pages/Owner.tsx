import { Link } from "react-router-dom";
import { MENU, formatEuro } from "../lib/restaurant";
import { useLocale, tx, statusLabel } from "../lib/i18n";
import { useApp, type OrderStatus } from "../lib/store";

export function OwnerPage() {
  const locale = useLocale((s) => s.locale);
  const user = useApp((s) => s.user);
  const orders = useApp((s) => s.orders);
  const reservations = useApp((s) => s.reservations);
  const unavailable = useApp((s) => s.unavailableIds);
  const updateOrderStatus = useApp((s) => s.updateOrderStatus);
  const updateReservationStatus = useApp((s) => s.updateReservationStatus);
  const cancelOrder = useApp((s) => s.cancelOrder);
  const toggleItemAvailable = useApp((s) => s.toggleItemAvailable);
  const signOut = useApp((s) => s.signOut);

  if (!user || user.role !== "owner") {
    return (
      <div className="section">
        <h1>{tx("owner", "title", locale)}</h1>
        <p className="muted">{locale === "fr" ? "Réservé au propriétaire." : "Owner access only."}</p>
        <Link to="/auth?role=owner" className="btn btn-primary" style={{ marginTop: "1rem" }}>{tx("nav", "signIn", locale)}</Link>
      </div>
    );
  }

  const live = orders.filter((o) => !["collected", "delivered", "cancelled"].includes(o.status));
  const revenue = orders.filter((o) => o.paid && o.status !== "cancelled").reduce((s, o) => s + o.totalCents, 0);
  const upcoming = reservations.filter((r) => r.status === "confirmed");
  const deliveryLive = live.filter((o) => o.fulfillment === "delivery").length;

  function nextStatus(s: OrderStatus, fulfillment: "pickup" | "delivery"): OrderStatus | null {
    if (s === "received") return "preparing";
    if (s === "preparing") return "ready";
    if (s === "ready") return fulfillment === "delivery" ? "delivered" : "collected";
    return null;
  }

  function nextLabel(s: OrderStatus, fulfillment: "pickup" | "delivery") {
    const n = nextStatus(s, fulfillment);
    if (n === "preparing") return tx("owner", "markPreparing", locale);
    if (n === "ready") return tx("owner", "markReady", locale);
    if (n === "collected" || n === "delivered") return tx("owner", "markDone", locale);
    return null;
  }

  return (
    <div className="section">
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <h1>{tx("owner", "title", locale)}</h1>
          <p className="muted">{user.name} · {user.email}</p>
        </div>
        <button type="button" className="btn btn-outline" onClick={signOut}>{tx("nav", "signOut", locale)}</button>
      </div>

      <div className="stat-row" style={{ marginTop: "1.5rem" }}>
        <div className="stat"><span className="muted">{tx("owner", "revenue", locale)}</span><strong>{formatEuro(revenue, locale)}</strong></div>
        <div className="stat"><span className="muted">{tx("owner", "liveOrders", locale)}</span><strong>{live.length}</strong></div>
        <div className="stat"><span className="muted">{locale === "fr" ? "Livraisons" : "Deliveries"}</span><strong>{deliveryLive}</strong></div>
        <div className="stat"><span className="muted">{tx("owner", "openTables", locale)}</span><strong>{upcoming.length}</strong></div>
      </div>

      <h2>{tx("owner", "liveOrders", locale)}</h2>
      {live.length === 0 ? (
        <p className="muted">{locale === "fr" ? "Aucune commande en cours." : "No live orders."}</p>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem", marginTop: "0.75rem" }}>
          {live.map((o) => {
            const label = nextLabel(o.status, o.fulfillment);
            const next = nextStatus(o.status, o.fulfillment);
            return (
              <article key={o.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{o.code} · {o.guestName}</strong>
                  <span className="badge">{statusLabel(o.status, locale)}</span>
                </div>
                <p className="muted">
                  {o.fulfillment} · {o.phone}
                  {o.address ? ` · ${o.address}` : ""}
                  {o.paid ? ` · ${statusLabel("paid", locale)}` : ""}
                </p>
                {o.notes && <p className="muted"><em>{o.notes}</em></p>}
                <ul className="muted" style={{ paddingLeft: "1.1rem" }}>
                  {o.items.map((i, idx) => (
                    <li key={idx}>{i.quantity} × {locale === "fr" ? i.nameFr : i.nameEn}</li>
                  ))}
                </ul>
                <p className="price">{formatEuro(o.totalCents, locale)}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
                  {label && next && (
                    <button type="button" className="btn btn-walnut" onClick={() => updateOrderStatus(o.id, next)}>{label}</button>
                  )}
                  <button type="button" className="btn btn-outline" onClick={() => cancelOrder(o.id)}>
                    {locale === "fr" ? "Annuler" : "Cancel"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <h2 style={{ marginTop: "2rem" }}>{tx("owner", "reservations", locale)}</h2>
      {upcoming.length === 0 ? (
        <p className="muted">{locale === "fr" ? "Pas de table à venir." : "No upcoming tables."}</p>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem", marginTop: "0.75rem" }}>
          {upcoming.map((r) => (
            <article key={r.id} className="card">
              <strong>{r.code} · {r.guestName}</strong>
              <p className="muted">{r.date} {r.time} · {r.partySize} pax · {r.phone}</p>
              <button type="button" className="btn btn-outline" onClick={() => updateReservationStatus(r.id, "seated")}>
                {tx("owner", "seat", locale)}
              </button>
            </article>
          ))}
        </div>
      )}

      <h2 style={{ marginTop: "2rem" }}>{tx("owner", "menu", locale)}</h2>
      <p className="muted">{locale === "fr" ? "Désactivez un plat épuisé en cuisine." : "Mark items sold out."}</p>
      <div className="grid-menu" style={{ marginTop: "0.75rem" }}>
        {MENU.slice(0, 8).map((item) => {
          const off = unavailable.includes(item.id);
          return (
            <article key={item.id} className="card" style={{ opacity: off ? 0.55 : 1 }}>
              <h3 style={{ fontSize: "1.05rem" }}>{locale === "fr" ? item.nameFr : item.nameEn}</h3>
              <p className="price">{formatEuro(item.priceCents, locale)}</p>
              <button type="button" className={`btn ${off ? "btn-primary" : "btn-outline"}`} style={{ width: "100%", marginTop: "0.5rem" }} onClick={() => toggleItemAvailable(item.id)}>
                {off
                  ? locale === "fr" ? "Remettre en vente" : "Back on menu"
                  : locale === "fr" ? "Marquer épuisé" : "Mark sold out"}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
