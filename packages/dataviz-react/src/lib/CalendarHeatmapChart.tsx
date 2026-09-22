import { CalendarHeatmapChart as DsCalendarHeatmapChart, type CalendarHeatmapChartProps as DsCalendarHeatmapChartProps } from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildCalendarHeatmapData } from './distributionData.js';

export type CalendarHeatmapChartProps = {
  store: DashboardStore;
  viewId?: string;
  date: string;
  measure: string;
  label: string;
  width?: DsCalendarHeatmapChartProps['width'];
  height?: DsCalendarHeatmapChartProps['height'];
  className?: string;
};

export function CalendarHeatmapChart({ store, viewId, date, measure, label, width, height, className }: CalendarHeatmapChartProps) {
  const state = useDashboard(store);
  void state;
  const data = buildCalendarHeatmapData(store.model, store.applyCrossfilter(viewId), date, measure);
  return <DsCalendarHeatmapChart data={data} label={label} width={width} height={height} className={className} />;
}
