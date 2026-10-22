import {useState} from 'react';
import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {useLocalized} from '~/lib/i18n/localized';
import {HOME} from '~/config/homeTemplate';
import {SectionHeading, useMoney} from '~/components/pdp/shared';
import type {LandingProduct} from '~/components/landing/products';

/**
 * Homepage mock-up 02 — the two best sellers face to face with a "VS" in
 * the middle; a colour picker per card swaps its photo (products with a
 * colour option only); one blue button, one pink. Real Shopify products,
 * best-selling first. Two columns on phones too (mock-up 07).
 */
export function BestSellerVs({products}: {products: LandingProduct[]}) {
  const pair = products.slice(0, 2);
  if (pair.length < 2) return null;

  return (
    <section className="hx-section hx-vs" aria-labelledby="hx-vs">
      <SectionHeading
        id="hx-vs"
        eyebrow={HOME.bestSeller.eyebrow}
        black={HOME.bestSeller.title}
      />
      <div className="hx-vs__grid">
        <VsCard product={pair[0]} tone="blue" />
        <span className="hx-vs__badge" aria-hidden="true">
          VS
        </span>
        <VsCard product={pair[1]} tone="pink" />
      </div>
    </section>
  );
}

function VsCard({
  product,
  tone,
}: {
  product: LandingProduct;
  tone: 'blue' | 'pink';
}) {
  const l = useLocalized();
  const money = useMoney();
  const [color, setColor] = useState(product.colors[0]?.name ?? null);
  const shown =
    product.colors.find((candidate) => candidate.name === color)?.image ??
    product.image;

  return (
    <article className="hx-vs__card" data-tone={tone}>
      {product.colors.length > 1 && (
        <div className="hx-colors" role="radiogroup" aria-label={product.title}>
          {product.colors.map((candidate) => (
            <button
              key={candidate.name}
              type="button"
              role="radio"
              aria-checked={candidate.name === color}
              className="hx-colors__pill"
              onClick={() => setColor(candidate.name)}
            >
              <span
                className="hx-colors__dot"
                style={{background: candidate.swatch ?? undefined}}
                aria-hidden="true"
              />
              {candidate.name}
            </button>
          ))}
        </div>
      )}
      <Link
        to={`/products/${product.handle}`}
        prefetch="intent"
        className="hx-vs__media"
        tabIndex={-1}
        aria-hidden="true"
      >
        {shown && (
          <Image
            data={shown}
            alt=""
            aspectRatio="5/4"
            sizes="(min-width: 64em) 37vw, 50vw"
            loading="lazy"
          />
        )}
      </Link>
      <div className="hx-vs__info">
        <span className="hx-vs__name">{product.title}</span>
        <span className="hx-vs__price">{money(product.price)}</span>
      </div>
      <Link
        to={`/products/${product.handle}`}
        prefetch="intent"
        className="hx-button hx-button--block"
        data-tone={tone}
      >
        {l(HOME.bestSeller.cta)}
      </Link>
    </article>
  );
}
