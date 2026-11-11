import {useEffect, useMemo, useState} from 'react';
import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {CurrencyCode} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from '~/components/reda/AddToCartButton';
import {PaymentIcons} from '~/components/store/PaymentIcons';
import {useAside} from '~/components/Aside';
import {SETS_BUNDLE} from '~/config/sets';
import {PROMOTIONS, isLive} from '~/config/promotions';
import {useT} from '~/lib/i18n';
import {OPEN_WELCOME_EVENT, hasSignedUp} from '~/components/NewsletterPopup';
import {
  addMoney,
  type Money as SetMoney,
  type SetData,
  type SetPiece,
} from '~/lib/sets';

function money(value: SetMoney) {
  return {
    amount: value.amount,
    currencyCode: value.currencyCode as CurrencyCode,
  };
}

/**
 * The buy column of a set page: both sizes picked by the customer (no size
 * is chosen for them), the two real lines added to the bag together, and
 * only offers Shopify really backs — the bundle line once its code exists,
 * the welcome discount while the pop-up's code is live.
 */
export function SetPurchase({set, others}: {set: SetData; others: SetData[]}) {
  const t = useT();
  const {open: openAside} = useAside();
  const [jacketId, setJacketId] = useState<string | null>(null);
  const [sweatsId, setSweatsId] = useState<string | null>(null);
  const [signedUp, setSignedUp] = useState(true);

  // Reset when moving to another colour.
  useEffect(() => {
    setJacketId(null);
    setSweatsId(null);
  }, [set.slug]);

  useEffect(() => {
    setSignedUp(hasSignedUp());
  }, []);

  const jacket = set.jacketPiece.variants.find((v) => v.id === jacketId);
  const sweats = set.sweatsPiece.variants.find((v) => v.id === sweatsId);
  const price = useMemo(
    () => (jacket && sweats ? addMoney(jacket.price, sweats.price) : set.price),
    [jacket, sweats, set.price],
  );
  const ready = Boolean(jacket && sweats);

  const welcome = PROMOTIONS.welcomePopup;
  const showWelcome = isLive(welcome) && !signedUp;
  const welcomePrice: SetMoney = {
    amount: ((Number(price.amount) * (100 - welcome.percent)) / 100).toFixed(2),
    currencyCode: price.currencyCode,
  };
  const bundleLive = isLive(SETS_BUNDLE);

  const lines = ready
    ? [
        {merchandiseId: jacket!.id, quantity: 1},
        {merchandiseId: sweats!.id, quantity: 1},
      ]
    : [];

  return (
    <div className="hs-set-buy">
      <p className="hs-set-buy__eyebrow">{t('sets.eyebrow')}</p>
      <h1 className="hs-set-buy__title">{set.title}</h1>
      <p className="hs-set-buy__price">
        <Money as="span" data={money(price)} />
      </p>

      {bundleLive && (
        <div className="hs-set-buy__deal">
          <span className="hs-set-buy__deal-tag">{t('sets.dealTag')}</span>
          <span>
            {t('sets.dealText', {
              count: SETS_BUNDLE.sets,
              amount: `€${SETS_BUNDLE.amount}`,
            })}
          </span>
        </div>
      )}

      {showWelcome && (
        <button
          type="button"
          className="hs-set-buy__welcome"
          onClick={() => window.dispatchEvent(new Event(OPEN_WELCOME_EVENT))}
        >
          <span>
            <strong>
              {t('sets.welcomeTitle')}{' '}
              <Money as="span" data={money(welcomePrice)} />
            </strong>
            <span className="hs-set-buy__welcome-sub">
              {t('sets.welcomeText', {percent: welcome.percent})}
            </span>
          </span>
          <span aria-hidden="true">→</span>
        </button>
      )}

      <SizePicker
        label={t('sets.jacketSize')}
        piece={set.jacketPiece}
        value={jacketId}
        onChange={setJacketId}
      />
      <SizePicker
        label={t('sets.sweatsSize')}
        piece={set.sweatsPiece}
        value={sweatsId}
        onChange={setSweatsId}
      />

      <p className="hs-set-buy__fit">{t('sets.fit')}</p>

      <AddToCartButton
        className="btn btn--full hs-set-buy__add"
        disabled={!ready || !set.available}
        onClick={() => openAside('cart')}
        lines={lines}
      >
        {!set.available ? (
          t('product.soldOut')
        ) : ready ? (
          <>
            {t('sets.addToBag')} · <Money as="span" data={money(price)} />
          </>
        ) : (
          t('sets.pickSizes')
        )}
      </AddToCartButton>

      <PaymentIcons
        className="hs-set-buy__payments"
        label={t('sets.secureCheckout')}
      />

      {others.length > 0 && (
        <div className="hs-set-buy__colors">
          <p className="hs-set-buy__label">
            {bundleLive
              ? t('sets.bundlePick', {
                  count: SETS_BUNDLE.sets,
                  amount: `€${SETS_BUNDLE.amount}`,
                })
              : t('sets.otherColors')}
          </p>
          <div className="hs-set-buy__swatches">
            {[set, ...others].map((item) => (
              <Link
                key={item.slug}
                to={`/sets/${item.slug}`}
                prefetch="intent"
                preventScrollReset
                className={`hs-set-buy__swatch${item.slug === set.slug ? ' is-current' : ''}`}
                aria-current={item.slug === set.slug ? 'page' : undefined}
              >
                {(item.jacketPiece.images[0] ?? item.image) && (
                  <Image
                    data={item.jacketPiece.images[0] ?? item.image!}
                    aspectRatio="1/1"
                    sizes="96px"
                    loading="lazy"
                  />
                )}
                <span>{item.color}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="hs-set-buy__separately">
        <p className="hs-set-buy__label">{t('sets.separately')}</p>
        <div className="hs-set-buy__pieces">
          {[
            {piece: set.jacketPiece, label: t('sets.jacketOnly')},
            {piece: set.sweatsPiece, label: t('sets.sweatsOnly')},
          ].map(({piece, label}) => (
            <Link
              key={piece.handle}
              to={`/products/${piece.handle}`}
              prefetch="intent"
              className="hs-set-buy__piece"
            >
              {piece.images[0] && (
                <img
                  src={`${piece.images[0].url}${piece.images[0].url.includes('?') ? '&' : '?'}width=160`}
                  alt=""
                  width={56}
                  height={56}
                  loading="lazy"
                />
              )}
              <span>
                <span className="hs-set-buy__piece-name">{label}</span>
                <strong>
                  <Money as="span" data={money(piece.price)} />
                </strong>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function SizePicker({
  label,
  piece,
  value,
  onChange,
}: {
  label: string;
  piece: SetPiece;
  value: string | null;
  onChange: (id: string) => void;
}) {
  const t = useT();
  return (
    <fieldset className="hs-set-buy__sizes">
      <legend className="hs-set-buy__label">{label}</legend>
      <div className="hs-set-buy__size-row">
        {piece.variants.map((variant) => (
          <button
            key={variant.id}
            type="button"
            className={`hs-set-buy__size${value === variant.id ? ' is-selected' : ''}`}
            aria-pressed={value === variant.id}
            disabled={!variant.availableForSale}
            aria-label={
              variant.availableForSale
                ? undefined
                : `${variant.size} — ${t('product.soldOut')}`
            }
            onClick={() => onChange(variant.id)}
          >
            {variant.size}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
