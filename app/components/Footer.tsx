import {NavLink, Link} from 'react-router';
import {InstagramIcon, TiktokIcon} from '~/components/Icons';
import {Newsletter} from '~/components/Newsletter';
import {LocalePreferences} from '~/components/Header';
import {BRAND} from '~/config/brand';
import {NAVIGATION, type NavLinkConfig} from '~/config/navigation';
import {useT} from '~/lib/i18n';
import {PACK_ENABLED, PACK_PATH} from '~/lib/packOffer';

/**
 * Site footer. Everything it shows is configured elsewhere: the brand's
 * contact and social links in app/config/brand.ts, the link columns in
 * app/config/navigation.ts, and the legal texts in Shopify Admin.
 */
export function Footer() {
  const t = useT();
  const year = new Date().getFullYear();
  const {instagram, tiktok} = BRAND.social;

  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div className="site-footer__brand">
          <Link to="/" className="site-footer__logo" aria-label={BRAND.name}>
            <span className="brand-wordmark" aria-hidden="true" />
          </Link>
          <p className="site-footer__blurb">{t('footer.blurb')}</p>
          {BRAND.email && (
            <a className="site-footer__email" href={`mailto:${BRAND.email}`}>
              {BRAND.email}
            </a>
          )}
          {(instagram || tiktok) && (
            <div className="site-footer__social">
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <InstagramIcon />
                </a>
              )}
              {tiktok && (
                <a
                  href={tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                >
                  <TiktokIcon />
                </a>
              )}
            </div>
          )}
        </div>

        <FooterColumn
          title={t('footer.info')}
          links={[
            // The pack page has no collection behind it, so the footer is
            // where it is reachable from — only while the offer is live.
            ...(PACK_ENABLED
              ? [{labelKey: 'footer.pack' as const, to: PACK_PATH}]
              : []),
            ...NAVIGATION.footer.info,
            {labelKey: 'footer.writeReview', to: '/reviews'},
          ]}
        />
        <FooterColumn
          title={t('footer.policies')}
          links={NAVIGATION.footer.policies}
        />

        <div className="site-footer__col site-footer__newsletter">
          <h3 className="site-footer__col-title">{t('news.title')}</h3>
          <Newsletter />
        </div>
      </div>

      <div className="site-footer__bottom">
        <span className="site-footer__copy">
          © {year} {BRAND.name}
        </span>
        <LocalePreferences className="site-footer__prefs" />
      </div>
    </footer>
  );
}

function FooterColumn({title, links}: {title: string; links: NavLinkConfig[]}) {
  const t = useT();
  return (
    <nav className="site-footer__col" aria-label={title}>
      <h3 className="site-footer__col-title">{title}</h3>
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
