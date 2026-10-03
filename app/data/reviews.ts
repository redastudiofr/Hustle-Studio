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
 * Star ratings on product cards and in the buy box do NOT come from here:
 * they come from Shopify's review metafields, written by a review app
 * (Shopify Product Reviews, Judge.me…) — see app/lib/rating.ts.
 */
export interface Review {
  /** Stable identifier, used as the React key. */
  id: string;
  /** Name as the customer agreed to have it shown (e.g. "Lucas M."). */
  name: string;
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
}

const REVIEWS: Review[] = [
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
