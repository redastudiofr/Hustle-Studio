/**
 * Product-specific details — cut & sizing, material, features, manufacturing,
 * care — written from each product's own Shopify data, never invented.
 *
 * Sources, in order of trust:
 *   1. Shopify metafields, when the shop fills them (Admin → product →
 *      Metafields): custom.fit, custom.composition, custom.made_in,
 *      custom.care. Their text is shown as written.
 *   2. The product's description: its cut ("coupe ample", "jambe droite",
 *      "épaules tombantes"…), its material words ("denim brut", "maille"…),
 *      its details ("broderies", "cordons de réglage"…), and a composition
 *      with percentages if one is written there.
 *   3. The product's own options: the sizes it really comes in.
 *   4. Its kind (hoodie, jeans, tee… from the title, type and handle), for
 *      care advice suited to the garment — general advice, not a claim.
 * Anything none of these say is left to the label sewn into the garment
 * rather than guessed: no fabric percentage is ever made up.
 */
import {extractComposition} from '~/data/faq';
import type {Locale} from '~/lib/i18n';

export type ProductKind =
  | 'zip'
  | 'hoodie'
  | 'jeans'
  | 'jogging'
  | 'shorts'
  | 'longsleeve'
  | 'tee'
  | 'knit'
  | 'other';

export type ProductDetailsInput = {
  title: string;
  handle: string;
  description?: string | null;
  productType?: string | null;
  options?: Array<{name: string; optionValues: Array<{name: string}>}>;
  fit?: {value?: string | null} | null;
  composition?: {value?: string | null} | null;
  madeIn?: {value?: string | null} | null;
  care?: {value?: string | null} | null;
};

export type ProductDetails = {
  kind: ProductKind;
  /** One sentence about the piece: what it is and what sets it apart. */
  summary: string;
  /** The cut, from the shop's metafield or the description. */
  fit: string | null;
  /** "S to XL" — the sizes Shopify lists for it. */
  sizes: string | null;
  /** The shop's own sizing advice, from the description ("Coupe et taille…"). */
  sizeAdvice: string | null;
  /** Composition with percentages (metafield or description), if any. */
  composition: string | null;
  /** Material words from the description ("raw denim", "knit"…). */
  material: string | null;
  /** Construction details found in the description. */
  features: string[];
  /** Where it is made: the metafield, or the description ("Confection au Portugal"). */
  madeIn: string | null;
  /** Care advice: the shop's metafield, else general advice for its kind. */
  care: string;
};

type Phrase = {en: string; fr: string};

const KINDS: Array<{kind: ProductKind; test: RegExp; name: Phrase}> = [
  {kind: 'zip', test: /\bzip\b|zip[- ]?up|zippé/i, name: {en: 'a zip-up hoodie', fr: 'un hoodie zippé'}},
  {kind: 'hoodie', test: /hoodie|sweat à capuche|capuche/i, name: {en: 'a hoodie', fr: 'un hoodie'}},
  {kind: 'shorts', test: /\bshorts?\b/i, name: {en: 'a pair of shorts', fr: 'un short'}},
  {kind: 'jeans', test: /jeans?\b|denim/i, name: {en: 'a pair of jeans', fr: 'un jean'}},
  {kind: 'jogging', test: /jogging|jogger|sweatpant|trouser/i, name: {en: 'a pair of joggers', fr: 'un jogging'}},
  {kind: 'longsleeve', test: /long ?sleeve|manches longues/i, name: {en: 'a long-sleeve top', fr: 'un haut à manches longues'}},
  {kind: 'tee', test: /t-?shirt|tee-?shirt|\btee\b/i, name: {en: 'a t-shirt', fr: 'un t-shirt'}},
  {kind: 'knit', test: /\bknit|maille|tricot/i, name: {en: 'a knit', fr: 'un pull en maille'}},
];

/** Cut, from the description — the first that matches wins. */
const FITS: Array<{test: RegExp; phrase: Phrase}> = [
  {test: /extra-?larges?|extra-?wide/i, phrase: {en: 'extra-wide legs, a loose fall', fr: 'jambes extra-larges, une tombée ample'}},
  {test: /jambes? larges?|wide[- ]leg/i, phrase: {en: 'a wide leg', fr: 'une jambe large'}},
  {test: /évasée?|flared?\b/i, phrase: {en: 'a flared leg', fr: 'une jambe évasée'}},
  {test: /jambe droite|straight/i, phrase: {en: 'a straight, relaxed leg', fr: 'une jambe droite et décontractée'}},
  {test: /classic regular|regular/i, phrase: {en: 'a classic regular fit', fr: 'une coupe regular classique'}},
  {test: /volume assumé|oversize/i, phrase: {en: 'an oversized fit with generous volume', fr: 'une coupe oversize au volume assumé'}},
  {test: /coupe ample|\bample\b|relaxed|loose/i, phrase: {en: 'a relaxed, roomy fit', fr: 'une coupe ample et décontractée'}},
  {test: /décontract/i, phrase: {en: 'a relaxed fit', fr: 'une coupe décontractée'}},
];

const SHOULDER: Array<{test: RegExp; phrase: Phrase}> = [
  {test: /épaules tombantes|drop(ped)?[- ]shoulder/i, phrase: {en: 'dropped shoulders', fr: 'épaules tombantes'}},
];

/** Material words, from the description. */
const MATERIALS: Array<{test: RegExp; phrase: Phrase}> = [
  {test: /denim brut|raw (blue )?denim|raw blue/i, phrase: {en: 'raw denim', fr: 'denim brut'}},
  {test: /délav|washed/i, phrase: {en: 'washed denim', fr: 'denim délavé'}},
  {test: /denim/i, phrase: {en: 'denim', fr: 'denim'}},
  {test: /maille|knit/i, phrase: {en: 'knit', fr: 'maille'}},
  {test: /toucher épais|heavyweight|heavy fleece|épais/i, phrase: {en: 'a thick, heavyweight hand-feel', fr: 'une matière au toucher épais'}},
];

/** Construction details, from the description. */
const FEATURES: Array<{test: RegExp; phrase: Phrase}> = [
  {test: /broderies? florales?|floral embroider/i, phrase: {en: 'floral embroidery', fr: 'broderies florales'}},
  {test: /brodé|broderie|embroider/i, phrase: {en: 'embroidered motif', fr: 'motif brodé'}},
  {test: /étoiles|stars?\b/i, phrase: {en: 'star motifs on the sleeves', fr: 'motifs étoiles sur les manches'}},
  {test: /permis de conduire|driving licen/i, phrase: {en: 'US driving-licence graphic', fr: 'graphisme permis de conduire américain'}},
  {test: /portrait/i, phrase: {en: 'monochrome portrait print', fr: 'portrait monochrome imprimé'}},
  {test: /typograph|lettering|lettrage/i, phrase: {en: 'large-format lettering', fr: 'typographie grand format'}},
  {test: /graphi|imprim|print/i, phrase: {en: 'graphic print', fr: 'graphisme imprimé'}},
  {test: /full-length front zip|fermeture zippée|\bzip/i, phrase: {en: 'full-length zip', fr: 'fermeture zippée'}},
  {test: /cordons?|drawstring/i, phrase: {en: 'adjustable drawcords', fr: 'cordons de réglage'}},
  {test: /taille réglable|adjustable waist/i, phrase: {en: 'adjustable waist', fr: 'taille réglable'}},
  {test: /effiloch|frayed/i, phrase: {en: 'frayed hem', fr: 'bas effiloché'}},
  {test: /usés|distress/i, phrase: {en: 'worn-in details', fr: 'détails usés'}},
  {test: /boutons?|button/i, phrase: {en: 'visible button details', fr: 'boutons apparents'}},
  {test: /ribbed|côtel/i, phrase: {en: 'ribbed cuffs and hem', fr: 'bords-côtes aux poignets et à la taille'}},
  {test: /poches?|pockets?/i, phrase: {en: 'pockets', fr: 'poches'}},
];

/** General care advice per kind of garment — advice, not a label. */
const CARE: Record<ProductKind, Phrase> = {
  jeans: {
    en: 'Wash rarely, inside out, at 30 °C with dark colours; air-dry to keep the colour of the denim.',
    fr: 'Laver rarement, sur l’envers, à 30 °C avec les couleurs foncées ; sécher à l’air libre pour préserver la teinte du denim.',
  },
  knit: {
    en: 'Hand wash cold or on a wool cycle, dry flat, never tumble dry.',
    fr: 'Lavage à la main à froid ou programme laine, séchage à plat, jamais au sèche-linge.',
  },
  zip: {
    en: 'Close the zip and wash inside out at 30 °C; no tumble dryer, and no iron on the graphic.',
    fr: 'Fermer le zip et laver sur l’envers à 30 °C ; pas de sèche-linge, ne pas repasser le graphisme.',
  },
  hoodie: {
    en: 'Wash inside out at 30 °C with similar colours; dry flat or on a hanger, no tumble dryer.',
    fr: 'Laver sur l’envers à 30 °C avec des couleurs proches ; sécher à plat ou sur cintre, pas de sèche-linge.',
  },
  jogging: {
    en: 'Wash inside out at 30 °C; air-dry to keep the shape of the legs.',
    fr: 'Laver sur l’envers à 30 °C ; sécher à l’air libre pour garder la tenue des jambes.',
  },
  shorts: {
    en: 'Wash inside out at 30 °C with similar colours; air-dry.',
    fr: 'Laver sur l’envers à 30 °C avec des couleurs proches ; sécher à l’air libre.',
  },
  tee: {
    en: 'Wash inside out at 30 °C; never iron directly on the print.',
    fr: 'Laver sur l’envers à 30 °C ; ne jamais repasser directement sur l’impression.',
  },
  longsleeve: {
    en: 'Wash inside out at 30 °C; never iron directly on the print or embroidery.',
    fr: 'Laver sur l’envers à 30 °C ; ne jamais repasser directement sur l’impression ou les broderies.',
  },
  other: {
    en: 'Wash inside out at a low temperature and follow the label sewn inside.',
    fr: 'Laver sur l’envers à basse température et suivre l’étiquette cousue à l’intérieur.',
  },
};

/** "100 % coton épais" → the percentage and the words after it. */
function compositionFrom(description: string): string | null {
  const match = description.match(
    /\d{1,3}\s?%\s?[a-zà-ÿ][a-zà-ÿ'’ -]*?(?:,\s*\d{1,3}\s?%\s?[a-zà-ÿ][a-zà-ÿ'’ -]*?)*(?=\s+[A-ZÀ-Ý]|[.;]|$)/u,
  );
  return match ? match[0].trim().replace(/\s+/g, ' ') : null;
}

/** "Confection au Portugal", "Made in Portugal" → "Portugal". */
function madeInFrom(description: string): string | null {
  const match = description.match(
    /(?:[Cc]onfection(?:né)?|[Ff]abriqu[ée]e?s?|[Mm]ade|[Mm]anufactured|[Pp]roduced)\s+(?:au|aux|en|in)\s+(\p{Lu}[\p{L}-]+)/u,
  );
  return match ? match[1] : null;
}

/** The sentence after "Coupe et taille" / "Size & fit" in the description. */
function sizeAdviceFrom(description: string): string | null {
  const match = description.match(
    /(?:coupe et taille|taille et coupe|size (?:&|and) fit|fit (?:&|and) siz(?:e|ing))\s*:?\s*([^.]+\.?)/i,
  );
  const advice = match?.[1]?.trim();
  return advice && advice.length > 8 ? advice : null;
}

const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

function sizeRange(
  options: ProductDetailsInput['options'],
  locale: Locale,
): string | null {
  const size = options?.find((option) =>
    /^(size|taille|pointure)$/i.test(option.name.trim()),
  );
  const values = size?.optionValues.map((value) => value.name.trim()) ?? [];
  if (!values.length) return null;
  if (values.length === 1) return values[0];
  const sorted = [...values].sort(
    (a, b) =>
      (SIZE_ORDER.indexOf(a.toUpperCase()) + 1 || 99) -
      (SIZE_ORDER.indexOf(b.toUpperCase()) + 1 || 99),
  );
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  return locale === 'fr' ? `du ${first} au ${last}` : `${first} to ${last}`;
}

const pick = (text: string, table: Array<{test: RegExp; phrase: Phrase}>) =>
  table.find((entry) => entry.test.test(text))?.phrase;

const clean = (value?: string | null) => value?.trim() || null;

function listJoin(items: string[], locale: Locale) {
  if (items.length <= 1) return items.join('');
  const and = locale === 'fr' ? ' et ' : ' and ';
  return `${items.slice(0, -1).join(', ')}${and}${items[items.length - 1]}`;
}

export function buildProductDetails(
  product: ProductDetailsInput,
  locale: Locale,
): ProductDetails {
  const lang = locale === 'fr' ? 'fr' : 'en';
  const description = (product.description ?? '').replace(/\s+/g, ' ');
  // The title and type say what the piece is; the handle and the
  // description are only a fallback (a description also names what to wear
  // it with: "à porter avec un hoodie").
  const named = `${product.title} ${product.productType ?? ''}`;
  const kindEntry =
    KINDS.find((entry) => entry.test.test(named)) ??
    KINDS.find((entry) => entry.test.test(product.handle)) ??
    KINDS.find((entry) => entry.test.test(description));
  const kind = kindEntry?.kind ?? 'other';

  const fitPhrase = pick(description, FITS)?.[lang] ?? null;
  const shoulder = pick(description, SHOULDER)?.[lang] ?? null;
  const fitFromDescription = [fitPhrase, shoulder].filter(Boolean).join(', ');
  const fit = clean(product.fit?.value) ?? (fitFromDescription || null);

  // Several material words can match ("denim brut" and "denim"): keep the
  // most specific one per family.
  const materials: string[] = [];
  for (const entry of MATERIALS) {
    if (!entry.test.test(description)) continue;
    const phrase = entry.phrase[lang];
    // "à porter avec un denim brut" is a styling tip, not the fabric: denim
    // and knit only count for pieces that are denim or knit themselves.
    if (/denim/.test(phrase) && kind !== 'jeans' && !/denim|jean/i.test(named)) continue;
    if (/knit|maille/.test(phrase) && kind !== 'knit') continue;
    if (materials.some((m) => m.includes('denim')) && phrase.includes('denim')) continue;
    materials.push(phrase);
  }
  const material = materials.length ? listJoin(materials, lang) : null;

  // Features: the first match per family of words, at most four.
  const features: string[] = [];
  for (const entry of FEATURES) {
    if (features.length >= 4) break;
    if (!entry.test.test(description)) continue;
    const phrase = entry.phrase[lang];
    if (phrase.includes('brod') && features.some((f) => f.includes('brod'))) continue;
    if (phrase.includes('embroider') && features.some((f) => f.includes('embroider'))) continue;
    if (/graphi/.test(phrase) && features.some((f) => /graphi|portrait|lettering|typograph/.test(f))) continue;
    if (/zip|fermeture/.test(phrase) && kind !== 'zip') continue;
    features.push(phrase);
  }

  const composition =
    clean(product.composition?.value) ??
    compositionFrom(description) ??
    extractComposition(description);
  const madeIn = clean(product.madeIn?.value) ?? madeInFrom(description);
  const sizeAdvice = sizeAdviceFrom(description);
  const care = clean(product.care?.value) ?? CARE[kind][lang];
  const sizes = sizeRange(product.options, lang);

  const kindName = kindEntry?.name[lang] ?? (lang === 'fr' ? 'une pièce' : 'a piece');
  const bits = [fit, material, features.slice(0, 2).join(', ')]
    .filter(Boolean)
    .join(' · ');
  const summary = `${product.title}${lang === 'fr' ? ' :' : ':'} ${kindName}${bits ? ` — ${bits}` : ''}.`;

  return {
    kind,
    summary,
    fit,
    sizes,
    sizeAdvice,
    composition,
    material,
    features,
    madeIn,
    care,
  };
}
