import { HeatmapChart as DsHeatmapChart, type HeatmapChartProps as DsHeatmapChartProps } from '@sentropic/design-system-preact';
import type { DashboardStore, HeatmapConfig } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';
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
  className?: MaybeSignal<string>;
};

export function HeatmapChart({ store, viewId, x, y, measure, legend = true, label, width, height, className }: HeatmapChartProps) {
  const state = useDashboard(store);
  void state;
  const resolvedLegend = useValue(legend);
  const resolvedClassName = useValue(className);
  const data = buildHeatmapData(store.model, store.applyCrossfilter(viewId), { x, y, measure });
  return <DsHeatmapChart data={data} label={label} legend={resolvedLegend} width={width} height={height} className={resolvedClassName} />;
}
