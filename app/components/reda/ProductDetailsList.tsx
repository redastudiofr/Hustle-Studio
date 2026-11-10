import type {ProductDetails} from '~/lib/productDetails';
import {useT} from '~/lib/i18n';

/**
 * "the details": one line per fact this product states about itself — cut,
 * sizes, material or composition, construction details, where it is made,
 * care (app/lib/productDetails.ts). A line with nothing to say is left out.
 */
export function ProductDetailsList({details}: {details: ProductDetails}) {
  const t = useT();
  const rows = [
    {label: t('details.cut'), value: details.fit},
    {label: t('details.sizes'), value: details.sizes},
    {label: t('details.sizeAdvice'), value: details.sizeAdvice},
    details.composition
      ? {label: t('details.composition'), value: details.composition}
      : {label: t('details.material'), value: details.material},
    {
      label: t('details.features'),
      value: details.features.length ? details.features.join(' · ') : null,
    },
    {label: t('details.madeInLabel'), value: details.madeIn},
    {label: t('details.care'), value: details.care},
  ].filter((row): row is {label: string; value: string} => Boolean(row.value));

  return (
    <section className="pdp__section product-details">
      <h2 className="pdp__section-title">{t('details.title')}</h2>
      <p className="product-details__summary">{details.summary}</p>
      <dl className="product-details__list">
        {rows.map((row) => (
          <div className="product-details__row" key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
