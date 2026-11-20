import {
  WindBarbChart as DsWindBarbChart,
  type WindBarbChartDatum as DsWindBarbChartDatum,
} from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildWindBarbData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type WindBarbChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose numeric value becomes the point's position on the time axis. */
  at: string;
  /** Field id whose numeric value becomes the wind speed in knots (≥ 0). */
  speed: string;
  /** Field id whose numeric value becomes the wind direction in degrees. */
  direction: string;
  width?: number;
  height?: number;
  size?: number;
  /** Accessible label for the chart (aria-label). */
  label?: string;
  className?: MaybeSignal<string>;
};

export function WindBarbChart({
  store,
  viewId,
  at,
  speed,
  direction,
  width,
  height,
  size,
  label,
  className,
}: WindBarbChartProps) {
  const state = useDashboard(store);
  void state;
  const resolvedClassName = useValue(className);

  const data = buildWindBarbData(store.model, store.applyCrossfilter(viewId), {
    at,
    speed,
    direction,
  });

  return (
    <DsWindBarbChart
      data={data as DsWindBarbChartDatum[]}
      label={label}
      width={width}
      height={height}
      size={size}
      className={resolvedClassName}
    />
  );
}
