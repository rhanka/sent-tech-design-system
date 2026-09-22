import {
  FunnelChart as DsFunnelChart,
  type FunnelChartDatum,
} from '@sentropic/design-system-react';
import type { DashboardStore, PartWholeSort } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafePartWholeModel, toPartWholeData } from './partOfWholeData.js';

export type FunnelChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  sort?: PartWholeSort;
  orientation?: 'vertical' | 'horizontal';
  showPercentages?: boolean;
  percentMode?: 'ofFirst' | 'ofPrevious';
  legend?: boolean;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

export function FunnelChart({
  store,
  viewId,
  category,
  measure,
  sort = 'value-desc',
  orientation = 'vertical',
  showPercentages = true,
  percentMode = 'ofFirst',
  legend = true,
  width,
  height,
  label,
  className,
}: FunnelChartProps) {
  const state = useDashboard(store);
  void state;

  const model = buildSafePartWholeModel(store.model, store.applyCrossfilter(viewId), { category, measure, sort });
  const data: FunnelChartDatum[] = toPartWholeData(model.items);

  return (
    <DsFunnelChart
      data={data}
      label={label}
      orientation={orientation}
      showPercentages={showPercentages}
      percentMode={percentMode}
      legend={legend}
      width={width}
      height={height}
      className={className}
    />
  );
}
