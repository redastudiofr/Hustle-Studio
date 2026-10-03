import type {Locale} from './locale';

/**
 * Every string the storefront owns, in both languages.
 *
 * One flat map keyed by a dotted path. Flat rather than nested because the
 * only operation is lookup, and a flat map makes "is anything missing?" a
 * one-line check — which `npm run typecheck` now performs for us: `fr` is
 * typed as a complete record of the English keys, so a forgotten translation
 * is a build error rather than an English word on a French page.
 *
 * What is NOT here, and cannot be: product titles, product descriptions and
 * collection names. Those live in Shopify and are translated in Shopify Admin
 * (Translate & Adapt). The storefront asks for them in the right language —
 * see `shopifyLanguage` — but it cannot invent a translation the merchant has
 * not published. Same for the checkout, which is Shopify's own page.
 */

export const en = {
  // — header / nav —
  'nav.home': 'home',
  'nav.drops': 'drops',
  'nav.track': 'track my order',
  'nav.menu': 'menu',
  'nav.openMenu': 'Open menu',
  'nav.search': 'Search',
  'nav.close': 'Close',
  'nav.language': 'Language',
  'nav.currency': 'Currency',
  'nav.settings': 'settings',

  // — home —
  'home.shopNow': 'shop now',
  'home.viewAll': 'view all',

  // — collections —
  'collections.eyebrow': 'shop',
  'collections.title': 'all collections',
  'collections.intro':
    "every piece we make, sorted. tap a collection to see what's in it.",
  'collections.empty': 'no collections published yet. everything we have is in',
  'collections.browseAll': 'browse all products',

  // — product —
  'product.addToCart': 'add to cart',
  'product.buyNow': 'buy now',
  'product.soldOut': 'sold out',
  'product.saleBadge': 'sale',
  'product.adding': 'adding…',
  'product.inStock': 'in stock',
  'product.lowStock': 'only {count} left in stock',
  'product.taxIncluded': 'taxes included ·',
  'product.shipping': 'shipping',
  'product.calculatedAtCheckout': 'calculated at checkout.',
  'product.quantity': 'quantity',
  'product.sizeGuide': 'size guide',
  'product.description': 'description',
  'product.youMightLike': 'you might also like',
  'product.faqTitle': 'frequently asked questions',
  'product.perk.delivery': 'tracked delivery',
  'product.perk.returns': 'returns & exchanges — see our policy',
  'product.perk.payment': 'secure checkout by shopify',

  // — offer —

  // — cart —
  'cart.title': 'cart',
  'cart.empty': 'your cart is empty.',
  'cart.continue': 'continue shopping',
  'cart.remove': 'remove',
  'cart.subtotal': 'subtotal',
  'cart.taxNote': 'taxes included · shipping calculated at checkout',
  'cart.checkout': 'proceed to checkout',
  'cart.promoCode': 'promo code',
  'cart.apply': 'ok',
  'cart.freeShippingAway': '{amount} away from free shipping',
  'cart.freeShippingUnlocked': 'free shipping unlocked ✓',
  'cart.suggestTitle': 'complete your order',
  'cart.add': 'add',

  // — reviews —

  // — write a review —

  // — help / faq —
  'faq.eyebrow': 'support',
  'faq.title': 'need help?',
  'faq.shipping': 'shipping times',
  'faq.shippingBody':
    'we prepare and ship every order within 1 to 3 business days. once it leaves our paris studio, delivery takes 48 hours anywhere in france, with tracking on every parcel, and 3 to 5 days worldwide — follow yours on the',
  'faq.trackingPage': 'order tracking page',
  'faq.returns': 'returns & exchanges',
  'faq.returnsBody1':
    'returns and exchanges are accepted within 30 days of delivery, on unworn pieces in their original packaging.',
  'faq.returnsBody2':
    'your refund is issued as soon as the item reaches us and has been checked. the full procedure is on our',
  'faq.returnsPage': 'returns page',
  'faq.legal': 'terms & policies',
  'faq.legalBody': 'our terms are available at any time:',
  'faq.terms': 'terms & conditions',
  'faq.privacy': 'privacy policy',
  'faq.shippingPolicy': 'shipping policy',
  'faq.and': 'and',
  'faq.support': 'support',
  'faq.supportBody':
    'a question about sizing, an order in progress or a return? write to us from the',
  'faq.contactPage': 'contact page',
  'legal.eyebrow': 'legal',
  'legal.documents': 'documents',
  'legal.updated': 'last updated',
  'legal.question': 'a question about these terms? write to us from the',
  'faq.supportBodyEnd': 'and we reply within 24 business hours.',

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
  'cookies.title': 'cookies',
  'cookies.text':
    'we use cookies for the cart, your language and anonymous visit statistics. no advertising trackers.',
  'cookies.accept': 'accept',
  'cookies.accepted': 'accepted',
  'cookies.essential': 'essential only',
  'cookies.more': 'privacy policy',
  'faqPage.title': 'frequently asked questions',
  'faqPage.intro':
    'shipping, returns, sizing, care — the questions we are asked most often about {brand}.',
  'faqPage.groupOrders': 'orders & shipping',
  'faqPage.groupPieces': 'our pieces',
  // — FAQ content (app/data/faq.tsx) —
  'faqData.shippingQ': 'how long does shipping take?',
  'faqData.shippingA':
    'delivery options, prices and estimated times are shown at checkout, before you pay. every parcel is tracked.',
  'faqData.madeQ': 'how do i choose my size?',
  'faqData.madeA':
    'each product page lists its available sizes and the cut when it is specified. between two sizes? write to us before ordering.',
  'faqData.qualityQ': 'how do i pay?',
  'faqData.qualityA':
    'payment happens on shopify’s secure checkout. we never see or store your card details.',
  'faqData.refundQ': 'can i get a refund?',
  'faqData.refundA':
    'yes, under the conditions of our refund policy, once the returned item reaches us.',
  'faqData.fitQ': 'fit & sizing',
  'faqData.fitA':
    'the cut and size guidance are given in the product description wherever they are available. if you fall between two sizes, write to us before ordering.',
  'faqData.compositionQ': 'composition',
  'faqData.compositionA':
    'the exact composition of this piece — materials and percentages — is printed on the label sewn inside the garment.',
  'faqData.manufacturingQ': 'where is it made?',
  'faqData.manufacturingA':
    'the country of manufacture is printed on the label sewn inside the garment.',
  'faqData.shipping2Q': 'shipping',
  'faqData.shipping2A':
    'prepared and shipped within 1 to 3 business days: 48 hours in france, 3 to 5 days worldwide, tracked. full details on our',
  'faqData.shippingLink': 'shipping page',
  'faqData.returnsQ': 'returns',
  'faqData.returnsA':
    'returns and exchanges within 30 days of delivery, on unworn pieces in their original packaging. full details on our',
  'faqData.returnsLink': 'returns page',
  'faqData.careQ': 'care',
  'faqData.careA':
    'wash inside out at a low temperature, and follow the specific instructions printed on the garment’s label.',
  'search.articles': 'articles',
  'search.pages': 'pages',
  'search.products': 'products',
  'search.collections': 'collections',
  'search.loadPrevious': '↑ load previous',
  'search.loadMore': 'load more ↓',
  'policies.title': 'information',
  'blogs.title': 'blog',
  'about.eyebrowStory': 'our story',
  'about.lead':
    '{brand} is a streetwear label for people who keep moving: clean cuts, quality fabrics, no noise.',
  'about.manifesto': 'the hustle is quiet. the clothes should be too.',
  'about.pillar1Title': 'ambition',
  'about.pillar1Body':
    'pieces made to keep up with people who work for what they want.',
  'about.pillar2Title': 'minimalism',
  'about.pillar2Body':
    'a restrained palette, clean lines, details you notice up close.',
  'about.pillar3Title': 'durability',
  'about.pillar3Body':
    'fewer pieces, better chosen, made to be worn for a long time.',
  'about.ctaTitle': 'discover the collection',
  'about.ctaBody': 'every available piece, straight from the studio.',
  'about.ctaButton': 'shop the collection',
  // — account area (Shopify customer accounts) —
  'account.orders': 'orders',
  'account.profile': 'profile',
  'account.addresses': 'addresses',
  'account.signOut': 'sign out',
  'account.myProfile': 'my profile',
  'account.personalInfo': 'personal information',
  'account.firstName': 'first name',
  'account.lastName': 'last name',
  'account.update': 'update',
  'account.updating': 'updating…',
  'account.noOrders': 'you haven’t placed any orders yet.',
  'account.startShopping': 'start shopping →',
  'account.noMatch': 'no orders found matching your search.',
  'account.clearFilters': 'clear filters →',
  'account.filterOrders': 'filter orders',
  'account.searchOrders': 'search orders',
  'account.orderNumber': 'order number',
  'account.confirmationNumber': 'confirmation number',
  'account.search': 'search',
  'account.searching': 'searching…',
  'account.clear': 'clear',
  'account.viewOrder': 'view order →',
  'account.product': 'product',
  'account.price': 'price',
  'account.quantity': 'quantity',
  'account.total': 'total',
  'account.discounts': 'discounts',
  'account.subtotal': 'subtotal',
  'account.tax': 'tax',
  'account.shippingAddress': 'shipping address',
  'account.noShippingAddress': 'no shipping address on this order',
  'account.status': 'status',
  'account.viewOrderStatus': 'view order status →',
  'account.createAddress': 'add an address',
  'account.noAddresses': 'you have no saved addresses.',
  'account.existingAddresses': 'saved addresses',
  'account.company': 'company',
  'account.address1': 'address',
  'account.address2': 'address line 2',
  'account.city': 'city',
  'account.province': 'state / province',
  'account.zip': 'zip / postal code',
  'account.country': 'country code',
  'account.phone': 'phone',
  'account.defaultAddress': 'set as default address',
  'account.welcome': 'welcome, {name}',
  'account.welcomeNoName': 'welcome to your account.',
  'account.details': 'account details',
  'account.confirmation': 'confirmation',
  'account.create': 'create',
  'account.creating': 'creating…',
  'account.save': 'save',
  'account.saving': 'saving…',
  'account.delete': 'delete',
  'account.deleting': 'deleting…',

  // — shared bits of furniture: rails, gallery, pagination —
  'common.loading': 'loading…',
  'common.previous': 'previous',
  'common.loadMore': 'load more',
  'rail.prevProduct': 'previous product',
  'rail.nextProduct': 'next product',
  'gallery.label': 'product images',
  'gallery.carousel': 'carousel',
  'gallery.image': 'image',
  'gallery.view': 'view image {index} of {total}',
  'gallery.position': '{index} of {total}',
  'gallery.thumbAlt': '{title} — thumbnail {index}',
  'gallery.imageAlt': '{title} — image {index}',
  'product.price': 'price',
  'cart.items': 'cart items',
  'shop.title': 'shop',
  'search.title': 'search',
  'search.placeholder': 'search for a product',
  'search.submit': 'search',
  'search.go': 'ok',
  'search.searching': 'searching…',
  'search.empty': 'no results, try a different search.',
  'search.viewAllFor': 'see all results for “{term}” →',
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

  // — pre-order waitlist (royal longsleeve — white only, see app/lib/preorder.ts) —

  // — footer —
  'footer.blurb': '{brand} — minimal, premium streetwear made to last.',
  'footer.info': 'help',
  'footer.policies': 'policies',
  'footer.faq': 'faq',
  'footer.contact': 'contact',
  'footer.shipping': 'shipping',
  'footer.returns': 'returns & refunds',
  'footer.terms': 'terms of service',
  'footer.privacy': 'privacy policy',
  'footer.legalNotice': 'legal notice',

  // — order tracking —
  'track.eyebrow': 'support',
  'track.title': 'order tracking',
  'track.intro':
    'Your order number is in your confirmation email — it looks like #1024. Enter it with the email you ordered with.',
  'track.orderNumber': 'order number',
  'track.email': 'email address',
  'track.submit': 'track order',
  'track.looking': 'looking…',
  'track.missingFields':
    'Please give both your order number and the email you ordered with.',
  'track.notFound':
    "We couldn't find order #{number} on this account. Check the number, or sign in with the account the order was placed on.",
  'track.emailMismatch': "That email doesn't match the one on order #{number}.",
  'track.gateTitle': 'one step first',
  'track.gateBody':
    "We only show order details to the person who placed the order. Confirm your email address and we'll bring you straight back here — Shopify sends you a one-time code, there is no password to remember.",
  'track.gateCta': 'confirm my email',
  'track.order': 'order',
  'track.placed': 'placed',
  'track.status': 'status',
  'track.carrier': 'carrier',
  'track.trackingNumber': 'tracking number',
  'track.shipped': 'shipped',
  'track.estimated': 'estimated delivery',
  'track.history': 'history',
  'track.parcelOf': 'parcel {index} of {total}',
  'track.pending':
    'Your order is confirmed and being prepared. A tracking number appears here as soon as it ships.',
  'track.statusPage': 'open the full order status page →',
  'track.helpTitle': "can't find your order?",
  'track.helpBody1':
    'Tracking becomes available once the parcel has left. A freshly created tracking number can also take a few hours to activate with the carrier.',
  'track.helpBody2': 'Still stuck? Write to us from the',
  'track.helpBody3':
    "and we'll look it up ourselves. Full delivery times are in our",
  'track.signedIn': "You're signed in — all your orders are in",
  'track.yourAccount': 'your account',

  // — legal —

  'cart.decrease': 'Decrease quantity',
  'cart.increase': 'Increase quantity',
  'size.available': 'available',
  'size.soldOut': 'sold out',
  'size.note1':
    'if you fall between two sizes, take the larger one for a looser fit. not sure?',
  'size.writeToUs': 'write to us',
  'size.note2': 'before ordering.',

  // — errors —

  // — added for Hustle Studio —
  'nav.shop': 'shop',
  'bundle.eyebrow': 'Bundle & save',
  'bundle.title': 'Build your set',
  'bundle.previewNote': 'Preview — these offers go live once their Shopify discount codes are connected.',
  'bundle.giftUnlocked': '{gift} unlocked — it ships with your order 🎁',
  'bundle.giftRemaining': 'Only €{amount} left to unlock your {gift} 🎁',
  'bundle.size': 'Size',
  'bundle.free': 'Free',
  'bundle.total': 'Bundle total',
  'bundle.youSave': 'You save €{amount}',
  'bundle.previewCta': 'Preview — discount code not connected yet',
  'bundle.addWithGift': 'Add the {offer} + {gift} to cart',
  'bundle.add': 'Add the {offer} — {count} pieces',
  'bundle.piece': 'Piece {n}',
  'bundle.addPiece': 'Add a piece',
  'bundle.removePiece': 'Remove a piece',
  'sizeChart.open': 'Size chart',
  'sizeChart.eyebrow': 'Size chart',
  'sizeChart.caption': 'Garment measurements by size',
  'sizeChart.size': 'Size',
  'sizeChart.howTo': 'How to measure',
  'sizeChart.availability': 'In stock now',
  'sizeChart.pending': 'Measurements for this piece are being added. Between two sizes?',
  'sizeChart.pendingEnd': 'with your height and usual size — we reply within 24 business hours.',
  'pdp.pairsEyebrow': 'Made to go with',
  'pdp.pairsView': 'View the piece',
  'pdp.price': 'Price',
  'pdp.detailsEyebrow': 'Details',
  'pdp.descriptionEyebrow': 'Description',
  'pdp.prevImage': 'Previous image',
  'pdp.nextImage': 'Next image',
  'family.pause': 'Pause',
  'family.play': 'Play',
  'product.colours': 'Colours',
  'nav.collections': 'collections',
  'nav.account': 'Account',
  'nav.cartCount': 'Cart, {count} item(s)',
  'nav.allProducts': 'all products',
  'notFound.title': 'page not found',
  'error.title': 'something went wrong',
  'error.text':
    'the store could not load this page. please try again in a moment.',
  'sort.label': 'sort by',
  'sort.featured': 'featured',
  'sort.newest': 'newest',
  'sort.best-selling': 'best sellers',
  'sort.price-asc': 'price, low to high',
  'sort.price-desc': 'price, high to low',
  'collection.empty': 'no products here yet — come back soon.',
  'footer.about': 'about',
  'footer.termsOfSale': 'terms of sale',

  // — promotions, reviews, videos —
  'cart.tierMax': '−{percent}% from the third piece onwards',
  'cart.tierNext': 'add one piece: the next one is −{percent}%',
  'cart.tierSaved': 'you save {amount} on this basket',
  'offer.addBoth': 'add both to cart',
  'offer.heading': 'the offer',
  'offer.noteAuto':
    'works with any second piece, not just this pair. no code needed — the reduction applies itself in your cart and at checkout.',
  'offer.noteCode':
    'works with any second piece, not just this pair. we add code {code} to your cart for you — it stays visible there, and you can type it in yourself at any time.',
  'offer.pick': 'pick your second piece',
  'offer.ribbon': '−{percent}% on your second piece',
  'offer.sub': 'add a second piece — any piece — and {percent}% comes off it',
  'offer.subOff': 'same aesthetic, same details',
  'offer.takeTwo': 'take two',
  'pack.add': 'add the pack to the cart',
  'pack.eyebrow': 'the pack',
  'pack.free': '+ one piece on us',
  'pack.freeSlot': 'the piece we add',
  'pack.freeTag': 'free',
  'pack.imageAlt': 'A {brand} outfit worn together',
  'pack.intro':
    'Pick a top, a bottom and a longsleeve, each in your size. Three pieces that go together, and a fourth on us.',
  'pack.model': 'model',
  'pack.offerIntro':
    'Build your pack from three pieces of your choice — a top, a bottom, a longsleeve — and a fourth piece is added, free.',
  'pack.offerTitle': '3 pieces bought = 1 free',
  'pack.piece': 'piece {n}',
  'pack.point.cart': 'The offer is applied in the cart, with the code {code}.',
  'pack.point.choice': 'The model and the size of each piece, your choice.',
  'pack.point.free': 'The free piece is added to your order automatically.',
  'pack.position': '{n} of {total}',
  'pack.size': 'size',
  'pack.swipe': 'swipe to choose',
  'pack.title': 'essential pack',
  'pack.total': 'the three pieces',
  'pack.unavailable': 'one of the pieces is sold out',
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
  'product.worn': 'your product worn',
  'rail.nextVideo': 'next video',
  'rail.prevVideo': 'previous video',
  'reviewForm.contactLink': 'contact page',
  'reviewForm.email': 'email',
  'reviewForm.error': 'something went wrong, please try again.',
  'reviewForm.intro': 'tell us what you thought — we read every one.',
  'reviewForm.missingFields': 'please fill in every required field.',
  'reviewForm.name': 'name',
  'reviewForm.product': 'product (optional)',
  'reviewForm.productPlaceholder': 'e.g. hustle zip — grey',
  'reviewForm.rating': 'rating',
  'reviewForm.sending': 'sending…',
  'reviewForm.submit': 'send my review',
  'reviewForm.text': 'your review',
  'reviewForm.thanks': 'your review has been sent — we read every one.',
  'reviewForm.title': 'write a review',
  'reviewForm.unavailable':
    'this form isn’t receiving submissions right now — write to us instead.',
  'reviews.ctaButton': 'write a review',
  'reviews.ctaText': 'seen it, worn it, loved it?',
  'reviews.forProduct': 'reviews for {product}',
  'reviews.next': 'next reviews',
  'reviews.prev': 'previous reviews',
  'reviews.subtitle': 'honest words from {brand} customers.',
  'reviews.title': 'what our customers say',
  'tier.second': 'second piece −{percent}%',
  'tier.third': 'third piece −{percent}%',
  'product.ratedOutOf': 'rated {value}/5',
  'product.fromReviews': 'from {count} reviews',
  'footer.pack': 'the pack',
  'footer.writeReview': 'write a review',
  'pack.slot.top': 'top',
  'pack.slot.bottom': 'bottom',
  'pack.slot.longsleeve': 'longsleeve',
} as const;

export type TranslationKey = keyof typeof en;

/**
 * The French side. Typed as a complete record of the English keys, so
 * forgetting one is a compile error.
 */
export const fr: Record<TranslationKey, string> = {
  // — en-tête / navigation —
  'nav.home': 'accueil',
  'nav.drops': 'drops',
  'nav.track': 'suivre ma commande',
  'nav.menu': 'menu',
  'nav.openMenu': 'Ouvrir le menu',
  'nav.search': 'Rechercher',
  'nav.close': 'Fermer',
  'nav.language': 'Langue',
  'nav.currency': 'Devise',
  'nav.settings': 'paramètres',

  // — accueil —
  'home.shopNow': 'découvrir',
  'home.viewAll': 'tout voir',

  // — collections —
  'collections.eyebrow': 'boutique',
  'collections.title': 'toutes les collections',
  'collections.intro':
    'toutes nos pièces, classées. touchez une collection pour voir ce qu’elle contient.',
  'collections.empty':
    'aucune collection publiée pour l’instant. tout ce que nous avons est dans',
  'collections.browseAll': 'voir tous les produits',

  // — produit —
  'product.addToCart': 'ajouter au panier',
  'product.buyNow': 'acheter maintenant',
  'product.soldOut': 'épuisé',
  'product.saleBadge': 'promo',
  'product.adding': 'ajout…',
  'product.inStock': 'en stock',
  'product.lowStock': 'plus que {count} en stock',
  'product.taxIncluded': 'taxes incluses ·',
  'product.shipping': 'livraison',
  'product.calculatedAtCheckout': 'calculée au paiement.',
  'product.quantity': 'quantité',
  'product.sizeGuide': 'guide des tailles',
  'product.description': 'description',
  'product.youMightLike': 'vous aimerez aussi',
  'product.faqTitle': 'questions fréquentes',
  'product.perk.delivery': 'livraison suivie',
  'product.perk.returns': 'retours & échanges — voir nos conditions',
  'product.perk.payment': 'paiement sécurisé par shopify',

  // — offre —

  // — panier —
  'cart.title': 'panier',
  'cart.empty': 'votre panier est vide.',
  'cart.continue': 'continuer mes achats',
  'cart.remove': 'retirer',
  'cart.subtotal': 'sous-total',
  'cart.taxNote': 'taxes incluses · livraison calculée au paiement',
  'cart.checkout': 'passer au paiement',
  'cart.promoCode': 'code promo',
  'cart.apply': 'ok',
  'cart.freeShippingAway': 'plus que {amount} pour la livraison offerte',
  'cart.freeShippingUnlocked': 'livraison offerte ✓',
  'cart.suggestTitle': 'complétez votre commande',
  'cart.add': 'ajouter',

  // — avis —

  // — laisser un avis —

  // — aide / faq —
  'faq.eyebrow': 'assistance',
  'faq.title': 'besoin d’aide ?',
  'faq.shipping': 'délai de livraison',
  'faq.shippingBody':
    'nous préparons et expédions toutes les commandes sous 1 à 3 jours ouvrés. une fois partie de notre studio parisien, la livraison prend 48 h partout en france, avec un suivi sur chaque colis, et entre 3 et 5 jours à travers le monde — suivez le vôtre sur la',
  'faq.trackingPage': 'page de suivi de commande',
  'faq.returns': 'retours & échanges',
  'faq.returnsBody1':
    'les retours et échanges sont acceptés sous 30 jours après réception, sur des pièces non portées dans leur emballage d’origine.',
  'faq.returnsBody2':
    'le remboursement intervient dès que l’article nous parvient et a été vérifié. la procédure complète est sur notre',
  'faq.returnsPage': 'page retours',
  'faq.legal': 'mentions et conditions',
  'faq.legalBody': 'nos conditions sont consultables à tout moment :',
  'faq.terms': 'conditions générales',
  'faq.privacy': 'politique de confidentialité',
  'faq.shippingPolicy': 'politique d’expédition',
  'faq.and': 'et',
  'faq.support': 'assistance',
  'faq.supportBody':
    'une question sur une taille, une commande en cours ou un retour ? écrivez-nous depuis la',
  'faq.contactPage': 'page contact',
  'legal.eyebrow': 'informations légales',
  'legal.documents': 'documents',
  'legal.updated': 'dernière mise à jour :',
  'legal.question': 'une question sur ces conditions ? écrivez-nous depuis la',
  'faq.supportBodyEnd': 'et nous répondons sous 24 h ouvrées.',

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
  'cookies.title': 'cookies',
  'cookies.text':
    'nous utilisons des cookies pour le panier, votre langue et des statistiques de visite anonymes. aucun traceur publicitaire.',
  'cookies.accept': 'accepter',
  'cookies.accepted': 'accepté',
  'cookies.essential': 'essentiels uniquement',
  'cookies.more': 'politique de confidentialité',
  'faqPage.title': 'questions fréquentes',
  'faqPage.intro':
    'livraison, retours, tailles, entretien — les questions qu’on nous pose le plus souvent sur {brand}.',
  'faqPage.groupOrders': 'commandes et livraison',
  'faqPage.groupPieces': 'nos pièces',
  // — contenu de la FAQ (app/data/faq.tsx) —
  'faqData.shippingQ': 'quels sont les délais de livraison ?',
  'faqData.shippingA':
    'les options, tarifs et délais estimés de livraison sont affichés au paiement, avant de payer. chaque colis est suivi.',
  'faqData.madeQ': 'comment choisir ma taille ?',
  'faqData.madeA':
    'chaque fiche produit indique les tailles disponibles et la coupe quand elle est précisée. entre deux tailles ? écrivez-nous avant de commander.',
  'faqData.qualityQ': 'comment payer ?',
  'faqData.qualityA':
    'le paiement se fait sur le checkout sécurisé de shopify. nous ne voyons ni ne stockons jamais vos données bancaires.',
  'faqData.refundQ': 'puis-je être remboursé ?',
  'faqData.refundA':
    'oui, selon les conditions de notre politique de retour, à réception de l’article retourné.',
  'faqData.fitQ': 'coupe et taille',
  'faqData.fitA':
    'la coupe et les conseils de taille figurent dans la description du produit quand ils sont disponibles. entre deux tailles ? écrivez-nous avant de commander.',
  'faqData.compositionQ': 'composition',
  'faqData.compositionA':
    'la composition exacte de cette pièce — matières et pourcentages — est indiquée sur l’étiquette cousue à l’intérieur du vêtement.',
  'faqData.manufacturingQ': 'où est-ce fabriqué ?',
  'faqData.manufacturingA':
    'le pays de fabrication est indiqué sur l’étiquette cousue à l’intérieur du vêtement.',
  'faqData.shipping2Q': 'livraison',
  'faqData.shipping2A':
    'préparée et expédiée sous 1 à 3 jours ouvrés : 48 h en france, 3 à 5 jours dans le monde, avec suivi. tous les détails sur notre',
  'faqData.shippingLink': 'page livraison',
  'faqData.returnsQ': 'retours',
  'faqData.returnsA':
    'retours et échanges sous 30 jours après réception, sur des pièces non portées dans leur emballage d’origine. tous les détails sur notre',
  'faqData.returnsLink': 'page retours',
  'faqData.careQ': 'entretien',
  'faqData.careA':
    'lavez sur l’envers à basse température, et suivez les instructions indiquées sur l’étiquette du vêtement.',
  'search.articles': 'articles',
  'search.pages': 'pages',
  'search.products': 'produits',
  'search.collections': 'collections',
  'search.loadPrevious': '↑ voir les précédents',
  'search.loadMore': 'voir plus ↓',
  'policies.title': 'informations',
  'blogs.title': 'journal',
  'about.eyebrowStory': 'notre histoire',
  'about.lead':
    '{brand} est une marque de streetwear pour celles et ceux qui avancent : des coupes nettes, des matières de qualité, aucun superflu.',
  'about.manifesto': 'le travail se fait en silence. les vêtements aussi.',
  'about.pillar1Title': 'ambition',
  'about.pillar1Body':
    'des pièces faites pour suivre celles et ceux qui travaillent pour ce qu’ils veulent.',
  'about.pillar2Title': 'minimalisme',
  'about.pillar2Body':
    'une palette sobre, des lignes nettes, des détails qu’on remarque de près.',
  'about.pillar3Title': 'durabilité',
  'about.pillar3Body':
    'moins de pièces, mieux choisies, faites pour être portées longtemps.',
  'about.ctaTitle': 'découvrir la collection',
  'about.ctaBody': 'toutes les pièces disponibles, directement du studio.',
  'about.ctaButton': 'voir la collection',
  // — espace compte (comptes clients Shopify) —
  'account.orders': 'commandes',
  'account.profile': 'profil',
  'account.addresses': 'adresses',
  'account.signOut': 'se déconnecter',
  'account.myProfile': 'mon profil',
  'account.personalInfo': 'informations personnelles',
  'account.firstName': 'prénom',
  'account.lastName': 'nom',
  'account.update': 'mettre à jour',
  'account.updating': 'mise à jour…',
  'account.noOrders': 'vous n’avez pas encore passé de commande.',
  'account.startShopping': 'découvrir la boutique →',
  'account.noMatch': 'aucune commande ne correspond à votre recherche.',
  'account.clearFilters': 'effacer les filtres →',
  'account.filterOrders': 'filtrer les commandes',
  'account.searchOrders': 'rechercher une commande',
  'account.orderNumber': 'numéro de commande',
  'account.confirmationNumber': 'numéro de confirmation',
  'account.search': 'rechercher',
  'account.searching': 'recherche…',
  'account.clear': 'effacer',
  'account.viewOrder': 'voir la commande →',
  'account.product': 'produit',
  'account.price': 'prix',
  'account.quantity': 'quantité',
  'account.total': 'total',
  'account.discounts': 'remises',
  'account.subtotal': 'sous-total',
  'account.tax': 'tva',
  'account.shippingAddress': 'adresse de livraison',
  'account.noShippingAddress': 'aucune adresse de livraison sur cette commande',
  'account.status': 'statut',
  'account.viewOrderStatus': 'voir le statut de la commande →',
  'account.createAddress': 'ajouter une adresse',
  'account.noAddresses': 'vous n’avez enregistré aucune adresse.',
  'account.existingAddresses': 'adresses enregistrées',
  'account.company': 'société',
  'account.address1': 'adresse',
  'account.address2': 'complément d’adresse',
  'account.city': 'ville',
  'account.province': 'région / province',
  'account.zip': 'code postal',
  'account.country': 'code pays',
  'account.phone': 'téléphone',
  'account.defaultAddress': 'définir comme adresse par défaut',
  'account.welcome': 'bonjour {name}',
  'account.welcomeNoName': 'bienvenue dans votre compte.',
  'account.details': 'détails du compte',
  'account.confirmation': 'confirmation',
  'account.create': 'créer',
  'account.creating': 'création…',
  'account.save': 'enregistrer',
  'account.saving': 'enregistrement…',
  'account.delete': 'supprimer',
  'account.deleting': 'suppression…',

  // — éléments partagés : carrousels, galerie, pagination —
  'common.loading': 'chargement…',
  'common.previous': 'précédent',
  'common.loadMore': 'voir plus',
  'rail.prevProduct': 'produit précédent',
  'rail.nextProduct': 'produit suivant',
  'gallery.label': 'images du produit',
  'gallery.carousel': 'carrousel',
  'gallery.image': 'image',
  'gallery.view': 'voir l’image {index} sur {total}',
  'gallery.position': '{index} sur {total}',
  'gallery.thumbAlt': '{title} — miniature {index}',
  'gallery.imageAlt': '{title} — image {index}',
  'product.price': 'prix',
  'cart.items': 'articles du panier',
  'shop.title': 'boutique',
  'search.title': 'recherche',
  'search.placeholder': 'rechercher un produit',
  'search.submit': 'rechercher',
  'search.go': 'ok',
  'search.searching': 'recherche…',
  'search.empty': 'aucun résultat, essayez une autre recherche.',
  'search.viewAllFor': 'voir tous les résultats pour « {term} » →',
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

  // — liste d'attente précommande (royal longsleeve — white uniquement, voir app/lib/preorder.ts) —

  // — pied de page —
  'footer.blurb':
    '{brand} — un streetwear minimaliste et premium, pensé pour durer.',
  'footer.info': 'aide',
  'footer.policies': 'informations légales',
  'footer.faq': 'faq',
  'footer.contact': 'contact',
  'footer.shipping': 'livraison',
  'footer.returns': 'retours & remboursements',
  'footer.terms': 'conditions d’utilisation',
  'footer.privacy': 'politique de confidentialité',
  'footer.legalNotice': 'mentions légales',

  // — suivi de commande —
  'track.eyebrow': 'assistance',
  'track.title': 'suivi de commande',
  'track.intro':
    'Votre numéro de commande figure dans votre e-mail de confirmation — il ressemble à #1024. Saisissez-le avec l’e-mail utilisé lors de la commande.',
  'track.orderNumber': 'numéro de commande',
  'track.email': 'adresse e-mail',
  'track.submit': 'suivre ma commande',
  'track.looking': 'recherche…',
  'track.missingFields':
    'Indiquez votre numéro de commande et l’e-mail utilisé lors de la commande.',
  'track.notFound':
    'Nous n’avons pas trouvé la commande #{number} sur ce compte. Vérifiez le numéro, ou connectez-vous avec le compte utilisé pour la commande.',
  'track.emailMismatch':
    'Cet e-mail ne correspond pas à celui de la commande #{number}.',
  'track.gateTitle': 'une étape d’abord',
  'track.gateBody':
    'Nous ne montrons le détail d’une commande qu’à la personne qui l’a passée. Confirmez votre adresse e-mail et nous vous ramenons directement ici — Shopify vous envoie un code à usage unique, aucun mot de passe à retenir.',
  'track.gateCta': 'confirmer mon e-mail',
  'track.order': 'commande',
  'track.placed': 'passée le',
  'track.status': 'statut',
  'track.carrier': 'transporteur',
  'track.trackingNumber': 'numéro de suivi',
  'track.shipped': 'expédiée le',
  'track.estimated': 'livraison estimée',
  'track.history': 'historique',
  'track.parcelOf': 'colis {index} sur {total}',
  'track.pending':
    'Votre commande est confirmée et en cours de préparation. Un numéro de suivi apparaît ici dès l’expédition.',
  'track.statusPage': 'ouvrir la page de suivi complète →',
  'track.helpTitle': 'vous ne trouvez pas votre commande ?',
  'track.helpBody1':
    'Le suivi devient disponible une fois le colis parti. Un numéro de suivi tout juste créé peut aussi mettre quelques heures à s’activer chez le transporteur.',
  'track.helpBody2': 'Toujours bloqué ? Écrivez-nous depuis la',
  'track.helpBody3':
    'et nous la retrouverons nous-mêmes. Les délais complets sont dans notre',
  'track.signedIn': 'Vous êtes connecté — toutes vos commandes sont dans',
  'track.yourAccount': 'votre compte',

  // — pages légales —

  'cart.decrease': 'Diminuer la quantité',
  'cart.increase': 'Augmenter la quantité',
  'size.available': 'disponible',
  'size.soldOut': 'épuisé',
  'size.note1':
    'si vous hésitez entre deux tailles, prenez la plus grande pour un porté plus ample. un doute ?',
  'size.writeToUs': 'écrivez-nous',
  'size.note2': 'avant de commander.',

  // — erreurs —

  // — ajouts Hustle Studio —
  'nav.shop': 'boutique',
  'bundle.eyebrow': 'Lot & économies',
  'bundle.title': 'Composez votre lot',
  'bundle.previewNote': 'Aperçu — ces offres seront actives une fois leurs codes promo Shopify connectés.',
  'bundle.giftUnlocked': '{gift} débloqué — il part avec votre commande 🎁',
  'bundle.giftRemaining': 'Plus que {amount} € pour débloquer votre {gift} 🎁',
  'bundle.size': 'Taille',
  'bundle.free': 'Offert',
  'bundle.total': 'Total du lot',
  'bundle.youSave': 'Vous économisez {amount} €',
  'bundle.previewCta': 'Aperçu — code promo pas encore connecté',
  'bundle.addWithGift': 'Ajouter le {offer} + {gift} au panier',
  'bundle.add': 'Ajouter le {offer} — {count} pièces',
  'bundle.piece': 'Pièce {n}',
  'bundle.addPiece': 'Ajouter une pièce',
  'bundle.removePiece': 'Retirer une pièce',
  'sizeChart.open': 'Guide des tailles',
  'sizeChart.eyebrow': 'Guide des tailles',
  'sizeChart.caption': 'Mesures du vêtement par taille',
  'sizeChart.size': 'Taille',
  'sizeChart.howTo': 'Comment mesurer',
  'sizeChart.availability': 'En stock maintenant',
  'sizeChart.pending': 'Les mesures de cette pièce arrivent. Entre deux tailles ?',
  'sizeChart.pendingEnd': 'avec votre taille et votre taille habituelle — réponse sous 24 h ouvrées.',
  'pdp.pairsEyebrow': 'Créée pour aller avec',
  'pdp.pairsView': 'Voir la pièce',
  'pdp.price': 'Prix',
  'pdp.detailsEyebrow': 'Détails',
  'pdp.descriptionEyebrow': 'Description',
  'pdp.prevImage': 'Image précédente',
  'pdp.nextImage': 'Image suivante',
  'family.pause': 'Pause',
  'family.play': 'Lecture',
  'product.colours': 'Couleurs',
  'nav.collections': 'collections',
  'nav.account': 'Compte',
  'nav.cartCount': 'Panier, {count} article(s)',
  'nav.allProducts': 'tous les produits',
  'notFound.title': 'page introuvable',
  'error.title': 'un problème est survenu',
  'error.text':
    'la boutique n’a pas pu charger cette page. réessayez dans un instant.',
  'sort.label': 'trier par',
  'sort.featured': 'sélection',
  'sort.newest': 'nouveautés',
  'sort.best-selling': 'meilleures ventes',
  'sort.price-asc': 'prix croissant',
  'sort.price-desc': 'prix décroissant',
  'collection.empty': 'aucun produit ici pour le moment — revenez bientôt.',
  'footer.about': 'à propos',
  'footer.termsOfSale': 'conditions générales de vente',

  // — promotions, avis, vidéos —
  'cart.tierMax': '−{percent} % dès le 3e article',
  'cart.tierNext': 'ajoutez un article : le suivant est à −{percent} %',
  'cart.tierSaved': 'vous économisez {amount} sur ce panier',
  'offer.addBoth': 'ajouter les deux au panier',
  'offer.heading': 'l’offre',
  'offer.noteAuto':
    'valable avec n’importe quelle deuxième pièce, pas seulement ce duo. aucun code à saisir — la réduction s’applique seule dans votre panier et au paiement.',
  'offer.noteCode':
    'valable avec n’importe quelle deuxième pièce, pas seulement ce duo. nous ajoutons le code {code} à votre panier — il y reste visible, et vous pouvez le saisir vous-même à tout moment.',
  'offer.pick': 'choisissez votre deuxième pièce',
  'offer.ribbon': '−{percent} % sur votre deuxième pièce',
  'offer.sub':
    'ajoutez une deuxième pièce — celle que vous voulez — et {percent} % en sont déduits',
  'offer.subOff': 'même esthétique, mêmes finitions',
  'offer.takeTwo': 'prenez-en deux',
  'pack.add': 'ajouter le pack au panier',
  'pack.eyebrow': 'le pack',
  'pack.free': '+ une pièce offerte',
  'pack.freeSlot': 'la pièce offerte',
  'pack.freeTag': 'offert',
  'pack.imageAlt': 'Une tenue {brand} portée',
  'pack.intro':
    'Choisissez un haut, un bas et un longsleeve, chacun dans votre taille. Trois pièces qui vont ensemble, et une quatrième offerte.',
  'pack.model': 'modèle',
  'pack.offerIntro':
    'Composez votre pack avec trois pièces au choix — un haut, un bas, un longsleeve — et une quatrième pièce est ajoutée, offerte.',
  'pack.offerTitle': '3 produits achetés = 1 offert',
  'pack.piece': 'pièce {n}',
  'pack.point.cart':
    'Offre appliquée directement au panier, avec le code {code}.',
  'pack.point.choice': 'Le modèle et la taille de chaque pièce, au choix.',
  'pack.point.free':
    'La pièce offerte est ajoutée automatiquement à votre commande.',
  'pack.position': '{n} sur {total}',
  'pack.size': 'taille',
  'pack.swipe': 'glissez pour choisir',
  'pack.title': 'pack essentiel',
  'pack.total': 'les trois pièces',
  'pack.unavailable': 'une des pièces est épuisée',
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
  'product.worn': 'le produit porté',
  'rail.nextVideo': 'vidéo suivante',
  'rail.prevVideo': 'vidéo précédente',
  'reviewForm.contactLink': 'page contact',
  'reviewForm.email': 'e-mail',
  'reviewForm.error': 'une erreur est survenue, réessayez.',
  'reviewForm.intro':
    'dites-nous ce que vous en avez pensé — on lit chaque avis.',
  'reviewForm.missingFields': 'merci de remplir tous les champs requis.',
  'reviewForm.name': 'nom',
  'reviewForm.product': 'produit (facultatif)',
  'reviewForm.productPlaceholder': 'ex. hustle zip — gris',
  'reviewForm.rating': 'note',
  'reviewForm.sending': 'envoi…',
  'reviewForm.submit': 'envoyer mon avis',
  'reviewForm.text': 'votre avis',
  'reviewForm.thanks':
    'votre avis a bien été envoyé — nous lisons chacun d’entre eux.',
  'reviewForm.title': 'laisser un avis',
  'reviewForm.unavailable':
    'ce formulaire ne reçoit pas encore de réponses — écrivez-nous plutôt.',
  'reviews.ctaButton': 'laisser un avis',
  'reviews.ctaText': 'vous l’avez porté ?',
  'reviews.forProduct': 'avis sur {product}',
  'reviews.next': 'avis suivants',
  'reviews.prev': 'avis précédents',
  'reviews.subtitle': 'les mots de clients {brand}, sans filtre.',
  'reviews.title': 'ce que disent nos clients',
  'tier.second': '2e article −{percent} %',
  'tier.third': '3e article −{percent} %',
  'product.ratedOutOf': 'noté {value}/5',
  'product.fromReviews': 'sur {count} avis',
  'footer.pack': 'le pack',
  'footer.writeReview': 'laisser un avis',
  'pack.slot.top': 'haut',
  'pack.slot.bottom': 'bas',
  'pack.slot.longsleeve': 'longsleeve',
};

export const DICTIONARIES: Record<Locale, Record<TranslationKey, string>> = {
  en,
  fr,
};
