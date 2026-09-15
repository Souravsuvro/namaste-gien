import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { formatEuro } from "../lib/restaurant";
import { useLocale, tx, statusLabel } from "../lib/i18n";
import { useApp } from "../lib/store";
import { OrderTracker } from "../components/OrderTracker";

export function AccountPage() {
  const locale = useLocale((s) => s.locale);
  const user = useApp((s) => s.user);
  const orders = useApp((s) => s.orders);
  const reservations = useApp((s) => s.reservations);
  const signOut = useApp((s) => s.signOut);
  const deleteAccount = useApp((s) => s.deleteAccount);
  const restoreAccount = useApp((s) => s.restoreAccount);
  const updateProfile = useApp((s) => s.updateProfile);
  const cancelOrder = useApp((s) => s.cancelOrder);
  const [params] = useSearchParams();
  const highlight = params.get("order");
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  if (!user) {
    return (
      <div className="section">
        <h1>{tx("customer", "title", locale)}</h1>
        <p className="muted">{locale === "fr" ? "Connectez-vous pour suivre vos commandes." : "Sign in to track your orders."}</p>
        <Link to="/auth" className="btn btn-primary" style={{ marginTop: "1rem" }}>{tx("nav", "signIn", locale)}</Link>
      </div>
    );
  }

  const myOrders = orders.filter((o) => o.userId === user.id);
  const myRes = reservations.filter((r) => r.userId === user.id);

  function onProfile(e: FormEvent) {
    e.preventDefault();
    updateProfile({ name, phone });
  }

  return (
    <div className="section">
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}>
        <div>
          <h1>{tx("customer", "title", locale)}</h1>
          <p className="muted">{user.email} · {user.provider === "google" ? "Google" : "Email"}</p>
        </div>
        <button type="button" className="btn btn-outline" onClick={signOut}>{tx("nav", "signOut", locale)}</button>
      </div>

      {user.deletedAt ? (
        <div className="alert" style={{ marginTop: "1rem" }}>
          <p>{tx("customer", "deleted", locale)}</p>
          <button type="button" className="btn btn-walnut" style={{ marginTop: "0.75rem" }} onClick={restoreAccount}>
            {tx("customer", "restore", locale)}
          </button>
        </div>
      ) : (
        <form className="card form" style={{ marginTop: "1.25rem", maxWidth: 420 }} onSubmit={onProfile}>
          <h2 style={{ margin: 0, fontSize: "1.2rem" }}>{tx("customer", "profile", locale)}</h2>
          <label>
            {locale === "fr" ? "Prénom" : "Name"}
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            {locale === "fr" ? "Téléphone" : "Phone"}
            <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
          </label>
          <button type="submit" className="btn btn-walnut">{tx("common", "save", locale)}</button>
        </form>
      )}

      {highlight && myOrders.some((o) => o.id === highlight) && (
        <p className="alert success" style={{ marginTop: "1rem" }}>{tx("payment", "success", locale)}</p>
      )}

      <h2 style={{ marginTop: "2rem" }}>{tx("customer", "orders", locale)}</h2>
      {myOrders.length === 0 ? (
        <p className="muted">{tx("customer", "noOrders", locale)}</p>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem", marginTop: "0.75rem" }}>
          {myOrders.map((o) => (
            <article key={o.id} className="card" style={o.id === highlight ? { boxShadow: "inset 0 0 0 2px var(--chili)" } : undefined}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                <strong>{o.code}</strong>
                <span className="badge">{statusLabel(o.status, locale)}</span>
              </div>
              <p className="muted">
                {o.fulfillment === "delivery" ? tx("order", "delivery", locale) : tx("order", "pickup", locale)}
                {" · "}
                {new Date(o.slotAt).toLocaleString(locale === "fr" ? "fr-FR" : "en-GB")}
                {o.paid ? ` · ${statusLabel("paid", locale)}` : ""}
              </p>
              <OrderTracker order={o} />
              <ul className="muted" style={{ paddingLeft: "1.1rem" }}>
                {o.items.map((i, idx) => (
                  <li key={idx}>{i.quantity} × {locale === "fr" ? i.nameFr : i.nameEn}</li>
                ))}
              </ul>
              <p className="price">{formatEuro(o.totalCents, locale)}</p>
              {!["collected", "delivered", "cancelled"].includes(o.status) && !user.deletedAt && (
                <button type="button" className="btn btn-outline" style={{ marginTop: "0.5rem" }} onClick={() => cancelOrder(o.id)}>
                  {locale === "fr" ? "Annuler" : "Cancel"}
                </button>
              )}
            </article>
          ))}
        </div>
      )}

      <h2 style={{ marginTop: "2rem" }}>{tx("customer", "reservations", locale)}</h2>
      {myRes.length === 0 ? (
        <p className="muted">{locale === "fr" ? "Aucune réservation." : "No reservations."}</p>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem", marginTop: "0.75rem" }}>
          {myRes.map((r) => (
            <article key={r.id} className="card">
              <strong>{r.code}</strong>
              <p className="muted">{r.date} {r.time} · {r.partySize} {locale === "fr" ? "couverts" : "guests"}</p>
              <span className="badge">{r.status}</span>
            </article>
          ))}
        </div>
      )}

      {!user.deletedAt && (
        <div style={{ marginTop: "2.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--line)" }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              if (confirm(locale === "fr" ? "Désactiver le compte ?" : "Deactivate account?")) deleteAccount();
            }}
          >
            {tx("customer", "delete", locale)}
          </button>
        </div>
      )}
    </div>
  );
}
