import type {TranslationKey} from './i18n/dictionary';
import {NAVIGATION} from '~/config/navigation';
import {normalizeName} from '~/lib/collections';

/**
 * Turns the flat list of Shopify collections into the menu: one "shop" group,
 * plus a "drops" group when collection titles match NAVIGATION.dropPattern.
 * Data-driven on purpose — a collection created in Shopify lands in the menu
 * without a code change. Order and grouping are set in app/config/navigation.ts.
 */

export type NavCollection = {
  id: string;
  title: string;
  handle: string;
};

export type NavGroup = {
  /** Stable key for the accordion / dropdown state. */
  id: string;
  /** Dictionary key — the label itself is resolved at render time. */
  labelKey: TranslationKey;
  collections: NavCollection[];
};

const ORDER = NAVIGATION.collectionOrder.map(normalizeName);

function rank(collection: NavCollection): number {
  const byTitle = ORDER.indexOf(normalizeName(collection.title));
  const index =
    byTitle !== -1 ? byTitle : ORDER.indexOf(normalizeName(collection.handle));
  // Unlisted collections sort after every listed one, keeping their own order.
  return index === -1 ? ORDER.length : index;
}

function sorted(collections: NavCollection[]): NavCollection[] {
  return collections
    .map((collection, index) => ({collection, index}))
    .sort(
      (a, b) => rank(a.collection) - rank(b.collection) || a.index - b.index,
    )
    .map(({collection}) => collection);
}

function isDrop(collection: NavCollection): boolean {
  return NAVIGATION.dropPattern?.test(collection.title) ?? false;
}

/** Empty groups are dropped, so a store with no drops shows no "drops" heading. */
export function buildNavGroups(collections: NavCollection[]): NavGroup[] {
  return [
    {
      id: 'shop',
      labelKey: 'nav.shop' as const,
      collections: sorted(collections.filter((c) => !isDrop(c))),
    },
    {
      id: 'drops',
      labelKey: 'nav.drops' as const,
      collections: sorted(collections.filter(isDrop)),
    },
  ].filter((group) => group.collections.length > 0);
}

export const NAV_SERVICE_LINKS = NAVIGATION.serviceLinks;
