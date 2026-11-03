import {Suspense, useState} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {useHeaderTone} from '~/lib/header-tone';
import {BagIcon, BurgerIcon, PersonIcon, SearchIcon} from '~/components/Icons';
import {LanguageSwitcher} from '~/components/LanguageSwitcher';
import {CURRENCY_SYMBOL, CURRENCY_CODE} from '~/lib/currency';
import {useT} from '~/lib/i18n';
import {HAS_LANGUAGE_CHOICE} from '~/lib/i18n/locale';
import {
  NAV_HEADER_LINKS,
  NAV_SERVICE_LINKS,
  NAV_MOBILE_LINKS,
  NAV_LEGAL_LINKS,
  type NavCollection,
} from '~/lib/nav';

export type {NavCollection};

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  navCollections: NavCollection[];
  /** False when the Customer Account API is not configured — no account icon then. */
  accountEnabled?: boolean;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  cart,
  navCollections,
  accountEnabled,
}: HeaderProps) {
  const {shop} = header;
  const {open} = useAside();
  const t = useT();
  const {transparent} = useHeaderTone();
  // Drives a short press animation on the wordmark; cleared on animation end
  // so it can replay on every click.
  const [logoPressed, setLogoPressed] = useState(false);

  const headerClassName = [
    'site-header',
    transparent && 'site-header--transparent',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={headerClassName}>
      {/* Logo left, menu centred, country and icons right. */}
      <div className="site-header__side site-header__side--start">
        <button
          className="site-header__icon-btn site-header__burger"
          onClick={() => open('mobile')}
          aria-label={t('nav.openMenu')}
        >
          <BurgerIcon />
        </button>
        <NavLink
          to="/"
          end
          prefetch="intent"
          className={`site-header__logo ${logoPressed ? 'site-header__logo--pressed' : ''}`}
          aria-label={shop.name}
          onClick={() => setLogoPressed(true)}
          onAnimationEnd={() => setLogoPressed(false)}
        >
          {/* Painted with currentColor through a CSS mask; the text stays
              for screen readers and as a fallback. */}
          <span className="site-header__wordmark" aria-hidden="true" />
          <span className="sr-only">{shop.name}</span>
        </NavLink>
      </div>

      <HeaderMenu collections={navCollections} viewport="desktop" />

      <div className="site-header__side site-header__side--end">
        <span className="site-header__market">
          France | {CURRENCY_CODE} {CURRENCY_SYMBOL}
        </span>
        <button
          className="site-header__icon-btn"
          onClick={() => open('search')}
          aria-label={t('nav.search')}
        >
          <SearchIcon />
        </button>
        {accountEnabled && (
          <NavLink
            to="/account"
            prefetch="intent"
            className="site-header__icon-btn site-header__account"
            aria-label={t('nav.account')}
          >
            <PersonIcon />
          </NavLink>
        )}
        <CartToggle cart={cart} />
      </div>
    </header>
  );
}

export function HeaderMenu({
  collections,
  viewport,
}: {
  collections: NavCollection[];
  viewport: Viewport;
}) {
  const {close} = useAside();
  const t = useT();

  if (viewport === 'desktop') {
    // Homepage, "on sale" (a Shopify collection with the handle "sale"),
    // every other collection, then the plain links (contact).
    const sale = collections.find((c) => c.handle === 'sale');
    const others = collections.filter((c) => c.handle !== 'sale').slice(0, 7);
    return (
      <nav className="site-header__nav" role="navigation">
        <NavLink to="/" end prefetch="intent" className="site-header__nav-link">
          {t('store.home')}
        </NavLink>
        {sale && (
          <NavLink
            to="/collections/sale"
            prefetch="intent"
            className="site-header__nav-link"
          >
            {t('store.onSale')}
          </NavLink>
        )}
        {others.map((collection) => (
          <NavLink
            key={collection.id}
            to={`/collections/${collection.handle}`}
            prefetch="intent"
            className="site-header__nav-link"
          >
            {collection.title}
          </NavLink>
        ))}
        {NAV_HEADER_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            prefetch="intent"
            className="site-header__nav-link"
          >
            {t(link.labelKey)}
          </NavLink>
        ))}
      </nav>
    );
  }

  // Burger menu: every page as a plain link — no "shop" dropdown to open.
  return (
    <nav className="mobile-nav" role="navigation">
      {NAV_MOBILE_LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end
          onClick={close}
          prefetch="intent"
        >
          {t(link.labelKey)}
        </NavLink>
      ))}

      {/* Service links sit under the main pages, not among them. */}
      {NAV_SERVICE_LINKS.map((link, index) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={`mobile-nav__service ${index === 0 ? 'mobile-nav__first' : ''}`}
          onClick={close}
          prefetch="intent"
        >
          {t(link.labelKey)}
        </NavLink>
      ))}

      {NAV_LEGAL_LINKS.map((link, index) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={`mobile-nav__service ${index === 0 ? 'mobile-nav__first' : ''}`}
          onClick={close}
          prefetch="intent"
        >
          {t(link.labelKey)}
        </NavLink>
      ))}

      <LocalePreferences className="mobile-nav__settings" />
    </nav>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartButton count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartButton count={cart?.totalQuantity ?? 0} />;
}

function CartButton({count}: {count: number}) {
  const {open} = useAside();
  const t = useT();
  const {publish, shop, cart, prevCart} = useAnalytics();
  return (
    <button
      className="site-header__icon-btn"
      aria-label={t('nav.cartCount', {count})}
      onClick={() => {
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      <BagIcon />
      {count > 0 && <span className="site-header__cart-count">{count}</span>}
    </button>
  );
}

/**
 * Store preferences — language and currency — as a small settings block.
 *
 * The language switcher used to sit loose in the header bar. It now lives
 * here, next to the currency it belongs with: two facts about how the shop is
 * displayed, stated in one place instead of scattered across the chrome. The
 * block is rendered inside the menu drawer and in the footer, so it is
 * reachable on a phone and on a desktop without the header carrying it.
 *
 * The currency is a statement, not a control: Shopify prices this storefront
 * in euros, and offering a switch that cannot change the price would be a lie.
 */
export function LocalePreferences({className}: {className?: string}) {
  const t = useT();

  return (
    <div className={['locale-prefs', className].filter(Boolean).join(' ')}>
      <span className="locale-prefs__title">{t('nav.settings')}</span>

      {HAS_LANGUAGE_CHOICE && (
        <div className="locale-prefs__row">
          <span className="locale-prefs__label">{t('nav.language')}</span>
          <LanguageSwitcher />
        </div>
      )}

      <div className="locale-prefs__row">
        <span className="locale-prefs__label">{t('nav.currency')}</span>
        <span className="locale-prefs__value">
          {CURRENCY_CODE}&nbsp;{CURRENCY_SYMBOL}
        </span>
      </div>
    </div>
  );
}
