import { defineComponent, h, type PropType } from 'vue';
import {
  GanttChart as DsGanttChart,
  type GanttChartTask,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildGanttData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type GanttChartProps = {
  store: DashboardStore;
  viewId: string;
  task: string;
  start: string;
  end: string;
  category?: string;
  width?: number;
  height?: number;
  marker?: number;
  label: string;
  class?: string;
};

export const GanttChart = defineComponent({
  name: 'GanttChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    task: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    category: { type: String, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    marker: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = buildGanttData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        {
          task: props.task,
          start: props.start,
          end: props.end,
          category: props.category,
        },
      );
      return h(DsGanttChart, {
        data: data as GanttChartTask[],
        label: props.label,
        width: props.width,
        height: props.height,
        marker: props.marker,
        class: props.class,
      });
    };
  },
});
