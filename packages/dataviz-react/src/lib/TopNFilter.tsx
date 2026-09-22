import { useEffect, useState } from 'react';
import { NumberInput } from '@sentropic/design-system-react';
import { findMeasure, groupAggregate, type DashboardStore, type Row } from '@sentropic/dataviz-core';

export type TopNFilterProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** Dimension to restrict to its top-N values. */
  dimension: string;
  /** Measure used to rank the dimension's values (descending). */
  measure: string;
  /** Initial N. Defaults to 5. */
  defaultN?: number;
  /** Field label of the number input. */
  label?: string;
  className?: string;
};

/**
 * Restricts a dimension to its top-N values by a measure (ranked over the full
 * dataset), via a design-system NumberInput. Applies on mount and on change.
 */
export function TopNFilter({
  store,
  dimension,
  measure,
  defaultN = 5,
  label = 'Top N',
  className,
}: TopNFilterProps) {
  const [n, setN] = useState(defaultN);
  useEffect(() => {
    const m = findMeasure(store.model, measure);
    if (!m || !Number.isFinite(n) || n < 1) return;
    const ranked = groupAggregate([...(store.data as readonly Row[])], dimension, m)
      .slice()
      .sort((a, b) => b.value - a.value)
      .slice(0, n)
      .map((r) => r.key);
    store.setFilter(dimension, { kind: 'include', values: ranked });
  }, [store, dimension, measure, n]);
  return (
    <NumberInput
      label={label}
      value={n}
      min={1}
      step={1}
      className={className}
      onChange={(e) => {
        const v = Number((e.target as HTMLInputElement).value);
        if (Number.isFinite(v)) setN(v);
      }}
    />
  );
}
