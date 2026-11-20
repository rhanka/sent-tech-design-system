import {
  TraceWaterfallChart as DsTraceWaterfallChart,
  type TraceSpan,
} from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildTraceWaterfallData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type TraceWaterfallChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value becomes the span id (string-coerced). */
  spanId: string;
  /** Field id whose value becomes the parent span id (null/empty → root). */
  parentSpanId: string;
  /** Field id whose value becomes the service name (string-coerced). */
  service: string;
  /** Field id whose numeric value becomes the span start time. */
  start: string;
  /** Field id whose numeric value becomes the span duration. */
  duration: string;
  width?: number;
  height?: number;
  size?: number;
  /** Accessible label for the chart (aria-label). */
  label?: string;
  className?: MaybeSignal<string>;
};

export function TraceWaterfallChart({
  store,
  viewId,
  spanId,
  parentSpanId,
  service,
  start,
  duration,
  width,
  height,
  size,
  label,
  className,
}: TraceWaterfallChartProps) {
  const state = useDashboard(store);
  void state;
  const resolvedClassName = useValue(className);

  const data = buildTraceWaterfallData(store.model, store.applyCrossfilter(viewId), {
    spanId,
    parentSpanId,
    service,
    start,
    duration,
  });

  return (
    <DsTraceWaterfallChart
      data={data as { spans: TraceSpan[] }}
      label={label}
      width={width}
      height={height}
      size={size}
      className={resolvedClassName}
    />
  );
}
