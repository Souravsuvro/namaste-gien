import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "fr" | "en";

type LocaleState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggle: () => void;
};

export const useLocale = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: "fr",
      setLocale: (locale) => set({ locale }),
      toggle: () => set({ locale: get().locale === "fr" ? "en" : "fr" }),
    }),
    { name: "namaste-gien-locale" },
  ),
);

const dict = {
  nav: {
    home: { fr: "Accueil", en: "Home" },
    menu: { fr: "La carte", en: "Menu" },
    order: { fr: "Commander", en: "Order" },
    reserve: { fr: "Réserver", en: "Reserve" },
    contact: { fr: "Contact", en: "Contact" },
    app: { fr: "Application", en: "App" },
    account: { fr: "Mon compte", en: "My account" },
    dashboard: { fr: "Tableau de bord", en: "Dashboard" },
    owner: { fr: "Espace pro", en: "Owner hub" },
    signIn: { fr: "Connexion", en: "Sign in" },
    signOut: { fr: "Déconnexion", en: "Sign out" },
  },
  hero: {
    kicker: { fr: "Restaurant indien · Gien", en: "Indian restaurant · Gien" },
    title: { fr: "Namasté Gien", en: "Namasté Gien" },
    lead: {
      fr: "Le tandoor, les épices, une place de Loire. Cuisine indienne de maison — à table, à emporter ou livrée dans Gien.",
      en: "The tandoor, the spices, a Loire square. Homestyle Indian cooking — dine in, pick up, or delivered in Gien.",
    },
    order: { fr: "Commander", en: "Order now" },
    reserve: { fr: "Réserver une table", en: "Book a table" },
    openApp: { fr: "Ouvrir l'application", en: "Open the app" },
  },
  cart: {
    title: { fr: "Votre panier", en: "Your basket" },
    empty: { fr: "Le panier est vide.", en: "Your basket is empty." },
    add: { fr: "Ajouter", en: "Add" },
    checkout: { fr: "Payer et commander", en: "Pay & order" },
    subtotal: { fr: "Sous-total", en: "Subtotal" },
    delivery: { fr: "Livraison", en: "Delivery" },
    total: { fr: "Total TTC", en: "Total incl. VAT" },
    paySecure: { fr: "Paiement sécurisé", en: "Secure payment" },
  },
  auth: {
    welcome: { fr: "Bienvenue", en: "Welcome" },
    signIn: { fr: "Se connecter", en: "Sign in" },
    signUp: { fr: "Créer un compte", en: "Create account" },
    google: { fr: "Continuer avec Google", en: "Continue with Google" },
    email: { fr: "E-mail", en: "Email" },
    password: { fr: "Mot de passe", en: "Password" },
    name: { fr: "Prénom", en: "First name" },
    or: { fr: "ou", en: "or" },
    noAccount: { fr: "Pas encore de compte ?", en: "No account yet?" },
    hasAccount: { fr: "Déjà un compte ?", en: "Already have an account?" },
    demoNote: {
      fr: "Démo : Google simule une connexion sécurisée. En production, branchez Google OAuth + Better Auth / Clerk.",
      en: "Demo: Google simulates a secure login. In production, wire Google OAuth + Better Auth / Clerk.",
    },
  },
  customer: {
    title: { fr: "Mon espace", en: "My account" },
    orders: { fr: "Mes commandes", en: "My orders" },
    reservations: { fr: "Mes réservations", en: "My reservations" },
    track: { fr: "Suivi", en: "Track" },
    profile: { fr: "Profil", en: "Profile" },
    delete: { fr: "Supprimer mon compte", en: "Delete my account" },
    restore: { fr: "Restaurer mon compte", en: "Restore my account" },
    deleted: {
      fr: "Compte désactivé. Vous pouvez le restaurer sous 30 jours.",
      en: "Account deactivated. You can restore it within 30 days.",
    },
    noOrders: { fr: "Aucune commande pour l'instant.", en: "No orders yet." },
    payOnline: { fr: "Payer en ligne", en: "Pay online" },
  },
  owner: {
    title: { fr: "Tableau de bord propriétaire", en: "Owner dashboard" },
    liveOrders: { fr: "Commandes en cours", en: "Live orders" },
    reservations: { fr: "Réservations", en: "Reservations" },
    menu: { fr: "Carte & prix", en: "Menu & prices" },
    analytics: { fr: "Activité du jour", en: "Today's activity" },
    settings: { fr: "Restaurant", en: "Restaurant" },
    markPreparing: { fr: "En cuisine", en: "Preparing" },
    markReady: { fr: "Prête", en: "Ready" },
    markDone: { fr: "Remise / livrée", en: "Collected / delivered" },
    seat: { fr: "Installés", en: "Seated" },
    revenue: { fr: "CA du jour", en: "Today's revenue" },
    openTables: { fr: "Tables du soir", en: "Evening tables" },
  },
  order: {
    pickup: { fr: "Retrait sur place", en: "Pickup" },
    delivery: { fr: "Livraison Gien", en: "Gien delivery" },
    status: {
      received: { fr: "Reçue", en: "Received" },
      preparing: { fr: "En cuisine", en: "Preparing" },
      ready: { fr: "Prête", en: "Ready" },
      collected: { fr: "Remise", en: "Collected" },
      delivered: { fr: "Livrée", en: "Delivered" },
      cancelled: { fr: "Annulée", en: "Cancelled" },
      paid: { fr: "Payée", en: "Paid" },
    },
  },
  payment: {
    title: { fr: "Paiement sécurisé", en: "Secure checkout" },
    card: { fr: "Carte bancaire", en: "Card" },
    pay: { fr: "Payer", en: "Pay" },
    success: { fr: "Paiement accepté", en: "Payment successful" },
    demo: {
      fr: "Mode démo : aucune carte n'est débitée. En production : Stripe / Wix Payments.",
      en: "Demo mode: no card is charged. Production: Stripe / Wix Payments.",
    },
  },
  common: {
    save: { fr: "Enregistrer", en: "Save" },
    cancel: { fr: "Annuler", en: "Cancel" },
    back: { fr: "Retour", en: "Back" },
    loading: { fr: "Chargement…", en: "Loading…" },
  },
} as const;

type Group = keyof typeof dict;

export function tx<G extends Group>(
  group: G,
  key: keyof (typeof dict)[G],
  locale: Locale,
): string {
  const entry = dict[group][key] as { fr: string; en: string } | Record<string, { fr: string; en: string }>;
  if ("fr" in entry && "en" in entry) {
    return (entry as { fr: string; en: string })[locale];
  }
  return String(key);
}

export function statusLabel(
  status: string,
  locale: Locale,
): string {
  const map = dict.order.status as Record<string, { fr: string; en: string }>;
  return map[status]?.[locale] ?? status;
}
