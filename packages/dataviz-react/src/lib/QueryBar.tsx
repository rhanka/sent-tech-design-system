import { useState } from 'react';
import { Search, type SearchProps } from '@sentropic/design-system-react';
import { buildQueryFilterSpec, type DashboardStore } from '@sentropic/dataviz-core';

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
  caseSensitive?: boolean;
  className?: string;
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

  function applyQuery(next: string) {
    setQuery(next);
    const spec = buildQueryFilterSpec(store.model, store.data, {
      dimension,
      fields,
      query: next,
      minLength,
      caseSensitive,
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
      className={['st-queryBar', className].filter(Boolean).join(' ') || undefined}
    />
  );
}
