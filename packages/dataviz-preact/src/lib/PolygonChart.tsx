import {
  PolygonChart as DsPolygonChart,
  type PolygonChartPoint,
} from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildPolygonData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type PolygonChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose numeric value becomes the x coordinate. */
  x: string;
  /** Field id whose numeric value becomes the y coordinate. */
  y: string;
  tone?: string;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: MaybeSignal<string>;
};

export function PolygonChart({
  store,
  viewId,
  x,
  y,
  tone,
  width,
  height,
  label,
  className,
}: PolygonChartProps) {
  const state = useDashboard(store);
  void state;
  const resolvedClassName = useValue(className);

  const data = buildPolygonData(store.model, store.applyCrossfilter(viewId), {
    x,
    y,
  });

  return (
    <DsPolygonChart
      data={data as PolygonChartPoint[]}
      label={label}
      tone={tone as any}
      width={width}
      height={height}
      className={resolvedClassName}
    />
  );
}
