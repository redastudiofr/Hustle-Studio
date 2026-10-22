import {Suspense, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {Await} from 'react-router';
import {useLocalized} from '~/lib/i18n/localized';
import {PDP} from '~/config/productTemplate';
import {Accordion} from '~/components/Accordion';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {PackSelector} from '~/components/pdp/PackSelector';
import {CheckIcon, Stars, fill, useMoney} from '~/components/pdp/shared';
import type {PackModel, PackSelection} from '~/components/pdp/usePackSelection';
import type {ProductRating} from '~/lib/rating';

/**
 * Right column of mock-up 01 (and the body of mock-up 09): badges, title,
 * rating, three arguments, the pack selector, the add-to-cart button with
 * the total, payment line, reassurance, and the accordions.
 */
export function PdpBuyBox({
  title,
  product,
  selection,
  salesCount,
  badge,
  rating,
  descriptionHtml,
  sizeGuide,
  shippingInfo,
}: {
  title: string;
  product: PackModel;
  selection: PackSelection;
  salesCount: number | null;
  badge: string | null;
  rating: Promise<ProductRating | null>;
  descriptionHtml: string;
  sizeGuide: React.ReactNode;
  shippingInfo: React.ReactNode;
}) {
  const l = useLocalized();
  const money = useMoney();
  const ctaRef = useRef<HTMLDivElement>(null);
  const {open} = useAside();

  return (
    <div className="pdpx-buy">
      {(salesCount || badge) && (
        <div className="pdpx-badges">
          {salesCount ? (
            <span className="pdpx-badge pdpx-badge--blue">
              ★ {salesCount} {l(PDP.badges.sales)}
            </span>
          ) : null}
          {badge && (
            <span className="pdpx-badge pdpx-badge--green">{badge}</span>
          )}
        </div>
      )}

      <h1 className="pdpx-buy__title">{title}</h1>

      <Suspense fallback={<div className="pdpx-rating pdpx-rating--empty" />}>
        <Await resolve={rating} errorElement={null}>
          {(value) =>
            value ? (
              <p className="pdpx-rating">
                <Stars value={value.value} />
                <strong>
                  {value.value.toFixed(1).replace('.', l({en: '.', fr: ','}))}
                  /5
                </strong>
                {value.count ? (
                  <span>
                    · {value.count}{' '}
                    <span className="pdpx-rating__long">
                      {l(PDP.ratingVerified)}
                    </span>
                    <span className="pdpx-rating__short">
                      {l(PDP.ratingShort)}
                    </span>
                  </span>
                ) : null}
              </p>
            ) : null
          }
        </Await>
      </Suspense>

      <ul className="pdpx-args">
        {PDP.arguments.map((argument) => (
          <li key={l(argument.label)}>
            <strong>{l(argument.label)}</strong>
            <span>{l(argument.detail)}</span>
          </li>
        ))}
      </ul>

      <PackSelector product={product} selection={selection} />

      <div className="pdpx-cta" ref={ctaRef}>
        <AddToCartButton
          lines={selection.lines}
          disabled={!selection.ready}
          className="pdpx-cta__button"
          teePack={{offer: selection.option.id}}
          onClick={() => open('cart')}
        >
          {selection.ready ? (
            <>
              {l(PDP.pack.cta)}
              <span className="pdpx-cta__price">
                {' '}
                – {money(selection.total)}
              </span>
            </>
          ) : (
            l(PDP.pack.soldOut)
          )}
        </AddToCartButton>
        <p className="pdpx-payment">
          <span className="pdpx-payment__long">{l(PDP.payment.desktop)}</span>
          <span className="pdpx-payment__short">{l(PDP.payment.mobile)}</span>
        </p>
      </div>

      <ul className="pdpx-reassure">
        {PDP.reassurance.map((line) => (
          <li key={l(line)}>
            <CheckIcon />
            {l(line)}
          </li>
        ))}
      </ul>

      <div className="pdpx-accordions">
        {descriptionHtml && (
          <Accordion title={l(PDP.accordions.description)}>
            <div
              className="pdp-description"
              dangerouslySetInnerHTML={{__html: descriptionHtml}}
            />
          </Accordion>
        )}
        {sizeGuide && (
          <Accordion title={l(PDP.accordions.sizeGuide)}>{sizeGuide}</Accordion>
        )}
        <Accordion title={l(PDP.accordions.shipping)}>{shippingInfo}</Accordion>
      </div>

      <StickyCartBar anchor={ctaRef} selection={selection} title={title} />
    </div>
  );
}

/**
 * Phones (mock-up 09): once the main button has scrolled out of view
 * upwards, a bar with the pack, its total and an "Add" button stays at the
 * bottom of the screen. Same lines as the main button.
 */
function StickyCartBar({
  anchor,
  selection,
  title,
}: {
  anchor: React.RefObject<HTMLDivElement | null>;
  selection: PackSelection;
  title: string;
}) {
  const l = useLocalized();
  const money = useMoney();
  const [visible, setVisible] = useState(false);
  const {open} = useAside();

  useEffect(() => {
    const node = anchor.current;
    if (!node) return;
    // A scroll check rather than an IntersectionObserver: a fast fling (or
    // a jump to an anchor) carries the button straight from below the
    // screen to above it, which an observer never reports.
    let frame = 0;
    const update = () => {
      frame = 0;
      setVisible(node.getBoundingClientRect().bottom < 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onScroll, {passive: true});
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [anchor]);

  const {option} = selection;
  const name = option.free
    ? fill(l(PDP.pack.packName), {buy: option.buy, free: option.free})
    : l(PDP.pack.single);

  // Rendered into <body>: <main> carries an entrance animation (a
  // transform), and a fixed element inside a transformed one would stick
  // to it instead of to the screen.
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => setHost(document.body), []);
  if (!host) return null;

  return createPortal(
    <div
      className="pdpx-sticky"
      data-visible={visible || undefined}
      aria-hidden={!visible}
    >
      {selection.firstImage && (
        <img
          className="pdpx-sticky__thumb"
          src={`${selection.firstImage.url}${selection.firstImage.url.includes('?') ? '&' : '?'}width=96`}
          alt=""
          width="44"
          height="44"
          loading="lazy"
        />
      )}
      <div className="pdpx-sticky__text">
        <strong>{name}</strong>
        <span>{money(selection.total)}</span>
      </div>
      <AddToCartButton
        lines={selection.lines}
        disabled={!selection.ready || !visible}
        className="pdpx-sticky__button"
        teePack={{offer: option.id}}
        onClick={() => open('cart')}
        ariaLabel={`${l(PDP.pack.cta)} — ${title} — ${name}`}
      >
        {l(PDP.pack.ctaShort)}
      </AddToCartButton>
    </div>,
    host,
  );
}
