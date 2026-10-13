import {useEffect, useId, useRef, useState} from 'react';
import {Link} from 'react-router';
import {normalizePhone} from '~/lib/phone';

type Status = 'idle' | 'loading' | 'done' | 'error';

/** What the visitor reads for each failure the server (or this form) reports. */
const ERRORS: Record<string, string> = {
  email: 'Cette adresse e-mail ne semble pas valide.',
  phone:
    'Ce numéro ne semble pas valide. Exemple : 06 12 34 56 78 ou +33 6 12 34 56 78.',
  too_fast: 'Un instant… vérifie tes informations puis réessaie.',
  rate: 'Trop de tentatives. Réessaie dans quelques minutes.',
  unavailable:
    'Les inscriptions ne sont pas encore ouvertes. Réessaie un peu plus tard.',
  send: 'L’inscription n’a pas pu être enregistrée. Réessaie dans un instant.',
  spam: 'L’inscription n’a pas pu être enregistrée. Réessaie dans un instant.',
  network: 'Connexion impossible. Vérifie ta connexion internet puis réessaie.',
};

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
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<'email' | 'phone' | null>(null);
  const startedAt = useRef<number>(0);
  const sending = useRef(false);
  const formId = useId();

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
      setError(ERRORS.email);
      return;
    }
    if (!normalizePhone(phone)) {
      setFieldError('phone');
      setError(ERRORS.phone);
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
      const code = body?.error ?? 'send';
      if (code === 'email' || code === 'phone') setFieldError(code);
      setError(ERRORS[code] ?? ERRORS.send);
      setStatus('error');
    } catch {
      setError(ERRORS.network);
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
            <p className="waitlist__success-title">C’est noté.</p>
            <p>
              Tu fais partie de la liste d’attente. On te prévient dès
              l’ouverture du drop.
            </p>
          </div>
        ) : (
          <form className="waitlist__form" onSubmit={onSubmit} noValidate>
            <div className="waitlist__fields">
              <label className="waitlist__field" htmlFor={`${formId}-email`}>
                <span>E-mail</span>
                <input
                  id={`${formId}-email`}
                  type="email"
                  name="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  inputMode="email"
                  placeholder="ton@email.com"
                  aria-invalid={fieldError === 'email' || undefined}
                  disabled={loading}
                />
              </label>
              <label className="waitlist__field" htmlFor={`${formId}-phone`}>
                <span>Téléphone</span>
                <input
                  id={`${formId}-phone`}
                  type="tel"
                  name="phone"
                  required
                  maxLength={30}
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="06 12 34 56 78"
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
              <legend className="sr-only">Communications facultatives</legend>
              <label className="waitlist__check">
                <input type="checkbox" name="emailOptIn" />
                <span>
                  J’accepte de recevoir les nouveautés et offres de Hustle
                  Studio par e-mail (facultatif).
                </span>
              </label>
              <label className="waitlist__check">
                <input type="checkbox" name="smsOptIn" />
                <span>
                  J’accepte de recevoir les nouveautés et offres de Hustle
                  Studio par SMS (facultatif).
                </span>
              </label>
            </fieldset>

            <button
              type="submit"
              className="waitlist__submit"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? 'Inscription en cours…' : submitLabel}
            </button>

            {error && (
              <p className="waitlist__error" role="alert">
                {error}
              </p>
            )}

            <p className="waitlist__legal">
              Ton e-mail et ton numéro servent à te prévenir du lancement de ce
              drop. Les offres commerciales ne te sont envoyées que si tu as
              coché la case correspondante, et tu peux te désinscrire à tout
              moment. Détails dans notre{' '}
              <Link to="/legal/privacy">politique de confidentialité</Link>.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
