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

## 1. « Prenez-en deux » — −30 % sur la 2ᵉ pièce

Affiché sous les boutons d'achat de chaque fiche produit. Le code est ajouté
automatiquement au panier dès 2 articles.

1. Shopify → **Réductions → Créer une réduction → Montant de réduction sur
   les produits** (ou « Achetez X, obtenez Y »).
2. Méthode : **Code de réduction**, par exemple `DUO30`.
3. Valeur : **30 %**, s'applique à **tous les produits**.
4. Conditions : **quantité minimale d'articles : 2**.
5. Dans `promotions.ts` → `secondItem` : `enabled: true`, `code: 'DUO30'`,
   `percent: 30` (le même chiffre que dans Shopify).

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

## 3. Offre par paliers — 2ᵉ pièce −20 %, 3ᵉ −30 %

Une simple ligne de texte sous les prix. La réduction elle-même doit venir
d'une application de remises par paliers installée dans Shopify.
**Ne l'activez pas en même temps que « Prenez-en deux »** : les deux offres
se contredisent.

Dans `promotions.ts` → `tiers` : `enabled: true` (et ajustez `percents`).

## 4. Pop-up de bienvenue — −15 % contre un numéro de téléphone

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

## 5. Avis clients

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

## 6. Vidéos « portées »

Carrousel de vidéos verticales sur chaque fiche produit.

1. Déposez vos vidéos (9:16, MP4, moins de ~5 Mo chacune) dans
   `public/videos/`.
2. Listez-les dans **`app/config/videos.ts`** :
   `{src: '/videos/zip-gris.mp4', label: 'Hustle Zip gris, porté'}`.

N'utilisez que vos propres vidéos, ou celles de créateurs qui vous ont donné
leur accord. Les clips téléchargés depuis les comptes TikTok d'autres
marques ne peuvent pas être réutilisés.
