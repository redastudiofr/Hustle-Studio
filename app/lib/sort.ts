/**
 * Sorting for product listings, read from `?sort=` so a sorted page can be
 * shared and survives a reload. Shopify does the sorting.
 */
export const SORT_OPTIONS = [
  'featured',
  'newest',
  'best-selling',
  'price-asc',
  'price-desc',
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export function sortFromRequest(request: Request): SortOption {
  const value = new URL(request.url).searchParams.get('sort');
  return (SORT_OPTIONS as readonly string[]).includes(value ?? '')
    ? (value as SortOption)
    : 'featured';
}

/** Sort keys for `collection.products` (ProductCollectionSortKeys). */
export function collectionSortKey(sort: SortOption) {
  switch (sort) {
    case 'newest':
      return {sortKey: 'CREATED' as const, reverse: true};
    case 'best-selling':
      return {sortKey: 'BEST_SELLING' as const, reverse: false};
    case 'price-asc':
      return {sortKey: 'PRICE' as const, reverse: false};
    case 'price-desc':
      return {sortKey: 'PRICE' as const, reverse: true};
    default:
      return {sortKey: 'COLLECTION_DEFAULT' as const, reverse: false};
  }
}

/** Sort keys for the store-wide `products` query (ProductSortKeys). */
export function catalogSortKey(sort: SortOption) {
  switch (sort) {
    case 'best-selling':
      return {sortKey: 'BEST_SELLING' as const, reverse: false};
    case 'price-asc':
      return {sortKey: 'PRICE' as const, reverse: false};
    case 'price-desc':
      return {sortKey: 'PRICE' as const, reverse: true};
    default:
      return {sortKey: 'CREATED_AT' as const, reverse: true};
  }
}
