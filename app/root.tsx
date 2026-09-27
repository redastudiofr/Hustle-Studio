import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import type {Route} from './+types/root';
import {HEADER_QUERY, NAV_COLLECTIONS_QUERY} from '~/lib/fragments';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import brandStyles from '~/styles/brand.css?url';
import tailwindCss from './styles/tailwind.css?url';
import {PageLayout} from './components/PageLayout';
import {withoutAutoCollections} from '~/lib/collections';
import {I18nProvider} from '~/lib/i18n';
import {consentChosen as hasConsentChoice} from '~/lib/cookieConsent';
import {
  DEFAULT_LOCALE,
  localeChosen as hasLocaleChoice,
  localeFromRequest,
} from '~/lib/i18n/locale';
import {BRAND} from '~/config/brand';
import {seoMeta} from '~/lib/seo';
import {ErrorPage} from '~/components/ErrorPage';

export type RootLoader = typeof loader;

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    // Favicon served from /public so the logo can be swapped by replacing the
    // files (see app/config/brand.ts). The .ico bundles 16/32/48px and is the
    // most reliable fallback; the 32px PNG is preferred by modern browsers,
    // and apple-touch-icon covers iOS home-screen / bookmarks.
    {rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png'},
    {rel: 'icon', sizes: '48x48', href: '/favicon.ico'},
    {rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png'},
  ];
}

/** Defaults for any route that does not declare its own meta. */
export const meta: Route.MetaFunction = ({data}) =>
  seoMeta({origin: data?.origin, path: '/'});

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront, env} = args.context;

  return {
    ...deferredData,
    ...criticalData,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    // Only a yes/no reaches the browser: whether the Customer Account API is
    // configured, which decides whether the header shows an account icon.
    accountEnabled: Boolean(env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID),
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      // localize the privacy banner
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const locale = localeFromRequest(request);

  const [header, {collections}] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: BRAND.menus.header,
      },
    }),
    storefront.query(NAV_COLLECTIONS_QUERY, {cache: storefront.CacheLong()}),
    // Add other queries here, so that they are loaded in parallel
  ]);

  // Shopify auto-creates a "Home page" collection on every store; it isn't a
  // real product category. The rule lives in ~/lib/collections so the header
  // and the collections index can't drift apart.
  const navCollections = withoutAutoCollections(collections.nodes);

  // Whether the language question has ever been answered — the pop-up is
  // rendered only when it hasn't, so it can't flash for someone who already
  // chose, and can't come back page after page.
  return {
    header,
    navCollections,
    locale,
    localeChosen: hasLocaleChoice(request),
    consentChosen: hasConsentChoice(request),
    origin: new URL(request.url).origin,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const {storefront, customerAccount, cart} = context;
  /*
   * Products offered inside the cart drawer. Deferred and cached, because it
   * is a suggestion: it must never hold up the page, and the drawer opens with
   * it already in hand rather than starting a request at the moment someone
   * wants to check out.
   */
  const cartSuggestions = storefront
    .query(CART_SUGGESTIONS_QUERY, {
      cache: storefront.CacheShort(),
      variables: {first: 8},
    })
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn().catch(() => false),
    cartSuggestions,
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();
  // Read here rather than passed down, because Layout also wraps the error
  // boundary, where the loader data may be absent — hence the fallback.
  const data = useRouteLoaderData<RootLoader>('root');
  const locale = data?.locale ?? DEFAULT_LOCALE;

  return (
    <html
      lang={locale}
      // The header and footer paint the wordmark through a CSS mask; its file
      // comes from app/config/brand.ts rather than being hardcoded in CSS.
      style={
        {
          '--brand-wordmark': `url(${BRAND.logo.wordmark})`,
        } as React.CSSProperties
      }
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content={BRAND.themeColor} />
        <link rel="stylesheet" href={tailwindCss}></link>
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <link rel="stylesheet" href={brandStyles}></link>
        <Meta />
        <Links />
        {/*
          Marks the document as "JavaScript is running" before the page paints.
          The scroll-reveal animation hides its sections until JavaScript says
          otherwise (see .reveal in app.css), so without this flag a script
          that never ran — or hydration that failed — left whole rows of
          products invisible with no way back. Everything is visible by
          default now; the animation is the enhancement, not the condition.
        */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body>
        <I18nProvider locale={locale}>{children}</I18nProvider>
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');

  if (!data) {
    return <Outlet />;
  }

  return (
    <Analytics.Provider
      cart={data.cart}
      shop={data.shop}
      consent={data.consent}
    >
      <PageLayout {...data}>
        <Outlet />
      </PageLayout>
    </Analytics.Provider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  if (!isRouteErrorResponse(error)) console.error(error);
  return <ErrorPage status={status} />;
}

/**
 * The products offered in the cart drawer.
 *
 * Newest first, with every variant's availability, because the drawer offers a
 * one-tap add: it has to know which sizes are actually buyable rather than
 * sending someone to a sold-out variant.
 */
const CART_SUGGESTIONS_QUERY = `#graphql
  fragment SuggestedProduct on Product {
    id
    title
    handle
    availableForSale
    featuredImage {
      id
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 12) {
      nodes {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
        }
      }
    }
  }
  query CartSuggestions($country: CountryCode, $language: LanguageCode, $first: Int)
    @inContext(country: $country, language: $language) {
    products(first: $first, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...SuggestedProduct
      }
    }
  }
` as const;
