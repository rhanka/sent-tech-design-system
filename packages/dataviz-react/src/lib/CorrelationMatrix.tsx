import { HeatmapChart as DsHeatmapChart, type HeatmapChartProps as DsHeatmapChartProps } from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildCorrelationMatrix } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type CorrelationMatrixProps = {
  store: DashboardStore;
  viewId?: string;
  measures: string[];
  legend?: DsHeatmapChartProps['legend'];
  label: string;
  width?: DsHeatmapChartProps['width'];
  height?: DsHeatmapChartProps['height'];
  className?: string;
};

export function CorrelationMatrix({ store, viewId, measures, legend = true, label, width, height, className }: CorrelationMatrixProps) {
  const state = useDashboard(store);
  void state;
  const data = buildCorrelationMatrix(store.model, store.applyCrossfilter(viewId), { measures });
  return <DsHeatmapChart data={data} label={label} legend={legend} width={width} height={height} className={className} />;
}
