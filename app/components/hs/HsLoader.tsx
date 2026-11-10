import {useEffect, useState} from 'react';
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

  return (
    <div
      className="hs-loader"
      role="status"
      aria-label={t('loader.label')}
    >
      <div className="hs-loader__inner" aria-hidden="true">
        {/* The site's wordmark, through the same CSS mask as the header. */}
        <span className="hs-loader__logo" />
        <span className="hs-loader__line" />
      </div>
    </div>
  );
}
