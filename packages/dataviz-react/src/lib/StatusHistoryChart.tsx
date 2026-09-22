import {
  StatusHistoryChart as DsStatusHistoryChart,
  type StatusHistorySeries,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildStatusHistoryData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type StatusHistoryChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value groups rows into lanes. */
  series: string;
  /** Field id whose numeric value becomes the bucket timestamp/index. */
  at: string;
  /** Field id whose value encodes the status label. */
  value: string;
  /** Accessible label for the chart (aria-label). */
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  className?: string;
};

export function StatusHistoryChart({
  store,
  viewId,
  series,
  at,
  value,
  label,
  width,
  height,
  size,
  className,
}: StatusHistoryChartProps) {
  const storeState = useDashboard(store);
  void storeState;

  const data = buildStatusHistoryData(store.model, store.applyCrossfilter(viewId), {
    series,
    at,
    value,
  });

  return (
    <DsStatusHistoryChart
      data={data as StatusHistorySeries[]}
      label={label}
      width={width}
      height={height}
      size={size}
      className={className}
    />
  );
}
