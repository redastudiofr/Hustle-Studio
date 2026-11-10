import {useEffect, useRef, useState} from 'react';
import {useFetcher, useRouteLoaderData} from 'react-router';
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
  variants?: {
    nodes: Array<{
      id: string;
      availableForSale: boolean;
      title?: string | null;
      selectedOptions?: Array<{name: string; value: string}> | null;
    }>;
  } | null;
};

/* ── Quick add ────────────────────────────────────────────────────────── */

const SUCCESS_MS = 1800;
const ERROR_MS = 3200;

type CardVariant = NonNullable<HsCardProduct['variants']>['nodes'][number];

const SIZE_NAME = /^(size|taille|pointure)$/i;

/** What the customer picks on the card: the size, else what tells variants apart. */
function variantLabel(variant: CardVariant, variants: CardVariant[]) {
  const options = variant.selectedOptions ?? [];
  const size = options.find((option) => SIZE_NAME.test(option.name.trim()));
  if (size) return size.value;
  const varying = options.filter((option) =>
    variants.some((other) =>
      (other.selectedOptions ?? []).some(
        (o) => o.name === option.name && o.value !== option.value,
      ),
    ),
  );
  if (varying.length) return varying.map((option) => option.value).join(' / ');
  return variant.title ?? '';
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

/**
 * "Add to cart" on the card, through the cart's existing LinesAdd action
 * (app/routes/cart.tsx) — the same request the product page sends.
 *
 * One variant: the button adds it. Several (sizes): the button opens the
 * sizes, the customer taps one, that one is added — a size is never picked
 * for them. Sold-out sizes are shown but cannot be chosen; a sold-out
 * product shows no button.
 */
export function HsQuickAdd({product}: {product: HsCardProduct}) {
  const t = useT();
  const fetcher = useFetcher<CartActionData>({key: `hs-quick-${product.id}`});
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState(false);
  const pending = useRef(false);
  const cartQuantity = useCartQuantity();
  const quantityBefore = useRef<number | null>(null);
  const timers = useRef<number[]>([]);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(
    () => () => timers.current.forEach((timer) => window.clearTimeout(timer)),
    [],
  );

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  // The sizes close on Escape or on a click anywhere else.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

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

    const result = fetcher.data;
    const before = quantityBefore.current;
    const after = result?.cart?.totalQuantity;
    const grew =
      before === null || typeof after !== 'number' ? true : after > before;
    const ok = Boolean(result?.cart) && !result?.errors?.length && grew;
    if (ok) {
      setPhase('success');
      notifyCartAdded();
      showHsToast(t('card.addedToast', {title: product.title}));
      later(() => setPhase('idle'), SUCCESS_MS);
    } else {
      setPhase('idle');
      setError(true);
      later(() => setError(false), ERROR_MS);
    }
    // Only the request's own state changes matter here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.state, fetcher.data]);

  if (!product.availableForSale) return null;

  const allVariants = product.variants?.nodes ?? [];
  if (!allVariants.length) return null;
  // Sizes of the colour the card shows (its first available variant): with
  // several colours, the same size would otherwise appear once per colour.
  const shown = allVariants.find((v) => v.availableForSale) ?? allVariants[0];
  const sameExceptSize = (variant: CardVariant) =>
    (variant.selectedOptions ?? []).every(
      (option) =>
        SIZE_NAME.test(option.name.trim()) ||
        (shown.selectedOptions ?? []).some(
          (o) => o.name === option.name && o.value === option.value,
        ),
    );
  const hasSizes = allVariants.some((variant) =>
    (variant.selectedOptions ?? []).some((o) => SIZE_NAME.test(o.name.trim())),
  );
  const variants = hasSizes ? allVariants.filter(sameExceptSize) : allVariants;
  const single = variants.length === 1 ? variants[0] : null;
  const busy = phase !== 'idle' || fetcher.state !== 'idle';

  const add = (variant: CardVariant) => {
    setOpen(false);
    const line: OptimisticCartLineInput = {
      merchandiseId: variant.id,
      quantity: 1,
      // Lets the header count show the line before Shopify answers.
      selectedVariant: {
        id: variant.id,
        availableForSale: true,
        title: variant.title ?? product.title,
        price: product.priceRange.minVariantPrice,
        image: product.featuredImage ?? null,
        selectedOptions: variant.selectedOptions ?? [],
        product: {id: product.id, title: product.title, handle: product.handle},
      },
    };
    const form = new FormData();
    form.append(
      CartForm.INPUT_NAME,
      JSON.stringify({
        action: CartForm.ACTIONS.LinesAdd,
        inputs: {lines: [line]},
      }),
    );
    void fetcher.submit(form, {method: 'POST', action: '/cart'});
  };

  return (
    <div
      ref={rootRef}
      className={`hs-quick${open ? ' hs-quick--open' : ''}`}
    >
      {error && (
        <p className="hs-quick__error" role="alert">
          {t('card.addError')}
        </p>
      )}
      {open && !single && (
        <div
          className="hs-quick__sizes"
          role="group"
          aria-label={t('card.pickSize', {title: product.title})}
        >
          {variants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              className="hs-quick__size"
              disabled={!variant.availableForSale}
              aria-label={
                variant.availableForSale
                  ? undefined
                  : `${variantLabel(variant, variants)} — ${t('product.soldOut')}`
              }
              onClick={() => add(variant)}
            >
              {variantLabel(variant, variants)}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        className={`hs-quick__btn hs-quick__btn--${phase}`}
        disabled={busy || (single !== null && !single.availableForSale)}
        aria-expanded={single ? undefined : open}
        onClick={() => {
          if (single) add(single);
          else setOpen((value) => !value);
        }}
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
          {phase === 'idle' &&
            (open ? t('card.pickSizePrompt') : t('card.addToCart'))}
        </span>
      </button>
    </div>
  );
}
