# Pop-up -15 % — inscriptions dans un Google Sheet

Le pop-up offre **-15 % sur la première commande** (code `HUSTLE15`, dans
`app/config/promotions.ts`) contre un **e-mail et/ou un numéro de téléphone**.

Chaque inscription est enregistrée :

1. dans le **Google Sheet** « Hustle Studio — Inscriptions pop-up -15% »
   (Google Drive d’alexian.orh@gmail.com) — une ligne par inscription :
   date, e-mail, téléphone, langue, code, source ;
2. par **e-mail** à alexian.orh@gmail.com (copie de secours, via Resend) ;
3. dans **Shopify → Clients** (e-mail avec consentement marketing).

Le code n’est montré au visiteur qu’une fois l’inscription enregistrée (Sheet
ou e-mail).

## Brancher le Google Sheet (une seule fois, ~3 minutes)

1. Ouvre le Google Sheet → menu **Extensions → Apps Script**.
2. Efface tout le code affiché et colle celui-ci :

   ```js
   function doPost(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
     var d = JSON.parse(e.postData.contents);
     sheet.appendRow([d.date, d.email, d.phone, d.locale, d.code, d.source]);
     return ContentService.createTextOutput(JSON.stringify({ok: true}))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

3. Clique sur **Enregistrer** (icône disquette).
4. **Déployer → Nouveau déploiement** → roue dentée → **Application Web** :
   - Exécuter en tant que : **Moi**
   - Qui a accès : **Tout le monde**
   - **Déployer**, puis **Autoriser l’accès** (choisis ton compte Google →
     « Paramètres avancés » → « Accéder au projet » → **Autoriser**).
5. Copie l’**URL de l’application Web** (elle se termine par `/exec`).
6. Vercel → projet **hustle-studio** → Settings → Environment Variables →
   **Add Environment Variable** :
   - Key : `GOOGLE_SHEET_WEBHOOK_URL`
   - Value : l’URL copiée
   - Type : **Secret**, Environment : **Production** → **Save**
7. Redéployer (ou demander à Claude de le faire).

L’URL est gardée côté serveur (variable d’environnement) : elle n’apparaît
jamais dans le site.

## Le code de réduction

Crée dans Shopify → **Remises → Créer une remise → Montant de réduction sur
la commande** :

- Code : `HUSTLE15`
- Valeur : **Pourcentage, 15**
- Éligibilité : clients **n’ayant pas encore passé de commande**
- Limite : **une utilisation par client**

Pour changer le code ou le pourcentage : `app/config/promotions.ts` →
`welcomePopup`. Pour couper le pop-up : `enabled: false`.
