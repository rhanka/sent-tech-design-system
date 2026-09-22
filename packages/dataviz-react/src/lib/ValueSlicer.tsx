import { CheckboxGroup, type CheckboxGroupOption } from '@sentropic/design-system-react';
import { findDimension, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ValueSlicerProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** Dimension whose distinct values become the slicer's checkboxes. */
  dimension: string;
  /** Legend; defaults to the dimension label. */
  legend?: string;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
};

const keyOf = (v: unknown) => (v == null ? 'null' : String(v));

/**
 * A checkbox slicer over a dimension's distinct values: checked values become an
 * `include` filter (an OR within the dimension). Design-system CheckboxGroup.
 */
export function ValueSlicer({
  store,
  dimension,
  legend,
  orientation = 'vertical',
  className,
}: ValueSlicerProps) {
  const state = useDashboard(store);
  const resolvedLegend = legend ?? findDimension(store.model, dimension)?.label ?? dimension;
  const seen = new Set<string>();
  const options: CheckboxGroupOption[] = [];
  for (const row of store.data) {
    const k = keyOf(row[dimension]);
    if (!seen.has(k)) {
      seen.add(k);
      options.push({ label: k, value: k });
    }
  }
  const f = state.filters[dimension];
  const value = f && f.kind === 'include' ? [...f.values] : [];
  const onChange = (values: string[]) => {
    if (values.length) store.setFilter(dimension, { kind: 'include', values });
    else store.clearFilter(dimension);
  };
  return (
    <CheckboxGroup
      legend={resolvedLegend}
      options={options}
      value={value}
      orientation={orientation}
      className={className}
      onChange={onChange}
    />
  );
}
