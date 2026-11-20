import type { DashboardStore } from '@sentropic/dataviz-core';
import { LineChart } from '@sentropic/design-system-preact';
import { useDashboard } from '../adapter.js';
import { classNames } from '../classNames.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';
import { buildForecastLineData } from './analyticsDsData.js';

export type ForecastLineChartProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
  periods: number;
  step?: number;
  width?: number;
  height?: number;
  label: string;
  hoverKey?: MaybeSignal<string | null>;
  onHoverKeyChange?: (key: string | null) => void;
  onSelectKey?: (key: string | null) => void;
  className?: MaybeSignal<string>;
};

export function ForecastLineChart({
  store,
  viewId,
  x,
  y,
  periods,
  step,
  width = 360,
  height = 220,
  label,
  hoverKey,
  onHoverKeyChange,
  onSelectKey,
  className,
}: ForecastLineChartProps) {
  const state = useDashboard(store);
  void state;
  const resolvedHoverKey = useValue(hoverKey);
  const resolvedClassName = useValue(className);
  const data = buildForecastLineData(store.model, store.applyCrossfilter(viewId), { x, y, periods, step });

  return (
    <LineChart
      data={data}
      width={width}
      height={height}
      label={label}
      hoverKey={resolvedHoverKey}
      onHoverKeyChange={onHoverKeyChange}
      onSelectKey={onSelectKey}
      className={classNames('st-forecastLineChart', resolvedClassName)}
    />
  );
}
