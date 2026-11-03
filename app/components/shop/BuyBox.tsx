import {Link, useNavigate} from 'react-router';
import type {MappedProductOptions} from '@shopify/hydrogen';
import type {ProductVariantFragment} from 'storefrontapi.generated';
import {AddToCartButton} from '~/components/AddToCartButton';
import {BuyNowButton} from '~/components/BuyNowButton';
import {Accordion} from '~/components/Accordion';
import {Price} from '~/components/Price';
import type {SizeEntry} from '~/components/ProductSizeGuide';
import {SizeChartDialog} from '~/components/product/SizeChartDialog';
import {PaymentIcons} from '~/components/store/PaymentIcons';
import type {SizeChart} from '~/config/sizeCharts';
import {extractComposition} from '~/data/faq';
import {useAside} from '~/components/Aside';
import {useT} from '~/lib/i18n';

const COLOR = /^(colou?r|couleur)$/i;

/**
 * The right column of the product page: title, price (the old one struck
 * through, the new one in red with a "sale" label), options as rounded
 * buttons — colours as photos of the variant —, add to cart, buy now (the
 * Shopify checkout, where Google Pay, Apple Pay… appear when they are on),
 * the payment methods Shopify accepts, size chart, description, shipping
 * and care. Everything comes from the selected Shopify variant.
 */
export function BuyBox({
  title,
  variant,
  productOptions,
  sizes,
  sizeChart,
  description,
  descriptionHtml,
}: {
  title: string;
  variant: ProductVariantFragment | null | undefined;
  productOptions: MappedProductOptions[];
  sizes: SizeEntry[];
  sizeChart: SizeChart | null;
  description: string;
  descriptionHtml?: string | null;
}) {
  const t = useT();
  const {open} = useAside();
  const available = Boolean(variant?.availableForSale);
  const price = variant?.price;
  const compareAt = variant?.compareAtPrice;
  const onSale =
    price && compareAt && Number(compareAt.amount) > Number(price.amount);
  const lines = variant ? [{merchandiseId: variant.id, quantity: 1}] : [];
  const composition = extractComposition(description);

  return (
    <div className="st-buy">
      <h1 className="st-buy__title">{title}</h1>
      {price && (
        <p className="st-buy__price">
          {onSale && (
            <s>
              <Price data={compareAt} />
            </s>
          )}
          <Price data={price} className={onSale ? 'st-buy__now' : undefined} />
          {onSale && <span className="st-buy__sale">{t('store.sale')}</span>}
        </p>
      )}

      <OptionPicker productOptions={productOptions} />

      <div className="st-buy__chart">
        <SizeChartDialog title={title} chart={sizeChart} sizes={sizes} />
      </div>

      <div className="st-buy__actions">
        <AddToCartButton
          className="st-pill st-pill--outline st-pill--block"
          disabled={!available || !variant}
          onClick={() => open('cart')}
          lines={variant ? [{...lines[0], selectedVariant: variant}] : []}
        >
          {available ? t('product.addToCart') : t('product.soldOut')}
        </AddToCartButton>
        {available && (
          <BuyNowButton
            className="st-pill st-pill--dark st-pill--block"
            lines={lines}
          >
            {t('product.buyNow')}
          </BuyNowButton>
        )}
      </div>

      <div className="st-buy__secure">
        <PaymentIcons label={t('store.secureCheckout')} />
      </div>

      {descriptionHtml && (
        <div
          className="st-buy__description"
          dangerouslySetInnerHTML={{__html: descriptionHtml}}
        />
      )}

      <div className="st-buy__details">
        <Accordion title={t('pdp.shippingReturns')}>
          <p>
            <Link to="/legal/shipping">{t('footer.shipping')}</Link>
            {' · '}
            <Link to="/legal/returns">{t('footer.returns')}</Link>
          </p>
        </Accordion>
        <Accordion title={t('pdp.fabricsCare')}>
          <p>{composition ? `${composition}.` : t('faqData.compositionA')}</p>
          <p>{t('faqData.careA')}</p>
        </Accordion>
      </div>
    </div>
  );
}

/**
 * Options as rounded buttons (the chosen one filled, sold-out ones struck
 * through); a colour option shows the photo of each colour's variant.
 */
function OptionPicker({
  productOptions,
}: {
  productOptions: MappedProductOptions[];
}) {
  const t = useT();
  const navigate = useNavigate();

  return (
    <>
      {productOptions
        .filter((option) => option.optionValues.length > 1)
        .map((option) => {
          const isColor = COLOR.test(option.name.trim());
          const selected = option.optionValues.find((value) => value.selected);
          return (
            <fieldset className="st-option" key={option.name}>
              <legend className="st-option__label">
                {/taille|size/i.test(option.name) ? t('pdp.size') : option.name}
                {isColor && selected ? `: ${selected.name}` : ''}
              </legend>
              <div className="st-option__values">
                {option.optionValues.map((value) => {
                  const photo =
                    value.swatch?.image?.previewImage?.url ??
                    value.firstSelectableVariant?.image?.url;
                  const content =
                    isColor && photo ? (
                      <img
                        src={`${photo}${photo.includes('?') ? '&' : '?'}width=80`}
                        alt={value.name}
                      />
                    ) : (
                      value.name
                    );
                  const className = `st-option__value${isColor && photo ? ' st-option__value--photo' : ''}`;
                  return value.isDifferentProduct ? (
                    <Link
                      key={value.name}
                      className={className}
                      to={`/products/${value.handle}?${value.variantUriQuery}`}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      aria-current={value.selected || undefined}
                      data-unavailable={!value.available || undefined}
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      key={value.name}
                      type="button"
                      className={className}
                      aria-pressed={value.selected}
                      aria-label={isColor && photo ? value.name : undefined}
                      data-unavailable={!value.available || undefined}
                      disabled={!value.exists}
                      onClick={() => {
                        if (!value.selected) {
                          void navigate(`?${value.variantUriQuery}`, {
                            replace: true,
                            preventScrollReset: true,
                          });
                        }
                      }}
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
    </>
  );
}
