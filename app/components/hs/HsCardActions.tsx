import {useCallback, useEffect, useRef, useState} from 'react';
import {
  Link,
  useRouteLoaderData,
  type FetcherWithComponents,
} from 'react-router';
import type {RootLoader} from '~/root';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {useT} from '~/lib/i18n';
import {notifyCartAdded, showHsToast} from '~/components/hs/HsToast';

/**
 * What a product card hands to its actions. Structural, so the grid cards
 * (ProductItem) and the Reda cards (reda/ProductItem) can both pass their
 * own Shopify fragments.
 */
export type HsCardProduct = {
  id: string;
  handle: string;
  title: string;
  availableForSale: boolean;
  featuredImage?: {
    id?: string | null;
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  priceRange: {minVariantPrice: {amount: string; currencyCode: string}};
  options?: Array<{name: string}> | null;
  variants?: {nodes: Array<{id: string; availableForSale: boolean}>} | null;
};

/* ── Favourites ───────────────────────────────────────────────────────── */

const FAVORITES_KEY = 'hs-favorites';
const FAVORITES_EVENT = 'hs:favorites';

function readFavorites(): string[] {
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(FAVORITES_KEY) ?? '[]',
    );
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

function writeFavorites(list: string[]) {
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
  } catch {
    // Storage refused (private mode, quota): the heart still toggles for
    // this page, it just won't be remembered.
  }
  window.dispatchEvent(new Event(FAVORITES_EVENT));
}

/**
 * Whether a product is in the favourites, kept in localStorage (the shop has
 * no favourites of its own). Every heart showing the same product stays in
 * step, in this tab and in others.
 */
export function useFavorite(handle: string) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const sync = () => setOn(readFavorites().includes(handle));
    sync();
    window.addEventListener(FAVORITES_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(FAVORITES_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [handle]);

  const toggle = useCallback(() => {
    const list = readFavorites();
    const next = list.includes(handle)
      ? list.filter((item) => item !== handle)
      : [...list, handle];
    setOn(next.includes(handle));
    writeFavorites(next);
    return next.includes(handle);
  }, [handle]);

  return [on, toggle] as const;
}

export function HsFavoriteButton({product}: {product: HsCardProduct}) {
  const t = useT();
  const [on, toggle] = useFavorite(product.handle);
  // Bumped each time the heart fills: the key restarts the "pop".
  const [pop, setPop] = useState(0);

  return (
    <button
      type="button"
      className={`hs-heart${on ? ' hs-heart--on' : ''}`}
      aria-pressed={on}
      aria-label={t(on ? 'card.removeFavorite' : 'card.addFavorite', {
        title: product.title,
      })}
      onClick={() => {
        if (toggle()) setPop((n) => n + 1);
      }}
    >
      <svg
        key={pop}
        className={`hs-heart__icon${pop ? ' hs-heart__icon--pop' : ''}`}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M12 20.3s-7.6-4.6-9.2-9.4C1.7 7.6 3.9 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.3 0 5.5 3.1 4.4 6.4-1.6 4.8-9.2 9.4-9.2 9.4z"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/* ── Quick add ────────────────────────────────────────────────────────── */

const SUCCESS_MS = 1800;
const ERROR_MS = 3200;

/**
 * "Add to cart" on the card, through the cart's existing LinesAdd action
 * (app/routes/cart.tsx) — the same path as the product page's button.
 *
 * Only a product with exactly one variant is added from here. Any other
 * (sizes, colours) links to its product page to choose: a size is never
 * picked for the customer. Sold-out products show nothing.
 */
export function HsQuickAdd({product}: {product: HsCardProduct}) {
  const t = useT();
  if (!product.availableForSale) return null;

  const variants = product.variants?.nodes ?? [];
  const only = variants.length === 1 ? variants[0] : null;

  if (!only || !only.availableForSale) {
    const hasSize = (product.options ?? []).some((option) =>
      /^(size|taille|pointure)$/i.test(option.name.trim()),
    );
    return (
      <div className="hs-quick">
        <Link
          to={`/products/${product.handle}`}
          prefetch="intent"
          className="hs-quick__btn"
        >
          {t(hasSize ? 'card.chooseSize' : 'card.chooseOptions')}
        </Link>
      </div>
    );
  }

  const lines: OptimisticCartLineInput[] = [
    {
      merchandiseId: only.id,
      quantity: 1,
      // Lets the header count and the drawer show the line before Shopify
      // answers (Hydrogen's optimistic cart).
      selectedVariant: {
        id: only.id,
        availableForSale: true,
        title: product.title,
        price: product.priceRange.minVariantPrice,
        image: product.featuredImage ?? null,
        selectedOptions: [],
        product: {
          id: product.id,
          title: product.title,
          handle: product.handle,
        },
      },
    },
  ];

  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesAdd}
      inputs={{lines}}
      fetcherKey={`hs-quick-${product.id}`}
    >
      {(fetcher: FetcherWithComponents<unknown>) => (
        <QuickAddButton fetcher={fetcher} title={product.title} />
      )}
    </CartForm>
  );
}

type CartActionData = {
  cart?: {totalQuantity?: number | null} | null;
  errors?: Array<{message?: string}> | null;
};

/**
 * The cart's current quantity, from the root loader — read before each add
 * so the answer can be checked: Shopify sometimes answers a refused line
 * with the unchanged cart and no error.
 */
function useCartQuantity() {
  const root = useRouteLoaderData<RootLoader>('root');
  const quantity = useRef<number | null>(null);
  useEffect(() => {
    let live = true;
    Promise.resolve(root?.cart)
      .then((cart) => {
        if (live) quantity.current = cart?.totalQuantity ?? 0;
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [root?.cart]);
  return quantity;
}

function QuickAddButton({
  fetcher,
  title,
}: {
  fetcher: FetcherWithComponents<unknown>;
  title: string;
}) {
  const t = useT();
  const [phase, setPhase] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState(false);
  const pending = useRef(false);
  const cartQuantity = useCartQuantity();
  const quantityBefore = useRef<number | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => timers.current.forEach((timer) => window.clearTimeout(timer)),
    [],
  );

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  useEffect(() => {
    if (fetcher.state !== 'idle') {
      if (!pending.current) quantityBefore.current = cartQuantity.current;
      pending.current = true;
      setPhase('loading');
      setError(false);
      return;
    }
    if (!pending.current) return;
    pending.current = false;

    const result = fetcher.data as CartActionData | undefined;
    const before = quantityBefore.current;
    const after = result?.cart?.totalQuantity;
    const grew =
      before === null || typeof after !== 'number' ? true : after > before;
    const ok = Boolean(result?.cart) && !result?.errors?.length && grew;
    if (ok) {
      setPhase('success');
      notifyCartAdded();
      showHsToast(t('card.addedToast', {title}));
      later(() => setPhase('idle'), SUCCESS_MS);
    } else {
      setPhase('idle');
      setError(true);
      later(() => setError(false), ERROR_MS);
    }
    // Only the request's own state changes matter here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.state, fetcher.data]);

  const busy = phase !== 'idle' || fetcher.state !== 'idle';

  return (
    <div className="hs-quick">
      {error && (
        <p className="hs-quick__error" role="alert">
          {t('card.addError')}
        </p>
      )}
      <button
        type="submit"
        className={`hs-quick__btn hs-quick__btn--${phase}`}
        disabled={busy}
        aria-disabled={busy}
      >
        <span className="hs-quick__label" aria-live="polite">
          {phase === 'loading' && (
            <>
              <span className="hs-spinner" aria-hidden="true" />
              {t('card.adding')}
            </>
          )}
          {phase === 'success' && (
            <>
              <svg
                className="hs-check"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                aria-hidden="true"
              >
                <path d="M2 7.4l3.2 3.1L12 3.6" />
              </svg>
              {t('card.added')}
            </>
          )}
          {phase === 'idle' && t('card.addToCart')}
        </span>
      </button>
    </div>
  );
}
