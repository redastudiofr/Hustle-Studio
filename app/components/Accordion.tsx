import {useId, useState} from 'react';

/**
 * Disclosure row. Two looks:
 * - 'line' (default): a hairline row with a + that turns into a −;
 * - 'block': a grey bar with a round black + (the info rows of the product
 *   page).
 *
 * Opening animates the content's real height (grid rows 0fr → 1fr, nothing
 * measured or guessed), then the text fades and rises into place.
 */
export function Accordion({
  title,
  children,
  defaultOpen = false,
  variant = 'line',
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  variant?: 'line' | 'block';
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div
      className={`accordion accordion--${variant} ${open ? 'accordion--open' : ''}`}
    >
      <button
        type="button"
        className="accordion__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        <span className="accordion__plus" aria-hidden="true" />
      </button>
      <div id={panelId} className="accordion__panel" role="region">
        <div className="accordion__clip">
          <div className="accordion__panel-inner">{children}</div>
        </div>
      </div>
    </div>
  );
}
