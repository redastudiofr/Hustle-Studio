import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/policies.$handle';
import {useT} from '~/lib/i18n';
import {seoMeta, originFromMatches} from '~/lib/seo';

/**
 * Legal pages, written in Shopify Admin → Settings → Policies. Nothing legal
 * is hardcoded in the storefront: edit the text in Shopify and it shows here.
 *
 * URL handle → Shopify field:
 */
const POLICIES = {
  'privacy-policy': 'privacyPolicy',
  'refund-policy': 'refundPolicy',
  'shipping-policy': 'shippingPolicy',
  'terms-of-service': 'termsOfService',
  'terms-of-sale': 'termsOfSale',
  'legal-notice': 'legalNotice',
  'subscription-policy': 'subscriptionPolicy',
} as const;

type PolicyHandle = keyof typeof POLICIES;

export const meta: Route.MetaFunction = ({data, matches}) =>
  seoMeta({
    title: data?.policy.title,
    path: data ? `/policies/${data.handle}` : undefined,
    origin: originFromMatches(matches),
  });

export async function loader({params, context}: Route.LoaderArgs) {
  const handle = params.handle as PolicyHandle;
  const field = POLICIES[handle];
  if (!field) {
    throw new Response('Unknown policy', {status: 404});
  }

  const data = await context.storefront.query(POLICY_CONTENT_QUERY, {
    cache: context.storefront.CacheLong(),
  });
  const policy = data.shop?.[field];

  // Not written yet in Shopify Admin.
  if (!policy?.body) {
    throw new Response('Policy not published', {status: 404});
  }

  return {policy, handle};
}

export default function Policy() {
  const {policy} = useLoaderData<typeof loader>();
  const t = useT();

  return (
    <div className="page policy-page">
      <Link to="/policies" className="btn--ghost">
        ← {t('policies.title')}
      </Link>
      <h1>{policy.title}</h1>
      <div className="rte" dangerouslySetInnerHTML={{__html: policy.body}} />
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/Shop
const POLICY_CONTENT_QUERY = `#graphql
  fragment Policy on ShopPolicy {
    body
    handle
    id
    title
    url
  }
  fragment PolicyWithDefault on ShopPolicyWithDefault {
    body
    handle
    id
    title
    url
  }
  query Policy($country: CountryCode, $language: LanguageCode)
  @inContext(language: $language, country: $country) {
    shop {
      privacyPolicy {
        ...Policy
      }
      shippingPolicy {
        ...Policy
      }
      termsOfService {
        ...Policy
      }
      refundPolicy {
        ...Policy
      }
      termsOfSale {
        ...Policy
      }
      legalNotice {
        ...Policy
      }
      subscriptionPolicy {
        ...PolicyWithDefault
      }
    }
  }
` as const;
