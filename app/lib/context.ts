import {createHydrogenContext, InMemoryCache} from '@shopify/hydrogen';
import {BRAND} from '~/config/brand';
import {localeFromRequest, shopifyLanguage} from '~/lib/i18n/locale';
import {AppSession} from '~/lib/session';
import {CART_QUERY_FRAGMENT} from '~/lib/fragments';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

// Define the additional context object
const additionalContext = {
  // Additional context for custom properties, CMS clients, 3P SDKs, etc.
  // These will be available as both context.propertyName and context.get(propertyContext)
  // Example of complex objects that could be added:
  // cms: await createCMSClient(env),
  // reviews: await createReviewsClient(env),
} as const;

// Automatically augment HydrogenAdditionalContext with the additional context type
type AdditionalContextType = typeof additionalContext;

declare global {
  interface HydrogenAdditionalContext extends AdditionalContextType {}

  // Augment HydrogenCustomCartFragment with the codegen'd cart fragment type so
  // that context.cart.get() and all cart mutations return the extended cart type.
  interface HydrogenCustomCartFragment extends CartApiQueryFragment {}
}

/**
 * Cache for Shopify responses (storefront.CacheShort / CacheLong).
 *
 * On a Worker runtime (local dev with `npm run dev`) the Cache API exists.
 * On Vercel's Node runtime it does not, so responses are kept in memory for
 * the life of the function instance instead — shared across the requests it
 * serves, dropped when it scales down.
 */
let memoryCache: InMemoryCache | undefined;
async function openCache(): Promise<Cache> {
  if (typeof caches !== 'undefined') return caches.open('hydrogen');
  memoryCache ??= new InMemoryCache();
  return memoryCache as unknown as Cache;
}

/**
 * Creates the Hydrogen context (Storefront API client, cart, customer
 * account, session) for one request. Shared by both server entries:
 * server.ts (local dev on Mini Oxygen) and server/vercel.ts (production).
 */
export async function createHydrogenRouterContext(
  request: Request,
  env: Env,
  executionContext: Pick<ExecutionContext, 'waitUntil'>,
) {
  /**
   * Open a cache instance in the worker and a custom session instance.
   */
  if (!env?.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }
  if (!env.PUBLIC_STORE_DOMAIN || !env.PUBLIC_STOREFRONT_API_TOKEN) {
    // Without these Hydrogen silently falls back to Shopify's demo store
    // (mock.shop) — fake products on a real site. Refuse instead.
    throw new Error(
      'PUBLIC_STORE_DOMAIN and PUBLIC_STOREFRONT_API_TOKEN must be set — see .env.example',
    );
  }

  const waitUntil = executionContext.waitUntil.bind(executionContext);
  const [cache, session] = await Promise.all([
    openCache(),
    AppSession.init(request, [env.SESSION_SECRET]),
  ]);

  const hydrogenContext = createHydrogenContext(
    {
      env,
      request,
      cache,
      waitUntil,
      session,
      /*
       * The visitor's chosen language, read from its cookie. This is what
       * makes Shopify answer in that language — product titles, descriptions,
       * collection names — for whatever the merchant has published in Shopify
       * Admin. It was hardcoded to FR while the whole site was in English,
       * which meant asking Shopify for one language and rendering another.
       *
       * The country (app/config/brand.ts) drives prices and shipping, not
       * wording.
       */
      i18n: {
        language: shopifyLanguage(localeFromRequest(request)),
        country: BRAND.country,
      },
      cart: {
        queryFragment: CART_QUERY_FRAGMENT,
      },
    },
    additionalContext,
  );

  return hydrogenContext;
}
