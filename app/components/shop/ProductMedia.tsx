import {useEffect, useState} from 'react';
import {Image} from '@shopify/hydrogen';

type MediaImage = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

/**
 * Product photos: one large image on a light grey tile, the thumbnails in a
 * row underneath (click to show). Shopify's images, in Shopify's order.
 */
export function ProductMedia({
  images,
  title,
}: {
  images: MediaImage[];
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const firstUrl = images[0]?.url;
  // A new product (or variant photo set): back to the first image.
  useEffect(() => setIndex(0), [firstUrl]);
  const current = images[index] ?? images[0];

  if (!current) return <div className="sx-media__main sx-media__main--empty" />;

  return (
    <div className="sx-media">
      <div className="sx-media__main">
        <Image
          key={current.url}
          data={current}
          alt={current.altText || title}
          aspectRatio="4/5"
          sizes="(min-width: 64em) 45vw, 100vw"
          loading="eager"
        />
      </div>
      {images.length > 1 && (
        <ul className="sx-media__thumbs">
          {images.map((image, i) => (
            <li key={image.id ?? image.url}>
              <button
                type="button"
                className="sx-media__thumb"
                aria-current={i === index}
                aria-label={`${title} — ${i + 1}/${images.length}`}
                onClick={() => setIndex(i)}
              >
                <Image
                  data={image}
                  alt=""
                  aspectRatio="1/1"
                  width={96}
                  loading="lazy"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
