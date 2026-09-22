import { PackedBubblesChart as DsPackedBubblesChart } from '@sentropic/design-system-react';
import type { DashboardStore, PartWholeSort } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafePackedBubbleModel, toPackedBubbleData } from './partOfWholeData.js';

export type PackedBubbleChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  sort?: PartWholeSort;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

export function PackedBubbleChart({
  store,
  viewId,
  category,
  measure,
  sort = 'value-desc',
  width = 420,
  height = 320,
  label,
  className,
}: PackedBubbleChartProps) {
  const state = useDashboard(store);
  void state;

  const data = toPackedBubbleData(
    buildSafePackedBubbleModel(store.model, store.applyCrossfilter(viewId), { category, measure, sort }),
  );

  return <DsPackedBubblesChart data={data} label={label} width={width} height={height} className={className} />;
}
