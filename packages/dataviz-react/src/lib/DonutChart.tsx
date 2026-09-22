import {
  DonutChart as DsDonutChart,
  type DonutChartDatum,
  type DataLabelsProp as ChartDataLabels,
} from '@sentropic/design-system-react';
import type { DashboardStore, PartWholeSort } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafePartWholeModel, toPartWholeData } from './partOfWholeData.js';

export type DonutChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  sort?: PartWholeSort;
  size?: number;
  thickness?: number;
  centerLabel?: string | null;
  label: string;
  dataLabels?: ChartDataLabels;
  className?: string;
};

export function DonutChart({
  store,
  viewId,
  category,
  measure,
  sort = 'input',
  size,
  thickness,
  centerLabel,
  label,
  dataLabels,
  className,
}: DonutChartProps) {
  const state = useDashboard(store);
  void state;

  const model = buildSafePartWholeModel(store.model, store.applyCrossfilter(viewId), { category, measure, sort });
  const data: DonutChartDatum[] = toPartWholeData(model.items);

  return (
    <DsDonutChart
      data={data}
      label={label}
      size={size}
      thickness={thickness}
      centerLabel={centerLabel}
      dataLabels={dataLabels}
      className={className}
    />
  );
}
