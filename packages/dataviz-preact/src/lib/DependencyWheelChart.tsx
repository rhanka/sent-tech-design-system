import {
  DependencyWheelChart as DsDependencyWheelChart,
  type DependencyWheelChartLink,
} from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildDependencyWheelData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type DependencyWheelChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value becomes the link's source node. */
  source: string;
  /** Field id whose value becomes the link's target node. */
  target: string;
  /** Field id whose numeric value becomes the link weight. */
  weight: string;
  /** Optional display labels per node id. */
  labels?: Record<string, string>;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: MaybeSignal<string>;
};

export function DependencyWheelChart({
  store,
  viewId,
  source,
  target,
  weight,
  labels,
  width,
  height,
  label,
  className,
}: DependencyWheelChartProps) {
  const state = useDashboard(store);
  void state;

  const resolvedClassName = useValue(className);

  const data = buildDependencyWheelData(store.model, store.applyCrossfilter(viewId), {
    source,
    target,
    weight,
  });

  return (
    <DsDependencyWheelChart
      data={data as DependencyWheelChartLink[]}
      labels={labels}
      label={label}
      width={width}
      height={height}
      className={resolvedClassName}
    />
  );
}
