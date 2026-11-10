/**
 * English versions of the product texts the shop wrote in French in Shopify.
 *
 * The site is English only, but 24 descriptions (and a few titles) were
 * written in French in Shopify Admin, and the store has no English
 * translation published (Shopify answers in French whatever language is
 * asked). These are faithful translations of those texts — same facts, same
 * structure — applied to every Shopify answer by app/lib/englishCopy.ts.
 *
 * When the shop publishes its own English text in Shopify (Settings →
 * Languages, or by editing the product in English), delete its entry here.
 * A product not listed keeps its Shopify text as it is.
 */

const SELECTION =
  '<p>The Hustle Studio selection: character, strong lines, your own pace.</p>';

const fitSize = (advice: string) =>
  `<p><strong>Fit &amp; size</strong><br>${advice}</p>`;

const list = (items: string[]) =>
  `<ul>\n${items.map((item) => `<li>${item}</li>`).join('\n')}\n</ul>`;

const winShort = (colour: string) =>
  `<p>The ${colour} Win combines volume and graphic impact. Its relaxed cut and adjustable waist set up an easy silhouette, to wear with a tee or a hoodie.</p>${SELECTION}${list([
    '100% heavyweight cotton',
    'Made in Portugal',
    'Win print',
    'Elastic waist with drawcord',
    'Side pockets',
    'Oversized fit',
  ])}${fitSize('Take your usual size for the intended volume, or one size down for a less roomy look.')}`;

const moneyKnit = (colour: string) =>
  `<p>The ${colour} Money Knit brings texture to your essentials. Its embroidered Money motif and relaxed cut give quiet presence to an easy-to-style look.</p>${SELECTION}${list([
    'Textured knit',
    'Embroidered Money motif',
    'Relaxed fit',
    'Crew neck, ribbed cuffs and hem',
  ])}${fitSize('Take your usual size for a slightly loose silhouette.')}`;

const asapJogging = (colour: string) =>
  `<p>The ${colour} Asap plays with volume and functional details. Its wide leg and adjustable drawcords let you build a streetwear silhouette your own way.</p>${SELECTION}${list([
    'Wide, relaxed fit',
    'Panelled construction',
    'Drawcord-adjustable waist and ankles',
    'Zipped side pockets',
    'Graphic details on the pockets',
  ])}${fitSize('Take your usual size for a roomy fit.')}`;

const redaHoodie = (colour: string) =>
  `<p>This ${colour} hoodie gets the essentials right: a thick hand-feel, dropped shoulders and assertive volume. A solid base for the Hustle Studio wardrobe.</p>${SELECTION}${list([
    'Thick hand-feel and structured silhouette',
    'Oversized fit',
    'Dropped shoulders and full sleeves',
    'Large hood',
    'Kangaroo pocket',
    'Ribbed cuffs and hem',
  ])}${fitSize('Take your usual size for the oversized volume, or one size down for a less roomy look.')}`;

const redaJogging = (colour: string) =>
  `<p>These ${colour} joggers go for extra-wide legs and a clean line. A piece to wear with a fitted top or as a loose set, in the Hustle Studio spirit.</p>${SELECTION}${list([
    'Thick hand-feel',
    'Slightly textured fabric',
    'Oversized fit with extra-wide legs',
    'Elastic waist',
    'Side pockets',
    'Straight hems',
  ])}${fitSize('Take your usual size for the oversized volume, or one size down for a less roomy look.')}`;

const redaLongsleeve = (body: string, stars: string, advice: string) =>
  `<p>${body}</p>${SELECTION}${list([
    'Cotton',
    stars,
    'Crew neck',
    'Ribbed cuffs',
    'Relaxed fit',
  ])}${fitSize(advice)}`;

/** Handle → English description (HTML, as Shopify's descriptionHtml). */
export const ENGLISH_DESCRIPTIONS: Record<string, string> = {
  'reda-short-raw-denim-bleu': winShort('grey'),
  'win-short-pink': winShort('pink'),
  'win-short-blue': winShort('blue'),
  'reda-jeans-raw-denim-blue-1': `<p>Raw denim, a flared line, details that count. These blue jeans pair a structured build with floral embroidery for a confident silhouette.</p>${SELECTION}${list([
    'Blue raw denim',
    'Made in Portugal',
    'White floral embroidery',
    'Flared fit',
    'Panelled construction',
    'Raw hem',
    'Five pockets',
  ])}${fitSize('Fitted at the waist and thighs, then flared. Take your usual size.')}`,
  'money-jeans-flared-grey': `<p>The grey Money bridges vintage denim and today’s proportions. Its wash, worn details and frayed hem give depth to a flared cut.</p>${SELECTION}${list([
    'Washed grey denim',
    'Flared fit',
    'Lightly worn details',
    'Embroidery on the back',
    'Frayed hem',
    'Five pockets',
  ])}${fitSize('Take your usual size to keep the flared silhouette.')}`,
  'money-knit-grey': moneyKnit('grey'),
  'money-knit-black': moneyKnit('black'),
  'im-scared-of-girls-tshirt-white': `<p>The white I’m Scared Of Girls tee brings an offbeat touch to your wardrobe. A simple base for a streetwear look with personality.</p>${SELECTION}${list([
    'White colourway',
    'Pair with denim or loose trousers',
  ])}${fitSize('Check the size guide before choosing.')}`,
  'nebraska-classic-zip-grey': `<p>The grey Nebraska sets the tone with a graphic inspired by an American driving licence. Its full zip lets you layer at your own pace.</p>${SELECTION}${list([
    'Nebraska graphic on the chest',
    'Full-length zip',
    'Structured hood',
    'Kangaroo pocket',
    'Ribbed cuffs and hem',
    'Relaxed fit',
  ])}${fitSize('Take your usual size for a slightly loose silhouette.')}`,
  'kaizen-jeans-raw-denim-blue': `<p>The Kaizen pairs the depth of raw denim with a white, Japanese-inspired graphic. A straight, relaxed leg for a clean silhouette.</p>${SELECTION}${list([
    'Blue raw denim',
    'White graphic on the upper leg',
    'Straight, relaxed fit',
    'Five pockets',
    'Contrast stitching',
  ])}${fitSize('Take your usual size to keep the ease of the straight cut.')}`,
  'asap-jogging-black': asapJogging('black'),
  'asap-jogging-grey': asapJogging('grey'),
  'sakura-longsleeve-white': `<p>The white Sakura makes the difference in the detail. Floral embroidery along the sleeves brings a Japanese-inspired touch to a clean silhouette.</p>${SELECTION}${list([
    'Cotton',
    'Floral embroidery on both sleeves',
    'Crew neck',
    'Long sleeves',
    'Relaxed fit',
  ])}${fitSize('Take your usual size for a slightly loose silhouette.')}`,
  'i-only-want-baddies-longsleeve-white': `<p>A bold message, a white base, a pink graphic. The I Only Want Baddies adds character to your looks without complicating the pairings.</p>${SELECTION}${list([
    'Cotton',
    'Pink graphic on the front',
    '“I ONLY WANT BADDIES” lettering',
    'Crew neck',
    'Long sleeves',
    'Relaxed fit',
  ])}${fitSize('Take your usual size for a slightly loose silhouette.')}`,
  'reda-longsleeve-black': redaLongsleeve(
    'This white long-sleeve top plays on contrast: a clean body and black stars along the sleeves. Pair it with raw denim or loose joggers.',
    'Star motifs on the sleeves',
    'Take your usual size for a slightly loose wear.',
  ),
  'reda-longsleeve-white': redaLongsleeve(
    'This black long-sleeve top builds a sober silhouette, lifted by star motifs on the sleeves. A base with character for simple pairings.',
    'Star motifs on the sleeves',
    'Take your usual size for a slightly loose wear.',
  ),
  'sherif-jeans-washed-blue-blue': `<p>The washed-blue Sherif takes on the attitude of vintage denim with a straight, relaxed leg. An easy piece to pair, from a graphic tee to a loose hoodie.</p>${SELECTION}${list([
    'Washed blue denim',
    'Vintage-look finish',
    'Straight, relaxed fit',
    'Five pockets',
  ])}${fitSize('Take your usual size to keep the ease at the waist, hips and legs.')}`,
  'tshirt-business-after-hour-white': `<p>The white Business After Hour makes its statement with a monochrome portrait and large-format lettering. A graphic piece that stands on its own.</p>${SELECTION}${list([
    'White cotton',
    'Black-and-white portrait print',
    '“BUSINESS AFTER HOURS” lettering',
    'Relaxed, slightly baggy fit',
    'Ribbed crew neck',
    'Short sleeves',
  ])}${fitSize('Take your usual size for the intended volume.')}`,
  'hoodie-reda-st-grey': redaHoodie('grey'),
  'hoodie-reda-st-blue': redaHoodie('navy'),
  'hoodie-reda-st-black': redaHoodie('black'),
  'jogging-reda-st-grey': redaJogging('grey'),
  'jogging-reda-st-blue': redaJogging('blue'),
  'jogging-reda-st-black': redaJogging('black'),
};

/** Handle → English title, for the titles written in French. */
export const ENGLISH_TITLES: Record<string, string> = {
  'zip-07-rose': 'Zip 07 — Pink',
  'zip-07-bleu': 'Zip 07 — Blue',
  'zip-07-noir': 'Zip 07 — Black',
  'jogging-07-rose': 'Jogging 07 — Pink',
  'jogging-07-bleu': 'Jogging 07 — Blue',
  'jogging-07-noir': 'Jogging 07 — Black',
};

/** Collection handle → English title, for the collections named in French. */
export const ENGLISH_COLLECTION_TITLES: Record<string, string> = {
  pulls: 'Knits',
  joggings: 'Joggers',
  't-shirts-manches-longues': 'Longsleeves',
};
