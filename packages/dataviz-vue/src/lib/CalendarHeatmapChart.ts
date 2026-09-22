import { defineComponent, h, type PropType } from 'vue';
import { CalendarHeatmapChart as DsCalendarHeatmapChart } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildCalendarHeatmapData } from './distributionData.js';

export type CalendarHeatmapChartProps = {
  store: DashboardStore;
  viewId?: string;
  date: string;
  measure: string;
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

export const CalendarHeatmapChart = defineComponent({
  name: 'CalendarHeatmapChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, default: undefined },
    date: { type: String, required: true },
    measure: { type: String, required: true },
    label: { type: String, required: true },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      return h(DsCalendarHeatmapChart, {
        data: buildCalendarHeatmapData(props.store.model, props.store.applyCrossfilter(props.viewId), props.date, props.measure),
        label: props.label,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});
