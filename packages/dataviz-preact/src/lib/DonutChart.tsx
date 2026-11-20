import {
  DonutChart as DsDonutChart,
  type DonutChartDatum,
  type DataLabelsProp as ChartDataLabels,
} from '@sentropic/design-system-preact';
import type { DashboardStore, PartWholeSort } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';
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
  className?: MaybeSignal<string>;
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

  const resolvedClassName = useValue(className);

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
      className={resolvedClassName}
    />
  );
}
