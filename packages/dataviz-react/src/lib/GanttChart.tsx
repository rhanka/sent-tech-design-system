import {
  GanttChart as DsGanttChart,
  type GanttChartTask,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildGanttData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type GanttChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value becomes the task name. */
  task: string;
  /** Field id whose numeric value becomes the start position. */
  start: string;
  /** Field id whose numeric value becomes the end position. */
  end: string;
  /** Optional field id whose string value becomes the category. */
  category?: string;
  width?: number;
  height?: number;
  /** Optional numeric marker position. */
  marker?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: string;
};

export function GanttChart({
  store,
  viewId,
  task,
  start,
  end,
  category,
  width,
  height,
  marker,
  label,
  className,
}: GanttChartProps) {
  const state = useDashboard(store);
  void state;

  const data = buildGanttData(store.model, store.applyCrossfilter(viewId), {
    task,
    start,
    end,
    category,
  });

  return (
    <DsGanttChart
      data={data as GanttChartTask[]}
      label={label}
      width={width}
      height={height}
      marker={marker}
      className={className}
    />
  );
}
