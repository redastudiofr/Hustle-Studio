import {useEffect, useState} from 'react';
import {useI18n} from '~/lib/i18n';
import {useLocalized} from '~/lib/i18n/localized';
import {PDP} from '~/config/productTemplate';
import {SectionHeading} from '~/components/pdp/shared';

const PARIS = 'Europe/Paris';

/** Today's calendar date in Paris, as a UTC-noon Date (safe to add days to). */
function parisToday(now: Date): Date {
  const [y, m, d] = new Intl.DateTimeFormat('en-CA', {
    timeZone: PARIS,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(now)
    .split('-')
    .map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

/** `days` business days after `from` (Saturdays and Sundays skipped). */
export function addBusinessDays(from: Date, days: number): Date {
  const date = new Date(from);
  let left = days;
  while (left > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    const weekday = date.getUTCDay();
    if (weekday !== 0 && weekday !== 6) left -= 1;
  }
  return date;
}

/**
 * Mock-up 08b — the shipping and delivery dates, computed: shipped the next
 * business day, delivered between business days J+2 and J+4 (Paris time,
 * weekends skipped). Worked out in the browser, after the page loads, so
 * the dates are never those of the day the page was cached.
 */
export function PdpDelivery() {
  const l = useLocalized();
  const {locale} = useI18n();
  const [dates, setDates] = useState<{ship: Date; from: Date; to: Date} | null>(
    null,
  );

  useEffect(() => {
    const today = parisToday(new Date());
    const [min, max] = PDP.delivery.deliveryBusinessDays;
    setDates({
      ship: addBusinessDays(today, PDP.delivery.shipBusinessDays),
      from: addBusinessDays(today, min),
      to: addBusinessDays(today, max),
    });
  }, []);

  const long = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });
  const short = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });

  return (
    <section
      className="pdpx-section pdpx-delivery"
      aria-labelledby="pdpx-delivery"
    >
      <SectionHeading
        id="pdpx-delivery"
        eyebrow={PDP.delivery.eyebrow}
        black={PDP.delivery.title.black}
        blue={PDP.delivery.title.blue}
      />

      <div className="pdpx-dates">
        <div>
          <p className="pdpx-dates__label">{l(PDP.delivery.orderedToday)}</p>
          <p className="pdpx-dates__value">
            {dates ? long.format(dates.ship) : '—'}
          </p>
        </div>
        <span className="pdpx-dates__arrow" aria-hidden="true">
          →
        </span>
        <div className="pdpx-dates__end">
          <p className="pdpx-dates__label">
            {l(PDP.delivery.deliveredBetween)}
          </p>
          <p className="pdpx-dates__value pdpx-dates__value--blue">
            {dates
              ? `${short.format(dates.from)} ${l(PDP.delivery.and)} ${short.format(dates.to)}`
              : '—'}
          </p>
        </div>
      </div>

      <ol className="pdpx-steps">
        {PDP.delivery.steps.map((step, index) => (
          <li
            key={l(step.label)}
            className="pdpx-step"
            data-first={index === 0 || undefined}
          >
            <span className="pdpx-step__dot" aria-hidden="true">
              {index + 1}
            </span>
            <strong>{l(step.label)}</strong>
            <span>{l(step.detail)}</span>
          </li>
        ))}
      </ol>

      <ul className="pdpx-service">
        {PDP.delivery.tiles.map((tile) => (
          <li key={l(tile.label)}>
            <strong>{l(tile.label)}</strong>
            <span>{l(tile.detail)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
