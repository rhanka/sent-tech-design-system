import { WaterfallChart as DsWaterfallChart } from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';
import { buildSafeWaterfallModel, toWaterfallData } from './partOfWholeData.js';

export type WaterfallChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  totalLabel?: string;
  connectors?: MaybeSignal<boolean>;
  format?: (value: number) => string;
  width?: number;
  height?: number;
  label: string;
  className?: MaybeSignal<string>;
};

export function WaterfallChart({
  store,
  viewId,
  category,
  measure,
  totalLabel,
  connectors = true,
  format,
  width,
  height,
  label,
  className,
}: WaterfallChartProps) {
  const state = useDashboard(store);
  void state;
  const resolvedConnectors = useValue(connectors);
  const resolvedClassName = useValue(className);

  const model = buildSafeWaterfallModel(store.model, store.applyCrossfilter(viewId), {
    category,
    measure,
    totalLabel,
  });
  const data = toWaterfallData(model);

  return (
    <DsWaterfallChart
      data={data}
      label={label}
      connectors={resolvedConnectors}
      format={format}
      width={width}
      height={height}
      className={resolvedClassName}
    />
  );
}
