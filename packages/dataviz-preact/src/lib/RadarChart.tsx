import { RadarChart as DsRadarChart } from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';
import { buildSafeRadarModel, toRadarAxes, toRadarSeries } from './partOfWholeData.js';

export type RadarChartProps = {
  store: DashboardStore;
  viewId: string;
  axes: string[];
  series?: string;
  maxValue?: number;
  levels?: number;
  legend?: MaybeSignal<boolean>;
  width?: number;
  height?: number;
  label: string;
  className?: MaybeSignal<string>;
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
  const resolvedLegend = useValue(legend);
  const resolvedClassName = useValue(className);

  const model = buildSafeRadarModel(store.model, store.applyCrossfilter(viewId), { axes, series });

  return (
    <DsRadarChart
      axes={toRadarAxes(model)}
      series={toRadarSeries(model)}
      maxValue={maxValue}
      levels={levels}
      legend={resolvedLegend}
      width={width}
      height={height}
      label={label}
      className={resolvedClassName}
    />
  );
}
