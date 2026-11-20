import {
  ParallelCoordinatesChart as DsParallelCoordinatesChart,
  type ParallelAxis,
  type ParallelCoordinatesChartTone,
} from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildParallelCoordinatesModel } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type ParallelCoordinatesChartProps = {
  store: DashboardStore;
  viewId: string;
  /** List of measure field ids that become the parallel axes (left to right). */
  measures: string[];
  /** Optional dimension field id used to assign a tone per row. */
  series?: string;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: MaybeSignal<string>;
};

export function ParallelCoordinatesChart({
  store,
  viewId,
  measures,
  series,
  width,
  height,
  label,
  className,
}: ParallelCoordinatesChartProps) {
  const state = useDashboard(store);
  void state;
  const resolvedClassName = useValue(className);

  const pcModel = buildParallelCoordinatesModel(store.model, store.applyCrossfilter(viewId), {
    measures,
    series,
  });

  return (
    <DsParallelCoordinatesChart
      axes={pcModel.axes as ParallelAxis[]}
      data={pcModel.data}
      tones={pcModel.tones as ParallelCoordinatesChartTone[] | undefined}
      label={label}
      width={width}
      height={height}
      className={resolvedClassName}
    />
  );
}
