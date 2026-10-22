import {useId} from 'react';
import {useLocalized} from '~/lib/i18n/localized';
import {PDP} from '~/config/productTemplate';
import {fill, useMoney} from '~/components/pdp/shared';
import type {
  PackModel,
  PackOption,
  PackSelection,
} from '~/components/pdp/usePackSelection';
import {defaultSize} from '~/components/pdp/usePackSelection';

/**
 * "Compose ton pack": one radio per option. The selected option opens to
 * show a size per t-shirt and, for packs, the design of each free one.
 * Sizes are chips on desktop and a select on phones (mock-ups 01 and 09).
 */
export function PackSelector({
  product,
  selection,
}: {
  product: PackModel;
  selection: PackSelection;
}) {
  const l = useLocalized();
  const money = useMoney();
  const name = useId();
  const {options, option: selected} = selection;

  return (
    <fieldset className="pdpx-pack">
      <legend className="pdpx-pack__head">
        <span className="pdpx-pack__title">{l(PDP.pack.title)}</span>
        <span className="pdpx-pack__subtitle">{l(PDP.pack.subtitle)}</span>
      </legend>

      {options.map((option) => {
        const quote = selection.quote(option);
        const isSelected = option.id === selected.id;
        const live = isSelected ? selection : null;
        const total = live ? live.total : quote.total;
        const full = live ? live.full : quote.full;
        const saving = live ? live.saving : quote.saving;
        return (
          <div
            key={option.id}
            className="pdpx-pack__option"
            data-selected={isSelected || undefined}
          >
            {option.mostChosen && (
              <span className="pdpx-pack__most">{l(PDP.pack.mostChosen)}</span>
            )}
            <label className="pdpx-pack__row">
              <input
                type="radio"
                name={name}
                value={option.id}
                checked={isSelected}
                onChange={() => selection.select(option.id)}
              />
              <span className="pdpx-pack__radio" aria-hidden="true" />
              <span className="pdpx-pack__label">
                <span className="pdpx-pack__name">{optionName(option, l)}</span>
                <span className="pdpx-pack__chip">
                  {option.free
                    ? `${fill(l(PDP.pack.save), {amount: money(saving)})} · ${l(PDP.pack.shippingFree)}`
                    : l(PDP.pack.shippingSingle)}
                </span>
              </span>
              <span className="pdpx-pack__price">
                <strong>{money(total)}</strong>
                {option.free > 0 && <s>{money(full)}</s>}
              </span>
            </label>

            {isSelected && (
              <div className="pdpx-pack__body">
                {Array.from({length: option.buy}, (_, index) => (
                  <SizeRow
                    key={`paid-${index}`}
                    label={
                      option.buy === 1
                        ? l(PDP.pack.size)
                        : fill(l(PDP.pack.shirt), {n: index + 1})
                    }
                    model={product}
                    value={selection.paidSizes[index]}
                    onChange={(size) => selection.setPaidSize(index, size)}
                  />
                ))}
                {Array.from({length: option.free}, (_, index) => {
                  const pick = selection.freePicks[index];
                  const model =
                    selection.freeModels.find(
                      (candidate) => candidate.handle === pick.handle,
                    ) ?? product;
                  return (
                    <div key={`free-${index}`} className="pdpx-pack__free">
                      <span className="pdpx-pack__free-label">
                        {l(PDP.pack.free)}
                        {option.free > 1 ? ` ${index + 1}` : ''}
                      </span>
                      <select
                        className="pdpx-select pdpx-select--dashed"
                        aria-label={`${l(PDP.pack.free)} — ${l(PDP.pack.chooseModel)}`}
                        value={pick.handle}
                        onChange={(event) => {
                          const next =
                            selection.freeModels.find(
                              (candidate) =>
                                candidate.handle === event.target.value,
                            ) ?? product;
                          selection.setFreePick(index, {
                            handle: next.handle,
                            size: next.variants.some(
                              (variant) =>
                                variant.size === pick.size &&
                                variant.availableForSale,
                            )
                              ? pick.size
                              : defaultSize(next),
                          });
                        }}
                      >
                        <option value="" disabled>
                          {l(PDP.pack.chooseModel)}
                        </option>
                        {selection.freeModels.map((candidate) => (
                          <option key={candidate.id} value={candidate.handle}>
                            {candidate.title}
                          </option>
                        ))}
                      </select>
                      <SizeRow
                        label={l(PDP.pack.size)}
                        model={model}
                        value={pick.size}
                        onChange={(size) =>
                          selection.setFreePick(index, {
                            handle: pick.handle,
                            size,
                          })
                        }
                        compact
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </fieldset>
  );
}

function optionName(option: PackOption, l: ReturnType<typeof useLocalized>) {
  if (!option.free) return l(PDP.pack.single);
  return fill(l(option.free > 1 ? PDP.pack.offerMany : PDP.pack.offerOne), {
    buy: option.buy,
    free: option.free,
  });
}

/** Size chips (desktop) and the same choice as a select (phones). */
function SizeRow({
  label,
  model,
  value,
  onChange,
  compact = false,
}: {
  label: string;
  model: PackModel;
  value: string | null;
  onChange: (size: string | null) => void;
  compact?: boolean;
}) {
  const l = useLocalized();
  const sized = model.variants.filter((variant) => variant.size !== null);
  if (!sized.length) return null;
  return (
    <div className={`pdpx-size ${compact ? 'pdpx-size--compact' : ''}`}>
      <span className="pdpx-size__label">{label}</span>
      <div className="pdpx-size__chips" role="radiogroup" aria-label={label}>
        {sized.map((variant) => (
          <button
            key={variant.id}
            type="button"
            role="radio"
            aria-checked={variant.size === value}
            className="pdpx-size__chip"
            disabled={!variant.availableForSale}
            onClick={() => onChange(variant.size)}
          >
            {variant.size}
          </button>
        ))}
      </div>
      <select
        className="pdpx-select pdpx-size__select"
        aria-label={label}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      >
        {sized.map((variant) => (
          <option
            key={variant.id}
            value={variant.size ?? ''}
            disabled={!variant.availableForSale}
          >
            {fill(l(PDP.pack.sizeOption), {size: variant.size ?? ''})}
          </option>
        ))}
      </select>
    </div>
  );
}
