import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {useLocalized} from '~/lib/i18n/localized';
import {PDP} from '~/config/productTemplate';
import {SectionHeading, useMoney} from '~/components/pdp/shared';

export type CollectionCard = {
  id: string;
  title: string;
  handle: string;
  price: number;
  image?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
};

/** Products in the grid (mock-up 07: five). */
const COUNT = 5;

/**
 * Mock-up 07 — the collection's designs, real Shopify products. The "2
 * bought = 1 free" line shows only while that pack is live.
 */
export function PdpCollection({
  products,
  showPackLine,
}: {
  products: CollectionCard[];
  showPackLine: boolean;
}) {
  const l = useLocalized();
  const money = useMoney();
  if (!products.length) return null;

  return (
    <section
      className="pdpx-section pdpx-collection"
      aria-labelledby="pdpx-collection"
    >
      <SectionHeading
        id="pdpx-collection"
        eyebrow={PDP.collection.eyebrow}
        black={PDP.collection.title.black}
        blue={PDP.collection.title.blue}
      />
      {showPackLine && <p className="pdpx-sub">{l(PDP.collection.text)}</p>}
      <ul className="pdpx-collection__grid">
        {products.slice(0, COUNT).map((product) => (
          <li key={product.id}>
            <Link
              to={`/products/${product.handle}`}
              prefetch="intent"
              className="pdpx-card"
            >
              <span className="pdpx-card__media">
                {product.image && (
                  <Image
                    data={product.image}
                    alt={product.image.altText || product.title}
                    aspectRatio="1/1"
                    sizes="(min-width: 64em) 20vw, 50vw"
                    loading="lazy"
                  />
                )}
              </span>
              <span className="pdpx-card__title">{product.title}</span>
              <span className="pdpx-card__price">{money(product.price)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
