# Hustle Studio — boutique en ligne

Site e-commerce **Hustle Studio**, connecté à Shopify.

| | |
| --- | --- |
| Frontend | React Router 7 + Shopify Hydrogen (utilisé comme bibliothèque) |
| Produits, collections, stock | Shopify Storefront API — rien n'est écrit en dur |
| Panier | Shopify Cart API (`cartCreate`, `cartLinesAdd`, …) via Hydrogen |
| Paiement | Checkout Shopify, via le `checkoutUrl` du panier |
| Hébergement | Vercel (fonction Node.js + CDN) |
| Styles | Tailwind v4 + CSS maison (`app/styles`) |

**Connecter Shopify et mettre en ligne sur Vercel :** voir
[`docs/SHOPIFY-VERCEL.md`](docs/SHOPIFY-VERCEL.md) (guide pas à pas).

---

## Changer ce qui touche à la marque

Tout ce qui est propre à la marque est regroupé ici :

| Quoi | Où |
| --- | --- |
| Nom, description SEO, e-mail, réseaux sociaux, pays/devise, langue par défaut, seuil de livraison gratuite | `app/config/brand.ts` |
| Couleurs, polices, ombres | `app/config/theme.css` |
| Sections de la page d'accueil (ordre, titres, collections affichées, images) | `app/config/home.ts` |
| Menu, ordre des collections, liens du footer | `app/config/navigation.ts` |
| Promotions (2ᵉ pièce, pack, paliers, pop-up) — éteintes tant qu'aucun code n'est saisi | `app/config/promotions.ts` → guide : [`docs/PROMOTIONS.md`](docs/PROMOTIONS.md) |
| Avis clients (réels uniquement) | `app/data/reviews.ts` |
| Vidéos « portées » des fiches produits | `app/config/videos.ts` + `public/videos/` |
| Logo, favicon, icône, image de partage | `public/brand/` + `public/favicon*.{ico,png}` + `public/apple-touch-icon.png` |
| Pages légales (`/legal/…`) : coordonnées de l'entreprise, délais de livraison, délai de retour | `app/config/legal.ts` (textes : `app/data/legal.ts` et `legal.fr.ts`) |
| Textes de l'interface (FR / EN) | `app/lib/i18n/dictionary.ts` (`{brand}` y insère le nom automatiquement) |

**Ce qui se gère dans Shopify, pas dans le code :**

- produits, prix, prix barrés, photos, variantes (tailles, couleurs), stock ;
- collections : il suffit de créer une collection dans Shopify pour qu'elle
  apparaisse dans le menu, sur `/collections` et dans « nos catégories » ;
- codes promo, frais de livraison, taxes, moyens de paiement.

### Page d'accueil

`app/config/home.ts` décrit la page de haut en bas. Types de sections :
`hero`, `products` (rangée ou grille), `feature` (grande bannière de
collection + rangée), `collections`, `editorial`, `pack`, `reviews`,
`newsletter`.

Les sections produits pointent vers une **collection Shopify** par son
*handle* (la fin de l'URL de la collection). Si la collection n'existe pas
encore, `fallbackSort` affiche à la place de vrais produits triés par
Shopify (`newest` ou `best-selling`). Collections prévues par défaut :
`new-arrivals` et `best-sellers`.

Pour ajouter des photos : les déposer dans `public/brand/` et renseigner
`image: {desktop: '/brand/…', mobile: '/brand/…', alt: '…'}` dans la
section. Sans image, le hero affiche le logo en grand sur fond noir.

---

## Développement

Prérequis : Node.js 22 ou 24.

```bash
npm install
cp .env.example .env      # puis remplir les valeurs (voir le guide)
npm run dev               # http://localhost:3000
```

| Commande | Rôle |
| --- | --- |
| `npm run dev` | serveur local (Mini Oxygen de Shopify, `server.ts`) |
| `npm run build:vercel` | build de production pour Vercel → `.vercel/output` |
| `npm run typecheck` | vérification TypeScript |
| `npm run lint` | ESLint |
| `npm run codegen` | régénère les types des requêtes GraphQL Shopify |

### Architecture

```
app/
  config/        ← marque, thème, accueil, navigation
  routes/        ← pages (routage par fichiers React Router)
  components/    ← composants (home/, panier, fiche produit, …)
  lib/           ← contexte Shopify, SEO, i18n, helpers
  styles/        ← tailwind.css, reset.css, app.css (base), brand.css (marque)
server/vercel.ts ← point d'entrée de production (fonction Vercel)
server.ts        ← point d'entrée de développement (Mini Oxygen)
scripts/vercel-output.mjs ← emballe le build au format Vercel
```

Les deux points d'entrée partagent `app/lib/context.ts`, qui crée le
client Storefront API, le panier et la session. Si une variable Shopify
manque, le site refuse de démarrer plutôt que d'afficher la boutique de
démonstration de Shopify.

### Sécurité

- Aucun token dans le code : tout passe par les variables d'environnement
  (`.env` en local, ignoré par Git ; réglages du projet sur Vercel).
- `PRIVATE_STOREFRONT_API_TOKEN` et `SESSION_SECRET` ne sont lus que côté
  serveur.
- Le paiement se fait entièrement sur le checkout Shopify ; le site ne
  voit jamais de données bancaires.
