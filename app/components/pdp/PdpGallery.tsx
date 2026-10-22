import {useEffect, useRef, useState} from 'react';
import {Image} from '@shopify/hydrogen';

type GalleryImage = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

/** Thumbnails under the main image on desktop (mock-up 01: five). */
const THUMBS = 5;

/**
 * Product gallery.
 *
 * - Desktop: one large image, five thumbnails underneath.
 * - Mobile (mock-up 09): a swipeable carousel with dots.
 *
 * One list of slides serves both: on desktop only the selected slide shows,
 * on mobile they sit side by side in a scroll-snapping row. Only the first
 * image loads eagerly; the others are lazy.
 */
export function PdpGallery({
  images,
  title,
  badge,
}: {
  images: GalleryImage[];
  title: string;
  badge?: string;
}) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  // Mobile: the dot follows the slide actually in view.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      if (!track.clientWidth) return;
      const index = Math.round(track.scrollLeft / track.clientWidth);
      setActive((current) => (current === index ? current : index));
    };
    track.addEventListener('scroll', onScroll, {passive: true});
    return () => track.removeEventListener('scroll', onScroll);
  }, []);

  function select(index: number) {
    setActive(index);
    const track = trackRef.current;
    // Mobile carousel: bring the slide into view too.
    if (track && getComputedStyle(track).overflowX !== 'visible') {
      track.scrollTo({left: index * track.clientWidth, behavior: 'smooth'});
    }
  }

  if (!images.length) {
    return <div className="pdpx-gallery pdpx-gallery--empty" />;
  }

  return (
    <div className="pdpx-gallery">
      <div className="pdpx-gallery__stage">
        {badge && <span className="pdpx-gallery__badge">{badge}</span>}
        <div
          className="pdpx-gallery__track"
          ref={trackRef}
          aria-roledescription="carousel"
          aria-label={title}
        >
          {images.map((image, index) => (
            <div
              key={image.id ?? image.url}
              className="pdpx-gallery__slide"
              data-active={index === active || undefined}
              aria-hidden={index !== active || undefined}
            >
              <Image
                data={image}
                alt={image.altText || title}
                aspectRatio="1/1"
                sizes="(min-width: 64em) 50vw, 100vw"
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : undefined}
              />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="pdpx-gallery__dots" aria-hidden="true">
            {images.map((image, index) => (
              <span
                key={image.id ?? image.url}
                data-active={index === active || undefined}
              />
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="pdpx-gallery__thumbs">
          {images.slice(0, THUMBS).map((image, index) => (
            <button
              key={image.id ?? image.url}
              type="button"
              className="pdpx-gallery__thumb"
              aria-label={`${title} — ${index + 1} / ${images.length}`}
              aria-pressed={index === active}
              onClick={() => select(index)}
            >
              <Image
                data={image}
                alt=""
                aspectRatio="1/1"
                sizes="120px"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
