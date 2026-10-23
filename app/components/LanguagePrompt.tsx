import {useEffect, useState} from 'react';
import {useLocation} from 'react-router';
import {LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE} from '~/lib/i18n/locale';
import {BRAND} from '~/config/brand';

/** Mirrors the cookie: a choice survives a cookie the browser drops on its own. */
const CHOICE_STORAGE_KEY = 'hs-locale-choice';

/**
 * The one dialog a visitor ever sees on arrival: the language. Never asked
 * twice: the server only renders this when the request carries no answer
 * (see root.tsx's `localeChosen`), so it never flashes for someone who has
 * already chosen, and never comes back page after page. (The site sets no
 * tracking cookie, so there is no cookie question.)
 *
 * It works with JavaScript off: the answers are submit buttons of a real
 * form, and /locale does the rest.
 */
export function LanguagePrompt() {
  const [open, setOpen] = useState(false);
  const {pathname, search} = useLocation();

  useEffect(() => {
    // The server already established that no answer was given. This only
    // covers a cookie the browser dropped although the visitor did answer.
    try {
      if (window.localStorage.getItem(CHOICE_STORAGE_KEY)) return;
    } catch {
      // Storage blocked (private browsing): fall through and ask.
    }
    setOpen(true);
  }, []);

  function rememberLanguageAsked() {
    try {
      window.localStorage.setItem(CHOICE_STORAGE_KEY, '1');
    } catch {
      // The cookie is the real record; this is only a second copy.
    }
  }

  function continueInEnglish() {
    rememberLanguageAsked();
    try {
      const secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `${LOCALE_COOKIE}=en; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
    } catch {
      // Without the cookie the question comes back on the next visit; the site
      // stays in English either way, which is what they just asked for.
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="lang-prompt"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-prompt-title"
    >
      <div className="lang-prompt__panel">
        <div className="lang-prompt__media">
          <img
            src={BRAND.logo.icon}
            alt=""
            width="512"
            height="512"
            loading="eager"
            decoding="async"
          />
        </div>

        <div className="lang-prompt__body">
          <p className="lang-prompt__eyebrow">{BRAND.name}</p>

          <>
            <h2 className="lang-prompt__title" id="lang-prompt-title">
              Choose your language
              <span lang="fr">Choisissez votre langue</span>
            </h2>

            <form
              method="post"
              action="/locale"
              className="lang-prompt__actions"
            >
              <input
                type="hidden"
                name="redirectTo"
                value={`${pathname}${search}`}
              />

              {/* English is what the page already shows, so this answer needs
                    no round trip; it stays a submit button so the form still
                    works when the click handler never runs. */}
              <button
                type="submit"
                name="locale"
                value="en"
                className="lang-prompt__btn lang-prompt__btn--primary"
                onClick={(event) => {
                  event.preventDefault();
                  continueInEnglish();
                }}
              >
                Continue in English
              </button>

              <button
                type="submit"
                name="locale"
                value="fr"
                className="lang-prompt__btn"
                lang="fr"
                onClick={rememberLanguageAsked}
              >
                Traduire en français
              </button>
            </form>
          </>

          <p className="lang-prompt__note">
            You can change this at any time in the menu
            <span lang="fr"> · Modifiable à tout moment dans le menu</span>
          </p>
        </div>
      </div>
    </div>
  );
}
