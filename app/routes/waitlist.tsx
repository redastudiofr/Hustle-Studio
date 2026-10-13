import type {Route} from './+types/waitlist';
import {normalizePhone} from '~/lib/phone';
import {sendNotificationEmail} from '~/lib/email';
import {LAUNCH} from '~/config/launch';

/**
 * Drop waitlist ("Be first", homepage). Server-side only: no key or secret
 * ever reaches the browser.
 *
 * Every sign-up is e-mailed to LAUNCH.notifyEmail through Resend — that
 * e-mail IS the record, so the visitor is told "you're in" only once Resend
 * has accepted it. Without RESEND_API_KEY the form answers "unavailable"
 * rather than pretending (set-up: docs/WAITLIST.md).
 *
 * Consent is kept apart: joining the waitlist only means "tell me when the
 * drop launches". Marketing e-mails and SMS are two separate, optional
 * boxes. Only a ticked e-mail box adds the address to Shopify's e-mail
 * subscribers (acceptsMarketing); the SMS choice is recorded in the e-mail.
 *
 * Abuse protection: a honeypot field, a minimum time on the form, a
 * same-origin check, field length limits and a per-IP rate limit.
 */

/** A human takes longer than this to type an e-mail and a phone number. */
const MIN_FILL_MS = 2500;
const RATE_LIMIT = {max: 5, windowMs: 10 * 60 * 1000};

/**
 * Per-instance memory of recent attempts by IP. Serverless instances are
 * recycled, so this is a brake on bursts, not a hard quota.
 */
const attempts = new Map<string, number[]>();

function rateLimited(ip: string, now: number): boolean {
  const recent = (attempts.get(ip) ?? []).filter(
    (time) => now - time < RATE_LIMIT.windowMs,
  );
  recent.push(now);
  attempts.set(ip, recent);
  if (attempts.size > 5000) attempts.clear();
  return recent.length > RATE_LIMIT.max;
}

type WaitlistError =
  'email' | 'phone' | 'spam' | 'too_fast' | 'rate' | 'unavailable' | 'send';

const fail = (error: WaitlistError, status: number) =>
  Response.json({ok: false, error}, {status});

export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') return fail('spam', 405);

  // Same-origin only: another site cannot post sign-ups through this one.
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return fail('spam', 403);
  }

  const now = Date.now();
  const ip =
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';
  if (rateLimited(ip, now)) return fail('rate', 429);

  const form = await request.formData();

  // Honeypot: invisible to people, filled in by bots.
  if (String(form.get('website') || '')) return fail('spam', 400);

  const startedAt = Number(form.get('startedAt'));
  if (!Number.isFinite(startedAt) || now - startedAt < MIN_FILL_MS) {
    return fail('too_fast', 400);
  }

  const email = String(form.get('email') || '')
    .trim()
    .toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return fail('email', 400);
  }

  const rawPhone = String(form.get('phone') || '').slice(0, 40);
  const phone = normalizePhone(rawPhone);
  if (!phone) return fail('phone', 400);

  const emailOptIn = form.get('emailOptIn') === 'on';
  const smsOptIn = form.get('smsOptIn') === 'on';

  if (!context.env.RESEND_API_KEY) {
    console.error('Waitlist: RESEND_API_KEY is not set — sign-up refused');
    return fail('unavailable', 503);
  }

  const sent = await sendNotificationEmail({
    env: context.env,
    to: LAUNCH.notifyEmail,
    subject: `Liste d'attente — ${email}`,
    text: [
      'Nouvelle inscription à la liste d’attente du drop.',
      '',
      `E-mail : ${email}`,
      `Téléphone : ${phone}`,
      `Offres par e-mail : ${emailOptIn ? 'oui' : 'non'}`,
      `Offres par SMS : ${smsOptIn ? 'oui' : 'non'}`,
      `Drop : ${LAUNCH.date}`,
      `Date d'inscription : ${new Date(now).toISOString()}`,
    ].join('\n'),
  });
  if (!sent) return fail('send', 502);

  // Marketing consent given: also an e-mail subscriber in Shopify. A bonus
  // copy — the sign-up itself already went through above.
  if (emailOptIn) {
    await subscribeInShopify(context, email, phone);
  }

  return Response.json({ok: true});
}

async function subscribeInShopify(
  context: Route.ActionArgs['context'],
  email: string,
  phone: string,
) {
  const input = {
    email,
    phone,
    acceptsMarketing: true,
    // Required by the API; never used — the subscriber can set their own
    // through "forgot password" if they ever want an account.
    password: `${crypto.randomUUID()}Aa1!`,
  };
  try {
    let {customerCreate} = await context.storefront.mutate(
      WAITLIST_CUSTOMER_CREATE,
      {variables: {input}},
    );
    // The phone already belongs to another customer: keep the e-mail.
    if (
      customerCreate?.customerUserErrors.some(
        (error) => error.code === 'TAKEN' && error.field?.includes('phone'),
      )
    ) {
      ({customerCreate} = await context.storefront.mutate(
        WAITLIST_CUSTOMER_CREATE,
        {variables: {input: {...input, phone: undefined}}},
      ));
    }
    const errors = customerCreate?.customerUserErrors ?? [];
    if (errors.length && !errors.some((error) => error.code === 'TAKEN')) {
      console.error('Waitlist: customerCreate refused', errors);
    }
  } catch (error) {
    console.error('Waitlist: customerCreate failed', error);
  }
}

const WAITLIST_CUSTOMER_CREATE = `#graphql
  mutation WaitlistCustomerCreate(
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
        field
        message
      }
    }
  }
` as const;
