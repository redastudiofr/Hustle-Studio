import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';
import {RailArrows} from '~/components/RailArrows';
import {BRAND} from '~/config/brand';
import {TIKTOK_VIDEOS} from '~/config/community';
import {useT} from '~/lib/i18n';
import {useHorizontalRail} from '~/lib/useHorizontalRail';

/** The brand's own photos, floating in the "become part of the community" slider. */
const COMMUNITY_PHOTOS = [
  '/brand/community-07-pink-car.webp',
  '/brand/community-07-blue.jpg',
  '/brand/community-07-black.webp',
  '/brand/community-gwagon-tee.webp',
  '/brand/community-07-pink.jpg',
  '/brand/community-07-grey.webp',
];

/**
 * One run of the slider: the photos repeated until there are enough to span
 * a wide screen (the track is two runs back to back, moved by half its width).
 */
const RUN = Array.from(
  {length: Math.max(1, Math.ceil(8 / COMMUNITY_PHOTOS.length))},
  () => COMMUNITY_PHOTOS,
).flat();

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
          {[...RUN, ...RUN].map((src, position) => (
            <img
              // Fixed list, never reordered.
              // eslint-disable-next-line react/no-array-index-key
              key={position}
              src={src}
              alt=""
              loading="lazy"
              decoding="async"
              style={
                {
                  '--i': position % RUN.length,
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
 * The videos' row: endless both ways, swiped on touch, dragged or moved with
 * the arrows with a mouse.
 *
 * Every video plays on its own — muted, looping — once the row comes near
 * the screen: the ones in view or next to it play, those far along the row
 * wait until they come close (the list repeated five times would otherwise
 * all decode at once). A page never scrolled that far downloads none.
 */
/** How many times the video list is repeated in the endless row. */
const COPIES = 5;

function VideoRail() {
  const t = useT();
  // Drag and arrows from the shared hook; the endless wrap is done here, so
  // that it never fights a finger: see the effect below.
  const {ref, scrollByCard} = useHorizontalRail<HTMLDivElement>();

  /*
   * Endless both ways, smoothly. The list is rendered COPIES times and the
   * row starts in the middle copy. The position is moved back by whole
   * copies only once the row has come to rest (no scroll event for a
   * moment), never during a swipe — moving it mid-flight is what made the
   * phone's momentum scrolling stutter. With five copies there is always
   * plenty of room on both sides before it rests.
   */
  useEffect(() => {
    const rail = ref.current;
    if (!rail) return;
    // One copy is nine videos plus nine gaps; the row has one gap fewer.
    const copyWidth = () => {
      const track = rail.firstElementChild as HTMLElement | null;
      const gap = track
        ? parseFloat(getComputedStyle(track).columnGap) || 0
        : 0;
      return (rail.scrollWidth + gap) / COPIES;
    };
    rail.scrollLeft = copyWidth() * Math.floor(COPIES / 2);

    let timer = 0;
    // Where the drift last put the row: a scroll event that finds it there
    // is the drift's own, not the visitor's.
    let driftedTo = -1;
    let heldUntil = 0;
    const hold = () => {
      heldUntil = performance.now() + 2500;
    };
    const recentre = () => {
      const width = copyWidth();
      if (!width) return;
      const middle = width * Math.floor(COPIES / 2);
      const offset = rail.scrollLeft - middle;
      const shift = Math.round(offset / width) * width;
      if (shift) rail.scrollLeft -= shift;
    };
    const onScroll = () => {
      if (Math.abs(rail.scrollLeft - driftedTo) < 2) return;
      // The visitor's own scroll (momentum included) holds the drift.
      hold();
      window.clearTimeout(timer);
      timer = window.setTimeout(recentre, 180);
    };
    rail.addEventListener('scroll', onScroll, {passive: true});

    /*
     * Always turning: the row drifts slowly to the left on its own, forever
     * (the copies are re-centred as it goes). A touch, a drag, the wheel or
     * an arrow pauses it; it picks up again a moment after the hand leaves.
     * Off screen, with reduced motion or in a hidden tab, it stays still.
     */
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const SPEED = 34; // px per second
    let frame = 0;
    let last = 0;
    let carry = 0;
    let onScreen = false;
    const step = (now: number) => {
      frame = requestAnimationFrame(step);
      const elapsed = last ? Math.min(now - last, 64) : 0;
      last = now;
      if (!onScreen || reduce.matches || document.hidden) return;
      if (now < heldUntil) {
        carry = 0;
        return;
      }
      carry += (SPEED * elapsed) / 1000;
      const whole = Math.floor(carry);
      if (!whole) return;
      carry -= whole;
      rail.scrollLeft += whole;
      const width = copyWidth();
      if (width && rail.scrollLeft > width * (Math.floor(COPIES / 2) + 1)) {
        rail.scrollLeft -= width;
      }
      driftedTo = rail.scrollLeft;
    };
    frame = requestAnimationFrame(step);

    const seen = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    });
    seen.observe(rail);

    const events = ['pointerdown', 'touchstart', 'wheel', 'keydown'] as const;
    events.forEach((name) =>
      rail.addEventListener(name, hold, {passive: true}),
    );
    const wrap = rail.parentElement;
    wrap?.addEventListener('click', hold);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      seen.disconnect();
      rail.removeEventListener('scroll', onScroll);
      events.forEach((name) => rail.removeEventListener(name, hold));
      wrap?.removeEventListener('click', hold);
    };
  }, [ref]);

  useEffect(() => {
    const rail = ref.current;
    if (!rail || typeof IntersectionObserver === 'undefined') return;
    const videos = [...rail.querySelectorAll('video')];

    // Along the row: play what is in view or close to it.
    const along = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.preload = 'auto';
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      {root: rail, rootMargin: '0px 400px'},
    );

    // Down the page: start once the row comes near the screen.
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        videos.forEach((video) => along.observe(video));
        near.disconnect();
      },
      {rootMargin: '600px 0px'},
    );
    near.observe(rail);

    return () => {
      near.disconnect();
      along.disconnect();
    };
  }, [ref]);

  const copies = Array.from({length: COPIES}, (_, copy) => copy);

  return (
    <div className="st-tiktok__rail-wrap">
      <div className="st-tiktok__rail" ref={ref}>
        <div className="st-tiktok__videos">
          {copies.map((copy) =>
            TIKTOK_VIDEOS.map((video) => (
              <video
                key={`${copy}-${video.src}`}
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
            )),
          )}
        </div>
      </div>
      <RailArrows
        onPrev={() => scrollByCard(-1)}
        onNext={() => scrollByCard(1)}
        prevLabel={t('rail.prevVideo')}
        nextLabel={t('rail.nextVideo')}
      />
    </div>
  );
}
