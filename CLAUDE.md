# Hustle Studio — notes for Claude

Showcase site (no online shop): React Router 7, server-rendered, deployed on
**Vercel** through the Build Output API (`npm run build:vercel` →
`server/vercel.ts` + `scripts/vercel-output.mjs`). `npm run dev` runs React
Router's dev server. No Shopify, no external service except Resend for the
forms (contact, newsletter, welcome pop-up → e-mail, see docs/FORMS.md).

- Brand-specific values live in `app/config/` (brand, theme, homeTemplate,
  navigation, inbox, promotions, legal) and `public/brand/`. Do not
  hardcode the brand name elsewhere; dictionary strings can use `{brand}`.
- Never add products, prices, fake reviews or promises (delivery times,
  return windows) the shop does not stand behind. Legal pages (`/legal/*`)
  are in `app/data/legal*.ts`, fed by `app/config/legal.ts`.
- UI text goes through `app/lib/i18n/dictionary.ts` (EN + FR, same keys).
  The site is in English by default with a French option
  (`BRAND.languages`); config copy uses `{en, fr}` (Localized). Homepage:
  sections in app/components/landing/, texts in app/config/homeTemplate.ts —
  see docs/HOME_PAGE.md.
- Server-only settings through `serverEnv()` (app/lib/env.server.ts), never
  in browser code. Secrets only in env vars (`.env.example` lists them).
  Never commit tokens.
- Styles: reset.css → app.css (base) → promotions.css → brand.css →
  editorial.css → pdp.css (header + section titles) → home.css (homepage,
  `hx-` classes, last), built into one file through app/styles/site.css
  (tailwind.css apart).
- Before pushing: `npm run typecheck`, `npm run lint`, `npm run build:vercel`.
- Vercel build: keep server and client CSS identical (no `build.target` on the
  SSR build) or hydration breaks on a stylesheet hash mismatch.
