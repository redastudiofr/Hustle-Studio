import {Image} from '@shopify/hydrogen';
import {useLocalized} from '~/lib/i18n/localized';
import {PDP} from '~/config/productTemplate';
import {SectionHeading} from '~/components/pdp/shared';

type DetailImage = {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

/**
 * Mock-up 05 — three photo cards, numbered 01 / 03. Photos come from the
 * product (see PDP.details); a card without a photo keeps its text.
 */
export function PdpDetails({images}: {images: (DetailImage | undefined)[]}) {
  const l = useLocalized();
  const total = String(PDP.details.cards.length).padStart(2, '0');

  return (
    <section
      className="pdpx-section pdpx-details"
      aria-labelledby="pdpx-details"
    >
      <SectionHeading
        id="pdpx-details"
        eyebrow={PDP.details.eyebrow}
        black={PDP.details.title.black}
        blue={PDP.details.title.blue}
      />
      <ol className="pdpx-details__list">
        {PDP.details.cards.map((card, index) => {
          const image = images[index];
          return (
            <li key={l(card.title)} className="pdpx-detail">
              <div className="pdpx-detail__photo">
                {image && (
                  <Image
                    data={image}
                    alt={image.altText || l(card.title)}
                    aspectRatio="6/5"
                    sizes="(min-width: 64em) 33vw, 100vw"
                    loading="lazy"
                  />
                )}
              </div>
              <p className="pdpx-detail__index">
                {String(index + 1).padStart(2, '0')} / {total}
              </p>
              <h3 className="pdpx-detail__title">{l(card.title)}</h3>
              <p className="pdpx-detail__text">{l(card.text)}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
