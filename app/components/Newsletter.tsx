import {useState} from 'react';
import {useT} from '~/lib/i18n';

/**
 * Newsletter sign-up. Posts to /newsletter, which adds the e-mail to the
 * Shopify customer list with marketing consent (see routes/newsletter.tsx).
 * Shows a readable message if that fails.
 */
export function Newsletter({compact = false}: {compact?: boolean}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>(
    'idle',
  );
  const t = useT();

  async function submit(form: HTMLFormElement) {
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value;
    const firstName =
      (form.elements.namedItem('firstName') as HTMLInputElement)?.value ?? '';
    if (!email) return;

    setStatus('loading');
    try {
      const body = new URLSearchParams({
        'contact[email]': email,
        'contact[first_name]': firstName,
      });
      const res = await fetch('/newsletter', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: body.toString(),
      });
      setStatus(res.ok ? 'done' : 'error');
      if (res.ok) form.reset();
    } catch {
      setStatus('error');
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit(event.currentTarget);
  }

  if (compact) {
    return status === 'done' ? (
      <p className="sx-news__done">{t('news.thanks')}</p>
    ) : (
      <form className="sx-news" onSubmit={onSubmit}>
        <input
          type="email"
          name="email"
          placeholder={t('news.placeholder')}
          required
          autoComplete="email"
          aria-label={t('news.emailLabel')}
        />
        <button
          type="submit"
          aria-label={t('news.subscribe')}
          disabled={status === 'loading'}
        >
          <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true">
            <path
              d="M1 6h15M11 1l5 5-5 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
            />
          </svg>
        </button>
        {status === 'error' && (
          <p className="form-error" role="alert">
            {t('news.error')}
          </p>
        )}
      </form>
    );
  }

  return (
    <div className="newsletter">
      <p>{t('news.pitch1')}</p>
      <p>{t('news.pitch2')}</p>

      {status === 'done' ? (
        <p className="newsletter__success">{t('news.thanks')}</p>
      ) : (
        <form className="newsletter__form" onSubmit={onSubmit}>
          <input
            type="text"
            name="firstName"
            placeholder={t('news.firstName')}
            autoComplete="given-name"
            aria-label={t('news.firstNameLabel')}
          />
          <input
            type="email"
            name="email"
            placeholder={t('news.placeholder')}
            required
            autoComplete="email"
            aria-label={t('news.emailLabel')}
          />
          <button type="submit" className="btn" disabled={status === 'loading'}>
            {status === 'loading' ? '…' : t('news.subscribe')}
          </button>
          {status === 'error' && (
            <p className="form-error" role="alert" style={{width: '100%'}}>
              {t('news.error')}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
