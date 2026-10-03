# Promotions, avis et vidéos — mode d'emploi

Tout est **déjà en place dans le site mais éteint**. Chaque offre reste
invisible tant que son code n'est pas renseigné : le site n'annonce jamais une
réduction que Shopify n'appliquerait pas.

Tous les réglages sont dans **`app/config/promotions.ts`**. Après chaque
modification, poussez sur `main` : Vercel redéploie tout seul en ~3 minutes.

> Règle d'or : le site **affiche**, Shopify **facture**. Le pourcentage écrit
> dans `promotions.ts` doit toujours être celui de la réduction créée dans
> Shopify, sinon le client voit un prix et en paie un autre.

---

## 1. Le bundle de la fiche produit — Duo, Trio, Meilleure offre

Un bloc « Build your set » sur chaque fiche produit : le client choisit une
offre, compose son lot (produit + taille pour chaque pièce) et voit le prix
total, la réduction et l'économie en temps réel. Le bouton ajoute toutes les
pièces au panier et y attache le code de l'offre (côté serveur).

**Aperçu avant de créer les codes :** ajoutez `?bundle=preview` à l'adresse
d'une fiche produit (ex. `https://hustlestudio.store/products/…?bundle=preview`).
Le bloc s'affiche, mais le bouton reste désactivé tant que les codes ne sont
pas connectés. Sans `?bundle=preview`, les clients ne voient que les offres
dont le code est renseigné.

Dans Shopify → **Réductions → Créer une réduction**, créez un code par offre :

| Offre | Type Shopify | Réglages | Code (exemple) |
| --- | --- | --- | --- |
| **Duo** — 2ᵉ pièce −20 % | Achetez X, obtenez Y | le client achète **1** article (tous les produits), obtient **1** article à **20 %** | `DUO20` |
| **Trio** — 3ᵉ pièce −30 % | Achetez X, obtenez Y | le client achète **2** articles, obtient **1** article à **30 %** | `TRIO30` |
| **Meilleure offre** — −30 % sur la commande | Montant de réduction sur la commande | **30 %**, quantité minimale **2** articles | `BEST30` |
| **T-shirt offert** | Achetez X, obtenez Y | montant minimum d'achat = le seuil (`threshold`), le client obtient **le T-shirt** à **100 %** ; cochez « peut se combiner avec les réductions sur commande » | `TEE` |

Puis, dans **`app/config/promotions.ts`** → `bundles` :
- `offers` : renseignez le `code` de chaque offre (`DUO20`, `TRIO30`, `BEST30`) ;
- `gift.code` : le code du T-shirt (`TEE`) ;
- `gift.productHandle` : la fin de l'adresse du T-shirt offert (ex. `mugshot-tshirt-white`) ;
- `gift.threshold` : le montant (en €) à atteindre **après réduction** pour
  débloquer le T-shirt — le même que dans Shopify. Le site affiche
  « Only €5 left to unlock your free t-shirt » quand il manque 5 €.

Vous pouvez aussi changer les pourcentages, les noms, les badges
(« Popular », « Best offer ») et le nombre de pièces maximum. **Gardez les
pourcentages identiques à ceux de Shopify.**

Sécurités en place :
- le code est choisi par le serveur selon l'offre — un client ne peut pas
  s'attribuer une autre réduction ;
- si le code du T-shirt n'est pas accepté par Shopify (code absent, seuil
  plus atteint après le retrait d'une pièce…), le T-shirt est retiré du
  panier : il n'est jamais facturé ;
- les codes saisis par le client lui-même ne sont jamais retirés.

Testez chaque offre avec une commande test avant de la mettre en avant.

## 2. Le pack — 3 pièces achetées = 1 offerte

Page `/pack` + une section sur l'accueil + un lien dans le footer.

1. Shopify → **Produits → Collections → Créer une collection** nommée
   « Pack essentiel », handle **`pack-essentiel`**, avec les produits
   proposés dans le pack (au moins un haut, un bas et un longsleeve).
2. Shopify → **Réductions → Achetez X, obtenez Y** :
   - le client achète **3 articles** de la collection `pack-essentiel` ;
   - le client obtient **1 article** : le produit offert, à **100 %**
     (« Gratuit ») ;
   - code, par exemple `PACK3`.
3. Dans `promotions.ts` → `pack` : `enabled: true`, `code: 'PACK3'`,
   `freeProductHandle: '…'` = la fin de l'URL du produit offert
   (ex. `hustle-zip-black`).

Les pièces sont classées automatiquement (haut / bas / longsleeve) d'après leur
nom et leur type de produit dans Shopify.

## 3. Pop-up de bienvenue — −15 % contre un numéro de téléphone

S'ouvre une fois par visiteur. Les numéros sont enregistrés dans Notion.

1. Shopify → **Réductions** : créez le code (ex. `BIENVENUE15`, 15 %,
   une utilisation par client).
2. Notion : créez une base de données avec les colonnes
   **Téléphone** (titre), **Code promo** (texte), **Langue** (sélection),
   **Date d'inscription** (date de création). Créez une intégration sur
   https://www.notion.so/my-integrations, puis partagez la base avec elle.
3. Vercel → projet **hustle-studio** → **Settings → Environment Variables** :
   - `NOTION_API_KEY` : le secret de l'intégration (cochez *Sensitive*) ;
   - `NOTION_PHONE_DATABASE_ID` : l'identifiant de la base (les 32
     caractères dans son URL).
4. Dans `promotions.ts` → `welcomePopup` : `enabled: true`,
   `code: 'BIENVENUE15'`, `percent: 15`.

Tant que les variables Notion ne sont pas sur Vercel, la pop-up reste cachée.

## 4. Avis clients

Deux sources, toutes deux **réelles uniquement** :

- **Étoiles** sur les fiches et les cartes produits : installez une app
  d'avis Shopify (« Shopify Product Reviews », Judge.me…). Les notes
  apparaissent automatiquement sur le site, sans code.
- **Carrousel d'avis** (accueil et fiches produits) : ajoutez les avis de vos
  clients dans **`app/data/reviews.ts`**, mot pour mot et avec leur accord.
  Tant que la liste est vide, le carrousel est masqué.

Le formulaire **`/reviews`** (« laisser un avis ») envoie les avis reçus par
e-mail. Il faut pour cela, sur Vercel :
- `RESEND_API_KEY` : clé d'un compte https://resend.com (gratuit), créé avec
  l'adresse qui doit recevoir les avis ;
- `NOTIFICATION_EMAIL` : cette même adresse.

⚠️ Des avis inventés, ou repris d'une autre marque, constituent une pratique
commerciale trompeuse (Code de la consommation, art. L121-4) : ne publiez que
de vrais avis Hustle Studio.

## 5. Vidéos « portées »

Carrousel de vidéos verticales sur chaque fiche produit.

1. Déposez vos vidéos (9:16, MP4, moins de ~5 Mo chacune) dans
   `public/videos/`.
2. Listez-les dans **`app/config/videos.ts`** :
   `{src: '/videos/zip-gris.mp4', label: 'Hustle Zip gris, porté'}`.

N'utilisez que vos propres vidéos, ou celles de créateurs qui vous ont donné
leur accord. Les clips téléchargés depuis les comptes TikTok d'autres
marques ne peuvent pas être réutilisés.
