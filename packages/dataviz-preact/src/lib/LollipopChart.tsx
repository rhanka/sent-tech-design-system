import {
  LollipopChart as DsLollipopChart,
  type LollipopChartDatum,
  type LollipopChartTone,
} from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';
import {
  buildSimpleCategoricalSeries,
  toSimpleCategoricalData,
} from './categoricalData.js';

export type LollipopChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  tone?: LollipopChartTone;
  orientation?: 'vertical' | 'horizontal';
  domain?: [number, number];
  width?: number;
  height?: number;
  label: string;
  className?: MaybeSignal<string>;
};

export function LollipopChart({
  store,
  viewId,
  category,
  measure,
  tone,
  orientation = 'vertical',
  domain,
  width,
  height,
  label,
  className,
}: LollipopChartProps) {
  const state = useDashboard(store);
  void state;

  const resolvedClassName = useValue(className);

  const seriesModel = buildSimpleCategoricalSeries(store.model, store.applyCrossfilter(viewId), category, measure);
  const data: LollipopChartDatum[] = toSimpleCategoricalData(seriesModel).map((item) =>
    tone ? { ...item, tone } : item,
  );

  return (
    <DsLollipopChart
      data={data}
      label={label}
      orientation={orientation}
      domain={domain}
      width={width}
      height={height}
      className={resolvedClassName}
    />
  );
}
