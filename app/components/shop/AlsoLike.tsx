import type {RecoProductFragment} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {useT} from '~/lib/i18n';

/** "You may also like": four products Shopify recommends. */
export function AlsoLike({items}: {items: RecoProductFragment[]}) {
  const t = useT();
  if (!items.length) return null;
  return (
    <section className="sx-also" aria-labelledby="sx-also-title">
      <h2 className="sx-also__title" id="sx-also-title">
        {t('pdp.alsoLike')}
      </h2>
      <div className="sx-also__grid">
        {items.slice(0, 4).map((product) => (
          <ProductItem
            key={product.id}
            product={product}
            variant="rail"
            loading="lazy"
          />
        ))}
      </div>
    </section>
  );
}
