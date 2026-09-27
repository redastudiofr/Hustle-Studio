import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout, LineItemChildrenMap} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link, useFetcher} from 'react-router';
import {useAside} from './Aside';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useT} from '~/lib/i18n';
import {Price} from '~/components/Price';

export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

export function CartLineItem({
  layout,
  line,
  childrenMap,
}: {
  layout: CartLayout;
  line: CartLine;
  childrenMap: LineItemChildrenMap;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const lineItemChildren = childrenMap[id];

  // An optimistic line (drawn before Shopify answers) has no cost yet: show
  // the variant price × quantity until the real line replaces it.
  const unitPrice = (
    merchandise as {price?: {amount: string; currencyCode: string}}
  ).price;
  const total =
    line.cost?.totalAmount ??
    (unitPrice
      ? {
          amount: (Number(unitPrice.amount) * line.quantity).toFixed(2),
          currencyCode: unitPrice.currencyCode,
        }
      : null);

  const optionLabel = (selectedOptions ?? [])
    .filter((o) => o.value.toLowerCase() !== 'default title')
    .map((o) => o.value)
    .join(' / ');

  return (
    <li className="cart-line">
      {image && (
        <Link
          to={lineItemUrl}
          prefetch="intent"
          onClick={() => layout === 'aside' && close()}
        >
          <Image
            alt={title}
            aspectRatio="4/5"
            data={image}
            height={90}
            width={72}
            loading="lazy"
            className="cart-line__img"
          />
        </Link>
      )}

      <div className="cart-line__body">
        <div className="cart-line__top">
          <Link
            to={lineItemUrl}
            prefetch="intent"
            onClick={() => layout === 'aside' && close()}
            className="cart-line__title"
          >
            {product.title}
          </Link>
          {total ? (
            <Price data={total as typeof line.cost.totalAmount} />
          ) : null}
        </div>
        {optionLabel ? (
          <span className="cart-line__option">{optionLabel}</span>
        ) : null}

        <div className="cart-line__controls">
          <CartLineQuantity line={line} />
          <CartLineRemoveButton lineIds={[id]} disabled={!!line.isOptimistic} />
        </div>
        <CartLineFeedback lineId={id} />
      </div>

      {lineItemChildren
        ? lineItemChildren.map((childLine) => (
            <CartLineItem
              childrenMap={childrenMap}
              key={childLine.id}
              line={childLine}
              layout={layout}
            />
          ))
        : null}
    </li>
  );
}

function CartLineQuantity({line}: {line: CartLine}) {
  const t = useT();
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="qty">
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
        <button
          aria-label={t('cart.decrease')}
          disabled={quantity <= 1 || !!isOptimistic}
          name="decrease-quantity"
          value={prevQuantity}
        >
          −
        </button>
      </CartLineUpdateButton>
      <span className="qty__value">{quantity}</span>
      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
        <button
          aria-label={t('cart.increase')}
          name="increase-quantity"
          value={nextQuantity}
          disabled={!!isOptimistic}
        >
          +
        </button>
      </CartLineUpdateButton>
    </div>
  );
}

function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  const t = useT();
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button disabled={disabled} type="submit" className="cart-line__remove">
        {t('cart.remove')}
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/**
 * What Shopify said about the last change to this line — e.g. "only 2 left
 * in stock" when a quantity was capped. Read from the line's own fetcher, so
 * the message sits next to the line it concerns.
 */
function CartLineFeedback({lineId}: {lineId: string}) {
  const fetcher = useFetcher<CartActionFeedback>({key: getUpdateKey([lineId])});
  const message = cartFeedbackMessage(fetcher.data);
  if (!message || fetcher.state !== 'idle') return null;
  return (
    <p className="cart-line__feedback" role="status">
      {message}
    </p>
  );
}

export type CartActionFeedback = {
  errors?: Array<{message?: string}> | null;
  warnings?: Array<{message?: string}> | null;
};

export function cartFeedbackMessage(
  data?: CartActionFeedback | null,
): string | null {
  return data?.errors?.[0]?.message || data?.warnings?.[0]?.message || null;
}

function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
