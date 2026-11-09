import {useEffect, useState} from 'react';
import {Link} from 'react-router';
import type {ComponentProps} from 'react';
import {ProductItem} from '~/components/ProductItem';
import {Reveal} from '~/components/Reveal';
import {useHorizontalRail} from '~/lib/useHorizontalRail';
import {useT} from '~/lib/i18n';

type RailProduct = ComponentProps<typeof ProductItem>['product'];

/**
 * Homepage product carousel: a bold title on the left, "view all" on the
 * right, a row of cards on grey tiles, and under it two arrows and a thin
 * bar showing how far the row has been scrolled. Swipe on touch, drag or
 * arrows on desktop (useHorizontalRail). Styles: `on-rail` in on.css.
 */
export function OnRail({
  id,
  title,
  products,
  link,
}: {
  id: string;
  title: string;
  products: RailProduct[];
  link?: {label: string; to: string};
}) {
  const t = useT();
  const {ref, scrollByCard} = useHorizontalRail<HTMLDivElement>();
  const [progress, setProgress] = useState({start: 0, size: 1});

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => {
      const total = node.scrollWidth || 1;
      setProgress({
        start: node.scrollLeft / total,
        size: Math.min(1, node.clientWidth / total),
      });
    };
    update();
    node.addEventListener('scroll', update, {passive: true});
    window.addEventListener('resize', update);
    return () => {
      node.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [ref, products.length]);

  if (!products.length) return null;
  const headingId = `${id}-heading`;
  const scrollable = progress.size < 0.999;

  return (
    <Reveal as="section" className="on-rail" aria-labelledby={headingId}>
      <div className="on-head">
        <h2 className="on-head__title" id={headingId}>
          {title}
        </h2>
        {link && (
          <Link to={link.to} prefetch="intent" className="on-head__link">
            {link.label}
          </Link>
        )}
      </div>
      <div className="on-rail__track" ref={ref}>
        {products.map((product, index) => (
          <div className="on-rail__item" key={product.id}>
            <ProductItem
              product={product}
              loading={index < 4 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>
      {scrollable && (
        <div className="on-rail__controls">
          <button
            type="button"
            className="on-rail__arrow"
            onClick={() => scrollByCard(-1)}
            aria-label={t('rail.prevProduct')}
          >
            <Arrow flip />
          </button>
          <button
            type="button"
            className="on-rail__arrow"
            onClick={() => scrollByCard(1)}
            aria-label={t('rail.nextProduct')}
          >
            <Arrow />
          </button>
          <span className="on-rail__bar" aria-hidden="true">
            <span
              className="on-rail__bar-fill"
              style={{
                width: `${progress.size * 100}%`,
                transform: `translateX(${(progress.start / progress.size) * 100}%)`,
              }}
            />
          </span>
        </div>
      )}
    </Reveal>
  );
}

function Arrow({flip = false}: {flip?: boolean}) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      style={flip ? {transform: 'scaleX(-1)'} : undefined}
    >
      <path d="M2 9h13M10 4l5 5-5 5" />
    </svg>
  );
}
