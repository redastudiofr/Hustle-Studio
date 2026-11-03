import {Link, NavLink} from 'react-router';
import {Newsletter} from '~/components/Newsletter';
import {LanguageSwitcher} from '~/components/LanguageSwitcher';
import {BRAND} from '~/config/brand';
import type {NavLinkConfig} from '~/config/navigation';
import {useT} from '~/lib/i18n';
import {HAS_LANGUAGE_CHOICE} from '~/lib/i18n/locale';
import {PaymentIcons} from '~/components/store/PaymentIcons';

const LEGAL_LINKS: NavLinkConfig[] = [
  {labelKey: 'footer.privacy', to: '/legal/privacy'},
  {labelKey: 'footer.termsOfSale', to: '/legal/terms'},
  {labelKey: 'footer.legalNotice', to: '/legal/legal-notice'},
];

const SERVICE_LINKS: NavLinkConfig[] = [
  {labelKey: 'footer.contact', to: '/contact'},
  {labelKey: 'footer.shippingReturn', to: '/legal/returns'},
  {labelKey: 'footer.trackOrder', to: '/order-tracking'},
];

/** The brand's own photos, tilted, under "become part of the community". */
const COMMUNITY_PHOTOS = [
  '/brand/about-street.webp',
  '/brand/hero-mobile-passage.webp',
  '/brand/about.webp',
];

/**
 * Site footer: a black "become part of the community" block (logo, title,
 * the brand's photos), then the newsletter, then
 * socials (only the profiles set in app/config/brand.ts), legal pages and
 * order help; country, language and the logo at the bottom.
 */
export function Footer() {
  const t = useT();
  const year = new Date().getFullYear();
  const socials = [
    {label: 'Instagram', href: BRAND.social.instagram},
    {label: 'TikTok', href: BRAND.social.tiktok},
  ].filter((social) => social.href);

  return (
    <footer className="sx-footer st-footer">
      <section className="st-community" aria-labelledby="st-community-title">
        <span className="st-community__logo" aria-hidden="true">
          <span className="brand-wordmark" />
        </span>
        <h2 className="st-community__title" id="st-community-title">
          {t('store.communityTitle')}
        </h2>
        <div className="st-community__photos" aria-hidden="true">
          {COMMUNITY_PHOTOS.map((src) => (
            <img key={src} src={src} alt="" loading="lazy" decoding="async" />
          ))}
        </div>
        <div className="st-community__about">
          <h3>{t('store.about')}</h3>
          <p>{t('footer.blurb')}</p>
        </div>
      </section>
      <div className="sx-footer__top">
        <div className="sx-footer__news">
          <p>{t('footer.newsletterText')}</p>
          <Newsletter compact />
        </div>

        {socials.length > 0 && (
          <nav className="sx-footer__col" aria-label={t('footer.socials')}>
            <h3>{t('footer.socials')}</h3>
            <ul>
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <FooterColumn title={t('footer.legal')} links={LEGAL_LINKS} />
        <FooterColumn title={t('footer.trackReturn')} links={SERVICE_LINKS} />
      </div>

      <div className="sx-footer__bottom">
        <div className="sx-footer__prefs">
          <p>
            {t('footer.country')}: <span>France</span>
          </p>
          {HAS_LANGUAGE_CHOICE && (
            <div className="sx-footer__lang">
              {t('footer.language')}: <LanguageSwitcher />
            </div>
          )}
          <p className="sx-footer__copy">
            © {year}, {BRAND.name}
          </p>
          <PaymentIcons className="st-footer__pay" />
        </div>
        <Link to="/" className="sx-footer__logo" aria-label={BRAND.name}>
          <span className="brand-wordmark" aria-hidden="true" />
        </Link>
      </div>
    </footer>
  );
}

function FooterColumn({title, links}: {title: string; links: NavLinkConfig[]}) {
  const t = useT();
  return (
    <nav className="sx-footer__col" aria-label={title}>
      <h3>{title}</h3>
      <ul>
        {links.map((link) => (
          <li key={link.to}>
            <NavLink to={link.to} prefetch="intent">
              {t(link.labelKey)}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
