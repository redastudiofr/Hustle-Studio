import {useEffect, useId, useMemo, useState} from 'react';
import {Image} from '@shopify/hydrogen';
import type {OptimisticCartLineInput} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import type {BundleProductFragment} from 'storefrontapi.generated';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {Price} from '~/components/Price';
import {
  ALL_OFFERS,
  GIFT,
  GIFT_ATTRIBUTE,
  GIFT_LIVE,
  giftProgress,
  isOfferLive,
  quote,
  type BundleOffer,
} from '~/lib/bundles';
import {useT} from '~/lib/i18n';

type Variant = BundleProductFragment['variants']['nodes'][number];
type Slot = {productId: string; variantId: string};

export type BundleData = {
  preview: boolean;
  offerIds: string[];
  current: BundleProductFragment;
  others: BundleProductFragment[];
  gift: BundleProductFragment | null;
};

const firstAvailable = (product: BundleProductFragment) =>
  product.variants.nodes.find((variant) => variant.availableForSale) ??
  product.variants.nodes[0];

/** "M" rather than "M / Black" when only one option varies in the list. */
const variantLabel = (variant: Variant) =>
  variant.selectedOptions.length === 1
    ? variant.selectedOptions[0].value
    : variant.title;

/**
 * The bundle box: three offers (Duo, Trio, Best offer), the pieces picked
 * right inside it, live totals and the free T-shirt progress.
 *
 * Prices are real Shopify variant prices; the reductions follow the
 * matching Shopify discounts (app/lib/bundles.ts). Adding sends the pieces
 * through the cart's bundle action, which attaches the offer's code on the
 * server. In preview (?bundle=preview, offers without a code yet) the box
 * shows everything but cannot add: it never promises a price Shopify would
 * not charge.
 */
export function SmartBundle({
  data,
  selectedVariantId,
}: {
  data: BundleData;
  selectedVariantId?: string;
}) {
  const t = useT();
  const {open: openAside} = useAside();
  const groupId = useId();

  const offers = useMemo(
    () => ALL_OFFERS.filter((offer) => data.offerIds.includes(offer.id)),
    [data.offerIds],
  );
  const {current: currentProduct, others} = data;
  const products = useMemo(
    () => [currentProduct, ...others],
    [currentProduct, others],
  );
  const byId = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const [offerId, setOfferId] = useState(
    () => (offers.find((offer) => offer.badge) ?? offers[0])?.id ?? '',
  );
  const offer =
    offers.find((candidate) => candidate.id === offerId) ?? offers[0];

  // Piece 1 is this product in the size picked above; the others default to
  // the next best sellers, each in its first available size.
  const defaultSlot = (index: number): Slot => {
    if (index === 0) {
      const picked = data.current.variants.nodes.find(
        (variant) =>
          variant.id === selectedVariantId && variant.availableForSale,
      );
      return {
        productId: data.current.id,
        variantId: (picked ?? firstAvailable(data.current)).id,
      };
    }
    const product =
      data.others[(index - 1) % Math.max(data.others.length, 1)] ??
      data.current;
    return {productId: product.id, variantId: firstAvailable(product).id};
  };

  const [slots, setSlots] = useState<Slot[]>(() =>
    Array.from({length: offer?.items ?? 2}, (_, i) => defaultSlot(i)),
  );

  // Follow the size chosen in the buy box for piece 1.
  useEffect(() => {
    setSlots((current) => {
      const picked = currentProduct.variants.nodes.find(
        (variant) =>
          variant.id === selectedVariantId && variant.availableForSale,
      );
      if (!picked || current[0]?.productId !== currentProduct.id)
        return current;
      return [
        {productId: currentProduct.id, variantId: picked.id},
        ...current.slice(1),
      ];
    });
  }, [selectedVariantId, currentProduct]);

  const [giftVariantId, setGiftVariantId] = useState(() =>
    data.gift ? firstAvailable(data.gift).id : '',
  );

  if (!offer) return null;

  // The selected offer needs exactly its piece count, or more up to maxItems.
  const count = Math.min(
    Math.max(slots.length, offer.items),
    offer.maxItems ?? offer.items,
  );
  const shown = Array.from(
    {length: count},
    (_, i) => slots[i] ?? defaultSlot(i),
  );

  const variantOf = (slot: Slot) =>
    byId
      .get(slot.productId)
      ?.variants.nodes.find((v) => v.id === slot.variantId);
  const priceOf = (slot: Slot) => Number(variantOf(slot)?.price.amount ?? 0);
  const currency =
    variantOf(shown[0])?.price.currencyCode ??
    data.current.variants.nodes[0]?.price.currencyCode ??
    'EUR';

  const pricesFor = (n: number) =>
    Array.from({length: n}, (_, i) => priceOf(shown[i] ?? defaultSlot(i)));
  const current = quote(offer, pricesFor(count));

  const giftOffer = offer.gift && (GIFT_LIVE || data.preview);
  const progress = giftOffer ? giftProgress(current.total) : null;
  const giftUnlocked = Boolean(progress?.unlocked);
  const giftVariant = data.gift?.variants.nodes.find(
    (v) => v.id === giftVariantId,
  );

  const live = isOfferLive(offer);
  const allAvailable = shown.every((slot) => variantOf(slot)?.availableForSale);

  const setSlot = (index: number, next: Partial<Slot>) =>
    setSlots((current) => {
      const copy = Array.from(
        {length: Math.max(current.length, count)},
        (_, i) => current[i] ?? defaultSlot(i),
      );
      const merged = {...copy[index], ...next};
      if (next.productId && next.productId !== copy[index].productId) {
        const product = byId.get(next.productId);
        if (product) merged.variantId = firstAvailable(product).id;
      }
      copy[index] = merged;
      return copy;
    });

  // Cart lines: the same variant twice becomes one line of quantity 2.
  const lines: OptimisticCartLineInput[] = [];
  for (const slot of shown) {
    const existing = lines.find(
      (line) => line.merchandiseId === slot.variantId,
    );
    if (existing) existing.quantity = (existing.quantity ?? 1) + 1;
    else lines.push({merchandiseId: slot.variantId, quantity: 1});
  }
  if (giftUnlocked && GIFT_LIVE && giftVariant?.availableForSale) {
    lines.push({
      merchandiseId: giftVariant.id,
      quantity: 1,
      attributes: [{key: GIFT_ATTRIBUTE, value: 'true'}],
    });
  }

  const money = (amount: number) => (
    <Price
      data={{
        amount: amount.toFixed(2),
        currencyCode: currency as MoneyV2['currencyCode'],
      }}
    />
  );

  return (
    <section className="bundle" aria-labelledby={`${groupId}-title`}>
      <p className="bundle__eyebrow">{t('bundle.eyebrow')}</p>
      <h2 className="bundle__title" id={`${groupId}-title`}>
        {t('bundle.title')}
      </h2>
      <span className="bundle__rule" aria-hidden="true" />

      {data.preview && (
        <p className="bundle__preview" role="note">
          {t('bundle.previewNote')}
        </p>
      )}

      <div
        className="bundle__offers"
        role="radiogroup"
        aria-label={t('bundle.title')}
      >
        {offers.map((candidate) => {
          const selected = candidate.id === offer.id;
          const n = selected ? count : Math.max(candidate.items, 1);
          const q = quote(candidate, pricesFor(n));
          return (
            <div
              key={candidate.id}
              className={`bundle-offer ${selected ? 'is-selected' : ''} ${candidate.badge ? 'bundle-offer--featured' : ''} bundle-offer--${candidate.id}`}
            >
              {candidate.badge && (
                <span className="bundle-offer__badge">{candidate.badge}</span>
              )}
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                className="bundle-offer__head"
                onClick={() => {
                  setOfferId(candidate.id);
                  // Keep the pieces already chosen, to the new offer's count.
                  setSlots(
                    Array.from(
                      {length: candidate.items},
                      (_, i) => shown[i] ?? defaultSlot(i),
                    ),
                  );
                }}
              >
                <span className="bundle-offer__radio" aria-hidden="true" />
                <span className="bundle-offer__names">
                  <strong>{candidate.name}</strong>
                  <span>{candidate.rule}</span>
                </span>
                <span className="bundle-offer__prices">
                  <strong>{money(q.total)}</strong>
                  {q.saving > 0 && <s>{money(q.full)}</s>}
                  <span className="bundle-offer__percent">
                    −{q.percentSaved}%
                  </span>
                </span>
              </button>

              <div className="bundle-offer__body" aria-hidden={!selected}>
                <div className="bundle-offer__clip">
                  {selected && (
                    <OfferBody
                      offer={candidate}
                      shown={shown}
                      quoteIndex={q.discountedIndex}
                      products={products}
                      byId={byId}
                      setSlot={setSlot}
                      onAdd={() =>
                        setSlots([...shown, defaultSlot(shown.length)])
                      }
                      onRemove={() => setSlots(shown.slice(0, -1))}
                      money={money}
                      priceOf={priceOf}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {progress && (
        <div className={`bundle-gift ${giftUnlocked ? 'is-unlocked' : ''}`}>
          <div className="bundle-gift__line">
            <span className="bundle-gift__chip">
              {giftUnlocked
                ? '🎁'
                : `+${progress.remaining.toFixed(2).replace(/\.00$/, '')} €`}
            </span>
            <span className="bundle-gift__text" aria-live="polite">
              {giftUnlocked
                ? t('bundle.giftUnlocked', {gift: GIFT.label})
                : t('bundle.giftRemaining', {
                    amount: progress.remaining.toFixed(2).replace(/\.00$/, ''),
                    gift: GIFT.label.toLowerCase(),
                  })}
            </span>
          </div>
          <div
            className="bundle-gift__bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress.ratio * 100)}
            aria-label={GIFT.label}
          >
            <span style={{transform: `scaleX(${progress.ratio})`}} />
          </div>
          {giftUnlocked && data.gift && (
            <div className="bundle-gift__pick">
              {data.gift.featuredImage && (
                <Image
                  data={data.gift.featuredImage}
                  alt={data.gift.title}
                  aspectRatio="1/1"
                  width={56}
                />
              )}
              <span className="bundle-gift__name">{data.gift.title}</span>
              {data.gift.variants.nodes.length > 1 && (
                <select
                  className="bundle-select"
                  value={giftVariantId}
                  onChange={(event) => setGiftVariantId(event.target.value)}
                  aria-label={t('bundle.size')}
                >
                  {data.gift.variants.nodes.map((variant) => (
                    <option
                      key={variant.id}
                      value={variant.id}
                      disabled={!variant.availableForSale}
                    >
                      {variantLabel(variant)}
                    </option>
                  ))}
                </select>
              )}
              <span className="bundle-gift__free">{t('bundle.free')}</span>
            </div>
          )}
        </div>
      )}

      <div className="bundle__summary">
        <div>
          <span className="bundle__summary-label">{t('bundle.total')}</span>
          <strong key={current.total} className="bundle__total">
            {money(current.total)}
          </strong>
          {current.saving > 0 && <s>{money(current.full)}</s>}
        </div>
        {current.saving > 0 && (
          <span key={current.saving} className="bundle__saving">
            {t('bundle.youSave', {amount: current.saving.toFixed(2)})}
            {' · '}−{current.percentSaved}%
          </span>
        )}
      </div>

      <AddToCartButton
        className="btn btn--full bundle__cta"
        lines={lines}
        bundle={{offer: offer.id, gift: giftUnlocked && GIFT_LIVE}}
        disabled={!live || !allAvailable}
        onClick={() => openAside('cart')}
      >
        {!live
          ? t('bundle.previewCta')
          : giftUnlocked && GIFT_LIVE
            ? t('bundle.addWithGift', {
                offer: offer.name,
                gift: GIFT.label.toLowerCase(),
              })
            : t('bundle.add', {offer: offer.name, count: shown.length})}
      </AddToCartButton>
    </section>
  );
}

function OfferBody({
  offer,
  shown,
  quoteIndex,
  products,
  byId,
  setSlot,
  onAdd,
  onRemove,
  money,
  priceOf,
}: {
  offer: BundleOffer;
  shown: Slot[];
  quoteIndex: number | null;
  products: BundleProductFragment[];
  byId: Map<string, BundleProductFragment>;
  setSlot: (index: number, next: Partial<Slot>) => void;
  onAdd: () => void;
  onRemove: () => void;
  money: (amount: number) => React.ReactNode;
  priceOf: (slot: Slot) => number;
}) {
  const t = useT();
  const max = offer.maxItems ?? offer.items;

  return (
    <div className="bundle-offer__inner">
      <ol className="bundle-slots">
        {shown.map((slot, index) => {
          const product = byId.get(slot.productId);
          if (!product) return null;
          const price = priceOf(slot);
          const discounted =
            offer.appliesTo === 'order' || index === quoteIndex;
          return (
            // eslint-disable-next-line react/no-array-index-key -- slots are positional
            <li key={index} className="bundle-slot">
              <span className="bundle-slot__thumb">
                {product.featuredImage && (
                  <Image
                    data={product.featuredImage}
                    alt=""
                    aspectRatio="4/5"
                    width={64}
                  />
                )}
              </span>
              <span className="bundle-slot__fields">
                <select
                  className="bundle-select"
                  value={slot.productId}
                  onChange={(event) =>
                    setSlot(index, {productId: event.target.value})
                  }
                  aria-label={t('bundle.piece', {n: index + 1})}
                >
                  {products.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.title}
                    </option>
                  ))}
                </select>
                {product.variants.nodes.length > 1 && (
                  <select
                    className="bundle-select bundle-select--size"
                    value={slot.variantId}
                    onChange={(event) =>
                      setSlot(index, {variantId: event.target.value})
                    }
                    aria-label={t('bundle.size')}
                  >
                    {product.variants.nodes.map((variant) => (
                      <option
                        key={variant.id}
                        value={variant.id}
                        disabled={!variant.availableForSale}
                      >
                        {variantLabel(variant)}
                      </option>
                    ))}
                  </select>
                )}
              </span>
              <span className="bundle-slot__price">
                {discounted ? (
                  <>
                    <strong>{money(price * (1 - offer.percent / 100))}</strong>
                    <s>{money(price)}</s>
                    <em>−{offer.percent}%</em>
                  </>
                ) : (
                  <strong>{money(price)}</strong>
                )}
              </span>
            </li>
          );
        })}
      </ol>

      {max > offer.items && (
        <div className="bundle-slots__more">
          {shown.length < max && (
            <button type="button" className="bundle-more" onClick={onAdd}>
              + {t('bundle.addPiece')}
            </button>
          )}
          {shown.length > offer.items && (
            <button
              type="button"
              className="bundle-more bundle-more--ghost"
              onClick={onRemove}
            >
              − {t('bundle.removePiece')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
