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
import {LAUNCH} from '~/config/launch';

const SIGNUP_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/**
 * Newsletter sign-ups. Server-side only; no token ever reaches the browser.
 *
 * - **Pop-up (e-mail and/or phone → discount code)** — see
 *   app/config/promotions.ts and popupSignup below.
 * - **Footer / homepage form (e-mail)** — described below.
 *
 * The e-mail becomes a Shopify customer who accepts e-mail marketing, so it
 * shows up in Shopify Admin → Customers (filter "Email subscribers") and can
 * be reached with Shopify Email. First through the Storefront API's
 * `customerCreate`; if the store has legacy customer accounts turned off,
 * through the store's own customer form instead — the same one a Shopify
 * theme's newsletter block posts to.
 */
export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return Response.json({ok: false}, {status: 405});
  }

  const form = await request.formData();

  if (form.get('source') === 'popup') {
    if (!PROMO_POPUP_ACTIVE) {
      return Response.json({ok: false, error: 'unavailable'}, {status: 503});
    }
    // E-mail and/or phone, checked again here: the pop-up's own check can
    // always be bypassed.
    const rawEmail = String(form.get('contact[email]') || '')
      .trim()
      .toLowerCase();
    const rawPhone = String(form.get('contact[phone]') || '').slice(0, 40);
    if (!rawEmail && !rawPhone.trim()) {
      return Response.json({ok: false, error: 'empty'}, {status: 400});
    }
    if (
      rawEmail &&
      (rawEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(rawEmail))
    ) {
      return Response.json({ok: false, error: 'email'}, {status: 400});
    }
    const phone = rawPhone.trim() ? normalizePhone(rawPhone) : '';
    if (rawPhone.trim() && !phone) {
      return Response.json({ok: false, error: 'phone'}, {status: 400});
    }
    return popupSignup({email: rawEmail, phone: phone || '', request, context});
  }

  const email = String(
    form.get('contact[email]') || form.get('email') || '',
  ).trim();
  const firstName = String(form.get('contact[first_name]') || '')
    .trim()
    .slice(0, 80);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return Response.json({ok: false, error: 'email'}, {status: 400});
  }

  if (await createSubscriber(context, email, firstName)) {
    return Response.json({ok: true});
  }
  const ok = await postCustomerForm(context, {email, firstName}, 'newsletter');
  return Response.json({ok}, {status: ok ? 200 : 502});
}

async function createSubscriber(
  context: Route.ActionArgs['context'],
  email: string,
  firstName: string,
): Promise<boolean> {
  try {
    const {customerCreate} = await context.storefront.mutate(
      CUSTOMER_CREATE_MUTATION,
      {
        variables: {
          input: {
            email,
            firstName: firstName || undefined,
            acceptsMarketing: true,
            // Required by the API; never used — the subscriber can set their own
            // through "forgot password" if they ever want an account.
            password: `${crypto.randomUUID()}Aa1!`,
          },
        },
      },
    );
    const errors = customerCreate?.customerUserErrors ?? [];
    // Already a customer: they are on the list, nothing more to do here.
    return (
      errors.length === 0 || errors.some((error) => error.code === 'TAKEN')
    );
  } catch (error) {
    console.error('Newsletter: customerCreate failed', error);
    return false;
  }
}

/** The store's native customer form, as a Shopify theme's sign-up posts it. */
async function postCustomerForm(
  context: Route.ActionArgs['context'],
  fields: {email?: string; phone?: string; firstName?: string},
  tags: string,
): Promise<boolean> {
  const body = new URLSearchParams({
    form_type: 'customer',
    utf8: '✓',
    'contact[tags]': tags,
    ...(fields.email ? {'contact[email]': fields.email} : {}),
    ...(fields.phone ? {'contact[phone]': fields.phone} : {}),
    ...(fields.firstName ? {'contact[first_name]': fields.firstName} : {}),
  });
  try {
    const res = await fetch(
      `https://${context.env.PUBLIC_STORE_DOMAIN}/contact`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: body.toString(),
        redirect: 'manual',
      },
    );
    return res.status < 400;
  } catch (error) {
    console.error('Newsletter: customer form failed', error);
    return false;
  }
}

/**
 * Pop-up sign-up: the record goes to the Google Sheet (GOOGLE_SHEET_WEBHOOK_URL,
 * see docs/POPUP.md) and, as a copy, by e-mail through Resend; the code is
 * given only once at least one of them has it. The e-mail also becomes a
 * Shopify customer who accepts marketing (Shopify Admin → Customers).
 */
async function popupSignup({
  email,
  phone,
  request,
  context,
}: {
  email: string;
  phone: string;
  request: Request;
  context: Route.ActionArgs['context'];
}) {
  const locale = localeFromRequest(request);
  const env = context.env;
  if (!env.GOOGLE_SHEET_WEBHOOK_URL && !env.RESEND_API_KEY) {
    // The pop-up is hidden in this case (see root.tsx): a stale page or a
    // hand-made request. There is nowhere to keep the sign-up.
    console.error(
      'Promo pop-up: neither Google Sheet nor Resend is configured',
    );
    return Response.json({ok: false, error: 'unavailable'}, {status: 503});
  }

  const record = {
    date: new Date().toISOString(),
    email,
    phone,
    locale,
    code: NEWSLETTER_PROMO_CODE,
    source: 'popup',
  };

  const [sheet, mail] = await Promise.all([
    saveToSheet(env, record),
    sendNotificationEmail({
      env,
      to: LAUNCH.notifyEmail,
      subject: `Pop-up -${NEWSLETTER_PROMO_PERCENT}% — ${email || phone}`,
      text: popupEmailText(email, phone, locale),
    }),
    // Marketing copy in Shopify; its outcome never changes the answer.
    email
      ? createSubscriber(context, email, '')
      : postCustomerForm(
          context,
          {phone},
          'newsletter, newsletter-popup, phone-optin',
        ),
  ]);

  if (!sheet && !mail) {
    return Response.json(
      {
        ok: false,
        error: 'storage',
        ref: env.GOOGLE_SHEET_WEBHOOK_URL ? 'S' : 'R',
      },
      {status: 502},
    );
  }
  return popupSuccess(request, false);
}

/** Appends one row to the Google Sheet through its Apps Script web app. */
async function saveToSheet(
  env: Env,
  record: Record<string, string>,
): Promise<boolean> {
  const url = env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!url) return false;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(record),
      signal: controller.signal,
      // Apps Script answers through a redirect to googleusercontent.com.
      redirect: 'follow',
    });
    const body = (await res.json().catch(() => null)) as {ok?: boolean} | null;
    if (!res.ok || !body?.ok) {
      console.error('Promo pop-up: Google Sheet refused', res.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Promo pop-up: Google Sheet unreachable', error);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function popupEmailText(email: string, phone: string, locale: string): string {
  return [
    `Nouvelle inscription au pop-up -${NEWSLETTER_PROMO_PERCENT}% (première commande).`,
    '',
    `E-mail : ${email || '—'}`,
    `Téléphone : ${phone || '—'}`,
    `Langue : ${locale}`,
    `Code promo donné : ${NEWSLETTER_PROMO_CODE}`,
    `Date : ${new Date().toISOString()}`,
  ].join('\n');
}

/** The code, plus the cookie that keeps the pop-up from asking again. */
function popupSuccess(request: Request, alreadyRegistered: boolean) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return Response.json(
    {ok: true, code: NEWSLETTER_PROMO_CODE, alreadyRegistered},
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

const CUSTOMER_CREATE_MUTATION = `#graphql
  mutation NewsletterCustomerCreate(
    $input: CustomerCreateInput!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    customerCreate(input: $input) {
      customer {
        id
      }
      customerUserErrors {
        code
        message
      }
    }
  }
` as const;
