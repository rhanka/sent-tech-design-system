import {
  AnomalySwimLaneChart as DsAnomalySwimLaneChart,
  type AnomalySwimLaneSeries,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildAnomalySwimLaneData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type AnomalySwimLaneChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value groups rows into lanes. */
  job: string;
  /** Field id whose numeric value becomes the bucket timestamp/index. */
  at: string;
  /** Field id whose numeric value encodes the anomaly score. */
  score: string;
  /** Maximum score value for the scale. */
  max?: number;
  /** Accessible label for the chart (aria-label). */
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  className?: string;
};

export function AnomalySwimLaneChart({
  store,
  viewId,
  job,
  at,
  score,
  max,
  label,
  width,
  height,
  size,
  className,
}: AnomalySwimLaneChartProps) {
  const storeState = useDashboard(store);
  void storeState;

  const data = buildAnomalySwimLaneData(store.model, store.applyCrossfilter(viewId), {
    job,
    at,
    score,
  });

  return (
    <DsAnomalySwimLaneChart
      data={data as AnomalySwimLaneSeries[]}
      max={max}
      label={label}
      width={width}
      height={height}
      size={size}
      className={className}
    />
  );
}
