import {redirect} from 'react-router';
import type {Route} from './+types/newsletter';
import {normalizePhone} from '~/lib/phone';
import {
  NEWSLETTER_PROMO_CODE,
  PROMO_POPUP_ACTIVE,
  PROMO_SIGNUP_COOKIE,
} from '~/lib/newsletterPromo';
import {localeFromRequest} from '~/lib/i18n/locale';
import {sendNotificationEmail} from '~/lib/email';

const NOTION_VERSION = '2022-06-28';
const NOTION_TIMEOUT_MS = 8000;
const SIGNUP_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/**
 * Newsletter sign-ups. Server-side only; no token ever reaches the browser.
 *
 * - **Pop-up (phone number → discount code)** — see app/config/promotions.ts.
 *   The number is stored in a Notion database first; the code is returned
 *   only once that has succeeded, then copied to Shopify and by e-mail.
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
    // Checked again here: the pop-up's own check can always be bypassed.
    const phone = normalizePhone(String(form.get('contact[phone]') || ''));
    if (!phone) {
      return Response.json({ok: false, error: 'phone'}, {status: 400});
    }
    return popupSignup({phone, request, context});
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

async function popupSignup({
  phone,
  request,
  context,
}: {
  phone: string;
  request: Request;
  context: Route.ActionArgs['context'];
}) {
  const notion = notionSettings(context.env);
  if (!notion) {
    // The pop-up is hidden while this is unset (see root.tsx), so reaching
    // this means a stale page or a hand-made request. Refusing is the only
    // honest answer: there is nowhere to keep the number.
    console.error(
      'Promo pop-up: NOTION_API_KEY or NOTION_PHONE_DATABASE_ID is not set',
    );
    return Response.json({ok: false, error: 'unavailable'}, {status: 503});
  }

  const locale = localeFromRequest(request);
  let alreadyRegistered: boolean;
  try {
    alreadyRegistered = await isPhoneInNotion(notion, phone);
    if (!alreadyRegistered) {
      await addPhoneToNotion(notion, {phone, locale});
    }
  } catch (error) {
    console.error('Promo pop-up: Notion request failed', error);
    const ref = `N${error instanceof NotionError ? error.status : 0}`;
    return Response.json({ok: false, error: 'storage', ref}, {status: 502});
  }

  // Secondary copies, only for a genuinely new number. Awaited so they aren't
  // cut off when the response is sent, but their outcome never changes the
  // answer: the number is already safe in Notion.
  if (!alreadyRegistered) {
    await Promise.allSettled([
      postCustomerForm(
        context,
        {phone},
        'newsletter, newsletter-popup, phone-optin',
      ),
      sendNotificationEmail({
        env: context.env,
        subject: 'Nouveau numéro collecté — pop-up',
        text: [
          `Téléphone : ${phone}`,
          `Langue : ${locale}`,
          `Code promo : ${NEWSLETTER_PROMO_CODE}`,
        ].join('\n'),
      }),
    ]);
  }

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

type NotionSettings = {token: string; databaseId: string};

function notionSettings(env: Env): NotionSettings | null {
  const token = env.NOTION_API_KEY;
  const databaseId = env.NOTION_PHONE_DATABASE_ID;
  return token && databaseId ? {token, databaseId} : null;
}

/**
 * The duplicate check. Numbers are stored normalised (+33612345678), so
 * "06 12 34 56 78" and "+33 6 12 34 56 78" are recognised as the same person.
 */
async function isPhoneInNotion(notion: NotionSettings, phone: string) {
  const result = (await notionPost(
    notion,
    `databases/${notion.databaseId}/query`,
    {
      filter: {property: 'Téléphone', title: {equals: phone}},
      page_size: 1,
    },
  )) as {results?: unknown[]};
  return (result.results?.length ?? 0) > 0;
}

/** "Date d'inscription" is a created-time column: Notion fills it in itself. */
async function addPhoneToNotion(
  notion: NotionSettings,
  {phone, locale}: {phone: string; locale: string},
) {
  await notionPost(notion, 'pages', {
    parent: {database_id: notion.databaseId},
    properties: {
      Téléphone: {title: [{text: {content: phone}}]},
      'Code promo': {rich_text: [{text: {content: NEWSLETTER_PROMO_CODE}}]},
      Langue: {select: {name: locale}},
    },
  });
}

/**
 * A failed Notion call. `status` is Notion's HTTP status (0 when the request
 * never got an answer), and is what the pop-up shows as a short reference —
 * enough to tell a wrong token (401) from a database not shared with the
 * integration (404) or a missing capability (403), without exposing anything.
 */
class NotionError extends Error {
  status: number;

  constructor(status: number, detail: string) {
    super(`Notion → ${status} ${detail}`);
    this.status = status;
  }
}

/** Throws on any failure, including a timeout, so callers can't mistake one for success. */
async function notionPost(notion: NotionSettings, path: string, body: unknown) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), NOTION_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`https://api.notion.com/v1/${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${notion.token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    throw new NotionError(
      0,
      controller.signal.aborted ? 'timeout' : String(error),
    );
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    throw new NotionError(res.status, `${path} ${await res.text()}`);
  }
  return (await res.json()) as unknown;
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
