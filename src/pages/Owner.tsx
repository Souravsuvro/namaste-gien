import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MENU, CATEGORIES, formatEuro, type CategoryId } from "../lib/restaurant";
import { useLocale, tx, statusLabel } from "../lib/i18n";
import { useApp, type Order, type OrderStatus, type Reservation } from "../lib/store";
import { OrderTracker } from "../components/OrderTracker";

type OwnerTab = "overview" | "orders" | "history" | "tables" | "menu" | "settings";

function formatSlot(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleString(locale === "fr" ? "fr-FR" : "en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function relativeAge(iso: string, locale: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return locale === "fr" ? "à l'instant" : "just now";
  if (m < 60) return locale === "fr" ? `il y a ${m} min` : `${m} min ago`;
  const h = Math.floor(m / 60);
  return locale === "fr" ? `il y a ${h} h` : `${h} h ago`;
}

function statusTone(status: OrderStatus | Reservation["status"]): string {
  if (status === "received" || status === "confirmed") return "tone-new";
  if (status === "preparing" || status === "seated") return "tone-progress";
  if (status === "ready") return "tone-ready";
  if (status === "collected" || status === "delivered" || status === "completed") return "tone-done";
  if (status === "cancelled") return "tone-cancel";
  return "";
}

export function OwnerPage() {
  const locale = useLocale((s) => s.locale);
  const user = useApp((s) => s.user);
  const orders = useApp((s) => s.orders);
  const reservations = useApp((s) => s.reservations);
  const unavailable = useApp((s) => s.unavailableIds);
  const kitchenPaused = useApp((s) => s.kitchenPaused);
  const updateOrderStatus = useApp((s) => s.updateOrderStatus);
  const updateReservationStatus = useApp((s) => s.updateReservationStatus);
  const cancelOrder = useApp((s) => s.cancelOrder);
  const toggleItemAvailable = useApp((s) => s.toggleItemAvailable);
  const setKitchenPaused = useApp((s) => s.setKitchenPaused);
  const signOut = useApp((s) => s.signOut);
  const pushToast = useApp((s) => s.pushToast);

  const [tab, setTab] = useState<OwnerTab>("overview");
  const [orderFilter, setOrderFilter] = useState<"all" | "pickup" | "delivery">("all");
  const [menuCat, setMenuCat] = useState<CategoryId | "all">("all");
  const [menuQuery, setMenuQuery] = useState("");

  if (!user || user.role !== "owner") {
    return (
      <div className="section">
        <p className="section-kicker">{locale === "fr" ? "Pro" : "Pro"}</p>
        <h1>{tx("owner", "title", locale)}</h1>
        <p className="muted">{locale === "fr" ? "Réservé au propriétaire." : "Owner access only."}</p>
        <Link to="/auth?role=owner" className="btn btn-primary" style={{ marginTop: "1rem" }}>
          {tx("nav", "signIn", locale)}
        </Link>
      </div>
    );
  }

  const live = useMemo(
    () => orders.filter((o) => !["collected", "delivered", "cancelled"].includes(o.status)),
    [orders],
  );
  const history = useMemo(
    () => orders.filter((o) => ["collected", "delivered", "cancelled"].includes(o.status)).slice(0, 40),
    [orders],
  );
  const revenue = orders
    .filter((o) => o.paid && o.status !== "cancelled")
    .reduce((s, o) => s + o.totalCents, 0);
  const paidCount = orders.filter((o) => o.paid && o.status !== "cancelled").length;
  const avgTicket = paidCount ? Math.round(revenue / paidCount) : 0;
  const upcoming = reservations.filter((r) => r.status === "confirmed" || r.status === "seated");
  const pastRes = reservations.filter((r) => r.status === "completed" || r.status === "cancelled").slice(0, 20);
  const deliveryLive = live.filter((o) => o.fulfillment === "delivery").length;
  const pickupLive = live.filter((o) => o.fulfillment === "pickup").length;
  const soldOutCount = unavailable.length;
  const coversTonight = upcoming.reduce((s, r) => s + r.partySize, 0);

  const filteredLive = live.filter((o) => orderFilter === "all" || o.fulfillment === orderFilter);

  const menuItems = MENU.filter((item) => {
    if (menuCat !== "all" && item.category !== menuCat) return false;
    if (!menuQuery.trim()) return true;
    const q = menuQuery.toLowerCase();
    return (
      item.nameFr.toLowerCase().includes(q) ||
      item.nameEn.toLowerCase().includes(q) ||
      item.id.includes(q)
    );
  });

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

  function copyCode(code: string) {
    void navigator.clipboard?.writeText(code);
    pushToast(locale === "fr" ? "Code copié" : "Code copied");
  }

  const tabs: { id: OwnerTab; fr: string; en: string; count?: number }[] = [
    { id: "overview", fr: "Vue d'ensemble", en: "Overview" },
    { id: "orders", fr: "En cours", en: "Live", count: live.length },
    { id: "history", fr: "Historique", en: "History", count: history.length },
    { id: "tables", fr: "Tables", en: "Tables", count: upcoming.length },
    { id: "menu", fr: "Carte", en: "Menu", count: soldOutCount || undefined },
    { id: "settings", fr: "Réglages", en: "Settings" },
  ];

  function OrderCard({ o, showTracker }: { o: Order; showTracker?: boolean }) {
    const label = nextLabel(o.status, o.fulfillment);
    const next = nextStatus(o.status, o.fulfillment);
    const isLive = !["collected", "delivered", "cancelled"].includes(o.status);
    return (
      <article className={`card owner-order ${statusTone(o.status)}`}>
        <div className="owner-order-head">
          <div>
            <button type="button" className="owner-code" onClick={() => copyCode(o.code)} title="Copy">
              {o.code}
            </button>
            <strong className="owner-guest"> · {o.guestName}</strong>
          </div>
          <span className={`badge status-badge ${statusTone(o.status)}`}>{statusLabel(o.status, locale)}</span>
        </div>
        <p className="muted owner-meta">
          <span className={`fulfill-pill ${o.fulfillment}`}>
            {o.fulfillment === "delivery" ? tx("order", "delivery", locale) : tx("order", "pickup", locale)}
          </span>
          {" · "}
          {formatSlot(o.slotAt, locale)}
          {" · "}
          <span className="owner-age">{relativeAge(o.createdAt, locale)}</span>
          {o.paid ? ` · ${statusLabel("paid", locale)}` : ` · ${locale === "fr" ? "Impayée" : "Unpaid"}`}
        </p>
        <p className="owner-contact">
          <a href={`tel:${o.phone.replace(/\s/g, "")}`}>{o.phone}</a>
          {o.address ? ` · ${o.address}` : ""}
        </p>
        {o.notes && (
          <p className="owner-notes">
            <em>{o.notes}</em>
          </p>
        )}
        {showTracker && isLive && <OrderTracker order={o} />}
        <ul className="owner-items">
          {o.items.map((i, idx) => (
            <li key={idx}>
              <span className="qty">{i.quantity}×</span> {locale === "fr" ? i.nameFr : i.nameEn}
            </li>
          ))}
        </ul>
        <div className="owner-order-foot">
          <span className="price">{formatEuro(o.totalCents, locale)}</span>
          {isLive && (
            <div className="owner-actions">
              {label && next && (
                <button type="button" className="btn btn-walnut btn-sm" onClick={() => updateOrderStatus(o.id, next)}>
                  {label}
                </button>
              )}
              <button type="button" className="btn btn-outline btn-sm" onClick={() => cancelOrder(o.id)}>
                {locale === "fr" ? "Annuler" : "Cancel"}
              </button>
            </div>
          )}
        </div>
      </article>
    );
  }

  return (
    <div className="section owner-page">
      <div className="owner-header">
        <div>
          <p className="section-kicker">{locale === "fr" ? "Propriétaire" : "Owner"}</p>
          <h1>{tx("owner", "title", locale)}</h1>
          <p className="muted">
            {user.name} · {user.email}
            {kitchenPaused && (
              <span className="open-pill is-closed" style={{ marginLeft: "0.65rem" }}>
                {locale === "fr" ? "Cuisine en pause" : "Kitchen paused"}
              </span>
            )}
          </p>
        </div>
        <button type="button" className="btn btn-outline" onClick={signOut}>
          {tx("nav", "signOut", locale)}
        </button>
      </div>

      <div className="owner-tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`owner-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {locale === "fr" ? t.fr : t.en}
            {typeof t.count === "number" && t.count > 0 && <span className="tab-count">{t.count}</span>}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="owner-panel">
          <div className="stat-row">
            <div className="stat">
              <span className="muted">{tx("owner", "revenue", locale)}</span>
              <strong>{formatEuro(revenue, locale)}</strong>
            </div>
            <div className="stat">
              <span className="muted">{tx("owner", "liveOrders", locale)}</span>
              <strong>{live.length}</strong>
            </div>
            <div className="stat">
              <span className="muted">{locale === "fr" ? "Ticket moyen" : "Avg. ticket"}</span>
              <strong>{formatEuro(avgTicket, locale)}</strong>
            </div>
            <div className="stat">
              <span className="muted">{locale === "fr" ? "Couverts à venir" : "Upcoming covers"}</span>
              <strong>{coversTonight}</strong>
            </div>
            <div className="stat">
              <span className="muted">{locale === "fr" ? "Retrait / Livraison" : "Pickup / Delivery"}</span>
              <strong>
                {pickupLive} / {deliveryLive}
              </strong>
            </div>
            <div className="stat">
              <span className="muted">{locale === "fr" ? "Épuisés" : "Sold out"}</span>
              <strong>{soldOutCount}</strong>
            </div>
          </div>

          {kitchenPaused && (
            <div className="alert" style={{ marginBottom: "1.25rem" }}>
              {locale === "fr"
                ? "La cuisine est en pause — les clients ne peuvent pas passer de commande."
                : "Kitchen is paused — customers cannot place orders."}
              <button type="button" className="btn btn-primary btn-sm" style={{ marginLeft: "0.75rem" }} onClick={() => setKitchenPaused(false)}>
                {locale === "fr" ? "Rouvrir" : "Reopen"}
              </button>
            </div>
          )}

          <div className="owner-quick">
            <button type="button" className="btn btn-walnut" onClick={() => setTab("orders")}>
              {locale === "fr" ? "Voir les commandes" : "View orders"} ({live.length})
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setTab("tables")}>
              {locale === "fr" ? "Tables" : "Tables"} ({upcoming.length})
            </button>
            <button
              type="button"
              className={`btn ${kitchenPaused ? "btn-primary" : "btn-outline"}`}
              onClick={() => setKitchenPaused(!kitchenPaused)}
            >
              {kitchenPaused
                ? locale === "fr"
                  ? "Rouvrir la cuisine"
                  : "Reopen kitchen"
                : locale === "fr"
                  ? "Mettre en pause"
                  : "Pause kitchen"}
            </button>
          </div>

          <h2 style={{ marginTop: "2rem", fontSize: "1.35rem" }}>
            {locale === "fr" ? "Dernières commandes en cours" : "Latest live orders"}
          </h2>
          {live.length === 0 ? (
            <p className="muted empty-hint">{locale === "fr" ? "Aucune commande en cours." : "No live orders."}</p>
          ) : (
            <div className="owner-grid">
              {live.slice(0, 4).map((o) => (
                <OrderCard key={o.id} o={o} showTracker />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "orders" && (
        <div className="owner-panel">
          <div className="owner-toolbar">
            <h2 style={{ margin: 0, fontSize: "1.35rem" }}>{tx("owner", "liveOrders", locale)}</h2>
            <div className="tabs" style={{ margin: 0 }}>
              {(["all", "pickup", "delivery"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`chip ${orderFilter === f ? "active" : ""}`}
                  onClick={() => setOrderFilter(f)}
                >
                  {f === "all"
                    ? locale === "fr"
                      ? "Tout"
                      : "All"
                    : f === "pickup"
                      ? tx("order", "pickup", locale)
                      : tx("order", "delivery", locale)}
                </button>
              ))}
            </div>
          </div>
          {filteredLive.length === 0 ? (
            <p className="muted empty-hint">{locale === "fr" ? "Aucune commande en cours." : "No live orders."}</p>
          ) : (
            <div className="owner-grid">
              {filteredLive.map((o) => (
                <OrderCard key={o.id} o={o} showTracker />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "history" && (
        <div className="owner-panel">
          <h2 style={{ margin: 0, fontSize: "1.35rem" }}>
            {locale === "fr" ? "Historique des commandes" : "Order history"}
          </h2>
          <p className="muted">{locale === "fr" ? "Terminées et annulées (40 max)." : "Completed & cancelled (last 40)."}</p>
          {history.length === 0 ? (
            <p className="muted empty-hint">{locale === "fr" ? "Pas encore d'historique." : "No history yet."}</p>
          ) : (
            <div className="owner-grid" style={{ marginTop: "1rem" }}>
              {history.map((o) => (
                <OrderCard key={o.id} o={o} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "tables" && (
        <div className="owner-panel">
          <h2 style={{ margin: 0, fontSize: "1.35rem" }}>{tx("owner", "reservations", locale)}</h2>
          <p className="muted">
            {locale === "fr"
              ? `${coversTonight} couverts confirmés / installés`
              : `${coversTonight} covers confirmed / seated`}
          </p>
          {upcoming.length === 0 ? (
            <p className="muted empty-hint">{locale === "fr" ? "Pas de table à venir." : "No upcoming tables."}</p>
          ) : (
            <div className="owner-grid" style={{ marginTop: "1rem" }}>
              {upcoming.map((r) => (
                <article key={r.id} className={`card owner-res ${statusTone(r.status)}`}>
                  <div className="owner-order-head">
                    <div>
                      <button type="button" className="owner-code" onClick={() => copyCode(r.code)}>
                        {r.code}
                      </button>
                      <strong className="owner-guest"> · {r.guestName}</strong>
                    </div>
                    <span className={`badge status-badge ${statusTone(r.status)}`}>{r.status}</span>
                  </div>
                  <p className="muted">
                    {r.date} · {r.time} · <strong>{r.partySize}</strong> {locale === "fr" ? "couverts" : "guests"}
                  </p>
                  <p className="owner-contact">
                    <a href={`tel:${r.phone.replace(/\s/g, "")}`}>{r.phone}</a>
                  </p>
                  {r.notes && (
                    <p className="owner-notes">
                      <em>{r.notes}</em>
                    </p>
                  )}
                  <div className="owner-actions" style={{ marginTop: "0.75rem" }}>
                    {r.status === "confirmed" && (
                      <button
                        type="button"
                        className="btn btn-walnut btn-sm"
                        onClick={() => updateReservationStatus(r.id, "seated")}
                      >
                        {tx("owner", "seat", locale)}
                      </button>
                    )}
                    {(r.status === "confirmed" || r.status === "seated") && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => updateReservationStatus(r.id, "completed")}
                      >
                        {locale === "fr" ? "Terminée" : "Complete"}
                      </button>
                    )}
                    {r.status !== "cancelled" && r.status !== "completed" && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => updateReservationStatus(r.id, "cancelled")}
                      >
                        {locale === "fr" ? "Annuler" : "Cancel"}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {pastRes.length > 0 && (
            <>
              <h3 style={{ marginTop: "2rem", fontSize: "1.1rem" }}>
                {locale === "fr" ? "Passées" : "Past"}
              </h3>
              <div className="owner-grid">
                {pastRes.map((r) => (
                  <article key={r.id} className="card" style={{ opacity: 0.75 }}>
                    <strong>
                      {r.code} · {r.guestName}
                    </strong>
                    <p className="muted">
                      {r.date} {r.time} · {r.partySize} pax · {r.status}
                    </p>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {tab === "menu" && (
        <div className="owner-panel">
          <div className="owner-toolbar">
            <div>
              <h2 style={{ margin: 0, fontSize: "1.35rem" }}>{tx("owner", "menu", locale)}</h2>
              <p className="muted" style={{ margin: "0.25rem 0 0" }}>
                {locale === "fr"
                  ? "Marquez les plats épuisés — visible immédiatement côté client."
                  : "Mark items sold out — updates live for customers."}
              </p>
            </div>
            <input
              className="owner-search"
              type="search"
              placeholder={locale === "fr" ? "Rechercher un plat…" : "Search dishes…"}
              value={menuQuery}
              onChange={(e) => setMenuQuery(e.target.value)}
            />
          </div>
          <div className="tabs sticky-tabs" style={{ marginTop: "0.75rem" }}>
            <button type="button" className={`chip ${menuCat === "all" ? "active" : ""}`} onClick={() => setMenuCat("all")}>
              {locale === "fr" ? "Tout" : "All"}
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`chip ${menuCat === c.id ? "active" : ""}`}
                onClick={() => setMenuCat(c.id)}
              >
                {locale === "fr" ? c.fr : c.en}
              </button>
            ))}
          </div>
          <div className="grid-menu" style={{ marginTop: "1rem" }}>
            {menuItems.map((item) => {
              const off = unavailable.includes(item.id);
              return (
                <article key={item.id} className={`card dish-card ${off ? "is-soldout" : ""}`}>
                  <div className="dish-card-top">
                    <h3 style={{ fontSize: "1.05rem" }}>{locale === "fr" ? item.nameFr : item.nameEn}</h3>
                    <span className="price">{formatEuro(item.priceCents, locale)}</span>
                  </div>
                  <p className="muted dish-desc" style={{ fontSize: "0.85rem" }}>
                    {locale === "fr" ? item.descFr : item.descEn}
                  </p>
                  <div className="dish-card-actions">
                    <button
                      type="button"
                      className={`btn btn-sm ${off ? "btn-primary" : "btn-outline"}`}
                      onClick={() => toggleItemAvailable(item.id)}
                    >
                      {off
                        ? locale === "fr"
                          ? "Remettre en vente"
                          : "Back on menu"
                        : locale === "fr"
                          ? "Marquer épuisé"
                          : "Mark sold out"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          {menuItems.length === 0 && (
            <p className="muted empty-hint">{locale === "fr" ? "Aucun plat trouvé." : "No dishes found."}</p>
          )}
        </div>
      )}

      {tab === "settings" && (
        <div className="owner-panel">
          <h2 style={{ margin: 0, fontSize: "1.35rem" }}>{tx("owner", "settings", locale)}</h2>
          <div className="card" style={{ marginTop: "1rem", maxWidth: 480 }}>
            <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem" }}>
              {locale === "fr" ? "État de la cuisine" : "Kitchen status"}
            </h3>
            <p className="muted">
              {locale === "fr"
                ? "Mettre la cuisine en pause bloque les nouvelles commandes en ligne (retrait et livraison)."
                : "Pausing the kitchen blocks new online orders (pickup and delivery)."}
            </p>
            <button
              type="button"
              className={`btn ${kitchenPaused ? "btn-primary" : "btn-walnut"}`}
              style={{ marginTop: "1rem" }}
              onClick={() => setKitchenPaused(!kitchenPaused)}
            >
              {kitchenPaused
                ? locale === "fr"
                  ? "Rouvrir la cuisine"
                  : "Reopen kitchen"
                : locale === "fr"
                  ? "Mettre la cuisine en pause"
                  : "Pause kitchen"}
            </button>
            <p style={{ marginTop: "0.75rem" }}>
              <span className={`open-pill ${kitchenPaused ? "is-closed" : ""}`}>
                {kitchenPaused
                  ? locale === "fr"
                    ? "En pause"
                    : "Paused"
                  : locale === "fr"
                    ? "Ouverte aux commandes"
                    : "Accepting orders"}
              </span>
            </p>
          </div>

          <div className="card" style={{ marginTop: "1rem", maxWidth: 480 }}>
            <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem" }}>
              {locale === "fr" ? "Raccourcis" : "Shortcuts"}
            </h3>
            <ul className="owner-shortcuts">
              <li>
                <Link to="/menu">{locale === "fr" ? "Voir la carte client" : "View customer menu"}</Link>
              </li>
              <li>
                <Link to="/order">{locale === "fr" ? "Page commande" : "Order page"}</Link>
              </li>
              <li>
                <Link to="/reserve">{locale === "fr" ? "Réservations" : "Reservations"}</Link>
              </li>
              <li>
                <a href="tel:+33751517109">07 51 51 71 09</a>
              </li>
            </ul>
          </div>

          <div className="card" style={{ marginTop: "1rem", maxWidth: 480 }}>
            <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem" }}>
              {locale === "fr" ? "Résumé session" : "Session summary"}
            </h3>
            <ul className="muted" style={{ margin: 0, paddingLeft: "1.1rem" }}>
              <li>
                {locale === "fr" ? "Commandes totales" : "Total orders"}: {orders.length}
              </li>
              <li>
                {locale === "fr" ? "CA encaissé" : "Paid revenue"}: {formatEuro(revenue, locale)}
              </li>
              <li>
                {locale === "fr" ? "Réservations" : "Reservations"}: {reservations.length}
              </li>
              <li>
                {locale === "fr" ? "Plats épuisés" : "Sold-out items"}: {soldOutCount}
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
