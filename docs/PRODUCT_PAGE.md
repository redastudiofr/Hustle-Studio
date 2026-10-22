# Product page (mock-ups 01–09)

Every product page, built from the mock-ups: `app/routes/products.$handle.tsx`
assembles one component per section, in `app/components/pdp/`:

| # | Section | Component |
|---|---------|-----------|
| 1 | Gallery (1 large + 5 thumbnails; carousel with dots on phones) | `PdpGallery` |
| 1 | Badges, title, rating, 3 arguments, pack selector, button, reassurance, accordions, sticky cart bar (phones) | `PdpBuyBox`, `PackSelector`, `usePackSelection` |
| 2 | Reviews — 4 cards + "see all" | `PdpReviews` |
| 3 | Material — tabs, blue card, 3 tiles | `PdpMaterial` |
| 4 | "Ce que tu ne vois pas" — 3 photo cards | `PdpDetails` |
| 5 | Manifesto — blue block, 3 numbered points | `PdpManifesto` |
| 6 | Collection — 5 products | `PdpCollection` |
| 7 | Comparison table | `PdpComparison` |
| 8 | Delivery — computed dates, 4 steps, 3 tiles | `PdpDelivery` |

The header and the blue announcement bar (mock-ups 01 and 09) are the site
header, on every page: `app/components/Header.tsx`.

Styles: `app/styles/pdp.css` (fonts Anton + Inter, colours in
`app/config/theme.css`).

## Texts

All fixed texts (French from the mock-ups, English translation) are in
`app/config/productTemplate.ts`. **Several are factual claims** — 190 g/m²,
printed in France, screen printing, 30-day free exchange, €4.90 shipping,
free shipping on packs, Colissimo, support 7/7: check each one and edit it
there if it is not true for your products.

What the mock-ups wrote in [brackets] comes from Shopify instead, and is
simply not shown while empty:

| Mock-up | Source |
|---------|--------|
| [MARQUE] | the logo (`BRAND`) |
| [NOM DU T-SHIRT] | product title |
| [TON VISUEL] | product images |
| ★ [N] VENTES | product metafield `custom.sales_count` (Integer) |
| COLLECTION PHARE | product metafield `custom.badge` (Single line text) |
| BEST-SELLER on the photo | product tag `best-seller` |
| 4,8/5 · [N] avis | the review app's metafields, else the average of the real reviews |
| [Avis client], [Prénom], [ville] | real reviews (Shopify "Review" metaobjects, `app/lib/reviews.ts`) — new optional fields `photo` (File) and `topic` (Single line text, e.g. "La qualité") |
| Photos of section 4 | product metafield `custom.detail_images` (List of files: collar close-up, print macro, fabric flat lay); without it, product photos 2–4 |
| [MODÈLE 1…5] | products of the `tshirt` collection |
| [Date d'expédition], [J+2] et [J+4] | computed (Paris time, weekends skipped, public holidays not) |
| [Une phrase : …] (section 5) | `manifesto.points[].text` in `productTemplate.ts` |
| Tabs "Matière & entretien", "Certifications" | their content in `productTemplate.ts` — hidden until written |

Create the metafield definitions in Shopify Admin → Settings → Custom data →
Products (namespace `custom`, keys above), with Storefront access on.

## Packs 1 / 2+1 / 3+2

Shown on products of the `tshirt` collection only, and only once their code
exists — until then the selector offers "1 t-shirt" alone and the blue bar is
hidden. For each pack, in Shopify Admin → Discounts → Create discount →
**Buy X get Y**:

- 2+1: code e.g. `PACK21` — Customer buys: minimum quantity **2**, items from
  collection **tshirt**; Customer gets: quantity **1**, items from collection
  **tshirt**, **Free**.
- 3+2: code e.g. `PACK32` — buys **3**, gets **2**, same collection, Free.
- Free shipping on packs ("Livraison offerte"): a free shipping rate in
  Settings → Shipping, e.g. from 2 items or from the 2+1 total.

Then write the codes in `app/config/promotions.ts` → `teePacks.offers[].code`
(or ask Claude to) and redeploy.

How it adds to the cart: the paid t-shirts (one line per size), the free ones
marked `_hs_pack_free`, and the pack's code — chosen on the server from the
offer id. If Shopify does not apply the code (wrong code, basket no longer
qualifying), the free lines are removed instead of being charged
(`app/routes/cart.tsx`).
