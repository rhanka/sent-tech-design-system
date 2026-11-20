import { buildReferenceLineModel, type DashboardStore } from '@sentropic/dataviz-core';
import { LineChart, type LineChartDatum } from '@sentropic/design-system-preact';
import { useDashboard } from '../adapter.js';
import { classNames } from '../classNames.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type ReferenceLineChartProps = {
  store: DashboardStore;
  viewId: string;
  value?: number;
  measure?: string;
  referenceId?: string;
  referenceLabel?: string;
  domainMin?: number;
  domainMax?: number;
  width?: number;
  height?: number;
  label: string;
  hoverKey?: MaybeSignal<string | null>;
  onHoverKeyChange?: (key: string | null) => void;
  onSelectKey?: (key: string | null) => void;
  className?: MaybeSignal<string>;
};

function xDomain(value: number, domainMin: number | undefined, domainMax: number | undefined): [number, number] {
  const min = domainMin ?? Math.min(0, value);
  const max = domainMax ?? Math.max(1, value);
  return min < max ? [min, max] : [min, min + 1];
}

export function ReferenceLineChart({
  store,
  viewId,
  value,
  measure,
  referenceId,
  referenceLabel,
  domainMin,
  domainMax,
  width = 360,
  height = 96,
  label,
  hoverKey,
  onHoverKeyChange,
  onSelectKey,
  className,
}: ReferenceLineChartProps) {
  const state = useDashboard(store);
  void state;
  const resolvedHoverKey = useValue(hoverKey);
  const resolvedClassName = useValue(className);
  const model = buildReferenceLineModel(store.model, store.applyCrossfilter(viewId), {
    id: referenceId,
    label: referenceLabel,
    value,
    measure,
  });
  const [min, max] = xDomain(model.value, domainMin, domainMax);
  const data: LineChartDatum[] = [
    { x: min, y: 0 },
    { x: max, y: 0 },
  ];

  return (
    <LineChart
      data={data}
      width={width}
      height={height}
      label={label}
      referenceLines={[{ axis: 'x', value: model.value, label: model.label, tone: 'info' }]}
      hoverKey={resolvedHoverKey}
      onHoverKeyChange={onHoverKeyChange}
      onSelectKey={onSelectKey}
      className={classNames('st-referenceLineChart', resolvedClassName)}
    />
  );
}
