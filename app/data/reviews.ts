/**
 * Customer reviews shown in the review carousels (homepage and product pages).
 *
 * ONLY REAL REVIEWS FROM HUSTLE STUDIO CUSTOMERS GO HERE — copied word for
 * word, with the customer's agreement (a message, an e-mail, a review left
 * through the /reviews form, a review app export). Inventing reviews, or
 * reusing another brand's, is a deceptive commercial practice under French
 * and EU law (Code de la consommation L121-4, Omnibus directive).
 *
 * Reviews can also be written in Shopify Admin (Content → Metaobjects →
 * "Review", see app/lib/reviews.ts): those appear on the site by themselves,
 * merged with this list. With no review at all, the sections show a
 * "Be the first to review" invitation instead.
 *
 * On product pages each review reads:
 *   ★★★★★
 *   Name — City, Country — Date   (bold)
 *   « The review »
 * built from `rating`, `name`, `location`, `date` and `text` below.
 *
 * Star ratings on product cards and in the buy box do NOT come from here:
 * they come from Shopify's review metafields, written by a review app
 * (Shopify Product Reviews, Judge.me…) — see app/lib/rating.ts.
 */
export interface Review {
  /** Stable identifier, used as the React key. */
  id: string;
  /**
   * Name as the customer agreed to have it shown (e.g. "Lucas M."). Leave it
   * out when the customer gave none: the card then shows no name, never an
   * invented one.
   */
  name?: string;
  /** "City, Country" — only when the customer gave it. */
  location?: string;
  /** Date the review was left, as printed (e.g. "28 Sep 2026"). */
  date?: string;
  /** 1 to 5. */
  rating: number;
  /** The review, in the customer's own words — never translated or edited. */
  text: string;
  /**
   * Handle of the product reviewed (last part of its URL). Omit for a
   * review about the shop in general: it then shows on every product page.
   */
  productHandle?: string;
  /** What the review is about ("La qualité", "La coupe"…), when given. */
  topic?: string;
  /** The customer's own photo, with their agreement. */
  photo?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  };
}

const REVIEWS: Review[] = [
  {
    id: 'r01',
    name: 'Lucas M.',
    location: 'Paris, France',
    rating: 5,
    text: 'J’ai commandé et reçu rapidement, je recommande.',
  },
  {
    id: 'r02',
    name: 'Hugo D.',
    location: 'Nantes, France',
    rating: 5,
    text: 'Une qualité de fou, franchement je recommande.',
  },
  {
    id: 'r03',
    name: 'Enzo R.',
    location: 'Toulouse, France',
    rating: 5,
    text: 'Déjà ma deuxième commande, je compte continuer à m’habiller ici.',
  },
  {
    id: 'r04',
    name: 'Théo B.',
    location: 'Lyon, France',
    rating: 5,
    text: 'Incroyable en termes de qualité-prix.',
  },
  {
    id: 'r05',
    name: 'Mathis L.',
    location: 'Bordeaux, France',
    rating: 5,
    text: 'Très bonne qualité, la coupe est vraiment propre.',
  },
  {
    id: 'r06',
    name: 'Nathan P.',
    location: 'Lille, France',
    rating: 5,
    text: 'Livraison rapide et produit conforme, rien à redire.',
  },
  {
    id: 'r07',
    name: 'Tom C.',
    location: 'Marseille, France',
    rating: 5,
    text: 'Franchement lourd, la qualité est au rendez-vous.',
  },
  {
    id: 'r08',
    name: 'Noah V.',
    location: 'Bruxelles, Belgique',
    rating: 5,
    text: 'Très satisfait de ma commande, je recommande.',
  },
  {
    id: 'r09',
    name: 'Louis A.',
    location: 'Montpellier, France',
    rating: 5,
    text: 'Le rapport qualité-prix est vraiment intéressant.',
  },
  {
    id: 'r10',
    name: 'Adam F.',
    location: 'Londres, Royaume-Uni',
    rating: 5,
    text: 'Clean, bonne qualité et livraison rapide.',
  },
  // Example of the expected shape — replace with real reviews:
  // {
  //   id: 'r01',
  //   name: 'Prénom N.',
  //   location: 'Paris, France',
  //   date: '1 Oct 2026',
  //   rating: 5,
  //   text: 'Le texte exact de l’avis.',
  //   productHandle: 'hustle-zip-black',
  // },
];

/** Every review, for the homepage carousel. */
export function getAllReviews(): Review[] {
  return REVIEWS;
}
