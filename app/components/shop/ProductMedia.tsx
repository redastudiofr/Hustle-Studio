import {Image} from '@shopify/hydrogen';

type MediaImage = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

/**
 * Product photos, Shopify's images in Shopify's order: the first one large,
 * the others two by two underneath; on phones, a swipeable row.
 */
export function ProductMedia({
  images,
  title,
}: {
  images: MediaImage[];
  title: string;
}) {
  if (!images.length) {
    return <div className="st-media st-media--empty" aria-hidden="true" />;
  }

  return (
    <ul className="st-media">
      {images.map((image, index) => (
        <li
          key={image.id ?? image.url}
          className={
            index === 0
              ? 'st-media__item st-media__item--first'
              : 'st-media__item'
          }
        >
          <Image
            data={image}
            alt={image.altText || `${title} — ${index + 1}/${images.length}`}
            sizes={
              index === 0
                ? '(min-width: 64em) 50vw, 90vw'
                : '(min-width: 64em) 25vw, 90vw'
            }
            loading={index === 0 ? 'eager' : 'lazy'}
          />
        </li>
      ))}
    </ul>
  );
}
