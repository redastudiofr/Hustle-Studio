import {useEffect, useState} from 'react';
import {Link} from 'react-router';
import {rememberConsent, type ConsentChoice} from '~/lib/cookieConsent';
import {useT} from '~/lib/i18n';

/**
 * The cookie question, in English, as a small bar at the bottom of the
 * screen. It does not block the page (the site is English only, so there is
 * no language to ask any more). Rendered only while the request carries no
 * answer; "essential only" grants nothing beyond what the shop needs to run.
 */
export function CookieBar() {
  const t = useT();
  const [open, setOpen] = useState(false);

  // Shown after hydration, so it never flashes for someone who answered in
  // a tab the server has not seen yet.
  useEffect(() => {
    try {
      if (window.localStorage.getItem('hs_cookie_consent')) return;
    } catch {
      // Storage refused: ask.
    }
    setOpen(true);
  }, []);

  if (!open) return null;

  const choose = (choice: ConsentChoice) => {
    rememberConsent(choice);
    setOpen(false);
  };

  return (
    <div className="cookie-bar" role="region" aria-label={t('cookies.title')}>
      <p className="cookie-bar__text">
        {t('cookies.text')}{' '}
        <Link to="/legal/privacy">{t('cookies.more')}</Link>
      </p>
      <div className="cookie-bar__actions">
        <button
          type="button"
          className="cookie-bar__btn"
          onClick={() => choose('essential')}
        >
          {t('cookies.essential')}
        </button>
        <button
          type="button"
          className="cookie-bar__btn cookie-bar__btn--dark"
          onClick={() => choose('all')}
        >
          {t('cookies.accept')}
        </button>
      </div>
    </div>
  );
}
