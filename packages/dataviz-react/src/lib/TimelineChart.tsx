import {
  TimelineChart as DsTimelineChart,
  type TimelineChartEvent,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildTimelineData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type TimelineChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose string value becomes the event label. */
  label_field: string;
  /** Field id whose numeric value becomes the event position. */
  position: string;
  /** Optional field id whose string value becomes the event description. */
  description?: string;
  /** Optional field id whose string value becomes the event tone. */
  tone?: string;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: string;
};

export function TimelineChart({
  store,
  viewId,
  label_field,
  position,
  description,
  tone,
  width,
  height,
  label,
  className,
}: TimelineChartProps) {
  const state = useDashboard(store);
  void state;

  const data = buildTimelineData(store.model, store.applyCrossfilter(viewId), {
    label: label_field,
    position,
    description,
    tone,
  });

  return (
    <DsTimelineChart
      data={data as TimelineChartEvent[]}
      label={label}
      width={width}
      height={height}
      className={className}
    />
  );
}
