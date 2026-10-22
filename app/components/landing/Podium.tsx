import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {useLocalized} from '~/lib/i18n/localized';
import {HOME} from '~/config/homeTemplate';
import {SectionHeading, useMoney} from '~/components/pdp/shared';
import type {LandingProduct} from '~/components/landing/products';

/**
 * Homepage mock-up 05 — the top three sales on steps: n°1 in the centre,
 * higher and blue, n°2 on its left, n°3 on its right. The order is
 * Shopify's best-selling sort; on phones the steps stack 1, 2, 3.
 */
export function Podium({products}: {products: LandingProduct[]}) {
  const l = useLocalized();
  const money = useMoney();
  const top = products.slice(0, 3);
  if (top.length < 3) return null;

  return (
    <section className="hx-section hx-podium" aria-labelledby="hx-podium">
      <SectionHeading
        id="hx-podium"
        eyebrow={HOME.podium.eyebrow}
        black={HOME.podium.title.black}
        blue={HOME.podium.title.blue}
      />
      <ol className="hx-podium__steps">
        {top.map((product, index) => (
          <li
            key={product.id}
            className="hx-podium__step"
            data-rank={index + 1}
          >
            <Link
              to={`/products/${product.handle}`}
              prefetch="intent"
              className="hx-podium__card"
            >
              <div className="hx-podium__photo">
                {product.image && (
                  <Image
                    data={product.image}
                    alt={product.image.altText || product.title}
                    aspectRatio="1/1"
                    sizes="(min-width: 64em) 26vw, 80vw"
                    loading="lazy"
                  />
                )}
              </div>
              <span className="hx-podium__name">{product.title}</span>
              <span className="hx-podium__price">{money(product.price)}</span>
            </Link>
            <span className="hx-podium__block" aria-hidden="true">
              {index + 1}
            </span>
          </li>
        ))}
      </ol>
      <div className="hx-actions">
        <Link to={HOME.podium.to} className="hx-button" data-tone="outline">
          {l(HOME.podium.cta)}
        </Link>
      </div>
    </section>
  );
}
