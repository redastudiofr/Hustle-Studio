import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/policies._index';
import type {PoliciesQuery, PolicyItemFragment} from 'storefrontapi.generated';
import {useT} from '~/lib/i18n';
import {seoMeta, originFromMatches} from '~/lib/seo';

export const meta: Route.MetaFunction = ({matches}) =>
  seoMeta({
    title: 'policies',
    path: '/policies',
    origin: originFromMatches(matches),
  });

export async function loader({context}: Route.LoaderArgs) {
  const data: PoliciesQuery = await context.storefront.query(POLICIES_QUERY);

  const shopPolicies = data.shop;
  const policies: PolicyItemFragment[] = [
    shopPolicies?.privacyPolicy,
    shopPolicies?.shippingPolicy,
    shopPolicies?.termsOfService,
    shopPolicies?.refundPolicy,
    shopPolicies?.termsOfSale,
    shopPolicies?.legalNotice,
    shopPolicies?.subscriptionPolicy,
  ].filter((policy): policy is PolicyItemFragment => policy != null);

  if (!policies.length) {
    throw new Response('No policies found', {status: 404});
  }

  return {policies};
}

export default function Policies() {
  const t = useT();
  const {policies} = useLoaderData<typeof loader>();

  return (
    <div className="page">
      <h1>{t('policies.title')}</h1>
      <ul className="policies-list">
        {policies.map((policy) => (
          <li key={policy.id} className="policies-list__item">
            <Link to={`/policies/${policy.handle}`}>{policy.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const POLICIES_QUERY = `#graphql
  fragment PolicyItem on ShopPolicy {
    id
    title
    handle
  }
  query Policies ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        ...PolicyItem
      }
      shippingPolicy {
        ...PolicyItem
      }
      termsOfService {
        ...PolicyItem
      }
      refundPolicy {
        ...PolicyItem
      }
      termsOfSale {
        ...PolicyItem
      }
      legalNotice {
        ...PolicyItem
      }
      subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
` as const;
