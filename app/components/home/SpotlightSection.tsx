import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {HomeProductFragment} from 'storefrontapi.generated';
import type {HomeSection} from '~/config/home';
import {ProductItem} from '~/components/ProductItem';
import {Reveal} from '~/components/Reveal';
import {useLocalized} from '~/lib/i18n/localized';

/**
 * One product line put forward (e.g. CY Jogging): a dark full-width band
 * with a large photo, the line's story and its products. The photo is the
 * first product's second Shopify image (usually the piece worn), else its
 * main one — so it changes with the catalogue, never with the code.
 */
export function SpotlightSection({
  id,
  section,
  products,
}: {
  id: string;
  section: Extract<HomeSection, {type: 'spotlight'}>;
  products: HomeProductFragment[];
}) {
  const l = useLocalized();
  if (!products.length) return null;

  const lead = products[0];
  const photo =
    lead.images.nodes.find((image) => image.id !== lead.featuredImage?.id) ??
    lead.featuredImage;

  return (
    <section className="spotlight" aria-labelledby={`${id}-heading`}>
      <div className="spotlight__inner">
        {photo && (
          <Reveal className="spotlight__media">
            <Image
              data={photo}
              alt={photo.altText || lead.title}
              aspectRatio="4/5"
              sizes="(min-width: 64em) 45vw, 100vw"
              loading="lazy"
            />
          </Reveal>
        )}

        <Reveal className="spotlight__body">
          {section.eyebrow && (
            <p className="spotlight__eyebrow">{l(section.eyebrow)}</p>
          )}
          <h2 className="spotlight__title" id={`${id}-heading`}>
            {l(section.title)}
          </h2>
          {section.text && <p className="spotlight__text">{l(section.text)}</p>}

          <div className="spotlight__products">
            {products.map((product) => (
              <ProductItem key={product.id} product={product} loading="lazy" />
            ))}
          </div>

          {section.cta && (
            <Link
              to={section.cta.to}
              prefetch="intent"
              className="spotlight__cta"
            >
              {l(section.cta.label)}
            </Link>
          )}
        </Reveal>
      </div>
    </section>
  );
}
