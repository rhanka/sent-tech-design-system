import {
  DumbbellChart as DsDumbbellChart,
  type DumbbellChartDatum,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildColumnRangeData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

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
  className?: string;
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
      className={className}
    />
  );
}
