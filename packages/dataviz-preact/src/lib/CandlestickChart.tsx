import {
  CandlestickChart as DsCandlestickChart,
  type CandlestickChartDatum,
} from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildCandlestickData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type CandlestickChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value becomes each bar's label (typically a date or session dimension). */
  label_field: string;
  /** Field id whose numeric value becomes the open price. */
  open: string;
  /** Field id whose numeric value becomes the high price. */
  high: string;
  /** Field id whose numeric value becomes the low price. */
  low: string;
  /** Field id whose numeric value becomes the close price. */
  close: string;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: MaybeSignal<string>;
};

export function CandlestickChart({
  store,
  viewId,
  label_field,
  open,
  high,
  low,
  close,
  width,
  height,
  label,
  className,
}: CandlestickChartProps) {
  const state = useDashboard(store);
  void state;

  const resolvedClassName = useValue(className);

  const data = buildCandlestickData(store.model, store.applyCrossfilter(viewId), {
    label: label_field,
    open,
    high,
    low,
    close,
  });

  return (
    <DsCandlestickChart
      data={data as CandlestickChartDatum[]}
      label={label}
      width={width}
      height={height}
      className={resolvedClassName}
    />
  );
}
