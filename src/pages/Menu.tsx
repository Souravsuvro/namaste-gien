import { useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES, MENU, formatEuro, type CategoryId } from "../lib/restaurant";
import { useLocale, tx } from "../lib/i18n";
import { cartCount, useApp } from "../lib/store";

export function MenuPage() {
  const locale = useLocale((s) => s.locale);
  const addToCart = useApp((s) => s.addToCart);
  const unavailable = useApp((s) => s.unavailableIds);
  const cart = useApp((s) => s.cart);
  const count = cartCount(cart);
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const items = cat === "all" ? MENU : MENU.filter((m) => m.category === cat);

  return (
    <div className="section section-menu">
      <div className="page-head">
        <div>
          <p className="section-kicker">{locale === "fr" ? "Carte" : "Menu"}</p>
          <h1>{tx("nav", "menu", locale)}</h1>
          <p className="muted">
            {locale === "fr"
              ? "Tout se commande à emporter ou en livraison Gien."
              : "Everything for pickup or Gien delivery."}
          </p>
        </div>
        {count > 0 && (
          <Link to="/order" className="btn btn-primary page-head-cta">
            {tx("cart", "title", locale)}
            <span className="cart-count">{count}</span>
          </Link>
        )}
      </div>
      <div className="tabs sticky-tabs" style={{ marginTop: "1rem" }}>
        <button type="button" className={`chip ${cat === "all" ? "active" : ""}`} onClick={() => setCat("all")}>
          {locale === "fr" ? "Tout" : "All"}
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" className={`chip ${cat === c.id ? "active" : ""}`} onClick={() => setCat(c.id)}>
            {locale === "fr" ? c.fr : c.en}
          </button>
        ))}
      </div>
      <div className="grid-menu">
        {items.map((item) => (
          <article key={item.id} className="card dish-card">
            <div className="dish-card-top">
              <h3>{locale === "fr" ? item.nameFr : item.nameEn}</h3>
              <span className="price">{formatEuro(item.priceCents, locale)}</span>
            </div>
            <p className="muted dish-desc">{locale === "fr" ? item.descFr : item.descEn}</p>
            <div className="dish-card-actions">
              {unavailable.includes(item.id) ? (
                <span className="badge">{locale === "fr" ? "Épuisé" : "Sold out"}</span>
              ) : (
                <button type="button" className="btn btn-primary btn-sm" onClick={() => addToCart(item.id)}>
                  {tx("cart", "add", locale)}
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
