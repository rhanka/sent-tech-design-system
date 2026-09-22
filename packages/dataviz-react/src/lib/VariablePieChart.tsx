import {
  VariablePieChart as DsVariablePieChart,
  type VariablePieChartDatum,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildVariablePieData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

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
  className?: string;
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
      className={className}
    />
  );
}
