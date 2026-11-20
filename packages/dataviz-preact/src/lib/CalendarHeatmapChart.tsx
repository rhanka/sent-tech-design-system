import { CalendarHeatmapChart as DsCalendarHeatmapChart, type CalendarHeatmapChartProps as DsCalendarHeatmapChartProps } from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';
import { buildCalendarHeatmapData } from './distributionData.js';

export type CalendarHeatmapChartProps = {
  store: DashboardStore;
  viewId?: string;
  date: string;
  measure: string;
  label: string;
  width?: DsCalendarHeatmapChartProps['width'];
  height?: DsCalendarHeatmapChartProps['height'];
  className?: MaybeSignal<string>;
};

export function CalendarHeatmapChart({ store, viewId, date, measure, label, width, height, className }: CalendarHeatmapChartProps) {
  const state = useDashboard(store);
  void state;
  const resolvedClassName = useValue(className);
  const data = buildCalendarHeatmapData(store.model, store.applyCrossfilter(viewId), date, measure);
  return <DsCalendarHeatmapChart data={data} label={label} width={width} height={height} className={resolvedClassName} />;
}
