import type {Locale} from './locale';

/**
 * Every string the site shows, in both languages.
 *
 * One flat map keyed by a dotted path. Flat rather than nested because the
 * only operation is lookup, and a flat map makes "is anything missing?" a
 * one-line check — which `npm run typecheck` now performs for us: `fr` is
 * typed as a complete record of the English keys, so a forgotten translation
 * is a build error rather than an English word on a French page.
 */

export const en = {
  // — header / nav —
  'nav.home': 'home',
  'nav.menu': 'menu',
  'nav.openMenu': 'Open menu',
  'nav.close': 'Close',
  'nav.language': 'Language',
  'nav.settings': 'settings',

  // — help / faq —
  'faq.contactPage': 'contact page',
  'legal.eyebrow': 'legal',
  'legal.documents': 'documents',
  'legal.updated': 'last updated',
  'legal.question': 'a question about these terms? write to us from the',

  // — newsletter —
  'news.title': 'newsletter',
  'news.pitch1': 'new drops, restocks and private sales — first.',
  'news.pitch2': 'no spam, unsubscribe anytime.',
  'news.firstName': 'first name (optional)',
  'news.firstNameLabel': 'first name',
  'news.placeholder': 'email',
  'news.emailLabel': 'email',
  'news.subscribe': 'sign up',
  'news.thanks': 'thank you — you’re in.',
  'news.error': 'something went wrong, please try again.',

  // — volume offer (see app/lib/tierDiscount.ts) and the signature pack —
  'faqPage.title': 'frequently asked questions',
  'faqPage.intro': 'the questions we are asked most often about {brand}.',
  'faqPage.groupPieces': 'the pieces',
  // — FAQ content (app/data/faq.tsx) —
  'faqData.compositionQ': 'composition',
  'faqData.compositionA':
    'the exact composition of this piece — materials and percentages — is printed on the label sewn inside the garment.',
  'faqData.manufacturingQ': 'where is it made?',
  'faqData.manufacturingA':
    'the country of manufacture is printed on the label sewn inside the garment.',
  'faqData.careQ': 'care',
  'faqData.careA':
    'wash inside out at a low temperature, and follow the specific instructions printed on the garment’s label.',
  'about.eyebrowStory': 'our story',
  'about.lead': '{brand} is an independent streetwear brand, born in Nantes.',
  'about.manifesto': 'built for the ambitious.',
  'about.pillar1Title': 'nantes',
  'about.pillar1Body':
    'born here, built here. an independent brand, with no group behind it.',
  'about.pillar2Title': 'ambition',
  'about.pillar2Body':
    'for the ones who build their own path and look further than the next season.',
  'about.pillar3Title': 'minimalism',
  'about.pillar3Body':
    'clean cuts, a strong identity, details you notice up close.',
  'about.storeEyebrow': 'the store',
  'about.storeTitle': 'come see us in nantes',
  'about.storeBody':
    '{brand} also has a store in Nantes. come try the pieces on and talk streetwear with us.',
  'about.storeAddress': 'address',
  'about.storeHours': 'opening hours',
  'about.storeMaps': 'open in maps',

  // — shared bits of furniture: rails, gallery, pagination —
  'contact.title': 'contact',
  'contact.intro':
    'a question about an order, a piece or a collaboration? write to us.',
  'contact.name': 'name',
  'contact.email': 'email',
  'contact.message': 'message',
  'contact.send': 'send',
  'contact.sending': 'sending…',
  'contact.thanks': 'thank you — your message has been sent.',
  'contact.errorFields': 'please fill in every field.',
  'contact.errorSend': 'sending failed, please try again later.',
  'notFound.text': 'this page doesn’t exist or is no longer available.',
  'notFound.back': 'back to home',

  // — footer —
  'footer.blurb': '{brand} — independent streetwear, born in Nantes.',
  'footer.info': 'help',
  'footer.policies': 'policies',
  'footer.faq': 'faq',
  'footer.contact': 'contact',
  'footer.privacy': 'privacy policy',
  'footer.legalNotice': 'legal notice',

  // — added for Hustle Studio —
  'notFound.title': 'page not found',
  'error.title': 'something went wrong',
  'error.text':
    'the store could not load this page. please try again in a moment.',
  'footer.about': 'about',

  // — promotions, reviews, videos —
  'popup.alreadyRegistered':
    'this number is already registered — here is your code',
  'popup.apply': 'apply to my cart',
  'popup.codeHint':
    'enter it at checkout, or apply it to your cart in one click.',
  'popup.codeLabel': 'your promo code',
  'popup.copied': 'code copied',
  'popup.copy': 'copy the code',
  'popup.copyFailed': 'select the code above to copy it.',
  'popup.cta': 'get my -{percent}% code',
  'popup.digitsTyped': '{count} digits received',
  'popup.error': 'we couldn’t save your number. please try again in a moment.',
  'popup.fineprint':
    'exclusive offers by SMS only. unsubscribe anytime, reply STOP.',
  'popup.invalidPhone':
    'this number doesn’t look right: a French mobile has 10 digits, e.g. 06 12 34 56 78.',
  'popup.phoneLabel': 'phone number',
  'popup.phonePlaceholder': 'e.g. 06 12 34 56 78',
  'popup.text':
    'leave your phone number and get your -{percent}% code instantly.',
  'popup.title': '-{percent}% off your first order',
} as const;

export type TranslationKey = keyof typeof en;

/**
 * The French side. Typed as a complete record of the English keys, so
 * forgetting one is a compile error.
 */
export const fr: Record<TranslationKey, string> = {
  // — en-tête / navigation —
  'nav.home': 'accueil',
  'nav.menu': 'menu',
  'nav.openMenu': 'Ouvrir le menu',
  'nav.close': 'Fermer',
  'nav.language': 'Langue',
  'nav.settings': 'paramètres',

  // — aide / faq —
  'faq.contactPage': 'page contact',
  'legal.eyebrow': 'informations légales',
  'legal.documents': 'documents',
  'legal.updated': 'dernière mise à jour :',
  'legal.question': 'une question sur ces conditions ? écrivez-nous depuis la',

  // — newsletter / pop-up —
  'news.title': 'newsletter',
  'news.pitch1':
    'nouveaux drops, réassorts et ventes privées — en avant-première.',
  'news.pitch2': 'pas de spam, désinscription en un clic.',
  'news.firstName': 'prénom (facultatif)',
  'news.firstNameLabel': 'prénom',
  'news.placeholder': 'e-mail',
  'news.emailLabel': 'e-mail',
  'news.subscribe': 's’inscrire',
  'news.thanks': 'merci — vous êtes inscrit.',
  'news.error': 'une erreur est survenue, réessayez.',

  // — offre par paliers (voir app/lib/tierDiscount.ts) et pack signature —
  'faqPage.title': 'questions fréquentes',
  'faqPage.intro': 'les questions qu’on nous pose le plus souvent sur {brand}.',
  'faqPage.groupPieces': 'les pièces',
  // — contenu de la FAQ (app/data/faq.tsx) —
  'faqData.compositionQ': 'composition',
  'faqData.compositionA':
    'la composition exacte de cette pièce — matières et pourcentages — est indiquée sur l’étiquette cousue à l’intérieur du vêtement.',
  'faqData.manufacturingQ': 'où est-ce fabriqué ?',
  'faqData.manufacturingA':
    'le pays de fabrication est indiqué sur l’étiquette cousue à l’intérieur du vêtement.',
  'faqData.careQ': 'entretien',
  'faqData.careA':
    'lavez sur l’envers à basse température, et suivez les instructions indiquées sur l’étiquette du vêtement.',
  'about.eyebrowStory': 'notre histoire',
  'about.lead':
    '{brand} est une marque de streetwear indépendante, née à Nantes.',
  'about.manifesto': 'built for the ambitious.',
  'about.pillar1Title': 'nantes',
  'about.pillar1Body':
    'née ici, construite ici. une marque indépendante, sans groupe derrière elle.',
  'about.pillar2Title': 'ambition',
  'about.pillar2Body':
    'pour celles et ceux qui tracent leur propre chemin et voient plus loin que la prochaine saison.',
  'about.pillar3Title': 'minimalisme',
  'about.pillar3Body':
    'des coupes nettes, une identité affirmée, des détails qu’on remarque de près.',
  'about.storeEyebrow': 'le magasin',
  'about.storeTitle': 'venez nous voir à nantes',
  'about.storeBody':
    '{brand} a aussi un magasin à Nantes. venez essayer les pièces et parler streetwear avec nous.',
  'about.storeAddress': 'adresse',
  'about.storeHours': 'horaires',
  'about.storeMaps': 'ouvrir dans maps',

  // — éléments partagés : carrousels, galerie, pagination —
  'contact.title': 'contact',
  'contact.intro':
    'une question sur une commande, une pièce ou une collaboration ? écrivez-nous.',
  'contact.name': 'nom',
  'contact.email': 'e-mail',
  'contact.message': 'message',
  'contact.send': 'envoyer',
  'contact.sending': 'envoi…',
  'contact.thanks': 'merci — votre message a bien été envoyé.',
  'contact.errorFields': 'merci de remplir tous les champs.',
  'contact.errorSend': 'l’envoi a échoué, réessayez plus tard.',
  'notFound.text': 'cette page n’existe pas ou n’est plus disponible.',
  'notFound.back': 'retour à l’accueil',

  // — pied de page —
  'footer.blurb': '{brand} — streetwear indépendant, né à Nantes.',
  'footer.info': 'aide',
  'footer.policies': 'informations légales',
  'footer.faq': 'faq',
  'footer.contact': 'contact',
  'footer.privacy': 'politique de confidentialité',
  'footer.legalNotice': 'mentions légales',

  // — ajouts Hustle Studio —
  'notFound.title': 'page introuvable',
  'error.title': 'un problème est survenu',
  'error.text':
    'la boutique n’a pas pu charger cette page. réessayez dans un instant.',
  'footer.about': 'à propos',

  // — promotions, avis, vidéos —
  'popup.alreadyRegistered': 'ce numéro est déjà inscrit — voici votre code',
  'popup.apply': 'appliquer à mon panier',
  'popup.codeHint':
    'à saisir au paiement, ou à appliquer à votre panier en un clic.',
  'popup.codeLabel': 'votre code promo',
  'popup.copied': 'code copié',
  'popup.copy': 'copier le code',
  'popup.copyFailed': 'sélectionnez le code ci-dessus pour le copier.',
  'popup.cta': 'recevoir mon code -{percent} %',
  'popup.digitsTyped': '{count} chiffres reçus',
  'popup.error':
    'votre numéro n’a pas pu être enregistré. réessayez dans un instant.',
  'popup.fineprint':
    'offres exclusives par sms uniquement. désinscription à tout moment en répondant stop.',
  'popup.invalidPhone':
    'numéro invalide : un portable français compte 10 chiffres, ex. 06 12 34 56 78.',
  'popup.phoneLabel': 'numéro de téléphone',
  'popup.phonePlaceholder': 'ex. 06 12 34 56 78',
  'popup.text':
    'laissez votre numéro et recevez votre code -{percent} % immédiatement.',
  'popup.title': '-{percent} % sur votre première commande',
};

export const DICTIONARIES: Record<Locale, Record<TranslationKey, string>> = {
  en,
  fr,
};
