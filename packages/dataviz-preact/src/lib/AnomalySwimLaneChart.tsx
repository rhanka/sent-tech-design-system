import {
  AnomalySwimLaneChart as DsAnomalySwimLaneChart,
  type AnomalySwimLaneSeries,
} from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildAnomalySwimLaneData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type AnomalySwimLaneChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value groups rows into lanes. */
  job: string;
  /** Field id whose numeric value becomes the bucket timestamp/index. */
  at: string;
  /** Field id whose numeric value encodes the anomaly score. */
  score: string;
  /** Maximum score value for the scale. */
  max?: number;
  /** Accessible label for the chart (aria-label). */
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  className?: MaybeSignal<string>;
};

export function AnomalySwimLaneChart({
  store,
  viewId,
  job,
  at,
  score,
  max,
  label,
  width,
  height,
  size,
  className,
}: AnomalySwimLaneChartProps) {
  const storeState = useDashboard(store);
  void storeState;

  const resolvedClassName = useValue(className);

  const data = buildAnomalySwimLaneData(store.model, store.applyCrossfilter(viewId), {
    job,
    at,
    score,
  });

  return (
    <DsAnomalySwimLaneChart
      data={data as AnomalySwimLaneSeries[]}
      max={max}
      label={label}
      width={width}
      height={height}
      size={size}
      className={resolvedClassName}
    />
  );
}
