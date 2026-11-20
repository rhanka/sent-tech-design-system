import { useState } from 'preact/hooks';
import { Search, type SearchProps } from '@sentropic/design-system-preact';
import { buildQueryFilterSpec, type DashboardStore } from '@sentropic/dataviz-core';
import { classNames } from '../classNames.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type QueryBarProps = {
  store: DashboardStore;
  /** Dimension owned by this query bar. Matching rows include this dimension's values. */
  dimension: string;
  /** Fields searched for the query. Defaults to the owned dimension. */
  fields?: readonly string[];
  label?: SearchProps['label'];
  placeholder?: string;
  clearLabel?: string;
  size?: SearchProps['size'];
  minLength?: number;
  caseSensitive?: MaybeSignal<boolean>;
  className?: MaybeSignal<string>;
};

export function QueryBar({
  store,
  dimension,
  fields,
  label = 'Search',
  placeholder = 'Search',
  clearLabel,
  size,
  minLength,
  caseSensitive,
  className,
}: QueryBarProps) {
  const [query, setQuery] = useState('');
  const resolvedCaseSensitive = useValue(caseSensitive);
  const resolvedClassName = useValue(className);

  function applyQuery(next: string) {
    setQuery(next);
    const spec = buildQueryFilterSpec(store.model, store.data, {
      dimension,
      fields,
      query: next,
      minLength,
      caseSensitive: resolvedCaseSensitive,
    });
    if (spec) store.setFilter(dimension, spec);
    else store.clearFilter(dimension);
  }

  return (
    <Search
      label={label}
      value={query}
      placeholder={placeholder}
      clearLabel={clearLabel}
      size={size}
      onChange={(event) => applyQuery(event.currentTarget.value)}
      onClear={() => applyQuery('')}
      className={classNames('st-queryBar', resolvedClassName)}
    />
  );
}
