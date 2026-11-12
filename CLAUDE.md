# Hustle Studio — notes for Claude

Shopify headless storefront: React Router 7 + Hydrogen (as a library),
deployed on **Vercel** through the Build Output API (`npm run build:vercel`
→ `server/vercel.ts` + `scripts/vercel-output.mjs`). `npm run dev` runs the
same app on Mini Oxygen through `server.ts`; keep the two entries in step.

- Brand-specific values live in `app/config/` (brand, theme, home,
  navigation) and `public/brand/`. Do not hardcode the brand name elsewhere;
  dictionary strings can use `{brand}`.
- Products, collections, stock and prices come from Shopify. Legal pages
  (`/legal/*`) are in `app/data/legal*.ts`, fed by `app/config/legal.ts`;
  their text, like the FAQ (`faqData.*` in the dictionary), is Reda
  Studio's, with Hustle's name, company details and host.
  Never add hardcoded products, fake reviews, fake stock counts or promises
  (delivery times, return windows) that Shopify does not back.
- Promotions live in `app/config/promotions.ts` and stay invisible until a
  Shopify code is set (`isLive`). Bundle maths in `app/lib/bundles.ts`; the
  cart attaches bundle codes server-side and drops an unbacked gift line.
  Reviews come only from Shopify `review` metaobjects + `app/data/reviews.ts`
  (real ones, app/lib/reviews.ts) or review-app metafields; videos only from `app/config/videos.ts`.
- UI text goes through `app/lib/i18n/dictionary.ts` (EN + FR, same keys).
  The site runs in English only (`BRAND.languages = ['en']`: no language
  prompt; cookies are a small bar, CookieBar.tsx). Product texts the shop
  wrote in French in Shopify are replaced by English ones from
  app/data/productEnglish.ts in every Shopify answer (app/lib/englishCopy.ts,
  wired in app/lib/context.ts).
- Homepage (app/routes/_index.tsx): Reda Studio's homepage, ported with
  Hustle's photos and Shopify data — hero (AnimatedHero, photos served as
  supplied; a portrait photo on phones, a landscape one on computers), collections slider, every product, real reviews,
  help, newsletter; no collection banners. Styles in reda-home.css, scoped under
  `.rhome`. The older configurable homepage (app/config/home.ts +
  components/home/HomeSections.tsx) is no longer rendered.
- Styles: app.css (base) → promotions.css → brand.css → editorial.css →
  shop.css (`sx-` classes) → store.css (`st-` classes) → on.css (the current
  look, inspired by on.com: transparent header over a full-screen hero,
  bold sentence-case titles, grey product tiles, carousels with arrows and a
  progress bar — app/components/store/OnRail.tsx —, white footer) →
  reda-pdp.css (product page, `.rpdp`) → reda-home.css (homepage, `.rhome`). Homepage sections incl. `sale`, `collectionGrids`,
  `usps` in app/config/home.ts; announcement messages in
  app/config/navigation.ts. Collection
  pages share app/components/shop/CollectionShell.tsx. The product page is
  Reda Studio's (redastudiofr/reda-studio), ported into app/components/reda/
  and app/lib/reda/: no synthetic ratings or stock, the bundle offer stays
  off until a Hustle code is set in app/lib/reda/offers.ts.
- Community block (app/components/CommunitySections.tsx): "become part of
  the community" (the whole block, "follow us" included, fills black from
  the logo; a slider of floating brand photos, COMMUNITY_PHOTOS, repeated
  to fill the screen; the story link) and "follow
  us" (Instagram + TikTok from BRAND.social in bold; the brand's videos from
  app/config/community.ts, files in public/brand/tiktok/, 480px, no sound,
  endless both ways, playing once the block nears the screen, the row
  drifting on its own and pausing while touched; swipe/drag/arrows). On the
  homepage it sits before "need help?" (route handle `communityInPage`);
  elsewhere the footer shows it. "Need help?" (HelpFaq) answers real
  questions from app/config/legal.ts and brand.ts.
- Welcome pop-up (-15%, e-mail and/or phone), switched off for now
  (`welcomePopup.enabled: false` in promotions.ts); sign-ups go to a Google Sheet (GOOGLE_SHEET_WEBHOOK_URL),
  by e-mail (Resend) and to Shopify customers — docs/POPUP.md. Header: logo
  centred, every page in the menu panel opened from the button on the right
  (app/config/navigation.ts `mobileLinks`).
- Opening loader (every full page load, desktop and phone; white screen,
  the wordmark, then a fade to transparent; a plain fade with reduced
  motion): app/lib/hs-loader.ts (inline CSS + head script) +
  app/components/hs/HsLoader.tsx. Product cards (ProductItem and
  reda/ProductItem): hover zoom, "Add to cart" through the cart's LinesAdd
  (one variant: added at once; sizes: the customer picks one on the card,
  never a default), header count bump and toasts — app/components/hs/,
  app/styles/hs-product-card.css. Animate transform/opacity/clip-path only.
- 07 sets (app/config/sets.ts, app/lib/sets.ts, components/sets/, routes
  /sets and /sets/:slug): a Zip 07 + the matching Jogging 07, two real
  Shopify products added as two lines, priced at the sum of their Shopify
  prices. On the homepage "the sets" is a slider under every product
  showing the Shopify "set-…" products themselves (first Shopify photo,
  title, price; loadSetProducts), which stay out of the product grid and the
  cart suggestions; /sets lists them too. After the slider, "Match your
  person" (components/sets/MatchYourPerson.tsx, photos in MATCH_PHOTOS):
  two worn photos + a grey panel, no price or shipping promise. The
  "any 2 sets" deal stays hidden until SETS_BUNDLE.code is set.
- Product page: "the details" and the FAQ answers are written per product
  from its own data (description, options, metafields custom.fit /
  composition / made_in / care) — app/lib/productDetails.ts; never invent a
  fabric or a country. Stars by the title: review-app metafields, else the
  average of the real reviews shown on the page. Reviews: three rows
  (right, left, right).
- Secrets only in env vars (`.env.example` lists them). Never commit tokens.
- Before pushing: `npm run typecheck`, `npm run lint`, `npm run build:vercel`.
- Vercel build: keep server and client CSS identical (no `build.target` on the
  SSR build) or hydration breaks on a stylesheet hash mismatch.
