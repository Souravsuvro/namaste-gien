import { Link } from "react-router-dom";
import { useLocale, tx } from "../lib/i18n";
import { MENU, formatEuro, RESTAURANT } from "../lib/restaurant";
import { HOURS_EN, HOURS_FR, DAY_EN, DAY_FR, isOpenNow } from "../lib/hours";
import { ReviewsMarquee } from "../components/ReviewsMarquee";
import { useApp } from "../lib/store";

export function Home() {
  const locale = useLocale((s) => s.locale);
  const open = isOpenNow();
  const days = locale === "fr" ? DAY_FR : DAY_EN;
  const hours = locale === "fr" ? HOURS_FR : HOURS_EN;
  const addToCart = useApp((s) => s.addToCart);
  const unavailable = useApp((s) => s.unavailableIds);
  const signatures = MENU.filter((m) =>
    ["butter-chicken", "biryani-chicken", "tikka", "palak-paneer"].includes(m.id),
  );

  return (
    <>
      <section className="hero">
        <div>
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.8 }}>
            {tx("hero", "kicker", locale)}
          </p>
          <h1>{tx("hero", "title", locale)}</h1>
          <p>{tx("hero", "lead", locale)}</p>
          <div className="hero-actions">
            <Link to="/order" className="btn btn-primary">{tx("hero", "order", locale)}</Link>
            <Link to="/reserve" className="btn btn-outline" style={{ color: "var(--cream)", boxShadow: "inset 0 0 0 1px rgba(250,246,239,0.4)" }}>
              {tx("hero", "reserve", locale)}
            </Link>
          </div>
          <p style={{ marginTop: "1rem" }}>
            <Link to="/app" style={{ textDecoration: "underline", opacity: 0.85 }}>
              {tx("hero", "openApp", locale)}
            </Link>
          </p>
        </div>
      </section>
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="delivery-banner">
          <strong>{locale === "fr" ? "Livraison locale Gien" : "Local Gien delivery"}</strong>
          <span className="zone-chip">45500</span>
          <span className="muted">
            {locale === "fr"
              ? "Dès 18 € · frais 3,50 € · à emporter en ~20 min"
              : "From €18 · €3.50 fee · pickup in ~20 min"}
          </span>
          <Link to="/order" className="btn btn-primary" style={{ marginLeft: "auto" }}>
            {tx("hero", "order", locale)}
          </Link>
        </div>
      </section>
      <ReviewsMarquee />
      <section className="section">
        <h2>{locale === "fr" ? "Plats signatures" : "Signature dishes"}</h2>
        <div className="grid-menu" style={{ marginTop: "1.25rem" }}>
          {signatures.map((item) => (
            <article key={item.id} className="card">
              <h3>{locale === "fr" ? item.nameFr : item.nameEn}</h3>
              <p className="muted">{locale === "fr" ? item.descFr : item.descEn}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", marginTop: "0.75rem" }}>
                <p className="price" style={{ margin: 0 }}>{formatEuro(item.priceCents, locale)}</p>
                {unavailable.includes(item.id) ? (
                  <span className="badge">{locale === "fr" ? "Épuisé" : "Sold out"}</span>
                ) : (
                  <button type="button" className="btn btn-primary" style={{ minHeight: "2.2rem" }} onClick={() => addToCart(item.id)}>
                    {tx("cart", "add", locale)}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
        <div style={{ marginTop: "2.5rem" }}>
          <Link to="/menu" className="btn btn-outline">{locale === "fr" ? "Toute la carte" : "Full menu"}</Link>
        </div>
      </section>
      <section className="section layout-2">
        <div>
          <h2>{locale === "fr" ? "Horaires" : "Hours"}</h2>
          <p className="muted" style={{ marginTop: "0.35rem" }}>
            {open ? (locale === "fr" ? "Ouvert en ce moment" : "Open right now") : (locale === "fr" ? "Actuellement fermé" : "Currently closed")}
          </p>
          <ul style={{ listStyle: "none", padding: 0, marginTop: "0.75rem" }}>
            {([2, 3, 4, 5, 6, 0, 1] as const).map((d) => (
              <li key={d} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", padding: "0.4rem 0", borderBottom: "1px solid var(--line)" }}>
                <span className="muted">{days[d]}</span>
                <span className="price">{hours[d]}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2 style={{ fontSize: "1.35rem" }}>{locale === "fr" ? "Nous trouver" : "Find us"}</h2>
          <p style={{ marginTop: "0.5rem" }}>
            {RESTAURANT.address.street}<br />
            {RESTAURANT.address.postal} {RESTAURANT.address.city}
          </p>
          <p><a href={RESTAURANT.telHref}>{RESTAURANT.phoneDisplay}</a></p>
          <Link to="/contact" className="btn btn-walnut" style={{ marginTop: "1rem" }}>{tx("nav", "contact", locale)}</Link>
        </div>
      </section>
    </>
  );
}
