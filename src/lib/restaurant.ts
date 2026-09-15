export const RESTAURANT = {
  name: "Namasté Gien",
  legalName: "Namaste Gien's",
  address: {
    street: "2 place Foch",
    postal: "45500",
    city: "Gien",
    country: "France",
    lat: 47.6854,
    lng: 2.6299,
  },
  phone: "0751517109",
  phoneDisplay: "07 51 51 71 09",
  telHref: "tel:+33751517109",
  email: "bonjour@namaste-gien.fr",
  deliveryFeeCents: 350,
  deliveryMinCents: 1800,
  deliveryPostal: "45500",
} as const;

export type CategoryId =
  | "starters"
  | "tandoor"
  | "chicken"
  | "lamb"
  | "veg"
  | "biryani"
  | "breads"
  | "desserts"
  | "drinks";

export type MenuItem = {
  id: string;
  category: CategoryId;
  nameFr: string;
  nameEn: string;
  descFr: string;
  descEn: string;
  priceCents: number;
  diets: string[];
};

export const CATEGORIES: { id: CategoryId; fr: string; en: string }[] = [
  { id: "starters", fr: "Entrées", en: "Starters" },
  { id: "tandoor", fr: "Tandoor", en: "Tandoor" },
  { id: "chicken", fr: "Currys poulet", en: "Chicken curries" },
  { id: "lamb", fr: "Currys agneau", en: "Lamb curries" },
  { id: "veg", fr: "Végétarien", en: "Vegetarian" },
  { id: "biryani", fr: "Biryanis", en: "Biryanis" },
  { id: "breads", fr: "Pains & riz", en: "Breads & rice" },
  { id: "desserts", fr: "Desserts", en: "Desserts" },
  { id: "drinks", fr: "Boissons", en: "Drinks" },
];

export const MENU: MenuItem[] = [
  { id: "samosas", category: "starters", nameFr: "Samosas légumes", nameEn: "Vegetable samosas", descFr: "Triangles croustillants, pomme de terre, petit pois.", descEn: "Crisp pastry, potato, peas.", priceCents: 590, diets: ["veg"] },
  { id: "onion-bhaji", category: "starters", nameFr: "Onion bhajia", nameEn: "Onion bhajis", descFr: "Beignets d'oignons à la farine de pois chiches.", descEn: "Chickpea-flour onion fritters.", priceCents: 550, diets: ["veg", "vegan"] },
  { id: "tikka", category: "tandoor", nameFr: "Chicken tikka", nameEn: "Chicken tikka", descFr: "Mariné yaourt et épices, grillé au tandoor.", descEn: "Yoghurt-spice marinade, tandoor grilled.", priceCents: 1290, diets: [] },
  { id: "tandoori", category: "tandoor", nameFr: "Poulet tandoori", nameEn: "Tandoori chicken", descFr: "Cuisse marinée, four de terre.", descEn: "Marinated leg, clay oven.", priceCents: 1390, diets: [] },
  { id: "butter-chicken", category: "chicken", nameFr: "Butter chicken", nameEn: "Butter chicken", descFr: "Sauce tomate beurrée, crème, garam masala.", descEn: "Buttery tomato cream sauce, garam masala.", priceCents: 1490, diets: ["chef"] },
  { id: "tikka-masala", category: "chicken", nameFr: "Chicken tikka masala", nameEn: "Chicken tikka masala", descFr: "Tikka en sauce tomate épicée.", descEn: "Tikka in spiced tomato sauce.", priceCents: 1490, diets: [] },
  { id: "rogan-josh", category: "lamb", nameFr: "Agneau rogan josh", nameEn: "Lamb rogan josh", descFr: "Mijoté kashmiri, cardamome.", descEn: "Kashmiri braise, cardamom.", priceCents: 1690, diets: [] },
  { id: "palak-paneer", category: "veg", nameFr: "Palak paneer", nameEn: "Palak paneer", descFr: "Épinards, fromage indien, ail.", descEn: "Spinach, Indian cheese, garlic.", priceCents: 1350, diets: ["veg"] },
  { id: "biryani-chicken", category: "biryani", nameFr: "Biryani poulet", nameEn: "Chicken biryani", descFr: "Riz basmati, safran, poulet.", descEn: "Basmati, saffron, chicken.", priceCents: 1590, diets: ["chef"] },
  { id: "naan", category: "breads", nameFr: "Naan nature", nameEn: "Plain naan", descFr: "Pain levé au tandoor.", descEn: "Leavened tandoor bread.", priceCents: 290, diets: ["veg"] },
  { id: "naan-garlic", category: "breads", nameFr: "Naan à l'ail", nameEn: "Garlic naan", descFr: "Beurre d'ail, coriandre.", descEn: "Garlic butter, coriander.", priceCents: 390, diets: ["veg"] },
  { id: "gulab", category: "desserts", nameFr: "Gulab jamun", nameEn: "Gulab jamun", descFr: "Boules de lait au sirop de rose.", descEn: "Milk dumplings in rose syrup.", priceCents: 550, diets: ["veg"] },
  { id: "dal", category: "veg", nameFr: "Dal tadka", nameEn: "Dal tadka", descFr: "Lentilles jaunes, cumin, beurre clarifié.", descEn: "Yellow lentils, cumin, ghee.", priceCents: 1190, diets: ["veg", "vegan"] },
  { id: "mango-chutney", category: "starters", nameFr: "Chutney mangue", nameEn: "Mango chutney", descFr: "Accompagnement sucré-épicé maison.", descEn: "House sweet-spiced accompaniment.", priceCents: 350, diets: ["veg", "vegan"] },
  { id: "lassi", category: "drinks", nameFr: "Lassi mangue", nameEn: "Mango lassi", descFr: "Yaourt, mangue, cardamome.", descEn: "Yoghurt, mango, cardamom.", priceCents: 450, diets: ["veg"] },
];

export const MENU_BY_ID = Object.fromEntries(MENU.map((m) => [m.id, m]));

export function formatEuro(cents: number, locale: "fr" | "en") {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
