import {useEffect, useRef, useState} from 'react';
import {Link, NavLink} from 'react-router';
import {Newsletter} from '~/components/Newsletter';
import {LanguageSwitcher} from '~/components/LanguageSwitcher';
import {BRAND} from '~/config/brand';
import type {NavLinkConfig} from '~/config/navigation';
import {useT} from '~/lib/i18n';
import {HAS_LANGUAGE_CHOICE} from '~/lib/i18n/locale';
import {PaymentIcons} from '~/components/store/PaymentIcons';
import {TIKTOK_VIDEOS, type CommunityVideo} from '~/config/community';

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

/** The brand's own photos, floating in the "become part of the community" slider. */
const COMMUNITY_PHOTOS = [
  '/brand/about-street.webp',
  '/brand/hero-mobile-paris.webp',
  '/brand/hero-mobile-passage.webp',
  '/brand/popup-business-after-hours.webp',
  '/brand/about.webp',
  '/brand/hero-mobile-chair.webp',
  '/brand/hero-mobile-shoot.webp',
];

/**
 * Site footer: "become part of the community" (logo, title, the brand's
 * photos, a link to the story), the brand's TikTok, then the newsletter, then
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
      <CommunityBlock />
      <TiktokBlock />
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

/**
 * "become part of the community": the whole block fills with black from the
 * logo outwards, then the photos arrive one by one in a slow slider, every
 * one of them floating.
 *
 * Everything starts visible: without JavaScript, or with reduced motion,
 * nothing is hidden. Once JavaScript runs the block is armed (empty disc,
 * no photos) and plays only when it is really on screen — there is no timer,
 * which used to play it before the visitor had scrolled down to it.
 */
function CommunityBlock() {
  const t = useT();
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<'idle' | 'armed' | 'in'>('idle');

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setState('armed');
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState('in');
          observer.disconnect();
        }
      },
      {threshold: 0.35},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={`st-community ${state === 'armed' ? 'st-community--armed' : ''} ${state === 'in' ? 'st-community--in' : ''}`}
      aria-labelledby="st-community-title"
    >
      {/* The black that spreads from the logo over the whole block. */}
      <span className="st-community__bg" aria-hidden="true" />
      <span className="st-community__logo" aria-hidden="true">
        <span className="brand-wordmark" />
      </span>
      <h2 className="st-community__title" id="st-community-title">
        {t('store.communityTitle')}
      </h2>
      <div className="st-community__photos" aria-hidden="true">
        <div className="st-community__track">
          {/* Two copies back to back: the slider loops without a jump. */}
          {[...COMMUNITY_PHOTOS, ...COMMUNITY_PHOTOS].map((src, position) => (
            <img
              key={`${position < COMMUNITY_PHOTOS.length ? 'a' : 'b'}-${src}`}
              src={src}
              alt=""
              loading="lazy"
              decoding="async"
              style={
                {
                  '--i': position % COMMUNITY_PHOTOS.length,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      </div>
      <div className="st-community__about">
        <Link to="/about" prefetch="intent" className="st-community__story">
          {t('store.storyButton')}
        </Link>
      </div>
    </section>
  );
}

/**
 * "follow us": the brand's videos in a row (app/config/community.ts), each
 * playing muted while it is on screen and paused otherwise, and the two
 * accounts — Instagram and TikTok — as bold links that open the profile.
 */
function TiktokBlock() {
  const t = useT();
  const accounts = [
    {name: 'Instagram', href: BRAND.social.instagram},
    {name: 'TikTok', href: BRAND.social.tiktok},
  ].filter((account) => account.href);

  return (
    <section className="st-tiktok" aria-labelledby="st-tiktok-title">
      <h2 className="st-tiktok__title" id="st-tiktok-title">
        {t('store.followTitle')}
      </h2>
      {accounts.length > 0 && (
        <p className="st-tiktok__accounts">
          {accounts.map((account) => (
            <a
              key={account.name}
              href={account.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {account.name}
            </a>
          ))}
        </p>
      )}
      <p className="st-tiktok__text">{t('store.tiktokText')}</p>
      {TIKTOK_VIDEOS.length > 0 && (
        <div className="st-tiktok__rail">
          <div className="st-tiktok__videos">
            {TIKTOK_VIDEOS.map((video) => (
              <FooterVideo key={video.src} video={video} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/** One video of the row: plays only while visible, never with sound. */
function FooterVideo({video}: {video: CommunityVideo}) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) node.play().catch(() => {});
        else node.pause();
      },
      {threshold: 0.4},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className="st-tiktok__video"
      src={video.src}
      poster={video.poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
