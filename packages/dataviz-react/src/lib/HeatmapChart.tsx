import { HeatmapChart as DsHeatmapChart, type HeatmapChartProps as DsHeatmapChartProps } from '@sentropic/design-system-react';
import type { DashboardStore, HeatmapConfig } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildHeatmapData } from './distributionData.js';

export type HeatmapChartProps = {
  store: DashboardStore;
  viewId?: string;
  x: HeatmapConfig['x'];
  y: HeatmapConfig['y'];
  measure: HeatmapConfig['measure'];
  legend?: DsHeatmapChartProps['legend'];
  label: string;
  width?: DsHeatmapChartProps['width'];
  height?: DsHeatmapChartProps['height'];
  className?: string;
};

export function HeatmapChart({ store, viewId, x, y, measure, legend = true, label, width, height, className }: HeatmapChartProps) {
  const state = useDashboard(store);
  void state;
  const data = buildHeatmapData(store.model, store.applyCrossfilter(viewId), { x, y, measure });
  return <DsHeatmapChart data={data} label={label} legend={legend} width={width} height={height} className={className} />;
}
