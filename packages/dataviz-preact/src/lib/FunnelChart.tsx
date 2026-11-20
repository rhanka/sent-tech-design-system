import {
  FunnelChart as DsFunnelChart,
  type FunnelChartDatum,
} from '@sentropic/design-system-preact';
import type { DashboardStore, PartWholeSort } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';
import { buildSafePartWholeModel, toPartWholeData } from './partOfWholeData.js';

export type FunnelChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  sort?: PartWholeSort;
  orientation?: 'vertical' | 'horizontal';
  showPercentages?: MaybeSignal<boolean>;
  percentMode?: 'ofFirst' | 'ofPrevious';
  legend?: MaybeSignal<boolean>;
  width?: number;
  height?: number;
  label: string;
  className?: MaybeSignal<string>;
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

  const resolvedShowPercentages = useValue(showPercentages);
  const resolvedLegend = useValue(legend);
  const resolvedClassName = useValue(className);

  const model = buildSafePartWholeModel(store.model, store.applyCrossfilter(viewId), { category, measure, sort });
  const data: FunnelChartDatum[] = toPartWholeData(model.items);

  return (
    <DsFunnelChart
      data={data}
      label={label}
      orientation={orientation}
      showPercentages={resolvedShowPercentages}
      percentMode={percentMode}
      legend={resolvedLegend}
      width={width}
      height={height}
      className={resolvedClassName}
    />
  );
}
