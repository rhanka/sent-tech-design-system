import {
  StateTimelineChart as DsStateTimelineChart,
  type StateTimelineSeries,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildStateTimelineData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type StateTimelineChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value groups rows into lanes. */
  series: string;
  /** Field id whose numeric value becomes the segment start. */
  start: string;
  /** Field id whose numeric value becomes the segment end. */
  end: string;
  /** Field id whose value encodes the state label. */
  state: string;
  /** Accessible label for the chart (aria-label). */
  label?: string;
  width?: number;
  height?: number;
  className?: string;
};

export function StateTimelineChart({
  store,
  viewId,
  series,
  start,
  end,
  state,
  label,
  width,
  height,
  className,
}: StateTimelineChartProps) {
  const storeState = useDashboard(store);
  void storeState;

  const data = buildStateTimelineData(store.model, store.applyCrossfilter(viewId), {
    series,
    start,
    end,
    state,
  });

  return (
    <DsStateTimelineChart
      data={data as StateTimelineSeries[]}
      label={label}
      width={width}
      height={height}
      className={className}
    />
  );
}
