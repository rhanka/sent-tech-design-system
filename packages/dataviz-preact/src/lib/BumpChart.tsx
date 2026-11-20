import {
  BumpChart as DsBumpChart,
  type BumpChartSeries,
} from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildBumpModel } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type BumpChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id of the dimension whose distinct values form the series (one line each). */
  series: string;
  /** Field id of the ordered dimension whose distinct values form the category axis (x). */
  category: string;
  /** Field id of the numeric measure used to rank series within each category. */
  measure: string;
  /**
   * Ranking direction.
   * - `'desc'` (default): rank 1 = highest measure value.
   * - `'asc'`: rank 1 = lowest measure value.
   */
  direction?: 'asc' | 'desc';
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: MaybeSignal<string>;
};

export function BumpChart({
  store,
  viewId,
  series,
  category,
  measure,
  direction,
  width,
  height,
  label,
  className,
}: BumpChartProps) {
  const state = useDashboard(store);
  void state;

  const resolvedClassName = useValue(className);

  const bumpModel = buildBumpModel(store.model, store.applyCrossfilter(viewId), {
    series,
    category,
    measure,
    direction,
  });

  return (
    <DsBumpChart
      data={bumpModel.series as BumpChartSeries[]}
      categories={bumpModel.categories}
      label={label}
      width={width}
      height={height}
      className={resolvedClassName}
    />
  );
}
