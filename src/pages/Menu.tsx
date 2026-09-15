import { useState } from "react";
import { CATEGORIES, MENU, formatEuro, type CategoryId } from "../lib/restaurant";
import { useLocale, tx } from "../lib/i18n";
import { useApp } from "../lib/store";

export function MenuPage() {
  const locale = useLocale((s) => s.locale);
  const addToCart = useApp((s) => s.addToCart);
  const unavailable = useApp((s) => s.unavailableIds);
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const items = cat === "all" ? MENU : MENU.filter((m) => m.category === cat);

  return (
    <div className="section">
      <h1>{tx("nav", "menu", locale)}</h1>
      <p className="muted">{locale === "fr" ? "Tout se commande à emporter ou en livraison Gien." : "Everything for pickup or Gien delivery."}</p>
      <div className="tabs" style={{ marginTop: "1rem" }}>
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
          <article key={item.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
              <h3>{locale === "fr" ? item.nameFr : item.nameEn}</h3>
              <span className="price">{formatEuro(item.priceCents, locale)}</span>
            </div>
            <p className="muted">{locale === "fr" ? item.descFr : item.descEn}</p>
            {unavailable.includes(item.id) ? (
              <p className="badge" style={{ marginTop: "0.85rem" }}>{locale === "fr" ? "Épuisé" : "Sold out"}</p>
            ) : (
              <button type="button" className="btn btn-primary" style={{ marginTop: "0.85rem", width: "100%" }} onClick={() => addToCart(item.id)}>
                {tx("cart", "add", locale)}
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
