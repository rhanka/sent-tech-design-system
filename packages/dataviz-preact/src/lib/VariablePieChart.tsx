import {
  VariablePieChart as DsVariablePieChart,
  type VariablePieChartDatum,
} from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildVariablePieData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type VariablePieChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value becomes each slice's label. */
  label_field: string;
  /** Field id whose numeric value becomes the slice angle (value). */
  value: string;
  /** Field id whose numeric value becomes the slice radius (z). */
  z: string;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: MaybeSignal<string>;
};

export function VariablePieChart({
  store,
  viewId,
  label_field,
  value,
  z,
  width,
  height,
  label,
  className,
}: VariablePieChartProps) {
  const state = useDashboard(store);
  void state;
  const resolvedClassName = useValue(className);

  const data = buildVariablePieData(store.model, store.applyCrossfilter(viewId), {
    label: label_field,
    value,
    z,
  });

  return (
    <DsVariablePieChart
      data={data as VariablePieChartDatum[]}
      label={label}
      width={width}
      height={height}
      className={resolvedClassName}
    />
  );
}
