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
          <p className="hero-kicker">{tx("hero", "kicker", locale)}</p>
          <h1>{tx("hero", "title", locale)}</h1>
          <p>{tx("hero", "lead", locale)}</p>
          <div className="hero-actions">
            <Link to="/order" className="btn btn-primary">
              {tx("hero", "order", locale)}
            </Link>
            <Link to="/reserve" className="btn btn-hero-outline">
              {tx("hero", "reserve", locale)}
            </Link>
          </div>
          <Link to="/app" className="hero-app-link">
            {tx("hero", "openApp", locale)}
          </Link>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 0, paddingTop: "1.75rem" }}>
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
        <div className="section-title-row">
          <div>
            <p className="section-kicker">{locale === "fr" ? "À la carte" : "From the kitchen"}</p>
            <h2>{locale === "fr" ? "Plats signatures" : "Signature dishes"}</h2>
          </div>
          <Link to="/menu" className="btn btn-outline btn-sm">
            {locale === "fr" ? "Toute la carte" : "Full menu"}
          </Link>
        </div>
        <div className="grid-menu">
          {signatures.map((item) => (
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
      </section>

      <section className="section layout-2" style={{ paddingTop: "1rem" }}>
        <div>
          <p className="section-kicker">{locale === "fr" ? "Planning" : "Schedule"}</p>
          <h2>{locale === "fr" ? "Horaires" : "Hours"}</h2>
          <p className="muted" style={{ marginTop: "0.4rem" }}>
            {open
              ? locale === "fr"
                ? "Ouvert en ce moment"
                : "Open right now"
              : locale === "fr"
                ? "Actuellement fermé"
                : "Currently closed"}
          </p>
          <ul className="hours-list">
            {([2, 3, 4, 5, 6, 0, 1] as const).map((d) => (
              <li key={d}>
                <span className="muted">{days[d]}</span>
                <span className="price">{hours[d]}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card location-card">
          <h2 style={{ fontSize: "1.4rem", marginTop: "0.15rem" }}>
            {locale === "fr" ? "Nous trouver" : "Find us"}
          </h2>
          <p style={{ marginTop: "0.65rem", lineHeight: 1.55 }}>
            {RESTAURANT.address.street}
            <br />
            {RESTAURANT.address.postal} {RESTAURANT.address.city}
          </p>
          <p style={{ marginTop: "0.5rem" }}>
            <a href={RESTAURANT.telHref} className="text-link">
              {RESTAURANT.phoneDisplay}
            </a>
          </p>
          <Link to="/contact" className="btn btn-walnut" style={{ marginTop: "1.15rem" }}>
            {tx("nav", "contact", locale)}
          </Link>
        </div>
      </section>
    </>
  );
}
