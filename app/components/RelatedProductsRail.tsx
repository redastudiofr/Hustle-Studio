import type {RecoProductFragment} from 'storefrontapi.generated';
import {ProductRail} from '~/components/ProductRail';
import {useT} from '~/lib/i18n';

/**
 * "You may also like" on product pages. `items` is already filtered by the
 * route loader to real, available, de-duplicated Shopify products.
 */
export function RelatedProductsRail({items}: {items: RecoProductFragment[]}) {
  const t = useT();
  return (
    <ProductRail
      id="related"
      title={t('product.youMightLike')}
      products={items}
    />
  );
}
