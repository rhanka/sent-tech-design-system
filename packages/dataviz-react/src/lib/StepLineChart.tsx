import {
  StepLineChart as DsStepLineChart,
  type StepLineChartTone,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import {
  buildSimpleCategoricalSeries,
  toSimpleCategoricalPoints,
} from './categoricalData.js';

export type StepLineChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  tone?: StepLineChartTone;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

export function StepLineChart({
  store,
  viewId,
  category,
  measure,
  tone,
  width,
  height,
  label,
  className,
}: StepLineChartProps) {
  const state = useDashboard(store);
  void state;

  const seriesModel = buildSimpleCategoricalSeries(store.model, store.applyCrossfilter(viewId), category, measure);
  const data = toSimpleCategoricalPoints(seriesModel);

  return <DsStepLineChart data={data} label={label} tone={tone} width={width} height={height} className={className} />;
}
