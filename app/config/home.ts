/**
 * The homepage, section by section, top to bottom.
 *
 * Reorder, remove or duplicate entries to change the page — no component code
 * to touch. Every product shown comes from Shopify:
 *
 * - `collection` is a collection handle from Shopify Admin → Products →
 *   Collections (the last part of the collection's URL, e.g. "new-arrivals").
 * - When that collection does not exist (yet), `fallbackSort` fills the
 *   section with real products sorted by Shopify instead; with no fallback
 *   the section is simply not shown.
 *
 * Texts accept either one string, or `{en, fr}` for the two site languages.
 *
 * Images are optional. Drop your photos in `public/brand/` and point
 * `image.desktop` / `image.mobile` at them (e.g. '/brand/hero-desktop.jpg').
 * Without an image, the hero and editorial blocks use a typographic layout.
 */
import type {Localized} from '~/lib/i18n/localized';

export type HomeImage = {
  /** Landscape crop, shown from tablet width upwards. */
  desktop: string;
  /** Portrait crop for phones. Falls back to `desktop`. */
  mobile?: string;
  alt: Localized;
};

export type HomeLink = {label: Localized; to: string};

export type ProductSort = 'newest' | 'best-selling';

export type HomeSection =
  | {
      type: 'hero';
      eyebrow?: Localized;
      /** Omit to show the brand's wordmark instead of a text title. */
      title?: Localized;
      text?: Localized;
      image?: HomeImage;
      cta?: HomeLink;
      secondaryCta?: HomeLink;
    }
  | {
      /** A row or grid of product cards. */
      type: 'products';
      title: Localized;
      collection?: string;
      fallbackSort?: ProductSort;
      limit?: number;
      layout?: 'rail' | 'grid';
      /** "view all" link; defaults to the collection's own page. */
      link?: HomeLink;
    }
  | {
      /** A large collection banner followed by a rail of its products. */
      type: 'feature';
      collection: string;
      /** Defaults to the collection's own image in Shopify. */
      image?: HomeImage;
      limit?: number;
    }
  | {
      /** Tiles of every Shopify collection, each with its Shopify image. */
      type: 'collections';
      title: Localized;
    }
  | {
      /** Photo + text, or text alone. */
      type: 'editorial';
      eyebrow?: Localized;
      title: Localized;
      text: Localized;
      image?: HomeImage;
      cta?: HomeLink;
    }
  | {type: 'newsletter'};

export const HOME_SECTIONS: HomeSection[] = [
  {
    type: 'hero',
    image: {
      desktop: '/brand/hero-desktop.webp',
      mobile: '/brand/hero-mobile.webp',
      alt: {
        en: 'Hustle Studio grey zip hoodie and joggers, worn beside a black sports car and a horse',
        fr: 'Zip et jogging gris Hustle Studio, portés devant une voiture de sport noire et un cheval',
      },
    },
    eyebrow: {en: 'new collection', fr: 'nouvelle collection'},
    text: {
      en: 'minimal streetwear, made to be worn every day.',
      fr: 'du streetwear minimaliste, pensé pour tous les jours.',
    },
    cta: {label: {en: 'shop now', fr: 'découvrir'}, to: '/collections/all'},
    secondaryCta: {
      label: {en: 'collections', fr: 'collections'},
      to: '/collections',
    },
  },
  {
    type: 'products',
    title: {en: 'new arrivals', fr: 'nouveautés'},
    collection: 'new-arrivals',
    fallbackSort: 'newest',
    limit: 12,
    layout: 'rail',
  },
  {
    type: 'collections',
    title: {en: 'shop by category', fr: 'nos catégories'},
  },
  {
    type: 'products',
    title: {en: 'best sellers', fr: 'meilleures ventes'},
    collection: 'best-sellers',
    fallbackSort: 'best-selling',
    limit: 12,
    layout: 'rail',
  },
  {
    type: 'editorial',
    eyebrow: {en: 'the studio', fr: 'le studio'},
    title: {en: 'built for the hustle.', fr: 'pensé pour ceux qui avancent.'},
    text: {
      en: 'clean cuts, heavy fabrics and quiet details. pieces designed to last longer than a season.',
      fr: 'des coupes nettes, des matières épaisses et des détails discrets. des pièces pensées pour durer plus qu’une saison.',
    },
    cta: {label: {en: 'our story', fr: 'notre histoire'}, to: '/about'},
  },
  {
    type: 'products',
    title: {en: 'all products', fr: 'tous les produits'},
    fallbackSort: 'newest',
    limit: 24,
    layout: 'grid',
    link: {label: {en: 'view all', fr: 'tout voir'}, to: '/collections/all'},
  },
  {type: 'newsletter'},
];
