# Hustle Studio — site vitrine

Site vitrine **Hustle Studio** (streetwear, Nantes). Aucune boutique en
ligne : pas de produits, de panier ni de paiement. Aucune connexion externe
à part Vercel (hébergement) et Resend (e-mails des formulaires).

| | |
| --- | --- |
| Frontend | React Router 7 (rendu serveur) |
| Hébergement | Vercel (fonction Node.js + CDN), Build Output API |
| Formulaires | Contact, newsletter, pop-up -15 % → e-mail via Resend ([`docs/FORMS.md`](docs/FORMS.md)) |
| Styles | Tailwind v4 + CSS maison (`app/styles`) |

## Pages

`/` accueil · `/about` notre histoire · `/faq` · `/contact` ·
`/legal/privacy` · `/legal/legal-notice`. Les anciennes adresses de la
boutique (`/products/…`, `/collections/…`, `/cart`, …) redirigent vers
l'accueil.

## Changer ce qui touche à la marque

| Quoi | Où |
| --- | --- |
| Nom, description SEO, e-mail, réseaux sociaux, langues | `app/config/brand.ts` |
| Couleurs, polices | `app/config/theme.css` |
| Page d'accueil (textes, photos, polaroids, médias) | `app/config/homeTemplate.ts` — [`docs/HOME_PAGE.md`](docs/HOME_PAGE.md) |
| Menus et liens du pied de page | `app/config/navigation.ts` |
| Pop-up -15 % | `app/config/promotions.ts` |
| Adresse qui reçoit les formulaires | `app/config/inbox.ts` |
| Pages légales | `app/config/legal.ts` (textes : `app/data/legal.ts`, `legal.fr.ts`) |
| Textes de l'interface (EN / FR) | `app/lib/i18n/dictionary.ts` |
| Logo, favicon, images | `public/brand/`, `public/favicon*`, `public/apple-touch-icon.png` |

## Développer

```bash
npm ci
npm run dev            # http://localhost:5173
npm run typecheck && npm run lint
npm run build:vercel   # sortie dans .vercel/output
```

Variables d'environnement : voir `.env.example` (seulement Resend).
