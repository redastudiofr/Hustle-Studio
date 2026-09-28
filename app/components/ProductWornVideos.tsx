import {useEffect, useRef, useState, type RefObject} from 'react';
import {useAmbientVideo} from '~/lib/useAmbientVideo';
import {useHorizontalRail} from '~/lib/useHorizontalRail';
import {useT} from '~/lib/i18n';
import {useInAppBrowser} from '~/lib/inAppBrowser';
import {RailArrows} from '~/components/RailArrows';
import {WORN_VIDEOS} from '~/config/videos';

/**
 * "Worn" — vertical clips of the pieces actually worn, on every product
 * page. The list lives in app/config/videos.ts; nothing is shown while it is
 * empty.
 */
const VIDEOS = WORN_VIDEOS;

/**
 * A single clip. The list is rendered three times over (see
 * useHorizontalRail's `loop`) so the rail can wrap seamlessly in both
 * directions — every copy of a given clip points at the same URL, so the
 * browser's own HTTP cache means it is only ever actually fetched once.
 */
function WornVideoTile({
  src,
  label,
  railRef,
}: {
  src: string;
  label: string;
  railRef: RefObject<HTMLDivElement | null>;
}) {
  const itemRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [near, setNear] = useState(false);

  // Stops this clip once it's off screen or the tab is hidden — see the hook.
  useAmbientVideo(videoRef);

  // Attach the source once the tile is within about one rail's width of
  // being visible — near enough that swiping to it feels instant, without
  // pulling all eighteen tiles' worth of video the moment the section
  // scrolls into view. `autoPlay` below then takes it from there natively:
  // once a clip has a source, the browser loads and plays it itself, no
  // manual play()/pause() orchestration (and no risk of a race between
  // "src just got attached" and "is this tile currently visible").
  useEffect(() => {
    const node = itemRef.current;
    const root = railRef.current;
    if (!node || !root) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      {root, rootMargin: '0px 150%'},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [railRef]);

  return (
    <div className="worn-rail__item" ref={itemRef}>
      <video
        ref={videoRef}
        className="worn-rail__video"
        src={near ? src : undefined}
        aria-label={label}
        autoPlay={near}
        muted
        loop
        playsInline
        // The legacy spellings of playsinline, for the embedded browsers that
        // still read those and not the standard one.
        // eslint-disable-next-line react/no-unknown-property
        webkit-playsinline="true"
        // eslint-disable-next-line react/no-unknown-property
        x5-playsinline="true"
        preload="none"
        draggable={false}
        // Decorative background footage: there is no reason for the browser
        // to ever float one of these over the page in its own window.
        disablePictureInPicture
      />
    </div>
  );
}

export function ProductWornVideos() {
  const t = useT();
  const inApp = useInAppBrowser();
  const {ref, scrollByCard} = useHorizontalRail<HTMLDivElement>({loop: true});

  /*
   * Nothing at all inside TikTok's or Instagram's browser. These clips are
   * the ones that kept being thrown full screen over the shop there: they are
   * decoration, and decoration that hijacks the screen is worse than no
   * decoration. Every other browser still gets the row — see
   * app/lib/inAppBrowser.ts.
   */
  if (inApp || !VIDEOS.length) return null;

  // Three copies back to back so the rail can be scrolled infinitely in
  // either direction — see useHorizontalRail's loop mode.
  const looped = [...VIDEOS, ...VIDEOS, ...VIDEOS];

  return (
    <section className="pdp__worn" aria-labelledby="worn-heading">
      <h2 className="pdp__section-title" id="worn-heading">
        {t('product.worn')}
      </h2>

      <div className="rail-wrap">
        <div className="worn-rail" ref={ref}>
          {looped.map((video, index) => (
            <WornVideoTile
              key={`${video.src}-${index}`}
              src={video.src}
              label={video.label}
              railRef={ref}
            />
          ))}
        </div>
        <RailArrows
          onPrev={() => scrollByCard(-1)}
          onNext={() => scrollByCard(1)}
          prevLabel={t('rail.prevVideo')}
          nextLabel={t('rail.nextVideo')}
        />
      </div>
    </section>
  );
}
