import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useLocale, tx } from "../lib/i18n";
import { cartCount, useApp } from "../lib/store";
import { RESTAURANT } from "../lib/restaurant";
import { GOOGLE_PROFILE_URL, GOOGLE_REVIEWS_URL } from "../lib/reviews";
import { ToastHost } from "./ToastHost";
import { isOpenNow } from "../lib/hours";
import { DocumentTitle } from "./DocumentTitle";
import { ScrollToTop } from "./ScrollToTop";

const navCls = ({ isActive }: { isActive: boolean }) => (isActive ? "active" : undefined);

export function SiteLayout() {
  const locale = useLocale((s) => s.locale);
  const toggle = useLocale((s) => s.toggle);
  const user = useApp((s) => s.user);
  const cart = useApp((s) => s.cart);
  const count = cartCount(cart);
  const loc = useLocation();
  const open = isOpenNow();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [loc.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  if (loc.pathname.startsWith("/app")) {
    return (
      <>
        <ScrollToTop />
        <DocumentTitle />
        <Outlet />
        <ToastHost />
      </>
    );
  }

  const links = (
    <>
      <NavLink to="/" end className={navCls} onClick={() => setMenuOpen(false)}>
        {tx("nav", "home", locale)}
      </NavLink>
      <NavLink to="/menu" className={navCls} onClick={() => setMenuOpen(false)}>
        {tx("nav", "menu", locale)}
      </NavLink>
      <NavLink to="/order" className={navCls} onClick={() => setMenuOpen(false)}>
        {tx("nav", "order", locale)}
      </NavLink>
      <NavLink to="/reserve" className={navCls} onClick={() => setMenuOpen(false)}>
        {tx("nav", "reserve", locale)}
      </NavLink>
      <NavLink to="/contact" className={navCls} onClick={() => setMenuOpen(false)}>
        {tx("nav", "contact", locale)}
      </NavLink>
      <NavLink to="/app" className={navCls} onClick={() => setMenuOpen(false)}>
        {tx("nav", "app", locale)}
      </NavLink>
      {user?.role === "owner" ? (
        <NavLink to="/owner" className={navCls} onClick={() => setMenuOpen(false)}>
          {tx("nav", "owner", locale)}
        </NavLink>
      ) : (
        <NavLink to="/account" className={navCls} onClick={() => setMenuOpen(false)}>
          {tx("nav", "account", locale)}
        </NavLink>
      )}
    </>
  );

  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        {locale === "fr" ? "Aller au contenu" : "Skip to content"}
      </a>
      <ScrollToTop />
      <DocumentTitle />
      <header className="site-header">
        <button
          type="button"
          className="nav-burger"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
        <Link to="/" className="brand">
          Namasté<span>Gien</span>
        </Link>
        <nav className="nav" aria-label="Main">
          {links}
        </nav>
        <div className="header-actions">
          <span
            className={`open-pill ${open ? "is-open" : "is-closed"}`}
            title={open ? "Open" : "Closed"}
          >
            {open ? (locale === "fr" ? "Ouvert" : "Open") : locale === "fr" ? "Fermé" : "Closed"}
          </span>
          <button type="button" className="lang-toggle" onClick={toggle} aria-label="Language FR EN">
            <span className={locale === "fr" ? "" : "dim"}>FR</span>
            <span className="dim">/</span>
            <span className={locale === "en" ? "" : "dim"}>EN</span>
          </button>
          <Link to="/order" className="btn btn-outline cart-btn">
            {tx("cart", "title", locale)}
            {count > 0 ? <span className="cart-count">{count}</span> : null}
          </Link>
          {user ? (
            <Link
              to={user.role === "owner" ? "/owner" : "/account"}
              className="btn btn-walnut user-chip"
            >
              {user.name.split(" ")[0]}
            </Link>
          ) : (
            <Link to="/auth" className="btn btn-primary">
              {tx("nav", "signIn", locale)}
            </Link>
          )}
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-nav-overlay" role="dialog" aria-modal="true">
          <nav className="mobile-nav" aria-label="Mobile">
            {links}
            <button type="button" className="btn btn-outline" onClick={toggle}>
              {locale === "fr" ? "English version" : "Version française"}
            </button>
          </nav>
          <button
            type="button"
            className="mobile-nav-backdrop"
            aria-label="Close"
            onClick={() => setMenuOpen(false)}
          />
        </div>
      )}

      <main id="main" className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <p className="brand" style={{ color: "var(--cream)" }}>
              Namasté<span>Gien</span>
            </p>
            <p style={{ opacity: 0.75, marginTop: "0.5rem" }}>
              {RESTAURANT.address.street}, {RESTAURANT.address.postal} {RESTAURANT.address.city}
            </p>
            <p>
              <a href={RESTAURANT.telHref}>{RESTAURANT.phoneDisplay}</a>
            </p>
          </div>
          <div>
            <p className="footer-label">{locale === "fr" ? "Services" : "Services"}</p>
            <p>
              <Link to="/order">
                {locale === "fr" ? "À emporter & livraison 45500" : "Pickup & 45500 delivery"}
              </Link>
            </p>
            <p>
              <Link to="/reserve">{tx("nav", "reserve", locale)}</Link>
            </p>
            <p>
              <Link to="/app">{tx("nav", "app", locale)}</Link>
            </p>
          </div>
          <div>
            <p className="footer-label">Google</p>
            <p>
              <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer">
                {locale === "fr" ? "Avis clients" : "Reviews"}
              </a>
            </p>
            <p>
              <a href={GOOGLE_PROFILE_URL} target="_blank" rel="noopener noreferrer">
                {locale === "fr" ? "Fiche établissement" : "Business profile"}
              </a>
            </p>
            <p>
              <Link to="/owner">{tx("nav", "owner", locale)}</Link>
            </p>
          </div>
        </div>
      </footer>
      <ToastHost />
    </div>
  );
}
