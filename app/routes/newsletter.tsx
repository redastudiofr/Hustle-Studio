import {redirect} from 'react-router';
import type {Route} from './+types/newsletter';
import {normalizePhone} from '~/lib/phone';
import {
  NEWSLETTER_PROMO_CODE,
  NEWSLETTER_PROMO_PERCENT,
  PROMO_POPUP_ACTIVE,
  PROMO_SIGNUP_COOKIE,
} from '~/lib/newsletterPromo';
import {localeFromRequest} from '~/lib/i18n/locale';
import {sendNotificationEmail} from '~/lib/email';
import {serverEnv} from '~/lib/env.server';
import {INBOX} from '~/config/inbox';

const SIGNUP_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/**
 * Newsletter sign-ups. Server-side only; no key ever reaches the browser.
 * Each sign-up is e-mailed to the shop's inbox through Resend — that e-mail
 * is the record, so the visitor is told it worked only once Resend has
 * accepted it.
 *
 * - **Pop-up (phone number → discount code)** — see app/config/promotions.ts.
 * - **Footer form (e-mail)**.
 */
export async function action({request}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return Response.json({ok: false}, {status: 405});
  }

  const form = await request.formData();
  const env = serverEnv();

  if (form.get('source') === 'popup') {
    if (!PROMO_POPUP_ACTIVE || !env.RESEND_API_KEY) {
      return Response.json({ok: false, error: 'unavailable'}, {status: 503});
    }
    // Checked again here: the pop-up's own check can always be bypassed.
    const phone = normalizePhone(String(form.get('contact[phone]') || ''));
    if (!phone) {
      return Response.json({ok: false, error: 'phone'}, {status: 400});
    }
    const sent = await sendNotificationEmail({
      env,
      to: INBOX,
      subject: `Pop-up -${NEWSLETTER_PROMO_PERCENT}% — ${phone}`,
      text: popupEmailText(phone, localeFromRequest(request)),
    });
    if (!sent) {
      return Response.json(
        {ok: false, error: 'storage', ref: 'R'},
        {status: 502},
      );
    }
    return popupSuccess(request);
  }

  const email = String(form.get('contact[email]') || form.get('email') || '')
    .trim()
    .toLowerCase();
  const firstName = String(form.get('contact[first_name]') || '')
    .trim()
    .slice(0, 80);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return Response.json({ok: false, error: 'email'}, {status: 400});
  }

  const ok = await sendNotificationEmail({
    env,
    to: INBOX,
    subject: `Newsletter — ${email}`,
    text: [
      'Nouvelle inscription à la newsletter.',
      '',
      `E-mail : ${email}`,
      firstName && `Prénom : ${firstName}`,
      `Date : ${new Date().toISOString()}`,
    ]
      .filter(Boolean)
      .join('\n'),
  });
  return Response.json({ok}, {status: ok ? 200 : 502});
}

function popupEmailText(phone: string, locale: string): string {
  return [
    `Nouveau numéro collecté par le pop-up -${NEWSLETTER_PROMO_PERCENT}% (première commande).`,
    '',
    `Téléphone : ${phone}`,
    `Langue : ${locale}`,
    `Code promo donné : ${NEWSLETTER_PROMO_CODE}`,
    `Date : ${new Date().toISOString()}`,
  ].join('\n');
}

/** The code, plus the cookie that keeps the pop-up from asking again. */
function popupSuccess(request: Request) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return Response.json(
    {ok: true, code: NEWSLETTER_PROMO_CODE, alreadyRegistered: false},
    {
      headers: {
        'Set-Cookie': `${PROMO_SIGNUP_COOKIE}=1; Path=/; Max-Age=${SIGNUP_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`,
      },
    },
  );
}

// Visiting /newsletter directly is not meaningful — send them home.
export async function loader() {
  return redirect('/');
}
