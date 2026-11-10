import {
  ENGLISH_COLLECTION_TITLES,
  ENGLISH_DESCRIPTIONS,
  ENGLISH_TITLES,
} from '~/data/productEnglish';

/**
 * Puts the English texts of app/data/productEnglish.ts into every Shopify
 * answer: product descriptions and titles, collection titles — wherever
 * they appear (grids, product page, cart, search). Products and collections
 * are recognised by their handle; anything not listed is left untouched.
 */
export function englishCopy<T>(value: T): T {
  visit(value, new WeakSet());
  return value;
}

function visit(node: unknown, seen: WeakSet<object>) {
  if (!node || typeof node !== 'object') return;
  if (seen.has(node)) return;
  seen.add(node);

  if (Array.isArray(node)) {
    for (const item of node) visit(item, seen);
    return;
  }

  const record = node as Record<string, unknown>;
  const handle = typeof record.handle === 'string' ? record.handle : null;
  if (handle) {
    const html = ENGLISH_DESCRIPTIONS[handle];
    if (html) {
      if ('descriptionHtml' in record) record.descriptionHtml = html;
      if ('description' in record) record.description = plainText(html);
    }
    const title = ENGLISH_TITLES[handle] ?? ENGLISH_COLLECTION_TITLES[handle];
    if (title && typeof record.title === 'string') record.title = title;
  }

  for (const key of Object.keys(record)) visit(record[key], seen);
}

/** The description as plain text, the way Shopify's `description` reads. */
function plainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|li|ul)>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}
