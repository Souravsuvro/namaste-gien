import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLocale, tx } from "../lib/i18n";
import { useApp } from "../lib/store";
import { nextOpenDates, parisNow, reservationSlots } from "../lib/hours";
import { RESTAURANT } from "../lib/restaurant";

export function ReservePage() {
  const locale = useLocale((s) => s.locale);
  const bookTable = useApp((s) => s.bookTable);
  const user = useApp((s) => s.user);
  const navigate = useNavigate();
  const now = useMemo(() => parisNow(), []);
  const dates = useMemo(() => nextOpenDates(now, 10), [now]);
  const initialDate = useMemo(() => {
    for (const d of dates) {
      if (reservationSlots(new Date(`${d}T12:00:00`), now).length > 0) return d;
    }
    return dates[0] ?? "";
  }, [dates, now]);
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState("");
  const [party, setParty] = useState(2);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState("");
  const [slots, setSlots] = useState<string[]>([]);

  useEffect(() => {
    const next = reservationSlots(new Date(`${date}T12:00:00`), now);
    setSlots(next);
    setTime((prev) => (prev && next.includes(prev) ? prev : next[0] ?? ""));
  }, [date, now]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    if (!time) {
      setErr(locale === "fr" ? "Choisissez une heure." : "Pick a time.");
      return;
    }
    const res = bookTable({ date, time, partySize: party, guestName: name, phone, notes: notes || undefined });
    if (res.error === "phone") {
      setErr(locale === "fr" ? "Téléphone français invalide." : "Invalid French phone.");
      return;
    }
    if (res.reservation) {
      navigate(user ? "/account" : `/reserve?ok=${res.reservation.code}`);
    }
  }

  return (
    <div className="section" style={{ maxWidth: 520 }}>
      <h1>{tx("nav", "reserve", locale)}</h1>
      <p className="muted">
        {locale === "fr"
          ? "Midi et soir, sauf le lundi. Plus de 8 couverts : appelez."
          : "Lunch and dinner, except Mondays. Parties over 8: please call."}{" "}
        <a href={RESTAURANT.telHref}>{RESTAURANT.phoneDisplay}</a>
      </p>
      <form className="form card" style={{ marginTop: "1.25rem" }} onSubmit={onSubmit}>
        <p className="form-label">{locale === "fr" ? "Date" : "Date"}</p>
        <div className="tabs" style={{ overflowX: "auto" }}>
          {dates.map((d) => {
            const label = new Date(`${d}T12:00:00`).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
            });
            return (
              <button key={d} type="button" className={`chip ${date === d ? "active" : ""}`} onClick={() => setDate(d)}>
                {label}
              </button>
            );
          })}
        </div>
        <p className="form-label">{locale === "fr" ? "Couverts" : "Guests"}</p>
        <div className="tabs">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <button key={n} type="button" className={`chip ${party === n ? "active" : ""}`} onClick={() => setParty(n)}>
              {n}
            </button>
          ))}
        </div>
        <p className="form-label">{locale === "fr" ? "Heure" : "Time"}</p>
        {slots.length === 0 ? (
          <p className="alert">{locale === "fr" ? "Plus de créneau." : "No times left."}</p>
        ) : (
          <div className="slot-grid">
            {slots.map((s) => (
              <button key={s} type="button" className={`chip ${time === s ? "active" : ""}`} onClick={() => setTime(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
        <label>
          {locale === "fr" ? "Prénom" : "First name"}
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          {locale === "fr" ? "Téléphone" : "Phone"}
          <input value={phone} onChange={(e) => setPhone(e.target.value)} required inputMode="tel" />
        </label>
        <label>
          {locale === "fr" ? "Précisions" : "Notes"}
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={locale === "fr" ? "Chaise haute, allergie…" : "High chair, allergy…"} />
        </label>
        {err && <p className="alert">{err}</p>}
        <button type="submit" className="btn btn-primary">
          {locale === "fr" ? "Confirmer la table" : "Confirm table"}
        </button>
        {!user && (
          <p className="muted" style={{ fontSize: "0.85rem" }}>
            <Link to="/auth">{tx("nav", "signIn", locale)}</Link>
            {" — "}
            {locale === "fr" ? "pour retrouver vos réservations." : "to keep your bookings."}
          </p>
        )}
      </form>
    </div>
  );
}
