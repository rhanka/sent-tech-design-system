import { Sparkline as DsSparkline } from '@sentropic/design-system-react';
import type { SparklineTone } from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSimpleCategoricalSeries } from './categoricalData.js';

export type { SparklineTone };

export type SparklineProps = {
  store: DashboardStore;
  viewId: string;
  dimension: string;
  measure: string;
  tone?: SparklineTone;
  strokeWidth?: number;
  area?: boolean;
  width?: number;
  height?: number;
  label?: string;
  className?: string;
};

export function Sparkline({
  store,
  viewId,
  dimension,
  measure,
  tone,
  strokeWidth,
  area,
  width,
  height,
  label,
  className,
}: SparklineProps) {
  const state = useDashboard(store);
  void state;

  const seriesModel = buildSimpleCategoricalSeries(store.model, store.applyCrossfilter(viewId), dimension, measure);
  const data: number[] = seriesModel.series[0]?.values ?? [];

  return (
    <DsSparkline
      data={data}
      tone={tone}
      strokeWidth={strokeWidth}
      area={area}
      width={width}
      height={height}
      label={label}
      className={className}
    />
  );
}
