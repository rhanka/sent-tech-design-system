import { HistogramChart as DsHistogramChart, type HistogramChartProps as DsHistogramChartProps } from '@sentropic/design-system-preact';
import type { DashboardStore, HistogramConfig } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';
import { buildHistogramData } from './distributionData.js';

export type HistogramChartProps = {
  store: DashboardStore;
  viewId?: string;
  value: HistogramConfig['value'];
  bins?: HistogramConfig['bins'];
  domain?: HistogramConfig['domain'];
  label: string;
  width?: DsHistogramChartProps['width'];
  height?: DsHistogramChartProps['height'];
  className?: MaybeSignal<string>;
};

export function HistogramChart({ store, viewId, value, bins, domain, label, width, height, className }: HistogramChartProps) {
  const state = useDashboard(store);
  void state;
  const resolvedClassName = useValue(className);
  const data = buildHistogramData(store.model, store.applyCrossfilter(viewId), { value, bins, domain });
  return <DsHistogramChart data={data} label={label} width={width} height={height} className={resolvedClassName} />;
}
