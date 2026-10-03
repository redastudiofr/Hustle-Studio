import type {Storefront} from '@shopify/hydrogen';
import {getAllReviews, type Review} from '~/data/reviews';

/**
 * Real customer reviews, from two places, merged:
 *
 * 1. Shopify Admin → Content → Metaobjects → definition "Review"
 *    (type `review`, Storefront access ON), one entry per review, status
 *    Active. Fields:
 *      name      Single line text (required) — as the customer agreed, e.g. "Lucas M."
 *      text      Multi-line text (required)  — the review, word for word
 *      rating    Rating 1–5 or Integer       — defaults to 5 if left empty
 *      date      Date                        — when it was left
 *      location  Single line text            — "Paris, France", only if given
 *      product   Product reference           — empty = a review of the shop
 *    A new entry shows on the site by itself, no code change.
 * 2. app/data/reviews.ts, for reviews collected another way.
 *
 * Nothing here ever fills a gap with invented data: a review with no
 * location or date simply shows none.
 */
export type ShopReview = Review;

const REVIEWS_QUERY = `#graphql
  query ShopReviews(
    $first: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    metaobjects(type: "review", first: $first, sortKey: "updated_at", reverse: true) {
      nodes {
        id
        name: field(key: "name") {
          value
        }
        text: field(key: "text") {
          value
        }
        rating: field(key: "rating") {
          value
        }
        date: field(key: "date") {
          value
        }
        location: field(key: "location") {
          value
        }
        product: field(key: "product") {
          reference {
            ... on Product {
              handle
            }
          }
        }
      }
    }
  }
` as const;

/** "5", or Shopify's rating JSON {"value":"4.5","scale_max":"5"} → 1–5. */
function parseRating(value?: string | null): number {
  if (!value) return 5;
  let raw: unknown = value;
  try {
    const json = JSON.parse(value) as
      {value?: string; scale_max?: string} | number;
    if (typeof json === 'number') raw = json;
    else if (json && typeof json === 'object') {
      const max = Number(json.scale_max ?? 5) || 5;
      raw = (Number(json.value) / max) * 5;
    }
  } catch {
    raw = Number(value);
  }
  const rating = Number(raw);
  return Number.isFinite(rating) ? Math.max(1, Math.min(5, rating)) : 5;
}

/** "2026-09-28" → "28 Sep 2026"; anything unreadable is left out. */
function formatDate(value?: string | null): string | undefined {
  if (!value) return undefined;
  const date = new Date(`${value.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** Every real review (Shopify first, newest first, then the local list). */
export async function loadReviews(storefront: Storefront): Promise<Review[]> {
  let fromShopify: Review[] = [];
  try {
    const {metaobjects} = await storefront.query(REVIEWS_QUERY, {
      variables: {first: 100},
      cache: storefront.CacheShort(),
    });
    fromShopify = (metaobjects?.nodes ?? []).flatMap((node) => {
      const name = node.name?.value?.trim();
      const text = node.text?.value?.trim();
      if (!name || !text) return [];
      const handle =
        node.product?.reference && 'handle' in node.product.reference
          ? node.product.reference.handle
          : undefined;
      return [
        {
          id: node.id,
          name,
          text,
          rating: parseRating(node.rating?.value),
          date: formatDate(node.date?.value),
          location: node.location?.value?.trim() || undefined,
          productHandle: handle,
        },
      ];
    });
  } catch (error) {
    // No "Review" definition yet, or Shopify unreachable: local reviews only.
    console.error(error);
  }
  return [...fromShopify, ...getAllReviews()];
}

/** One product's reviews first, then those about the shop in general. */
export function reviewsForProduct(reviews: Review[], handle: string): Review[] {
  return [
    ...reviews.filter((review) => review.productHandle === handle),
    ...reviews.filter((review) => !review.productHandle),
  ];
}
