import {Link, useNavigate} from 'react-router';
import type {MappedProductOptions} from '@shopify/hydrogen';
import type {ProductVariantFragment} from 'storefrontapi.generated';
import {AddToCartButton} from '~/components/AddToCartButton';
import {BuyNowButton} from '~/components/BuyNowButton';
import {Accordion} from '~/components/Accordion';
import {Price} from '~/components/Price';
import type {SizeEntry} from '~/components/ProductSizeGuide';
import {SizeChartDialog} from '~/components/product/SizeChartDialog';
import type {SizeChart} from '~/config/sizeCharts';
import {extractComposition} from '~/data/faq';
import {useAside} from '~/components/Aside';
import {useT} from '~/lib/i18n';

/**
 * The right column of the product page: title, price, options as plain
 * text (sold-out values struck through), add to cart, buy now, size chart,
 * the Shopify description, then "shipping, exchange & returns" and
 * "fabrics & care". Everything comes from the selected Shopify variant.
 */
export function BuyBox({
  title,
  variant,
  productOptions,
  sizes,
  sizeChart,
  description,
  descriptionHtml,
  children,
}: {
  title: string;
  variant: ProductVariantFragment | null | undefined;
  productOptions: MappedProductOptions[];
  sizes: SizeEntry[];
  sizeChart: SizeChart | null;
  description: string;
  descriptionHtml?: string | null;
  /** Shown under the details ("complete the fit"). */
  children?: React.ReactNode;
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
    <div className="sx-buy">
      <h1 className="sx-buy__title">{title}</h1>
      {price && (
        <p className="sx-buy__price">
          {onSale && (
            <s>
              <Price data={compareAt} />
            </s>
          )}
          <Price data={price} />
        </p>
      )}
      <p className="sx-buy__note">
        <Link to="/legal/shipping">{t('product.shipping')}</Link>{' '}
        {t('product.calculatedAtCheckout')}
      </p>

      <OptionPicker productOptions={productOptions} />

      <div className="sx-buy__actions">
        <AddToCartButton
          className="sx-btn sx-btn--outline"
          disabled={!available || !variant}
          onClick={() => open('cart')}
          lines={variant ? [{...lines[0], selectedVariant: variant}] : []}
        >
          {available ? t('product.addToCart') : t('product.soldOut')}
        </AddToCartButton>
        {available && (
          <BuyNowButton className="sx-btn sx-btn--dark" lines={lines}>
            {t('product.buyNow')}
          </BuyNowButton>
        )}
      </div>

      <div className="sx-buy__chart">
        <SizeChartDialog title={title} chart={sizeChart} sizes={sizes} />
      </div>

      {descriptionHtml && (
        <div
          className="sx-buy__description"
          dangerouslySetInnerHTML={{__html: descriptionHtml}}
        />
      )}

      <div className="sx-buy__details">
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

      {children}
    </div>
  );
}

/** Options as text: the chosen value underlined, sold-out values struck. */
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
        .map((option) => (
          <fieldset className="sx-option" key={option.name}>
            <legend className="sx-option__label">
              {/taille|size/i.test(option.name) ? t('pdp.size') : option.name}
            </legend>
            <div className="sx-option__values">
              {option.optionValues.map((value) =>
                value.isDifferentProduct ? (
                  <Link
                    key={value.name}
                    className="sx-option__value"
                    to={`/products/${value.handle}?${value.variantUriQuery}`}
                    prefetch="intent"
                    preventScrollReset
                    replace
                    aria-current={value.selected || undefined}
                    data-unavailable={!value.available || undefined}
                  >
                    {value.name}
                  </Link>
                ) : (
                  <button
                    key={value.name}
                    type="button"
                    className="sx-option__value"
                    aria-pressed={value.selected}
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
                    {value.name}
                  </button>
                ),
              )}
            </div>
          </fieldset>
        ))}
    </>
  );
}
