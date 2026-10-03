import {useRef} from 'react';
import type {SizeEntry} from '~/components/ProductSizeGuide';
import {HOW_TO_MEASURE, type SizeChart} from '~/config/sizeCharts';
import {PdpIcon} from '~/components/product/PdpIcons';
import {useT} from '~/lib/i18n';

/**
 * "Size chart" button + dialog.
 *
 * A native <dialog>: focus is trapped and Escape closes it by itself, and the
 * page behind is inert while it is open. Shows the garment's measurements
 * when this product has a chart (Shopify metafield or app/config/sizeCharts),
 * how to measure, and the sizes in stock right now. Without a chart it says
 * so plainly — it never shows made-up numbers.
 */
export function SizeChartDialog({
  title,
  chart,
  sizes,
}: {
  title: string;
  chart: SizeChart | null;
  sizes: SizeEntry[];
}) {
  const t = useT();
  const ref = useRef<HTMLDialogElement>(null);
  if (!sizes.length && !chart) return null;

  return (
    <>
      <button
        type="button"
        className="size-chart__open"
        onClick={() => ref.current?.showModal()}
      >
        <PdpIcon name="ruler" />
        {t('sizeChart.open')}
      </button>

      {/* Keyboard users close it with Escape (native) or the × button; the
          backdrop click is the extra mouse/touch shortcut. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        ref={ref}
        className="size-chart"
        aria-labelledby="size-chart-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) ref.current?.close();
        }}
      >
        <div className="size-chart__panel">
          <div className="size-chart__head">
            <div>
              <p className="size-chart__eyebrow">{t('sizeChart.eyebrow')}</p>
              <h2 className="size-chart__title" id="size-chart-title">
                {title}
              </h2>
            </div>
            <button
              type="button"
              className="size-chart__close"
              aria-label={t('nav.close')}
              onClick={() => ref.current?.close()}
            >
              ×
            </button>
          </div>

          <SizeChartBody chart={chart} sizes={sizes} />
        </div>
      </dialog>
    </>
  );
}

/** The chart itself — also used inline in the "Size guide" accordion. */
export function SizeChartBody({
  chart,
  sizes,
}: {
  chart: SizeChart | null;
  sizes: SizeEntry[];
}) {
  const t = useT();
  const inStock = new Set(sizes.filter((s) => s.available).map((s) => s.name));

  return (
    <div className="size-chart__body">
      {chart ? (
        <>
          <div className="size-chart__table-wrap">
            <table className="size-chart__table">
              <caption className="sr-only">{t('sizeChart.caption')}</caption>
              <thead>
                <tr>
                  <th scope="col">{t('sizeChart.size')}</th>
                  {chart.columns.map((column) => (
                    <th scope="col" key={column}>
                      {column}
                      <span className="size-chart__unit">
                        {' '}
                        ({chart.unit ?? 'cm'})
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chart.rows.map(([size, ...values]) => (
                  <tr
                    key={String(size)}
                    className={
                      sizes.length && !inStock.has(String(size))
                        ? 'size-chart__row--out'
                        : undefined
                    }
                  >
                    <th scope="row">{size}</th>
                    {values.map((value, index) => (
                      // eslint-disable-next-line react/no-array-index-key -- columns are positional
                      <td key={index}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {chart.note && <p className="size-chart__note">{chart.note}</p>}

          <h3 className="size-chart__subtitle">{t('sizeChart.howTo')}</h3>
          <dl className="size-chart__how">
            {chart.columns
              .filter((column) => HOW_TO_MEASURE[column])
              .map((column) => (
                <div key={column}>
                  <dt>{column}</dt>
                  <dd>{HOW_TO_MEASURE[column]}</dd>
                </div>
              ))}
          </dl>
        </>
      ) : (
        <p className="size-chart__note">
          {t('sizeChart.pending')}{' '}
          <a href="/contact">{t('size.writeToUs')}</a>{' '}
          {t('sizeChart.pendingEnd')}
        </p>
      )}

      {sizes.length > 0 && (
        <>
          <h3 className="size-chart__subtitle">{t('sizeChart.availability')}</h3>
          <ul className="size-chart__sizes">
            {sizes.map((size) => (
              <li
                key={size.name}
                className={size.available ? undefined : 'is-out'}
              >
                {size.name}
                <span>
                  {size.available ? t('size.available') : t('size.soldOut')}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
