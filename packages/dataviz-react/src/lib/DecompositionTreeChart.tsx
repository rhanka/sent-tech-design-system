import {
  DecompositionTreeChart as DsDecompositionTreeChart,
  type DecompositionTreeData,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildDecompositionTreeData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type DecompositionTreeChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id of the measure to aggregate (summed per group). */
  measure: string;
  /** Ordered dimension field ids — one decomposition level each. */
  levels: string[];
  width?: number;
  height?: number;
  size?: number;
  /** Accessible label for the chart (aria-label). */
  label?: string;
  className?: string;
};

export function DecompositionTreeChart({
  store,
  viewId,
  measure,
  levels,
  width,
  height,
  size,
  label,
  className,
}: DecompositionTreeChartProps) {
  const state = useDashboard(store);
  void state;

  const data = buildDecompositionTreeData(store.model, store.applyCrossfilter(viewId), {
    measure,
    levels,
  });

  return (
    <DsDecompositionTreeChart
      data={data as DecompositionTreeData}
      label={label}
      width={width}
      height={height}
      size={size}
      className={className}
    />
  );
}
