import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';
import {RailArrows} from '~/components/RailArrows';
import {BRAND} from '~/config/brand';
import {TIKTOK_VIDEOS} from '~/config/community';
import {useT} from '~/lib/i18n';
import {useHorizontalRail} from '~/lib/useHorizontalRail';

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
 * "become part of the community": the whole block fills with black from the
 * logo outwards, then the photos arrive one by one in a slow slider, every
 * one of them floating.
 *
 * Everything starts visible: without JavaScript, or with reduced motion,
 * nothing is hidden. Once JavaScript runs the block is armed (empty disc,
 * no photos) and plays only when it is really on screen — there is no timer,
 * which used to play it before the visitor had scrolled down to it.
 */
export function CommunitySections() {
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
      // Low on purpose: the block is taller than a phone screen.
      {threshold: 0.15},
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
      <FollowUs />
    </section>
  );
}

/**
 * "follow us", inside the black block: the two accounts — Instagram and
 * TikTok — as bold links that open the profile, then the brand's videos
 * (app/config/community.ts) in a row you can swipe, drag or move with the
 * arrows.
 */
function FollowUs() {
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
      {TIKTOK_VIDEOS.length > 0 && <VideoRail />}
    </section>
  );
}

/**
 * The videos' row: swipe on touch, drag or arrows with a mouse. Every video
 * plays — muted, looping — from the moment the row comes near the screen,
 * including those still off to the side, and none is paused after that. A
 * page never scrolled that far downloads none of them.
 */
function VideoRail() {
  const t = useT();
  const {ref, scrollByCard, atStart, atEnd} =
    useHorizontalRail<HTMLDivElement>();

  useEffect(() => {
    const rail = ref.current;
    if (!rail) return;
    const start = () => {
      rail.querySelectorAll('video').forEach((video) => {
        video.preload = 'auto';
        video.play().catch(() => {});
      });
    };
    if (typeof IntersectionObserver === 'undefined') {
      start();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start();
          observer.disconnect();
        }
      },
      {rootMargin: '600px 0px'},
    );
    observer.observe(rail);
    return () => observer.disconnect();
  }, [ref]);

  return (
    <div className="st-tiktok__rail-wrap">
      <div className="st-tiktok__rail" ref={ref}>
        <div className="st-tiktok__videos">
          {TIKTOK_VIDEOS.map((video) => (
            <video
              key={video.src}
              className="st-tiktok__video"
              src={video.src}
              poster={video.poster}
              muted
              loop
              playsInline
              autoPlay
              preload="none"
              aria-hidden="true"
              tabIndex={-1}
              draggable={false}
            />
          ))}
        </div>
      </div>
      <RailArrows
        onPrev={() => scrollByCard(-1)}
        onNext={() => scrollByCard(1)}
        disablePrev={atStart}
        disableNext={atEnd}
        prevLabel={t('rail.prevVideo')}
        nextLabel={t('rail.nextVideo')}
      />
    </div>
  );
}
