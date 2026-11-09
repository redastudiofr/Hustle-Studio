# Hustle Studio — notes for Claude

Shopify headless storefront: React Router 7 + Hydrogen (as a library),
deployed on **Vercel** through the Build Output API (`npm run build:vercel`
→ `server/vercel.ts` + `scripts/vercel-output.mjs`). `npm run dev` runs the
same app on Mini Oxygen through `server.ts`; keep the two entries in step.

- Brand-specific values live in `app/config/` (brand, theme, home,
  navigation) and `public/brand/`. Do not hardcode the brand name elsewhere;
  dictionary strings can use `{brand}`.
- Products, collections, stock and prices come from Shopify. Legal pages
  (`/legal/*`) are in `app/data/legal*.ts`, fed by `app/config/legal.ts`.
  Never add hardcoded products, fake reviews, fake stock counts or promises
  (delivery times, return windows) that Shopify does not back.
- Promotions live in `app/config/promotions.ts` and stay invisible until a
  Shopify code is set (`isLive`). Bundle maths in `app/lib/bundles.ts`; the
  cart attaches bundle codes server-side and drops an unbacked gift line.
  Reviews come only from Shopify `review` metaobjects + `app/data/reviews.ts`
  (real ones, app/lib/reviews.ts) or review-app metafields; videos only from `app/config/videos.ts`.
- UI text goes through `app/lib/i18n/dictionary.ts` (EN + FR, same keys).
  The site runs in English only (`BRAND.languages`); legal pages keep a
  French version via `?lang=fr`. Homepage copy lives in `app/config/home.ts`.
- Styles: app.css (base) → promotions.css → brand.css → editorial.css →
  shop.css (`sx-` classes) → store.css (`st-` classes) → on.css (the current
  look, inspired by on.com: transparent header over a full-screen hero,
  bold sentence-case titles, grey product tiles, carousels with arrows and a
  progress bar — app/components/store/OnRail.tsx —, white footer) →
  reda-pdp.css (product page only, scoped under `.rpdp`). Homepage sections incl. `sale`, `collectionGrids`,
  `usps` in app/config/home.ts; announcement messages in
  app/config/navigation.ts. Collection
  pages share app/components/shop/CollectionShell.tsx. The product page is
  Reda Studio's (redastudiofr/reda-studio), ported into app/components/reda/
  and app/lib/reda/: no synthetic ratings or stock, the bundle offer stays
  off until a Hustle code is set in app/lib/reda/offers.ts.
- Welcome pop-up (-15%, e-mail and/or phone): code in promotions.ts
  `welcomePopup`; sign-ups go to a Google Sheet (GOOGLE_SHEET_WEBHOOK_URL),
  by e-mail (Resend) and to Shopify customers — docs/POPUP.md. Header: logo
  centred, every page in the menu panel opened from the button on the right
  (app/config/navigation.ts `mobileLinks`).
- Secrets only in env vars (`.env.example` lists them). Never commit tokens.
- Before pushing: `npm run typecheck`, `npm run lint`, `npm run build:vercel`.
- Vercel build: keep server and client CSS identical (no `build.target` on the
  SSR build) or hydration breaks on a stylesheet hash mismatch.
