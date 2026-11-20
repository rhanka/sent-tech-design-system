import {
  ViolinChart as DsViolinChart,
  type ViolinChartDatum,
} from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildViolinModel } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type ViolinChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id of the dimension used to split data into groups (one violin per group). */
  groupBy: string;
  /** Field id whose numeric values form the distribution for each group. */
  measure: string;
  /** Number of density bins (optional; DS default is 20). */
  bins?: number;
  /** Whether to overlay median / quartile markers (optional; DS default is true). */
  quartiles?: MaybeSignal<boolean>;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: MaybeSignal<string>;
};

export function ViolinChart({
  store,
  viewId,
  groupBy,
  measure,
  bins,
  quartiles,
  width,
  height,
  label,
  className,
}: ViolinChartProps) {
  const state = useDashboard(store);
  void state;
  const resolvedQuartiles = useValue(quartiles);
  const resolvedClassName = useValue(className);

  const model = buildViolinModel(store.model, store.applyCrossfilter(viewId), {
    groupBy,
    measure,
    bins,
    quartiles: resolvedQuartiles,
  });

  return (
    <DsViolinChart
      data={model.data as ViolinChartDatum[]}
      bins={model.bins}
      quartiles={model.quartiles}
      label={label}
      width={width}
      height={height}
      className={resolvedClassName}
    />
  );
}
