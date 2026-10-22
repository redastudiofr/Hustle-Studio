# Homepage (mock-ups 01–07)

`app/routes/_index.tsx` renders, in order:

| # | Section | Component (app/components/landing/) | Data | Shown when |
|---|---------|-------------------------------------|------|------------|
| 1 | Hero, 2 photo panels (slider on phones) | `HeroSplit.tsx` | `HOME.hero` | the panel's Shopify collection exists (`tshirt`, `pulls`) |
| 1 | Blue scrolling band (pure CSS) | `ScrollingBand` in `HeroSplit.tsx` | `HOME.band` | pack lines only while a tee pack is live |
| 2 | Best-seller VS | `BestSellerVs.tsx` | Shopify best sellers, or `HOME.bestSeller.handles` | 2 products |
| 3 | Duo offer (2nd at -50 %) | `DuoOffer.tsx` | `PROMOTIONS.homeDuo` | `homeDuo.code` is set (Shopify code) |
| 4 | Worn by you (polaroids) | `Community.tsx` | `HOME.community.photos` | at least one real photo |
| 5 | Podium | `Podium.tsx` | Shopify best sellers (top 3) | 3 products |
| 6 | Seen everywhere + logos | `MediaCarousel.tsx` | `HOME.media.cards` / `logos` | at least one card / logo |

- Texts: `app/config/homeTemplate.ts` (`{en, fr}`). [Bracket] fields of the
  mock-ups are empty there and hide their section or line until filled.
- Shopify queries: `app/lib/landing.ts` (run `npm run codegen` after edits).
  Colour pills appear for products with a `Color`/`Couleur` option; swatch
  colours come from Shopify's option-value swatches.
- Styles: `app/styles/home.css` (`hx-` classes, mobile first), after pdp.css.
- Duo: create a Shopify automatic "Buy X get Y" or code discount (2nd item
  at -50 %), put its code in `promotions.ts` → `homeDuo.code`. The button
  sends both pieces with the code through the `CustomDuoAdd` cart action.
- The previous config-driven homepage (`app/config/home.ts`,
  `app/components/home/`) is kept, unused.
