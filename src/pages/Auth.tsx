import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useLocale, tx } from "../lib/i18n";
import { useApp } from "../lib/store";

export function AuthPage() {
  const locale = useLocale((s) => s.locale);
  const signInEmail = useApp((s) => s.signInEmail);
  const signInGoogle = useApp((s) => s.signInGoogle);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const asOwner = params.get("role") === "owner";
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState(asOwner ? "owner@namaste-gien.fr" : "");
  const [password, setPassword] = useState("demo1234");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function goAfter(role: "customer" | "owner") {
    navigate(role === "owner" ? "/owner" : "/account");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = signInEmail(email, password, mode === "up" ? name : undefined, asOwner);
    if (!res.ok) {
      setError(locale === "fr" ? "E-mail ou mot de passe invalide." : "Invalid email or password.");
      return;
    }
    const user = useApp.getState().user;
    goAfter(user?.role ?? "customer");
  }

  function onGoogle() {
    signInGoogle(asOwner);
    goAfter(asOwner ? "owner" : "customer");
  }

  return (
    <div className="section" style={{ maxWidth: 420 }}>
      <h1>{tx("auth", "welcome", locale)}</h1>
      <p className="muted">
        {asOwner
          ? locale === "fr"
            ? "Espace propriétaire — gérez commandes et tables."
            : "Owner hub — manage orders and tables."
          : locale === "fr"
            ? "Suivez vos commandes et réservez une table."
            : "Track orders and book a table."}
      </p>

      <button type="button" className="btn btn-google" style={{ marginTop: "1.25rem" }} onClick={onGoogle}>
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.1 5.5l.1.1 6.2 5.2C39.2 36.3 44 31 44 24c0-1.3-.1-2.5-.4-3.5z"/>
        </svg>
        {tx("auth", "google", locale)}
      </button>

      <div className="divider" style={{ margin: "1.25rem 0" }}>{tx("auth", "or", locale)}</div>

      <form className="form" onSubmit={onSubmit}>
        {mode === "up" && (
          <label>
            {tx("auth", "name", locale)}
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
        )}
        <label>
          {tx("auth", "email", locale)}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>
          {tx("auth", "password", locale)}
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={4} autoComplete={mode === "up" ? "new-password" : "current-password"} />
        </label>
        {error && <p className="alert">{error}</p>}
        <button type="submit" className="btn btn-primary">
          {mode === "in" ? tx("auth", "signIn", locale) : tx("auth", "signUp", locale)}
        </button>
      </form>

      <p style={{ marginTop: "1rem" }} className="muted">
        {mode === "in" ? tx("auth", "noAccount", locale) : tx("auth", "hasAccount", locale)}{" "}
        <button type="button" className="btn btn-ghost" style={{ minHeight: "auto", padding: 0, color: "var(--chili)" }} onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? tx("auth", "signUp", locale) : tx("auth", "signIn", locale)}
        </button>
      </p>
      <p className="muted" style={{ marginTop: "1rem", fontSize: "0.8rem" }}>{tx("auth", "demoNote", locale)}</p>
      <p className="muted" style={{ marginTop: "0.5rem", fontSize: "0.8rem"}}>
        {locale === "fr" ? "Propriétaire :" : "Owner:"}{" "}
        <Link to="/auth?role=owner" style={{ textDecoration: "underline" }}>
          owner@namaste-gien.fr
        </Link>
      </p>
    </div>
  );
}
