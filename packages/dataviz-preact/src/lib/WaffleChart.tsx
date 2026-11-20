import {
  WaffleChart as DsWaffleChart,
  type WaffleChartDatum,
} from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildItemChartData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type WaffleChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value becomes each segment's label. */
  label_field: string;
  /** Field id whose numeric value becomes the segment count. */
  value: string;
  totalCells?: number;
  columns?: number;
  /** Accessible label for the chart (aria-label). */
  label?: string;
  size?: number;
  className?: MaybeSignal<string>;
};

export function WaffleChart({
  store,
  viewId,
  label_field,
  value,
  totalCells,
  columns,
  label,
  size,
  className,
}: WaffleChartProps) {
  const state = useDashboard(store);
  void state;
  const resolvedClassName = useValue(className);

  const data = buildItemChartData(store.model, store.applyCrossfilter(viewId), {
    label: label_field,
    value,
  });

  return (
    <DsWaffleChart
      data={data as WaffleChartDatum[]}
      totalCells={totalCells}
      columns={columns}
      label={label}
      size={size}
      className={resolvedClassName}
    />
  );
}
