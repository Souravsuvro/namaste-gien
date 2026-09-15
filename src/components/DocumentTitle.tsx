import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLocale } from "../lib/i18n";

const TITLES: Record<string, { fr: string; en: string }> = {
  "/": { fr: "Accueil", en: "Home" },
  "/menu": { fr: "La carte", en: "Menu" },
  "/order": { fr: "Commander", en: "Order" },
  "/reserve": { fr: "Réserver", en: "Reserve" },
  "/contact": { fr: "Contact", en: "Contact" },
  "/auth": { fr: "Connexion", en: "Sign in" },
  "/account": { fr: "Mon compte", en: "My account" },
  "/owner": { fr: "Espace pro", en: "Owner hub" },
  "/app": { fr: "Application", en: "App" },
  "/app/menu": { fr: "Menu · App", en: "Menu · App" },
};

export function DocumentTitle() {
  const { pathname } = useLocation();
  const locale = useLocale((s) => s.locale);
  useEffect(() => {
    const entry = TITLES[pathname] ?? { fr: "Namasté Gien", en: "Namasté Gien" };
    document.title = `${entry[locale]} · Namasté Gien`;
    document.documentElement.lang = locale;
  }, [pathname, locale]);
  return null;
}
