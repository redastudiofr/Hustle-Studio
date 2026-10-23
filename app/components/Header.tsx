import {NavLink} from 'react-router';
import {useAside} from '~/components/Aside';
import {BurgerIcon} from '~/components/Icons';
import {LanguageSwitcher} from '~/components/LanguageSwitcher';
import {BRAND} from '~/config/brand';
import {NAVIGATION} from '~/config/navigation';
import {useT} from '~/lib/i18n';
import {HAS_LANGUAGE_CHOICE} from '~/lib/i18n/locale';

/**
 * Site header, as in the mock-ups: desktop — logo left, links centred;
 * phones — menu, logo centred. White and sticky: it stays at the top of the
 * screen and never overlaps the page underneath.
 */
export function Header() {
  const {open} = useAside();
  const t = useT();

  return (
    <div className="site-top">
      <header className="site-header site-header--mock">
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
          className="site-header__logo"
          aria-label={BRAND.name}
        >
          <span className="site-header__wordmark" aria-hidden="true" />
          <span className="sr-only">{BRAND.name}</span>
        </NavLink>

        <nav className="site-header__links" aria-label={t('nav.menu')}>
          {NAVIGATION.headerLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              prefetch="intent"
              className="site-header__link"
              end
            >
              {t(link.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="site-header__icons" />
      </header>
    </div>
  );
}

/** Burger menu: every page as a plain link, then the legal pages. */
export function MobileMenu() {
  const {close} = useAside();
  const t = useT();

  return (
    <nav className="mobile-nav" role="navigation">
      {NAVIGATION.mobileLinks.map((link) => (
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

      {NAVIGATION.footer.policies.map((link, index) => (
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

/** Language choice, in the menu drawer and in the footer. */
export function LocalePreferences({className}: {className?: string}) {
  const t = useT();
  if (!HAS_LANGUAGE_CHOICE) return null;

  return (
    <div className={['locale-prefs', className].filter(Boolean).join(' ')}>
      <span className="locale-prefs__title">{t('nav.settings')}</span>
      <div className="locale-prefs__row">
        <span className="locale-prefs__label">{t('nav.language')}</span>
        <LanguageSwitcher />
      </div>
    </div>
  );
}
