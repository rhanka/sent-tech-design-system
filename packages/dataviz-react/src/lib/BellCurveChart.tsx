import {
  BellCurveChart as DsBellCurveChart,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildBellCurveData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type BellCurveChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose numeric values are sampled for the distribution. */
  measure: string;
  tone?: string;
  smooth?: boolean;
  intervals?: number;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: string;
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
      smooth={smooth}
      intervals={intervals}
      className={className}
    />
  );
}
