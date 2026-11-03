import type {RecoProductFragment} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {useT} from '~/lib/i18n';

/** "Related products": four products Shopify recommends. */
export function AlsoLike({items}: {items: RecoProductFragment[]}) {
  const t = useT();
  if (!items.length) return null;
  return (
    <section className="st-related" aria-labelledby="st-related-title">
      <h2 className="st-related__title" id="st-related-title">
        {t('store.relatedProducts')}
      </h2>
      <div className="st-grid">
        {items.slice(0, 4).map((product) => (
          <ProductItem key={product.id} product={product} loading="lazy" />
        ))}
      </div>
    </section>
  );
}
