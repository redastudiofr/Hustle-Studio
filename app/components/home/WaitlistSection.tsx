import {useEffect, useId, useRef, useState} from 'react';
import {Link} from 'react-router';
import {normalizePhone} from '~/lib/phone';
import {useT} from '~/lib/i18n';
import type {TranslationKey} from '~/lib/i18n/dictionary';

type Status = 'idle' | 'loading' | 'done' | 'error';

/** Dictionary key of the message shown for each failure code. */
const ERROR_KEYS = {
  email: 'waitlist.errorEmail',
  phone: 'waitlist.errorPhone',
  too_fast: 'waitlist.errorTooFast',
  rate: 'waitlist.errorRate',
  unavailable: 'waitlist.errorUnavailable',
  send: 'waitlist.errorSend',
  spam: 'waitlist.errorSend',
  network: 'waitlist.errorNetwork',
} as const satisfies Record<string, TranslationKey>;

type ErrorCode = keyof typeof ERROR_KEYS;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * "Be first": the drop waitlist. E-mail and phone are both required; the two
 * marketing boxes are optional and separate from the sign-up itself. Posts
 * to /waitlist (app/routes/waitlist.tsx), and only says "you're in" when the
 * server confirms the sign-up was actually delivered.
 */
export function WaitlistSection({
  id,
  title,
  text,
  submitLabel,
}: {
  id: string;
  title: string;
  text: string;
  submitLabel: string;
}) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<ErrorCode | null>(null);
  const [fieldError, setFieldError] = useState<'email' | 'phone' | null>(null);
  const startedAt = useRef<number>(0);
  const sending = useRef(false);
  const formId = useId();
  const t = useT();

  // When the form became usable — the server rejects instant submissions.
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function submit(form: HTMLFormElement) {
    if (sending.current) return; // no double submission
    const data = new FormData(form);
    const email = String(data.get('email') || '').trim();
    const phone = String(data.get('phone') || '');

    if (!EMAIL_PATTERN.test(email)) {
      setFieldError('email');
      setError('email');
      return;
    }
    if (!normalizePhone(phone)) {
      setFieldError('phone');
      setError('phone');
      return;
    }

    sending.current = true;
    setFieldError(null);
    setError(null);
    setStatus('loading');
    data.set('startedAt', String(startedAt.current));

    try {
      const res = await fetch('/waitlist', {method: 'POST', body: data});
      const body = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;
      if (res.ok && body?.ok) {
        setStatus('done');
        form.reset();
        return;
      }
      const code = (
        body?.error && body.error in ERROR_KEYS ? body.error : 'send'
      ) as ErrorCode;
      if (code === 'email' || code === 'phone') setFieldError(code);
      setError(code);
      setStatus('error');
    } catch {
      setError('network');
      setStatus('error');
    } finally {
      sending.current = false;
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit(event.currentTarget);
  }

  const loading = status === 'loading';

  return (
    <section
      className="waitlist"
      id="waitlist"
      aria-labelledby={`${id}-heading`}
    >
      <div className="waitlist__inner">
        <h2 className="waitlist__title" id={`${id}-heading`}>
          {title}
        </h2>
        <p className="waitlist__text">{text}</p>

        {status === 'done' ? (
          <div className="waitlist__success" role="status">
            <p className="waitlist__success-title">
              {t('waitlist.successTitle')}
            </p>
            <p>{t('waitlist.successText')}</p>
          </div>
        ) : (
          <form className="waitlist__form" onSubmit={onSubmit} noValidate>
            <div className="waitlist__fields">
              <label className="waitlist__field" htmlFor={`${formId}-email`}>
                <span>{t('waitlist.emailLabel')}</span>
                <input
                  id={`${formId}-email`}
                  type="email"
                  name="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  inputMode="email"
                  placeholder={t('waitlist.emailPlaceholder')}
                  aria-invalid={fieldError === 'email' || undefined}
                  disabled={loading}
                />
              </label>
              <label className="waitlist__field" htmlFor={`${formId}-phone`}>
                <span>{t('waitlist.phoneLabel')}</span>
                <input
                  id={`${formId}-phone`}
                  type="tel"
                  name="phone"
                  required
                  maxLength={30}
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder={t('waitlist.phonePlaceholder')}
                  aria-invalid={fieldError === 'phone' || undefined}
                  disabled={loading}
                />
              </label>
            </div>

            {/* Honeypot: hidden from people and screen readers, bots fill it. */}
            <div className="waitlist__trap" aria-hidden="true">
              <label>
                Site web
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>
            </div>

            <fieldset className="waitlist__consents" disabled={loading}>
              <legend className="sr-only">
                {t('waitlist.optionalLegend')}
              </legend>
              <label className="waitlist__check">
                <input type="checkbox" name="emailOptIn" />
                <span>{t('waitlist.optInEmail')}</span>
              </label>
              <label className="waitlist__check">
                <input type="checkbox" name="smsOptIn" />
                <span>{t('waitlist.optInSms')}</span>
              </label>
            </fieldset>

            <button
              type="submit"
              className="waitlist__submit"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? t('waitlist.sending') : submitLabel}
            </button>

            {error && (
              <p className="waitlist__error" role="alert">
                {t(ERROR_KEYS[error])}
              </p>
            )}

            <p className="waitlist__legal">
              {t('waitlist.legal')}{' '}
              <Link to="/legal/privacy">{t('waitlist.privacy')}</Link>.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
