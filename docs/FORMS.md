# Formulaires du site (Resend)

Le site n'a aucune autre connexion que Vercel et, pour les formulaires,
[Resend](https://resend.com), qui envoie chaque envoi par e-mail à
**alexian.orh@gmail.com** (`INBOX` dans `app/config/inbox.ts`).

| Formulaire | Où | E-mail reçu |
| --- | --- | --- |
| Contact | `/contact` (`app/routes/contact.tsx`) | « Contact — nom » |
| Newsletter | pied de page (`app/components/Newsletter.tsx`) | « Newsletter — e-mail » |
| Pop-up -15 % | à la première visite (`app/components/NewsletterPopup.tsx`) | « Pop-up -15% — numéro » |

Le visiteur n'est remercié **que** si Resend a accepté l'e-mail : sinon le
formulaire affiche une erreur, il ne fait jamais semblant.

## Mise en place

1. Compte gratuit sur https://resend.com **avec l'adresse
   alexian.orh@gmail.com** (sans domaine vérifié, Resend ne livre qu'à
   l'adresse du compte).
2. Resend → API Keys → Create API key (« Sending access »), copier `re_…`.
3. Vercel → projet **hustle-studio** → Settings → Environment Variables →
   `RESEND_API_KEY` = la clé (Production), puis redéployer.

Facultatif : `NOTIFICATION_EMAIL` remplace l'adresse de destination. Pour
envoyer depuis votre propre domaine au lieu de `onboarding@resend.dev`,
vérifiez le domaine dans Resend.

## Pop-up -15 %

Réglages dans `app/config/promotions.ts` (`welcomePopup`). Caché sans
`RESEND_API_KEY`, ou avec `enabled: false`. Le site ne vend plus en ligne :
le code (`WELCOME15`) ne vaut que là où vous l'acceptez (en boutique).

## Protection

Contact et newsletter : vérifications côté serveur (format, longueurs). Pour
une protection plus forte, activez Bot Protection (Vercel → Firewall).
