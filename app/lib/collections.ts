import {NAVIGATION} from '~/config/navigation';

/** "T-Shirts" / "t-shirts" / "tshirts" → "tshirts". */
export function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

const HIDDEN = new Set(NAVIGATION.hiddenCollections.map(normalizeName));

/**
 * Drops the collections that are not real categories: the "Home page"
 * collection Shopify creates on every store (handle `frontpage`), plus
 * anything listed in NAVIGATION.hiddenCollections. The header, the homepage
 * and /collections all filter through here, so the rule lives once.
 */
export function withoutAutoCollections<
  T extends {handle: string; title: string},
>(collections: T[]): T[] {
  return collections.filter(
    (collection) =>
      !HIDDEN.has(normalizeName(collection.handle)) &&
      !HIDDEN.has(normalizeName(collection.title)),
  );
}
