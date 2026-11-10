import {useEffect, useState} from 'react';
import {BRAND} from '~/config/brand';
import {HS_LOADER_DURATION_MS} from '~/lib/hs-loader';
import {useT} from '~/lib/i18n';

declare global {
  interface Window {
    __hsLoaderStart?: number;
  }
}

/**
 * The opening loader's overlay (see app/lib/hs-loader.ts for the timeline,
 * the critical CSS and the script that decides whether it plays). The
 * markup is rendered on every page but stays hidden unless the head script
 * marked the document; it is then taken out of the DOM once it has played,
 * or right away when it does not play.
 */
export function HsLoader() {
  const t = useT();
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains('hs-loader-run')) {
      setGone(true);
      return;
    }
    const elapsed = Date.now() - (window.__hsLoaderStart ?? Date.now());
    const timer = window.setTimeout(
      () => setGone(true),
      Math.max(0, HS_LOADER_DURATION_MS - elapsed),
    );
    return () => window.clearTimeout(timer);
  }, []);

  if (gone) return null;

  const [first, ...rest] = BRAND.name.trim().split(/\s+/);
  const second = rest.join(' ');
  // Letters can repeat, so each carries its position in its key.
  const letters = [...first].map((letter, position) => ({
    letter,
    key: `${position}-${letter}`,
    position,
  }));

  return (
    <div
      className="hs-loader"
      role="status"
      aria-label={t('loader.label')}
    >
      <div className="hs-loader__inner" aria-hidden="true">
        <p className="hs-loader__word">
          {letters.map(({letter, key, position}) => (
            <span
              key={key}
              className="hs-loader__letter"
              style={{'--i': position} as React.CSSProperties}
            >
              {letter}
            </span>
          ))}
        </p>
        {second && <p className="hs-loader__sub">{second}</p>}
        <span className="hs-loader__line" />
      </div>
    </div>
  );
}
