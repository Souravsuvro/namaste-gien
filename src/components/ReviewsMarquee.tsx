import { GOOGLE_PROFILE_URL, GOOGLE_RATING, GOOGLE_REVIEWS, GOOGLE_REVIEWS_URL } from "../lib/reviews";
import { useLocale } from "../lib/i18n";

function Stars({ n }: { n: number }) {
  return (
    <span className="stars" aria-label={`${n} / 5`}>
      {"★".repeat(n)}
      <span className="stars-empty">{"★".repeat(5 - n)}</span>
    </span>
  );
}

function ReviewCard({
  author,
  rating,
  text,
  relative,
}: {
  author: string;
  rating: number;
  text: string;
  relative: string;
}) {
  return (
    <article className="review-card">
      <div className="review-card-top">
        <div className="review-avatar" aria-hidden>
          {author.charAt(0)}
        </div>
        <div>
          <p className="review-author">{author}</p>
          <Stars n={rating} />
        </div>
        <span className="google-g" title="Google" aria-hidden>
          G
        </span>
      </div>
      <p className="review-text">{text}</p>
      <p className="review-meta">{relative}</p>
    </article>
  );
}

export function ReviewsMarquee() {
  const locale = useLocale((s) => s.locale);
  const loop = [...GOOGLE_REVIEWS, ...GOOGLE_REVIEWS];

  return (
    <section className="reviews-section" aria-labelledby="reviews-heading">
      <div className="section reviews-header">
        <div>
          <p className="reviews-kicker">Google</p>
          <h2 id="reviews-heading">
            {locale === "fr" ? "Avis de nos clients" : "What guests say"}
          </h2>
          <div className="reviews-score">
            <strong>{GOOGLE_RATING.average.toFixed(1)}</strong>
            <Stars n={5} />
            <span className="muted">
              {locale === "fr"
                ? `Note Google · ${GOOGLE_RATING.countLabelFr}`
                : `Google rating · ${GOOGLE_RATING.countLabelEn}`}
            </span>
          </div>
        </div>
        <div className="reviews-actions">
          <a className="btn btn-walnut" href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer">
            {locale === "fr" ? "Voir tous les avis" : "See all reviews"}
          </a>
          <a className="btn btn-outline" href={GOOGLE_PROFILE_URL} target="_blank" rel="noopener noreferrer">
            {locale === "fr" ? "Fiche Google" : "Google profile"}
          </a>
        </div>
      </div>
      <div className="marquee" role="region" aria-label={locale === "fr" ? "Défilement des avis" : "Reviews carousel"}>
        <div className="marquee-track">
          {loop.map((r, i) => (
            <ReviewCard
              key={`${r.id}-${i}`}
              author={r.author}
              rating={r.rating}
              text={locale === "fr" ? r.textFr : r.textEn}
              relative={locale === "fr" ? r.relativeFr : r.relativeEn}
            />
          ))}
        </div>
      </div>
      <p className="section muted reviews-footnote">
        {locale === "fr"
          ? "Sélection d'avis affichés sur le site. Les notes et commentaires complets sont sur Google."
          : "A selection of guest feedback shown on the site. Full ratings and comments are on Google."}{" "}
        <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer">Google</a>
      </p>
    </section>
  );
}
