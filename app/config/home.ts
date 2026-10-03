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
      /** Omit for no visible title (the logo stays in the header only). */
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
  | {
      /** The pack offer (app/config/promotions.ts). Hidden while it is off. */
      type: 'pack';
    }
  | {
      /** Customer reviews (app/data/reviews.ts). Hidden while there are none. */
      type: 'reviews';
    }
  | {
      /**
       * "Family": a wall of photos in two rows that scroll continuously in
       * opposite directions. Uses `photos` when set; while the list is empty,
       * the shop's own product photos (from Shopify) stand in.
       */
      type: 'family';
      title: Localized;
      text?: Localized;
      photos: FamilyPhoto[];
    }
  | {
      /** Large photo + the brand story, side by side on desktop. */
      type: 'about';
      eyebrow?: Localized;
      title: Localized;
      paragraphs: Localized[];
      image: HomeImage;
      cta?: HomeLink;
    }
  | {type: 'newsletter'};

/**
 * A photo of the "family" wall. Put the file in public/brand/family/ and
 * only use photos you own or have the wearer's permission to publish.
 */
export type FamilyPhoto = {src: string; alt: Localized};

export const HOME_SECTIONS: HomeSection[] = [
  {
    type: 'hero',
    image: {
      desktop: '/brand/hero-desktop.webp',
      mobile: '/brand/hero-mobile-desert.webp',
      alt: 'Hustle Studio streetwear, worn outdoors',
    },
    eyebrow: 'New collection',
    title: 'Built on ambition.',
    text: 'Streetwear for the ones still building.',
    cta: {label: 'Shop now', to: '/collections/all'},
    secondaryCta: {label: 'Collections', to: '/collections'},
  },
  {
    type: 'collections',
    title: 'Collections',
  },
  {
    type: 'products',
    title: 'Our products',
    fallbackSort: 'newest',
    limit: 12,
    layout: 'grid',
    link: {label: 'View all', to: '/collections/all'},
  },
  {
    type: 'family',
    title: 'Family',
    text: 'Worn by the ones still building.',
    // Your photos go here, e.g. {src: '/brand/family/01.webp', alt: '…'}.
    photos: [],
  },
  {
    type: 'about',
    eyebrow: 'About us',
    title: 'Hustle Studio.',
    paragraphs: [
      'Hustle is not a slogan. It is the hours nobody sees — the early mornings, the late nights, the work you put in long before anyone is watching.',
      'Hustle Studio is made for the ones still building: the first idea sketched on a phone, the hundredth draft, the session nobody asked you to do. People who measure progress in effort, not in noise.',
      'Every piece is designed as a uniform for that work — clean lines, considered details, nothing that does not need to be there. Build something. Wear it while you do.',
    ],
    image: {
      desktop: '/brand/hero-mobile.webp',
      alt: 'Hustle Studio grey zip hoodie and joggers, worn beside a black car and a horse',
    },
    cta: {label: 'Discover the studio', to: '/about'},
  },
];
