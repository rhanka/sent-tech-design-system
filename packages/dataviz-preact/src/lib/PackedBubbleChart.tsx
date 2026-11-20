import { PackedBubblesChart as DsPackedBubblesChart } from '@sentropic/design-system-preact';
import type { DashboardStore, PartWholeSort } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';
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
  className?: MaybeSignal<string>;
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
  const resolvedClassName = useValue(className);

  const data = toPackedBubbleData(
    buildSafePackedBubbleModel(store.model, store.applyCrossfilter(viewId), { category, measure, sort }),
  );

  return <DsPackedBubblesChart data={data} label={label} width={width} height={height} className={resolvedClassName} />;
}
