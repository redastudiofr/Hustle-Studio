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
  /**
   * [width, height] of each file. When set, a text-free hero takes the
   * photo's own ratio instead of filling the screen: the image is shown
   * whole — no crop, no forced enlargement.
   */
  desktopSize?: [number, number];
  mobileSize?: [number, number];
  alt: Localized;
};

export type HomeLink = {label: Localized; to: string};

export type ProductSort = 'newest' | 'best-selling';

/** Texts of the countdown to the next drop (date: app/config/launch.ts). */
export type CountdownCopy = {
  label: Localized;
  /** Shown instead of the figures once the launch time is reached. */
  endedLabel: Localized;
  units: {
    days: Localized;
    hours: Localized;
    minutes: Localized;
    seconds: Localized;
  };
};

export type HomeSection = (
  | {
      type: 'hero';
      eyebrow?: Localized;
      /** Omit for no visible title (the logo stays in the header only). */
      title?: Localized;
      text?: Localized;
      image?: HomeImage;
      cta?: HomeLink;
      secondaryCta?: HomeLink;
      /** Countdown to LAUNCH.date, between the text and the button. */
      countdown?: CountdownCopy;
    }
  | {
      /** A row or grid of product cards. */
      type: 'products';
      title: Localized;
      collection?: string;
      fallbackSort?: ProductSort;
      /** How many products; 'all' shows every product Shopify has. */
      limit?: number | 'all';
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
      /**
       * Show only these collections, in this order (title or handle; case,
       * spaces and hyphens ignored: "T-shirt" = "tshirt"). The others are
       * only hidden from this slider — still in Shopify, still on
       * /collections. Remove the list to show every collection again.
       */
      only?: string[];
    }
  | {
      /**
       * Tiles of the brand collections (handle "marque-…", see
       * NAVIGATION.brandHandlePrefix). Hidden while no brand exists.
       */
      type: 'brands';
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
      /**
       * Real customer reviews (Shopify "Review" metaobjects + app/data/
       * reviews.ts, see app/lib/reviews.ts). None yet: "Be the first to review".
       */
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
  | {
      /** "Need help?": shipping, returns, terms, support (HelpFaq). */
      type: 'faq';
    }
  | {type: 'newsletter'}
  | {
      /**
       * "Be first": the drop waitlist (e-mail + phone). Sign-ups are saved
       * in Shopify and e-mailed to LAUNCH.notifyEmail (app/config/launch.ts).
       */
      type: 'waitlist';
      title: Localized;
      text: Localized;
      submitLabel: Localized;
    }
) & {
  /**
   * true: the section is not rendered, nor its data loaded — its code and
   * content stay here, ready to come back by removing the flag.
   */
  hidden?: boolean;
};

/**
 * A photo of the "family" wall. Put the file in public/brand/family/ and
 * only use photos you own or have the wearer's permission to publish.
 */
export type FamilyPhoto = {src: string; alt: Localized};

/** The community photos (public/brand/family/), in display order. */
const FAMILY_PHOTOS: FamilyPhoto[] = [
  {
    src: '/brand/family/01.webp',
    alt: 'chloeestr in a black CY tracksuit, Paris',
  },
  {src: '/brand/family/03.webp', alt: 'Stacyhrf in a grey CY set, New York'},
  {
    src: '/brand/family/04.webp',
    alt: 'muruafit_ in a black CY zip and jogging, Toulouse',
  },
  {
    src: '/brand/family/05.webp',
    alt: 'paauuul_ in black CY with two dogs, Toulouse',
  },
  {
    src: '/brand/family/06.webp',
    alt: 'Rach.K_ in a black CY zip and jogging, New York',
  },
  {
    src: '/brand/family/07.webp',
    alt: 'Alan__ot in a black CY tracksuit, London',
  },
  {
    src: '/brand/family/08.webp',
    alt: 'muruafit_ in CY by a graffiti wall, Toulouse',
  },
];

export const HOME_SECTIONS: HomeSection[] = [
  {
    type: 'hero',
    image: {
      // Two different photos, one per format — not one photo cropped twice.
      desktop: '/brand/hero-desktop-shoot.webp',
      mobile: '/brand/hero-mobile-shoot.webp',
      // Native pixel sizes: each format is shown whole, at its own ratio.
      desktopSize: [2000, 1002],
      mobileSize: [1072, 2000],
      alt: {
        en: 'White long-sleeve t-shirt on a studio monitor, during a photo shoot',
        fr: 'T-shirt manches longues blanc sur un écran de studio, pendant un shooting photo',
      },
    },
    // Purely visual: no title, text, countdown or button. To bring the
    // drop countdown back, add `countdown` (see CountdownCopy) and a `cta`.
  },
  {
    type: 'waitlist',
    title: 'BE FIRST.',
    text: {
      en: '30 pieces. One drop. Sign up to be among the first to hear when Hustle Studio launches.',
      fr: '30 pièces. Un seul drop. Inscris-toi pour être parmi les premiers informés du lancement de Hustle Studio.',
    },
    submitLabel: {
      en: 'JOIN THE WAITLIST',
      fr: 'REJOINDRE LA LISTE D’ATTENTE',
    },
  },
  {
    type: 'collections',
    title: {en: 'Shop by category', fr: 'Par catégorie'},
    // For now: Longsleeve and T-shirt only. Remove `only` to show them all.
    only: ['longsleeve', 'tshirt'],
  },
  {
    type: 'products',
    title: {en: 'New in', fr: 'Nouveautés'},
    fallbackSort: 'newest',
    // Every product, not a first page: nothing in the catalogue is hidden.
    limit: 'all',
    layout: 'grid',
    link: {label: {en: 'View all', fr: 'Tout voir'}, to: '/collections/all'},
  },
  {
    type: 'brands',
    title: {en: 'Our labels', fr: 'Nos marques'},
  },
  {
    // Hidden for now (not rendered, no data loaded). Remove `hidden` to
    // bring the community wall back exactly as it was.
    hidden: true,
    type: 'family',
    title: 'Community',
    text: {
      en: 'Our selection, worn on the street.',
      fr: 'Notre sélection, portée dans la rue.',
    },
    photos: FAMILY_PHOTOS,
  },
  {
    type: 'about',
    eyebrow: {en: 'Our story — Nantes', fr: 'Notre histoire — Nantes'},
    title: 'Hustle Studio.',
    paragraphs: [
      {
        en: 'Hustle Studio is an independent brand, born in Nantes. No big group behind it, no shortcuts: just an idea, and the work it takes to make it real.',
        fr: 'Hustle Studio est une marque indépendante, née à Nantes. Pas de grand groupe derrière, pas de raccourci : juste une idée, et le travail pour la faire exister.',
      },
      {
        en: 'We make it for the ones who keep moving. Those building their own path, looking further than next season, and not waiting for anyone to open the door.',
        fr: 'On la fait pour ceux qui avancent. Ceux qui construisent leur propre chemin, qui voient plus loin que la prochaine saison et qui n’attendent pas qu’on leur ouvre la porte.',
      },
      {
        en: 'Our streetwear is minimal by choice. Clean cuts, a strong identity, details you notice up close. Few pieces, each one made to last.',
        fr: 'Notre streetwear est minimaliste par choix. Des coupes nettes, une identité affirmée, des détails qu’on remarque de près. Peu de pièces, chacune pensée pour durer.',
      },
    ],
    image: {
      desktop: '/brand/about-street.webp',
      alt: {
        en: 'White waffle henley with red embroidered sleeves and raw denim, worn in the street',
        fr: 'Henley gaufré blanc aux manches brodées de rouge et jean brut, porté dans la rue',
      },
    },
    cta: {
      label: {en: 'Read our story', fr: 'Lire notre histoire'},
      to: '/about',
    },
  },
  {
    type: 'editorial',
    eyebrow: {en: 'The store', fr: 'Le magasin'},
    title: {en: 'Come see us in Nantes.', fr: 'Venez nous voir à Nantes.'},
    text: {
      en: 'Hustle Studio is also a streetwear store in Nantes. Come try the pieces on and talk streetwear with us.',
      fr: 'Hustle Studio, c’est aussi un magasin de streetwear à Nantes. Venez essayer les pièces et parler streetwear avec nous.',
    },
    cta: {
      label: {en: 'Visit the store', fr: 'Voir le magasin'},
      to: '/about#store',
    },
  },
  {type: 'reviews'},
  {type: 'faq'},
];
