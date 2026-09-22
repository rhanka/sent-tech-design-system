import { HistogramChart as DsHistogramChart, type HistogramChartProps as DsHistogramChartProps } from '@sentropic/design-system-react';
import type { DashboardStore, HistogramConfig } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
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
  className?: string;
};

export function HistogramChart({ store, viewId, value, bins, domain, label, width, height, className }: HistogramChartProps) {
  const state = useDashboard(store);
  void state;
  const data = buildHistogramData(store.model, store.applyCrossfilter(viewId), { value, bins, domain });
  return <DsHistogramChart data={data} label={label} width={width} height={height} className={className} />;
}
