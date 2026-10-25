import type {MetaDescriptor} from 'react-router';
import {BRAND} from '~/config/brand';

/**
 * One place that turns a page's title/description/image into the full set of
 * meta tags: <title>, description, canonical, Open Graph and Twitter card.
 * Every route's `meta` export goes through here so no page ships without them.
 */
export function seoMeta({
  title,
  description,
  path,
  image,
  type = 'website',
  origin,
  noindex = false,
}: {
  /** Page title; the brand name is appended. Omit for the brand name alone. */
  title?: string | null;
  description?: string | null;
  /** Path of the canonical URL, e.g. `/products/tee`. */
  path?: string;
  /** Absolute image URL (Shopify CDN) or a path under /public. */
  image?: string | null;
  type?: 'website' | 'product' | 'article';
  /** Request origin, from the root loader — used when BRAND.siteUrl is empty. */
  origin?: string;
  noindex?: boolean;
}): MetaDescriptor[] {
  const fullTitle = title ? `${title} | ${BRAND.name}` : BRAND.name;
  const desc = truncate(description || BRAND.description, 160);
  const img = absoluteUrl(image || BRAND.ogImage, origin);
  const url = path !== undefined ? absoluteUrl(path, origin) : undefined;

  const tags: MetaDescriptor[] = [
    {title: fullTitle},
    {name: 'description', content: desc},
    {property: 'og:site_name', content: BRAND.name},
    {property: 'og:type', content: type},
    {property: 'og:title', content: fullTitle},
    {property: 'og:description', content: desc},
    {property: 'og:image', content: img},
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: fullTitle},
    {name: 'twitter:description', content: desc},
    {name: 'twitter:image', content: img},
  ];
  if (url) {
    tags.push({tagName: 'link', rel: 'canonical', href: url});
    tags.push({property: 'og:url', content: url});
  }
  if (noindex) tags.push({name: 'robots', content: 'noindex'});
  return tags;
}

/** Makes a path absolute against BRAND.siteUrl, or the request origin. */
export function absoluteUrl(pathOrUrl: string, origin?: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  const base = BRAND.siteUrl || origin || '';
  return `${base}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

/** The request origin the root loader exposes, for route `meta` functions. */
export function originFromMatches(
  matches: ReadonlyArray<{id: string; data?: unknown} | undefined>,
): string | undefined {
  const root = matches.find((match) => match?.id === 'root')?.data as
    {origin?: string} | undefined;
  return root?.origin;
}

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}
