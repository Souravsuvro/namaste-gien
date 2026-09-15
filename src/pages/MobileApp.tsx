import { Link, NavLink, useLocation } from "react-router-dom";
import { useLocale, tx } from "../lib/i18n";
import { MENU, formatEuro } from "../lib/restaurant";
import { cartCount, useApp } from "../lib/store";
import { GOOGLE_RATING, GOOGLE_REVIEWS_URL } from "../lib/reviews";
import { isOpenNow } from "../lib/hours";

export function MobileApp() {
  const locale = useLocale((s) => s.locale);
  const toggle = useLocale((s) => s.toggle);
  const count = cartCount(useApp((s) => s.cart));
  const addToCart = useApp((s) => s.addToCart);
  const unavailable = useApp((s) => s.unavailableIds);
  const loc = useLocation();
  const showMenu = loc.pathname.includes("/app/menu");
  const open = isOpenNow();

  return (
    <div className="app-stage">
      <div className="phone-frame">
        <header className="app-header">
          <Link to="/app" className="brand" style={{ fontSize: "1.25rem" }}>
            Namasté<span>Gien</span>
          </Link>
          <span className={`open-pill ${open ? "is-open" : "is-closed"}`}>
            {open ? (locale === "fr" ? "Ouvert" : "Open") : locale === "fr" ? "Fermé" : "Closed"}
          </span>
          <button type="button" className="lang-toggle" onClick={toggle} aria-label="Language">
            <span className={locale === "fr" ? "" : "dim"}>FR</span>
            <span className="dim">/</span>
            <span className={locale === "en" ? "" : "dim"}>EN</span>
          </button>
        </header>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {showMenu ? (
            <div style={{ padding: "1rem" }}>
              <h1 style={{ fontSize: "1.6rem" }}>{tx("nav", "menu", locale)}</h1>
              {MENU.map((item) => {
                const soldOut = unavailable.includes(item.id);
                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      padding: "0.85rem 0",
                      borderBottom: "1px solid var(--line)",
                      opacity: soldOut ? 0.5 : 1,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <strong>{locale === "fr" ? item.nameFr : item.nameEn}</strong>
                      <div className="muted" style={{ fontSize: "0.8rem" }}>
                        {locale === "fr" ? item.descFr : item.descEn}
                      </div>
                      <div className="price">{formatEuro(item.priceCents, locale)}</div>
                    </div>
                    {soldOut ? (
                      <span className="badge" style={{ alignSelf: "center" }}>
                        {locale === "fr" ? "Épuisé" : "Sold out"}
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ minHeight: "2.4rem", alignSelf: "center" }}
                        onClick={() => addToCart(item.id)}
                        aria-label={tx("cart", "add", locale)}
                      >
                        +
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: "1rem 1rem 1.5rem" }}>
              <div
                style={{
                  background: "var(--walnut)",
                  color: "var(--cream)",
                  borderRadius: 12,
                  padding: "1.5rem 1rem",
                }}
              >
                <p
                  style={{
                    fontSize: "0.7rem",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    opacity: 0.75,
                  }}
                >
                  {tx("hero", "kicker", locale)}
                </p>
                <h1 style={{ color: "var(--cream)", margin: "0.35rem 0" }}>Namasté Gien</h1>
                <p style={{ opacity: 0.85, fontSize: "0.9rem" }}>
                  {locale === "fr" ? "Cuisine indienne · place Foch" : "Indian kitchen · place Foch"}
                </p>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.6rem",
                  marginTop: "1rem",
                }}
              >
                <Link to="/app/menu" className="btn btn-primary">
                  {tx("hero", "order", locale)}
                </Link>
                <Link to="/reserve" className="btn btn-walnut">
                  {tx("hero", "reserve", locale)}
                </Link>
              </div>
              <div
                className="delivery-banner"
                style={{ marginTop: "0.85rem", flexDirection: "column", alignItems: "flex-start" }}
              >
                <strong>
                  {locale === "fr" ? "Livraison locale 45500" : "Local delivery 45500"}
                </strong>
                <span className="muted" style={{ fontSize: "0.8rem" }}>
                  {locale === "fr"
                    ? "Dès 18 € · 3,50 € de frais · à emporter ~20 min"
                    : "From €18 · €3.50 fee · pickup ~20 min"}
                </span>
                <Link to="/order" className="btn btn-primary" style={{ width: "100%", marginTop: "0.35rem" }}>
                  {locale === "fr" ? "Commander / livrer" : "Order / deliver"}
                </Link>
              </div>
              <a
                href={GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="card"
                style={{ display: "block", marginTop: "0.85rem" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <strong style={{ fontSize: "1.25rem" }}>{GOOGLE_RATING.average.toFixed(1)}</strong>
                  <span style={{ color: "#e2a106" }}>★★★★★</span>
                </div>
                <p className="muted" style={{ margin: "0.25rem 0 0", fontSize: "0.8rem" }}>
                  {locale === "fr" ? "Avis Google · Voir tous les avis" : "Google reviews · See all"}
                </p>
              </a>
              <h2 style={{ marginTop: "1.5rem", fontSize: "1.3rem" }}>
                {locale === "fr" ? "Signatures" : "Signatures"}
              </h2>
              <div style={{ display: "flex", gap: "0.6rem", overflowX: "auto" }}>
                {MENU.slice(4, 8).map((m) => (
                  <div key={m.id} className="card" style={{ minWidth: 150 }}>
                    <strong style={{ fontSize: "0.95rem" }}>
                      {locale === "fr" ? m.nameFr : m.nameEn}
                    </strong>
                    <div className="price">{formatEuro(m.priceCents, locale)}</div>
                  </div>
                ))}
              </div>
              <Link
                to="/account"
                className="btn btn-outline"
                style={{ width: "100%", marginTop: "1.25rem", display: "flex" }}
              >
                {tx("nav", "account", locale)}
              </Link>
              <Link
                to="/owner"
                className="btn btn-ghost"
                style={{ width: "100%", marginTop: "0.5rem", display: "flex" }}
              >
                {tx("nav", "owner", locale)}
              </Link>
            </div>
          )}
        </div>
        <nav className="app-tabs" aria-label="App tabs">
          <NavLink to="/app" end className={({ isActive }) => (isActive ? "active" : "")}>
            {tx("nav", "home", locale)}
          </NavLink>
          <NavLink to="/app/menu" className={({ isActive }) => (isActive ? "active" : "")}>
            {tx("nav", "menu", locale)}
          </NavLink>
          <NavLink to="/order">
            {tx("cart", "title", locale)}
            {count ? ` (${count})` : ""}
          </NavLink>
          <NavLink to="/reserve">{tx("nav", "reserve", locale)}</NavLink>
          <NavLink to="/account">{tx("nav", "account", locale)}</NavLink>
        </nav>
      </div>
    </div>
  );
}
