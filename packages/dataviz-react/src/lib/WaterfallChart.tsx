import { WaterfallChart as DsWaterfallChart } from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafeWaterfallModel, toWaterfallData } from './partOfWholeData.js';

export type WaterfallChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  totalLabel?: string;
  connectors?: boolean;
  format?: (value: number) => string;
  width?: number;
  height?: number;
  label: string;
  className?: string;
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
      connectors={connectors}
      format={format}
      width={width}
      height={height}
      className={className}
    />
  );
}
