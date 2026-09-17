import { RESTAURANT } from "../lib/restaurant";
import { HOURS_EN, HOURS_FR, DAY_EN, DAY_FR, isOpenNow } from "../lib/hours";
import { useLocale, tx } from "../lib/i18n";
import { GOOGLE_PROFILE_URL } from "../lib/reviews";

export function ContactPage() {
  const locale = useLocale((s) => s.locale);
  const open = isOpenNow();
  const days = locale === "fr" ? DAY_FR : DAY_EN;
  const hours = locale === "fr" ? HOURS_FR : HOURS_EN;
  const map = `https://www.openstreetmap.org/export/embed.html?bbox=${RESTAURANT.address.lng - 0.008}%2C${RESTAURANT.address.lat - 0.005}%2C${RESTAURANT.address.lng + 0.008}%2C${RESTAURANT.address.lat + 0.005}&layer=mapnik&marker=${RESTAURANT.address.lat}%2C${RESTAURANT.address.lng}`;

  return (
    <div className="section layout-2">
      <div>
        <h1>{tx("nav", "contact", locale)}</h1>
        <p className="muted">
          {locale === "fr"
            ? "Au pied du château, sur la place Foch."
            : "At the foot of the château, on place Foch."}
        </p>
        <p style={{ marginTop: "1rem" }}>
          <strong>{RESTAURANT.address.street}</strong>
          <br />
          {RESTAURANT.address.postal} {RESTAURANT.address.city}
        </p>
        <p>
          <a href={RESTAURANT.telHref}>{RESTAURANT.phoneDisplay}</a>
        </p>
        <p className="muted">{RESTAURANT.email}</p>
        <p style={{ marginTop: "0.75rem" }}>
          <span className={`open-pill ${open ? "is-open" : "is-closed"}`}>
            {open
              ? locale === "fr"
                ? "Ouvert maintenant"
                : "Open now"
              : locale === "fr"
                ? "Fermé maintenant"
                : "Closed now"}
          </span>
        </p>
        <h2 style={{ marginTop: "1.75rem", fontSize: "1.35rem" }}>
          {locale === "fr" ? "Horaires" : "Hours"}
        </h2>
        <ul style={{ listStyle: "none", padding: 0, marginTop: "0.5rem" }}>
          {([2, 3, 4, 5, 6, 0, 1] as const).map((d) => (
            <li key={d} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", padding: "0.35rem 0", borderBottom: "1px solid var(--line)" }}>
              <span className="muted">{days[d]}</span>
              <span className="price">{hours[d]}</span>
            </li>
          ))}
        </ul>
        <a className="btn btn-walnut" style={{ marginTop: "1.25rem" }} href={GOOGLE_PROFILE_URL} target="_blank" rel="noopener noreferrer">
          {locale === "fr" ? "Voir sur Google" : "View on Google"}
        </a>
      </div>
      <div className="card map-card">
        <iframe title="map" src={map} className="map-iframe" loading="lazy" />
      </div>
    </div>
  );
}
