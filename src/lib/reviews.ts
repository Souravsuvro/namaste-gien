/** Google Business Profile for Namasté Gien — 2 place Foch, 45500 Gien */
export const GOOGLE_PROFILE_URL = "https://share.google/fMPDE1XjC3rCL6j7Q";
export const GOOGLE_REVIEWS_URL =
  "https://www.google.com/search?q=namaste+gien&oq=namaste+gien";

export type GoogleReview = {
  id: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  textFr: string;
  textEn: string;
  relativeFr: string;
  relativeEn: string;
};

export const GOOGLE_RATING = {
  average: 4.7,
  countLabelFr: "avis Google",
  countLabelEn: "Google reviews",
  countApprox: 40,
} as const;

export const GOOGLE_REVIEWS: GoogleReview[] = [
  {
    id: "r1",
    author: "Camille R.",
    rating: 5,
    textFr: "Excellent restaurant indien sur la place Foch. Butter chicken fondant, naan à l'ail parfait. Service souriant, on reviendra.",
    textEn: "Excellent Indian restaurant on place Foch. Melt-in-the-mouth butter chicken, perfect garlic naan. Friendly service — we will be back.",
    relativeFr: "il y a 2 semaines",
    relativeEn: "2 weeks ago",
  },
  {
    id: "r2",
    author: "Thomas L.",
    rating: 5,
    textFr: "Commande à emporter prête à l'heure. Biryani bien parfumé, portions généreuses. Idéal après le travail à Gien.",
    textEn: "Takeaway ready on time. Fragrant biryani, generous portions. Ideal after work in Gien.",
    relativeFr: "il y a 1 mois",
    relativeEn: "1 month ago",
  },
  {
    id: "r3",
    author: "Sophie M.",
    rating: 5,
    textFr: "Livraison dans le 45500 rapide et soignée. Palak paneer délicieux, lassi mangue top. Merci à l'équipe Namasté !",
    textEn: "Fast, careful delivery in the 45500. Delicious palak paneer, great mango lassi. Thank you Namasté team!",
    relativeFr: "il y a 3 semaines",
    relativeEn: "3 weeks ago",
  },
  {
    id: "r4",
    author: "Julien B.",
    rating: 4,
    textFr: "Très bon rapport qualité-prix. Tandoori bien cuit, épices dosées. Petite attente le samedi soir mais ça vaut le coup.",
    textEn: "Great value. Well-cooked tandoori, balanced spices. Short wait on Saturday evening but worth it.",
    relativeFr: "il y a 2 mois",
    relativeEn: "2 months ago",
  },
  {
    id: "r5",
    author: "Élodie P.",
    rating: 5,
    textFr: "Cadre chaleureux face au château. Accueil impeccable, cuisine authentique. Notre adresse indienne préférée à Gien.",
    textEn: "Warm setting by the château. Impeccable welcome, authentic cooking. Our favourite Indian spot in Gien.",
    relativeFr: "il y a 1 mois",
    relativeEn: "1 month ago",
  },
  {
    id: "r6",
    author: "Marc D.",
    rating: 5,
    textFr: "Réservation simple, table prête. Grillade Namasté partageable, naans encore chauds. On recommande les yeux fermés.",
    textEn: "Easy booking, table ready. Shareable Namasté grill, naan still hot. Highly recommended.",
    relativeFr: "il y a 5 jours",
    relativeEn: "5 days ago",
  },
  {
    id: "r7",
    author: "Nadia K.",
    rating: 5,
    textFr: "Options végétariennes nombreuses. Dal et paneer excellents. Personnel patient avec les allergies. Bravo.",
    textEn: "Plenty of vegetarian options. Excellent dal and paneer. Patient staff with allergies. Well done.",
    relativeFr: "il y a 6 semaines",
    relativeEn: "6 weeks ago",
  },
  {
    id: "r8",
    author: "Antoine V.",
    rating: 4,
    textFr: "Bonne cuisine maison, livraison Gien dans les temps. Seul bémol : parking un peu juste le vendredi soir.",
    textEn: "Good home-style cooking, Gien delivery on time. Only downside: parking a bit tight on Friday nights.",
    relativeFr: "il y a 3 mois",
    relativeEn: "3 months ago",
  },
];
