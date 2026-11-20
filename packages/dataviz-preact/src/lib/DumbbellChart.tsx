import {
  DumbbellChart as DsDumbbellChart,
  type DumbbellChartDatum,
} from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildColumnRangeData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type DumbbellChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value becomes the category label. */
  category: string;
  /** Field id whose numeric value becomes the low point. */
  low: string;
  /** Field id whose numeric value becomes the high point. */
  high: string;
  lowTone?: string;
  highTone?: string;
  lowLabel?: string;
  highLabel?: string;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: MaybeSignal<string>;
};

export function DumbbellChart({
  store,
  viewId,
  category,
  low,
  high,
  lowTone,
  highTone,
  lowLabel,
  highLabel,
  width,
  height,
  label,
  className,
}: DumbbellChartProps) {
  const state = useDashboard(store);
  void state;

  const resolvedClassName = useValue(className);

  const data = buildColumnRangeData(store.model, store.applyCrossfilter(viewId), {
    category,
    low,
    high,
  });

  return (
    <DsDumbbellChart
      data={data as DumbbellChartDatum[]}
      label={label}
      width={width}
      height={height}
      lowTone={lowTone as any}
      highTone={highTone as any}
      lowLabel={lowLabel}
      highLabel={highLabel}
      className={resolvedClassName}
    />
  );
}
