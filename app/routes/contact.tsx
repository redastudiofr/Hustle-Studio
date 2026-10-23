import {Form, useActionData, useNavigation} from 'react-router';
import {useT} from '~/lib/i18n';
import type {Route} from './+types/contact';
import {seoMeta, originFromMatches} from '~/lib/seo';
import {sendNotificationEmail} from '~/lib/email';
import {serverEnv} from '~/lib/env.server';
import {INBOX} from '~/config/inbox';

export const meta: Route.MetaFunction = ({matches}) =>
  seoMeta({
    title: 'contact',
    path: '/contact',
    origin: originFromMatches(matches),
  });

type ActionData = {ok: boolean; error?: string};

/** The message is e-mailed to the shop's inbox (INBOX) through Resend. */
export async function action({request}: Route.ActionArgs): Promise<ActionData> {
  const formData = await request.formData();
  const name = String(formData.get('name') || '')
    .trim()
    .slice(0, 120);
  const email = String(formData.get('email') || '')
    .trim()
    .slice(0, 254);
  const message = String(formData.get('message') || '')
    .trim()
    .slice(0, 5000);

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) {
    return {ok: false, error: 'fields'};
  }

  const sent = await sendNotificationEmail({
    env: serverEnv(),
    to: INBOX,
    subject: `Contact — ${name}`,
    text: [`Nom : ${name}`, `E-mail : ${email}`, '', message].join('\n'),
  });
  return sent ? {ok: true} : {ok: false, error: 'send'};
}

export default function Contact() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const t = useT();
  const submitting = navigation.state === 'submitting';

  return (
    <div className="page">
      <h1>{t('contact.title')}</h1>
      <p>{t('contact.intro')}</p>

      {actionData?.ok ? (
        <p className="form-success" role="status">
          {t('contact.thanks')}
        </p>
      ) : (
        <Form method="post" className="contact-form" replace>
          <label htmlFor="name">{t('contact.name')}</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
          />

          <label htmlFor="email">{t('contact.email')}</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />

          <label htmlFor="message">{t('contact.message')}</label>
          <textarea id="message" name="message" rows={5} required />

          {actionData?.error && (
            <p className="form-error" role="alert">
              {actionData.error === 'fields'
                ? t('contact.errorFields')
                : t('contact.errorSend')}
            </p>
          )}

          <br />
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? t('contact.sending') : t('contact.send')}
          </button>
        </Form>
      )}
    </div>
  );
}
