import {
  BellCurveChart as DsBellCurveChart,
} from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildBellCurveData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type BellCurveChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose numeric values are sampled for the distribution. */
  measure: string;
  tone?: string;
  smooth?: MaybeSignal<boolean>;
  intervals?: number;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: MaybeSignal<string>;
};

export function BellCurveChart({
  store,
  viewId,
  measure,
  tone,
  smooth,
  intervals,
  width,
  height,
  label,
  className,
}: BellCurveChartProps) {
  const state = useDashboard(store);
  void state;

  const resolvedSmooth = useValue(smooth);
  const resolvedClassName = useValue(className);

  const data = buildBellCurveData(store.model, store.applyCrossfilter(viewId), {
    measure,
  });

  return (
    <DsBellCurveChart
      data={data}
      label={label}
      width={width}
      height={height}
      tone={tone as any}
      smooth={resolvedSmooth}
      intervals={intervals}
      className={resolvedClassName}
    />
  );
}
