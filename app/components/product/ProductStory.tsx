import {PRODUCT_PAGE, type Highlight} from '~/config/productPage';
import {PdpIcon} from '~/components/product/PdpIcons';
import {Reveal} from '~/components/Reveal';
import {useLocalized} from '~/lib/i18n/localized';
import {useT} from '~/lib/i18n';

const ICONS: Highlight['icon'][] = [
  'pin',
  'spark',
  'needle',
  'box',
  'return',
  'lock',
];

/**
 * Highlights ("Designed in Nantes…") as icon rows, from the product's
 * custom.highlights metafield ("Title — detail" per line) or the brand-wide
 * defaults in app/config/productPage.ts.
 */
export function ProductHighlights({value}: {value?: string | null}) {
  const l = useLocalized();
  const t = useT();
  const own = parseHighlights(value);
  const items = own.length
    ? own
    : PRODUCT_PAGE.highlights.map((h) => ({
        icon: h.icon,
        title: l(h.title),
        detail: l(h.detail),
      }));

  return (
    <Reveal as="section" className="pdp-block pdp-highlights">
      <p className="pdp-block__eyebrow">{t('pdp.detailsEyebrow')}</p>
      <h2 className="pdp-block__title">{l(PRODUCT_PAGE.highlightsTitle)}</h2>
      <ul className="pdp-highlights__list">
        {items.map((item) => (
          <li key={item.title} className="pdp-highlights__item">
            <span className="pdp-highlights__icon">
              <PdpIcon name={item.icon} />
            </span>
            <span>
              <strong>{item.title}</strong>
              {item.detail && <span>{item.detail}</span>}
            </span>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

/** custom.highlights: a list metafield (JSON array) or plain lines. */
function parseHighlights(value?: string | null) {
  if (!value) return [];
  let lines: unknown = null;
  try {
    lines = JSON.parse(value);
  } catch {
    lines = value.split(/\n+/);
  }
  if (!Array.isArray(lines)) return [];
  return lines
    .filter((line): line is string => typeof line === 'string' && !!line.trim())
    .slice(0, 6)
    .map((line, i) => {
      const [head, ...rest] = line.split(/\s+[—–-]\s+/);
      return {
        icon: ICONS[i % ICONS.length],
        title: head.trim(),
        detail: rest.join(' — ').trim(),
      };
    });
}
