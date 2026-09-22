import { SunburstChart as DsSunburstChart } from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafePartWholeHierarchy, toHierarchyDatum } from './partOfWholeData.js';

export type SunburstChartProps = {
  store: DashboardStore;
  viewId: string;
  hierarchy: string[];
  measure: string;
  legend?: boolean;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

export function SunburstChart({
  store,
  viewId,
  hierarchy,
  measure,
  legend = true,
  width,
  height,
  label,
  className,
}: SunburstChartProps) {
  const state = useDashboard(store);
  void state;

  const model = buildSafePartWholeHierarchy(store.model, store.applyCrossfilter(viewId), { hierarchy, measure });
  const data = toHierarchyDatum(model);

  return (
    <DsSunburstChart
      data={data}
      label={label}
      legend={legend}
      width={width}
      height={height}
      className={className}
    />
  );
}
