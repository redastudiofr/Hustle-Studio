# Connecter Shopify et mettre le site en ligne sur Vercel

Ce guide ne demande aucune connaissance technique particulière. Comptez
environ 20 minutes.

> **Règle d'or :** ne collez jamais un token ou un secret dans un fichier
> envoyé sur GitHub, ni dans une conversation. Ils vont uniquement dans le
> fichier `.env` sur votre ordinateur et dans les réglages de Vercel.

---

## Étape 1 — Installer l'application « Headless » dans Shopify

Le site communique avec Shopify par la **Storefront API**. Pour obtenir les
accès, on installe l'application gratuite **Headless** (éditée par Shopify).
C'est l'alternative au canal Hydrogen quand le site est hébergé ailleurs que
chez Shopify, ici sur Vercel.

1. Ouvrez **admin.shopify.com** et connectez-vous à la boutique
   **Hustle Studio**.
2. Allez sur la page de l'application Headless :
   **https://apps.shopify.com/headless**, puis cliquez sur **Installer**.
   (Ou : *Paramètres* → *Applications et canaux de vente* → *Shopify App
   Store* → recherchez « Headless ».)
3. Une fois installée, ouvrez **Headless** dans le menu de gauche (sous
   *Canaux de vente*) et cliquez sur **Créer une vitrine**
   (*Create storefront*).
4. Nommez-la par exemple « Site Hustle Studio ».

## Étape 2 — Récupérer les tokens de la Storefront API

Dans la vitrine que vous venez de créer, section **Storefront API** :

| Ce que Shopify affiche | Nom de la variable |
| --- | --- |
| **Public access token** | `PUBLIC_STOREFRONT_API_TOKEN` |
| **Private access token** (cliquez sur l'œil pour l'afficher) | `PRIVATE_STOREFRONT_API_TOKEN` |

Dans **Permissions** de la Storefront API, vérifiez que sont cochés au
minimum : lecture des produits et collections, lecture de l'inventaire
(pour afficher le stock), panier / checkout, et
« unauthenticated_write_customers » (inscription à la newsletter).

**`PUBLIC_STOREFRONT_ID`** (facultatif, pour les statistiques Shopify) : c'est
le numéro à la fin de l'adresse de la page de votre vitrine Headless dans
votre navigateur (par exemple `…/headless_storefronts/1000123456` →
`1000123456`).

## Étape 3 — Récupérer le domaine de la boutique

1. Dans Shopify : **Paramètres** → **Domaines**.
2. Repérez l'adresse qui se termine par **`.myshopify.com`**
   (par exemple `hustle-studio.myshopify.com`).

| Valeur | Variables |
| --- | --- |
| `hustle-studio.myshopify.com` (sans `https://`) | `PUBLIC_STORE_DOMAIN` et `PUBLIC_CHECKOUT_DOMAIN` |

⚠️ Ce n'est **pas** `admin.shopify.com`. L'admin sert à gérer la boutique,
le site ne s'y connecte jamais.

## Étape 4 — Créer le secret de session

`SESSION_SECRET` est une longue suite de caractères aléatoires, que vous
inventez vous-même. Pour en générer une :

- avec un terminal : `openssl rand -hex 32`
- ou sur https://1password.com/password-generator (64 caractères, sans
  symboles).

Gardez-la pour l'étape 6. Ne la réutilisez nulle part ailleurs.

## Étape 5 — Essayer en local (facultatif)

Sur votre ordinateur, dans le dossier du projet :

1. Copiez `.env.example` et renommez la copie en `.env`.
2. Ouvrez `.env` et remplissez les valeurs des étapes 2 à 4 :

   ```env
   PUBLIC_STORE_DOMAIN=hustle-studio.myshopify.com
   PUBLIC_STOREFRONT_API_TOKEN=…
   PRIVATE_STOREFRONT_API_TOKEN=…
   SESSION_SECRET=…
   PUBLIC_CHECKOUT_DOMAIN=hustle-studio.myshopify.com
   PUBLIC_STOREFRONT_ID=…
   ```

3. Lancez :

   ```bash
   npm install
   npm run dev
   ```

4. Ouvrez http://localhost:3000 : vos vrais produits doivent apparaître.

`.env` est ignoré par Git : il ne partira jamais sur GitHub.

## Étape 6 — Mettre en ligne sur Vercel

1. Sur **vercel.com**, cliquez sur **Add New… → Project**.
2. Importez le dépôt GitHub **redastudiofr/Hustle-Studio**.
3. Laissez **Framework Preset** sur **Other**. Le fichier `vercel.json`
   du projet règle déjà les commandes d'installation et de build.
4. Ouvrez **Environment Variables** et ajoutez une par une, pour
   **Production** et **Preview** :

   | Nom | Valeur |
   | --- | --- |
   | `PUBLIC_STORE_DOMAIN` | étape 3 |
   | `PUBLIC_CHECKOUT_DOMAIN` | étape 3 |
   | `PUBLIC_STOREFRONT_API_TOKEN` | étape 2 |
   | `PRIVATE_STOREFRONT_API_TOKEN` | étape 2 (cochez **Sensitive**) |
   | `SESSION_SECRET` | étape 4 (cochez **Sensitive**) |
   | `PUBLIC_STOREFRONT_ID` | étape 2 (facultatif) |

5. Cliquez sur **Deploy**. Au bout d'environ 2 minutes, Vercel donne une
   adresse du type `hustle-studio.vercel.app`.

Si une variable manque, le site affiche « La boutique est momentanément
indisponible », et le détail apparaît dans Vercel → *Logs*.

## Étape 7 — Votre nom de domaine

1. Vercel → votre projet → **Settings → Domains** → ajoutez par exemple
   `hustlestudio.fr` et suivez les instructions DNS.
2. **Important pour le paiement :** le checkout reste chez Shopify. Dans
   Shopify → *Paramètres → Domaines*, **ne faites pas pointer
   `hustlestudio.fr` vers Shopify**, puisqu'il pointe vers Vercel. Deux
   options :
   - laisser le checkout sur `hustle-studio.myshopify.com` (rien à faire) ;
   - ou connecter un sous-domaine à Shopify, par exemple
     `checkout.hustlestudio.fr`, le définir comme domaine principal dans
     Shopify, puis mettre cette valeur dans `PUBLIC_CHECKOUT_DOMAIN` sur
     Vercel.
3. Renseignez l'adresse finale dans `app/config/brand.ts` → `siteUrl`
   (utilisée pour le SEO).

## Étape 8 — Vérifier que tout fonctionne

1. Les produits, les photos et les prix correspondent à ceux de l'admin
   Shopify.
2. Sur une fiche produit, changer la taille ou la couleur met à jour le
   prix et le stock ; une variante épuisée ne peut pas être ajoutée.
3. Ajouter au panier, modifier la quantité, supprimer : le compteur et le
   sous-total suivent.
4. **Passer au paiement** ouvre le checkout Shopify avec le bon produit, la
   bonne variante et la bonne quantité. Faites une commande test avec le
   *mode test* de Shopify Payments ou le *Bogus Gateway*, puis annulez-la.

Si le checkout affiche la page « mot de passe » de la boutique : dans
Shopify → *Canaux de vente → Boutique en ligne → Préférences*, vérifiez la
protection par mot de passe. Un forfait payant est nécessaire pour que les
clients puissent payer.

---

## Facultatif — Comptes clients (`/account`)

Sans configuration, l'icône « compte » est simplement masquée. Pour
l'activer :

1. Shopify → **Paramètres → Comptes clients** : choisissez les
   « nouveaux comptes clients ».
2. Headless → votre vitrine → **Customer Account API** :
   - notez le **Client ID** → variable `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID` ;
   - notez l'identifiant numérique de la boutique (visible dans l'URL des
     endpoints, `shopify.com/<ce numéro>/…`) → variable `SHOP_ID` ;
   - dans **Application setup**, ajoutez :
     - *Callback URI* : `https://VOTRE-DOMAINE/account/authorize`
     - *JavaScript origin* : `https://VOTRE-DOMAINE`
     - *Logout URI* : `https://VOTRE-DOMAINE`
3. Ajoutez les deux variables sur Vercel, puis redéployez.

## Facultatif — Collections de la page d'accueil

Créez dans Shopify (*Produits → Collections*) les collections dont les
*handles* sont utilisés dans `app/config/home.ts` :

- `new-arrivals` (nouveautés)
- `best-sellers` (meilleures ventes)

Tant qu'elles n'existent pas, la page d'accueil affiche automatiquement
les produits les plus récents et les meilleures ventes calculées par
Shopify.
