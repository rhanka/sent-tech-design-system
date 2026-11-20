import {
  ColumnPyramidChart as DsColumnPyramidChart,
  type ColumnPyramidChartDatum,
} from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildColumnPyramidData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type ColumnPyramidChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value becomes each column's category label. */
  category: string;
  /** Field id whose numeric value becomes the column height. */
  value: string;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: MaybeSignal<string>;
};

export function ColumnPyramidChart({
  store,
  viewId,
  category,
  value,
  width,
  height,
  label,
  className,
}: ColumnPyramidChartProps) {
  const state = useDashboard(store);
  void state;

  const resolvedClassName = useValue(className);

  const data = buildColumnPyramidData(store.model, store.applyCrossfilter(viewId), {
    category,
    value,
  });

  return (
    <DsColumnPyramidChart
      data={data as ColumnPyramidChartDatum[]}
      label={label}
      width={width}
      height={height}
      className={resolvedClassName}
    />
  );
}
