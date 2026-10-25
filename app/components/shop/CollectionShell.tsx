import {useState} from 'react';
import {Form, NavLink, useRouteLoaderData} from 'react-router';
import type {RootLoader} from '~/root';
import {SortSelect} from '~/components/SortSelect';
import {useT} from '~/lib/i18n';
import {ModelViewProvider, useModelView} from '~/lib/modelView';
import type {SortOption} from '~/lib/sort';
import {hasFilters, type ShopFilters} from '~/lib/shopFilters';

/**
 * The frame of every collection page, as in the reference shop: the row of
 * Shopify collections, the "Model" switch, the item count, the filter panel
 * and the sort menu; then the product grid (children).
 */
export function CollectionShell({
  title,
  activeHandle,
  count,
  more,
  sort,
  sortExclude,
  filters,
  children,
}: {
  title: string;
  /** The current collection's handle; null on "shop all". */
  activeHandle: string | null;
  /** Products loaded on this page. */
  count: number;
  /** Shopify has more pages after this one. */
  more: boolean;
  sort: SortOption;
  sortExclude?: SortOption[];
  filters: ShopFilters;
  children: React.ReactNode;
}) {
  const t = useT();
  const root = useRouteLoaderData<RootLoader>('root');
  const collections = root?.navCollections ?? [];
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <ModelViewProvider>
      <div className="sx-collection">
        <h1 className="sr-only">{title}</h1>

        <div className="sx-collection__bar">
          {collections.length > 0 && (
            <nav className="sx-tabs" aria-label={t('nav.collections')}>
              {collections.map((collection) => (
                <NavLink
                  key={collection.id}
                  to={`/collections/${collection.handle}`}
                  prefetch="intent"
                  className="sx-tabs__link"
                  aria-current={
                    collection.handle === activeHandle ? 'page' : undefined
                  }
                >
                  {collection.title}
                </NavLink>
              ))}
            </nav>
          )}
          <ModelSwitch />
        </div>

        <div className="sx-collection__tools">
          <p className="sx-collection__count">
            {t('shop.items', {count: more ? `${count}+` : count})}
          </p>
          <div className="sx-collection__actions">
            <button
              type="button"
              className="sx-tool"
              aria-expanded={filterOpen}
              onClick={() => setFilterOpen((open) => !open)}
            >
              <FilterIcon />
              {t('shop.filter')}
              {hasFilters(filters) && <span className="sx-tool__dot" />}
            </button>
            <SortSelect value={sort} exclude={sortExclude} />
          </div>
        </div>

        {filterOpen && <FilterPanel filters={filters} sort={sort} />}

        {children}
      </div>
    </ModelViewProvider>
  );
}

function ModelSwitch() {
  const t = useT();
  const {on, toggle} = useModelView();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      className="sx-switch"
      onClick={toggle}
    >
      <span className="sx-switch__label">{t('shop.model')}</span>
      <span className="sx-switch__track" aria-hidden="true">
        <span className="sx-switch__thumb" />
      </span>
    </button>
  );
}

/** A plain GET form: works without JavaScript, the URL holds the filters. */
function FilterPanel({
  filters,
  sort,
}: {
  filters: ShopFilters;
  sort: SortOption;
}) {
  const t = useT();
  return (
    <Form method="get" className="sx-filters" preventScrollReset>
      {sort !== 'featured' && <input type="hidden" name="sort" value={sort} />}
      <label className="sx-filters__check">
        <input
          type="checkbox"
          name="available"
          value="1"
          defaultChecked={filters.available}
        />
        {t('shop.inStockOnly')}
      </label>
      <label className="sx-filters__field">
        <span>{t('shop.priceFrom')}</span>
        <input
          type="number"
          name="min"
          min="0"
          step="1"
          inputMode="numeric"
          defaultValue={filters.min ?? ''}
        />
      </label>
      <label className="sx-filters__field">
        <span>{t('shop.priceTo')}</span>
        <input
          type="number"
          name="max"
          min="0"
          step="1"
          inputMode="numeric"
          defaultValue={filters.max ?? ''}
        />
      </label>
      <div className="sx-filters__actions">
        <button type="submit" className="sx-btn sx-btn--dark">
          {t('shop.apply')}
        </button>
        <a href="?" className="sx-filters__reset">
          {t('shop.reset')}
        </a>
      </div>
    </Form>
  );
}

function FilterIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path d="M1 4h12M1 10h12" stroke="currentColor" strokeWidth="1.2" />
      <circle
        cx="9"
        cy="4"
        r="1.6"
        fill="#fff"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle
        cx="5"
        cy="10"
        r="1.6"
        fill="#fff"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}
