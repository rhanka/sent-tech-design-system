import { MarimekkoChart as DsMarimekkoChart } from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafeMekkoModel, toMarimekkoData } from './partOfWholeData.js';

export type MekkoChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  series: string;
  measure: string;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

export function MekkoChart({
  store,
  viewId,
  category,
  series,
  measure,
  width,
  height,
  label,
  className,
}: MekkoChartProps) {
  const state = useDashboard(store);
  void state;

  const model = buildSafeMekkoModel(store.model, store.applyCrossfilter(viewId), {
    category,
    series,
    measure,
  });

  return (
    <DsMarimekkoChart
      data={toMarimekkoData(model)}
      width={width}
      height={height}
      label={label}
      className={className}
    />
  );
}
