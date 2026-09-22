import { RadarChart as DsRadarChart } from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafeRadarModel, toRadarAxes, toRadarSeries } from './partOfWholeData.js';

export type RadarChartProps = {
  store: DashboardStore;
  viewId: string;
  axes: string[];
  series?: string;
  maxValue?: number;
  levels?: number;
  legend?: boolean;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

export function RadarChart({
  store,
  viewId,
  axes,
  series,
  maxValue,
  levels,
  legend = true,
  width,
  height,
  label,
  className,
}: RadarChartProps) {
  const state = useDashboard(store);
  void state;

  const model = buildSafeRadarModel(store.model, store.applyCrossfilter(viewId), { axes, series });

  return (
    <DsRadarChart
      axes={toRadarAxes(model)}
      series={toRadarSeries(model)}
      maxValue={maxValue}
      levels={levels}
      legend={legend}
      width={width}
      height={height}
      label={label}
      className={className}
    />
  );
}
