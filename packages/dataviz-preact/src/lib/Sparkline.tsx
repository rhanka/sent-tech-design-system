import { Sparkline as DsSparkline } from '@sentropic/design-system-preact';
import type { SparklineTone } from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';
import { buildSimpleCategoricalSeries } from './categoricalData.js';

export type { SparklineTone };

export type SparklineProps = {
  store: DashboardStore;
  viewId: string;
  dimension: string;
  measure: string;
  tone?: SparklineTone;
  strokeWidth?: number;
  area?: MaybeSignal<boolean>;
  width?: number;
  height?: number;
  label?: string;
  className?: MaybeSignal<string>;
};

export function Sparkline({
  store,
  viewId,
  dimension,
  measure,
  tone,
  strokeWidth,
  area,
  width,
  height,
  label,
  className,
}: SparklineProps) {
  const state = useDashboard(store);
  void state;
  const resolvedArea = useValue(area);
  const resolvedClassName = useValue(className);

  const seriesModel = buildSimpleCategoricalSeries(store.model, store.applyCrossfilter(viewId), dimension, measure);
  const data: number[] = seriesModel.series[0]?.values ?? [];

  return (
    <DsSparkline
      data={data}
      tone={tone}
      strokeWidth={strokeWidth}
      area={resolvedArea}
      width={width}
      height={height}
      label={label}
      className={resolvedClassName}
    />
  );
}
