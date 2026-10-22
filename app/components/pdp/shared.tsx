import type {Localized} from '~/lib/i18n/localized';
import {useLocalized} from '~/lib/i18n/localized';
import {useI18n} from '~/lib/i18n';

/** "34,90 €" in French, "€34.90" in English. */
export function useMoney() {
  const {locale} = useI18n();
  const format = new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-IE', {
    style: 'currency',
    currency: 'EUR',
  });
  return (amount: number) => format.format(amount);
}

/** Replaces {name} placeholders in an already-localized string. */
export function fill(
  template: string,
  values: Record<string, string | number>,
) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/**
 * Section title of the mock-ups: Anton, upper case, a black part then a
 * blue ending; an optional small blue eyebrow above.
 */
export function SectionHeading({
  id,
  eyebrow,
  black,
  blue,
  as: Tag = 'h2',
}: {
  id?: string;
  eyebrow?: Localized;
  black: Localized;
  blue?: Localized;
  as?: 'h2' | 'h3';
}) {
  const l = useLocalized();
  return (
    <header className="pdpx-heading">
      {eyebrow && <p className="pdpx-eyebrow">{l(eyebrow)}</p>}
      <Tag className="pdpx-title" id={id}>
        {l(black)}
        {blue && (
          <>
            {' '}
            <span className="pdpx-title__blue">{l(blue)}</span>
          </>
        )}
      </Tag>
    </header>
  );
}

/** Five stars, filled to the rating (rounded to the half). Decorative. */
export function Stars({value, size = 14}: {value: number; size?: number}) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className="pdpx-stars" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width={size} height={size} viewBox="0 0 20 20">
          <defs>
            <linearGradient id={`half-${n}-${size}`}>
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#d9d4c7" />
            </linearGradient>
          </defs>
          <path
            d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6L10 15l-5.4 3 1.2-6L1.3 7.8l6.1-.7z"
            fill={
              rounded >= n
                ? 'currentColor'
                : rounded >= n - 0.5
                  ? `url(#half-${n}-${size})`
                  : '#d9d4c7'
            }
          />
        </svg>
      ))}
    </span>
  );
}

export function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3 8.5l3.2 3L13 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CrossIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M4 4l8 8M12 4l-8 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
