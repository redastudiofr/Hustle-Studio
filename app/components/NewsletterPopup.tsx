import {useCallback, useEffect, useRef, useState} from 'react';
import {useLocation} from 'react-router';
import {CloseIcon} from '~/components/Icons';
import {lockScroll, unlockScroll} from '~/lib/scrollLock';
import {countDigits, normalizePhone} from '~/lib/phone';
import {
  NEWSLETTER_PROMO_PERCENT,
  PROMO_SIGNUP_COOKIE,
} from '~/lib/newsletterPromo';
import {useT} from '~/lib/i18n';

/** Signed up: never shown again. The server sets the cookie; this is the second copy. */
const SIGNUP_STORAGE_KEY = 'hs-promo-signup';
/** Written by the pop-up before -15%, only once someone had actually subscribed. */
const LEGACY_SIGNUP_STORAGE_KEY = 'hs-newsletter-subscribed';

/** Closed with the X: left alone for the rest of the visit (this tab session), offered again on the next one. */
const DISMISS_SESSION_KEY = 'hs-promo-dismissed-session';

const DAY_SECONDS = 60 * 60 * 24;
const SIGNUP_MAX_AGE_SECONDS = DAY_SECONDS * 365;
const OPEN_DELAY_MS = 1200;

/*
 * Every fact is recorded twice, in a cookie and in localStorage, because
 * browsers evict the two under different rules — Safari caps script-written
 * storage at seven days of inactivity. Either one is enough.
 *
 * Both throw outright when a browser blocks storage (Safari private mode being
 * the classic case), so every access fails soft: an unguarded read would take
 * the whole page down over a marketing pop-up.
 */
function hasCookie(name: string): boolean {
  try {
    return document.cookie
      .split(';')
      .some((entry) => entry.trim().startsWith(`${name}=`));
  } catch {
    return false;
  }
}

function setCookie(name: string, maxAgeSeconds: number) {
  try {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=1; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secure}`;
  } catch {
    // Nothing to do — localStorage is the other half.
  }
}

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Nothing to do — the cookie is the other half.
  }
}

function hasSignedUp(): boolean {
  return (
    hasCookie(PROMO_SIGNUP_COOKIE) ||
    readStorage(SIGNUP_STORAGE_KEY) !== null ||
    readStorage(LEGACY_SIGNUP_STORAGE_KEY) !== null
  );
}

function recentlyDismissed(): boolean {
  try {
    return Boolean(window.sessionStorage.getItem(DISMISS_SESSION_KEY));
  } catch {
    return false;
  }
}

function rememberSignup() {
  writeStorage(SIGNUP_STORAGE_KEY, String(Date.now()));
  setCookie(PROMO_SIGNUP_COOKIE, SIGNUP_MAX_AGE_SECONDS);
}

function rememberDismissal() {
  try {
    window.sessionStorage.setItem(DISMISS_SESSION_KEY, '1');
  } catch {
    // Storage refused: it may show again on the next page.
  }
}

/**
 * The async Clipboard API needs a secure context and, on older Safari and
 * Opera, isn't there at all — hence the execCommand fallback, which works from
 * a click on every browser this shop sees.
 */
async function writeToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Permission refused — try the fallback.
  }

  try {
    const field = document.createElement('textarea');
    field.value = text;
    // readonly keeps the iOS keyboard from opening; off-screen keeps it invisible.
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.top = '0';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    field.setSelectionRange(0, text.length);
    const copied = document.execCommand('copy');
    field.remove();
    return copied;
  } catch {
    return false;
  }
}

type Status =
  'idle' | 'loading' | 'done' | 'error' | 'invalid' | 'invalidEmail' | 'empty';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Welcome pop-up: -15% in exchange for a phone number.
 *
 * - Shown only to a visitor who hasn't signed up. Once they have, never again.
 * - Closing it (X, the backdrop, Escape) is remembered for the visit, so it
 *   doesn't come back on every page or every visit — only after that pause.
 * - Hidden entirely while `enabled` is false, i.e. while the server has no
 *   way to record sign-ups (Google Sheet or e-mail): better no offer than a
 *   code handed out for a sign-up that was never saved.
 *
 * The code shown is the one the server returns, and only after it has
 * confirmed the number is stored — see app/routes/newsletter.tsx.
 */
export function NewsletterPopup({enabled}: {enabled: boolean}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [code, setCode] = useState('');
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>(
    'idle',
  );
  const [digitCount, setDigitCount] = useState(0);
  // A short technical reference shown with a failed save (e.g. S502), so a
  // screenshot is enough to tell what went wrong.
  const [errorRef, setErrorRef] = useState('');
  const statusRef = useRef<Status>('idle');
  const codeRef = useRef<HTMLParagraphElement>(null);
  const {pathname} = useLocation();
  const t = useT();

  statusRef.current = status;

  useEffect(() => {
    if (!enabled || hasSignedUp() || recentlyDismissed()) return;
    // Never under the opening loader: wait until it has gone, then open.
    let timer: ReturnType<typeof setTimeout>;
    const tryOpen = () => {
      if (document.documentElement.classList.contains('hs-loader-run')) {
        timer = setTimeout(tryOpen, OPEN_DELAY_MS);
        return;
      }
      setOpen(true);
    };
    timer = setTimeout(tryOpen, OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [enabled]);

  const close = useCallback(() => {
    // Closing after signing up isn't a dismissal — that visitor is already
    // recorded as signed up and won't see it again anyway.
    if (statusRef.current !== 'done') rememberDismissal();
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    document.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Escape') close();
      },
      {signal: controller.signal},
    );

    // Shared with the cart, search and menu drawers — see app/lib/scrollLock.ts
    // for why locking the page must not be allowed to resize it.
    lockScroll();

    return () => {
      controller.abort();
      unlockScroll();
    };
  }, [open, close]);

  useEffect(() => {
    if (copyState === 'idle') return;
    const timer = setTimeout(() => setCopyState('idle'), 2500);
    return () => clearTimeout(timer);
  }, [copyState]);

  async function submit(form: HTMLFormElement) {
    if (statusRef.current === 'loading') return;
    const field = (name: string) =>
      (
        (form.elements.namedItem(name) as HTMLInputElement | null)?.value ?? ''
      ).trim();
    const rawEmail = field('email');
    const rawPhone = field('phone');

    // E-mail and/or phone: at least one, each valid when given. Checked
    // before the request, and again on the server (this can be bypassed).
    if (!rawEmail && !rawPhone) {
      setStatus('empty');
      return;
    }
    const email = rawEmail.toLowerCase();
    if (email && (email.length > 254 || !EMAIL_PATTERN.test(email))) {
      setStatus('invalidEmail');
      return;
    }
    const phone = rawPhone ? normalizePhone(rawPhone) : '';
    setDigitCount(countDigits(rawPhone));
    if (rawPhone && !phone) {
      setStatus('invalid');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: new URLSearchParams({
          'contact[email]': email,
          'contact[phone]': phone ?? '',
          source: 'popup',
        }).toString(),
      });
      const result = (await res.json().catch(() => null)) as {
        ok?: boolean;
        code?: string;
        alreadyRegistered?: boolean;
        error?: string;
        ref?: string;
      } | null;

      if (res.ok && result?.ok && result.code) {
        rememberSignup();
        setCode(result.code);
        setAlreadyRegistered(Boolean(result.alreadyRegistered));
        setStatus('done');
      } else {
        setErrorRef(result?.ref ?? `H${res.status}`);
        setStatus(
          result?.error === 'phone'
            ? 'invalid'
            : result?.error === 'email'
              ? 'invalidEmail'
              : result?.error === 'empty'
                ? 'empty'
                : 'error',
        );
      }
    } catch {
      setErrorRef('NET');
      setStatus('error');
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit(event.currentTarget);
  }

  async function copyCode() {
    if (await writeToClipboard(code)) {
      setCopyState('copied');
      return;
    }
    // Last resort: select the code on screen, so a long-press or Ctrl+C copies it.
    const node = codeRef.current;
    const selection = window.getSelection();
    if (node && selection) {
      const range = document.createRange();
      range.selectNodeContents(node);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    setCopyState('failed');
  }

  if (!open) return null;

  return (
    <div
      className="popup-overlay"
      role="dialog"
      aria-modal
      aria-label={t('popup.title', {percent: NEWSLETTER_PROMO_PERCENT})}
    >
      <button
        className="popup-overlay__close-outside"
        onClick={close}
        aria-label={t('nav.close')}
      />
      <div className="popup">
        <button
          type="button"
          className="popup__close"
          onClick={close}
          aria-label={t('nav.close')}
        >
          <CloseIcon />
        </button>

        <div className="popup__media">
          <img
            src="/brand/popup-business-after-hours.webp"
            alt=""
            width="800"
            height="1421"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="popup__body">
          <h2>{t('popup.title', {percent: NEWSLETTER_PROMO_PERCENT})}</h2>

          {status === 'done' ? (
            <div className="popup__code">
              <p className="popup__code-label">
                {alreadyRegistered
                  ? t('popup.alreadyRegistered')
                  : t('popup.codeLabel')}
              </p>
              <p className="popup__code-value" ref={codeRef}>
                {code}
              </p>
              <div className="popup__code-actions">
                <button
                  type="button"
                  className="popup__copy"
                  onClick={() => void copyCode()}
                >
                  {copyState === 'copied' ? t('popup.copied') : t('popup.copy')}
                </button>
                <a
                  className="popup__apply"
                  href={`/discount/${encodeURIComponent(code)}?redirect=${encodeURIComponent(pathname)}`}
                >
                  {t('popup.apply')}
                </a>
              </div>
              <p className="popup__code-hint" role="status" aria-live="polite">
                {copyState === 'failed'
                  ? t('popup.copyFailed')
                  : t('popup.codeHint')}
              </p>
            </div>
          ) : (
            <>
              <p className="popup__text">
                {t('popup.text', {percent: NEWSLETTER_PROMO_PERCENT})}
              </p>
              <form className="popup__form" onSubmit={onSubmit} noValidate>
                <input
                  type="email"
                  name="email"
                  placeholder={t('popup.emailPlaceholder')}
                  aria-label={t('popup.emailLabel')}
                  autoComplete="email"
                  inputMode="email"
                  onChange={() =>
                    status !== 'loading' &&
                    status !== 'idle' &&
                    setStatus('idle')
                  }
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder={t('popup.phonePlaceholder')}
                  aria-label={t('popup.phoneLabel')}
                  autoComplete="tel"
                  inputMode="tel"
                  onChange={() =>
                    status !== 'loading' &&
                    status !== 'idle' &&
                    setStatus('idle')
                  }
                />
                <button
                  type="submit"
                  className="btn btn--full"
                  disabled={status === 'loading'}
                >
                  {status === 'loading'
                    ? '…'
                    : t('popup.cta', {percent: NEWSLETTER_PROMO_PERCENT})}
                </button>
                {status === 'invalid' && (
                  <p className="form-error" role="alert">
                    {t('popup.invalidPhone')}
                    {/* Said back so a slip — two extra digits, a missing one —
                        is obvious instead of leaving the visitor guessing. */}
                    {digitCount > 0 &&
                      ` (${t('popup.digitsTyped', {count: digitCount})})`}
                  </p>
                )}
                {status === 'invalidEmail' && (
                  <p className="form-error" role="alert">
                    {t('popup.invalidEmail')}
                  </p>
                )}
                {status === 'empty' && (
                  <p className="form-error" role="alert">
                    {t('popup.empty')}
                  </p>
                )}
                {status === 'error' && (
                  <p className="form-error" role="alert">
                    {t('popup.error')}
                    {errorRef && ` (${errorRef})`}
                  </p>
                )}
              </form>
              <p className="popup__fineprint">{t('popup.fineprint')}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
