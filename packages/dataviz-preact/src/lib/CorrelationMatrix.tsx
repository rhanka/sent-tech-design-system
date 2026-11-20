import { HeatmapChart as DsHeatmapChart, type HeatmapChartProps as DsHeatmapChartProps } from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildCorrelationMatrix } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type CorrelationMatrixProps = {
  store: DashboardStore;
  viewId?: string;
  measures: string[];
  legend?: DsHeatmapChartProps['legend'];
  label: string;
  width?: DsHeatmapChartProps['width'];
  height?: DsHeatmapChartProps['height'];
  className?: MaybeSignal<string>;
};

export function CorrelationMatrix({ store, viewId, measures, legend = true, label, width, height, className }: CorrelationMatrixProps) {
  const state = useDashboard(store);
  void state;
  const resolvedLegend = useValue(legend);
  const resolvedClassName = useValue(className);
  const data = buildCorrelationMatrix(store.model, store.applyCrossfilter(viewId), { measures });
  return <DsHeatmapChart data={data} label={label} legend={resolvedLegend} width={width} height={height} className={resolvedClassName} />;
}
