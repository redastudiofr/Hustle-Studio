import {useNavigate, useSearchParams} from 'react-router';
import {SORT_OPTIONS, type SortOption} from '~/lib/sort';
import {useT} from '~/lib/i18n';

/** Sort dropdown for listings. Changing it reloads page 1 with `?sort=`. */
export function SortSelect({
  value,
  exclude = [],
}: {
  value: SortOption;
  exclude?: SortOption[];
}) {
  const t = useT();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  return (
    <label className="sort-select">
      <span className="sort-select__label">{t('sort.label')}</span>
      <select
        value={value}
        onChange={(event) => {
          const next = new URLSearchParams(params);
          // Pagination cursors belong to the previous order.
          ['cursor', 'direction'].forEach((key) => next.delete(key));
          next.set('sort', event.target.value);
          void navigate(`?${next.toString()}`, {preventScrollReset: true});
        }}
      >
        {SORT_OPTIONS.filter((option) => !exclude.includes(option)).map(
          (option) => (
            <option key={option} value={option}>
              {t(`sort.${option}`)}
            </option>
          ),
        )}
      </select>
    </label>
  );
}
