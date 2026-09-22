import type { DashboardStore } from '@sentropic/dataviz-core';
import { ScatterPlot } from '@sentropic/design-system-react';
import { useDashboard } from '../adapter.js';
import { buildClusterScatterData } from './analyticsDsData.js';

export type AnalyticsClusterPlotProps = {
  store: DashboardStore;
  viewId: string;
  fields: string[];
  k: number;
  maxIterations?: number;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

export function AnalyticsClusterPlot({
  store,
  viewId,
  fields,
  k,
  maxIterations,
  width = 360,
  height = 240,
  label,
  className,
}: AnalyticsClusterPlotProps) {
  const state = useDashboard(store);
  void state;
  const { data, centroids, xLabel, yLabel } = buildClusterScatterData(store.model, store.applyCrossfilter(viewId), {
    fields,
    k,
    maxIterations,
  });

  return (
    <ScatterPlot
      data={data}
      centroids={centroids}
      xLabel={xLabel}
      yLabel={yLabel}
      width={width}
      height={height}
      label={label}
      className={['st-analyticsClusterPlot', className].filter(Boolean).join(' ') || undefined}
    />
  );
}
