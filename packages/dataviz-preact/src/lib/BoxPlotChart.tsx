import { BoxPlotChart as DsBoxPlotChart, type BoxPlotChartProps as DsBoxPlotChartProps } from '@sentropic/design-system-preact';
import type { BoxPlotConfig, DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';
import { buildBoxPlotData } from './distributionData.js';

export type BoxPlotChartProps = {
  store: DashboardStore;
  viewId?: string;
  value: BoxPlotConfig['value'];
  group?: BoxPlotConfig['group'];
  label: string;
  width?: DsBoxPlotChartProps['width'];
  height?: DsBoxPlotChartProps['height'];
  className?: MaybeSignal<string>;
};

export function BoxPlotChart({ store, viewId, value, group, label, width, height, className }: BoxPlotChartProps) {
  const state = useDashboard(store);
  void state;
  const resolvedClassName = useValue(className);
  const data = buildBoxPlotData(store.model, store.applyCrossfilter(viewId), { value, group });
  return <DsBoxPlotChart data={data} label={label} width={width} height={height} className={resolvedClassName} />;
}
