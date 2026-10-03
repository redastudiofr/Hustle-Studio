import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {PairProductFragment} from 'storefrontapi.generated';
import {Price} from '~/components/Price';
import {useT} from '~/lib/i18n';

/**
 * "Made to go with": one piece that completes this one — Shopify's
 * complementary recommendation (Search & Discovery app), else its closest
 * related product. Its photos in a swipeable carousel with dots, its real
 * price, and a link to it.
 */
export function PairsWithCard({product}: {product: PairProductFragment}) {
  const t = useT();
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const images = product.images.nodes;

  // Follow the swipe: the dot is the slide that is mostly in view.
  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const onScroll = () =>
      setIndex(Math.round(node.scrollLeft / Math.max(node.clientWidth, 1)));
    node.addEventListener('scroll', onScroll, {passive: true});
    return () => node.removeEventListener('scroll', onScroll);
  }, []);

  const go = (to: number) => {
    const node = track.current;
    if (!node) return;
    const target = (to + images.length) % images.length;
    node.scrollTo({left: target * node.clientWidth, behavior: 'smooth'});
  };

  const price = product.priceRange.minVariantPrice;

  return (
    <section className="pairs" aria-labelledby="pairs-title">
      <p className="pairs__eyebrow">{t('pdp.pairsEyebrow')}</p>
      <h2 className="pairs__title" id="pairs-title">
        {product.title}
      </h2>
      <span className="pairs__rule" aria-hidden="true" />

      {images.length > 0 && (
        <div className="pairs__carousel">
          <div className="pairs__track" ref={track}>
            {images.map((image, i) => (
              <div className="pairs__slide" key={image.id ?? image.url}>
                <Image
                  data={image}
                  alt={image.altText || product.title}
                  aspectRatio="1/1"
                  sizes="(min-width: 64em) 30vw, 90vw"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>
          {images.length > 1 && (
            <>
              <button
                type="button"
                className="pairs__arrow pairs__arrow--prev"
                onClick={() => go(index - 1)}
                aria-label={t('pdp.prevImage')}
              >
                ‹
              </button>
              <button
                type="button"
                className="pairs__arrow pairs__arrow--next"
                onClick={() => go(index + 1)}
                aria-label={t('pdp.nextImage')}
              >
                ›
              </button>
              <div className="pairs__dots" aria-hidden="true">
                {images.map((image, i) => (
                  <span
                    key={image.id ?? image.url}
                    className={i === index ? 'is-active' : undefined}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="pairs__footer">
        <div className="pairs__price">
          <span>{t('pdp.price')}</span>
          <strong>
            <Price data={price} />
          </strong>
        </div>
        <Link
          to={`/products/${product.handle}`}
          prefetch="intent"
          className="pairs__cta"
        >
          {t('pdp.pairsView')}
        </Link>
      </div>
    </section>
  );
}
