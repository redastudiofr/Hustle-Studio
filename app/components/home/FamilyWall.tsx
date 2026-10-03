import {useState} from 'react';
import {Image} from '@shopify/hydrogen';
import type {FamilyTile} from '~/lib/homeSections';
import {Reveal} from '~/components/Reveal';
import {useT} from '~/lib/i18n';

/** Enough tiles per row that one copy is wider than any screen. */
const MIN_PER_ROW = 8;

/**
 * "Family": two rows of photos drifting in opposite directions, endlessly.
 *
 * Pure CSS: each row holds its tiles twice and slides by exactly one copy
 * (translateX(-50%)), so the loop has no seam and costs no JavaScript per
 * frame — the browser runs it on the compositor, smooth on phones too.
 * Hovering a row pauses it; the pause button stops both (moving content must
 * be stoppable, WCAG 2.2.2). With reduced motion, rows are still and simply
 * scroll sideways by hand.
 */
export function FamilyWall({
  id,
  title,
  text,
  tiles,
  layout = 'marquee',
}: {
  id: string;
  title: string;
  text?: string;
  tiles: FamilyTile[];
  layout?: 'marquee' | 'grid';
}) {
  const t = useT();
  const [paused, setPaused] = useState(false);
  if (!tiles.length) return null;

  if (layout === 'grid') {
    return (
      <Reveal
        as="section"
        className="family family--grid"
        aria-labelledby={`${id}-heading`}
      >
        <div className="section-head">
          <div>
            <h2 className="section-title" id={`${id}-heading`}>
              {title}
            </h2>
            {text && <p className="section-head__text">{text}</p>}
          </div>
        </div>
        <div className="family__grid">
          {tiles.map((tile, index) => (
            <figure
              // eslint-disable-next-line react/no-array-index-key -- a photo may appear twice
              key={`${tile.key}-${index}`}
              className="family__tile"
            >
              <TileImage tile={tile} />
            </figure>
          ))}
        </div>
      </Reveal>
    );
  }

  // Alternate tiles between the rows; a short list feeds both rows whole.
  const split = tiles.length >= MIN_PER_ROW;
  const rows = [
    split ? tiles.filter((_, i) => i % 2 === 0) : tiles,
    split ? tiles.filter((_, i) => i % 2 === 1) : [...tiles].reverse(),
  ];

  return (
    <Reveal
      as="section"
      className={`family ${paused ? 'family--paused' : ''}`}
      aria-labelledby={`${id}-heading`}
    >
      <div className="section-head">
        <div>
          <h2 className="section-title" id={`${id}-heading`}>
            {title}
          </h2>
          {text && <p className="section-head__text">{text}</p>}
        </div>
        <button
          type="button"
          className="family__toggle"
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? t('family.play') : t('family.pause')}
        </button>
      </div>

      {rows.map((row, rowIndex) => (
        <FamilyRow
          // eslint-disable-next-line react/no-array-index-key -- two fixed rows
          key={rowIndex}
          tiles={row}
          reverse={rowIndex === 1}
        />
      ))}
    </Reveal>
  );
}

function FamilyRow({tiles, reverse}: {tiles: FamilyTile[]; reverse: boolean}) {
  // Repeat the row until one copy is wide enough, then render it twice.
  const copy: FamilyTile[] = [];
  while (copy.length < MIN_PER_ROW) copy.push(...tiles);
  // A steady speed whatever the number of tiles: ~6s per tile.
  const duration = `${copy.length * 6}s`;

  return (
    <div className={`family__row ${reverse ? 'family__row--reverse' : ''}`}>
      <div
        className="family__track"
        style={{'--family-duration': duration} as React.CSSProperties}
      >
        {[0, 1].map((set) =>
          copy.map((tile, index) => (
            <figure
              // eslint-disable-next-line react/no-array-index-key -- tiles repeat by design
              key={`${set}-${index}`}
              className="family__tile"
              aria-hidden={set === 1 ? true : undefined}
            >
              <TileImage tile={tile} hidden={set === 1} />
            </figure>
          )),
        )}
      </div>
    </div>
  );
}

function TileImage({tile, hidden = false}: {tile: FamilyTile; hidden?: boolean}) {
  const alt = hidden ? '' : tile.alt;
  return tile.shopify ? (
    <Image
      data={tile.shopify}
      alt={alt}
      aspectRatio="4/5"
      sizes="(min-width: 64em) 20vw, (min-width: 48em) 33vw, 50vw"
      loading="lazy"
    />
  ) : (
    <img
      src={tile.src}
      alt={alt}
      loading="lazy"
      decoding="async"
      width={900}
      height={1125}
    />
  );
}
