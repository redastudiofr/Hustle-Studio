import {redirect} from 'react-router';
import type {Route} from './+types/newsletter';

/**
 * Newsletter sign-up (footer and homepage form). Server-side only.
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
  const ok = await postCustomerForm(context, email, firstName);
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

async function postCustomerForm(
  context: Route.ActionArgs['context'],
  email: string,
  firstName: string,
): Promise<boolean> {
  const body = new URLSearchParams({
    form_type: 'customer',
    utf8: '✓',
    'contact[tags]': 'newsletter',
    'contact[email]': email,
    ...(firstName ? {'contact[first_name]': firstName} : {}),
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
