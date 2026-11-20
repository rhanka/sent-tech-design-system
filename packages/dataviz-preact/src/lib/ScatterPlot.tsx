import {
  ScatterPlot as DsScatterPlot,
  type ScatterPlotDatum,
} from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildScatterModel } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type ScatterPlotProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
  series?: string;
  labelField?: string;
  width?: number;
  height?: number;
  radius?: number;
  label: string;
  className?: MaybeSignal<string>;
};

export function ScatterPlot({
  store,
  viewId,
  x,
  y,
  series,
  labelField,
  width,
  height,
  radius,
  label,
  className,
}: ScatterPlotProps) {
  const state = useDashboard(store);
  void state;
  const resolvedClassName = useValue(className);

  const model = buildScatterModel(store.model, store.applyCrossfilter(viewId), { x, y, series, labelField });

  return (
    <DsScatterPlot
      data={model.data as ScatterPlotDatum[]}
      xLabel={model.xLabel}
      yLabel={model.yLabel}
      width={width}
      height={height}
      radius={radius}
      label={label}
      className={resolvedClassName}
    />
  );
}
