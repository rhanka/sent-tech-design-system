import { defineComponent, h, type PropType } from 'vue';
import {
  TimelineChart as DsTimelineChart,
  type TimelineChartEvent,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildTimelineData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type TimelineChartProps = {
  store: DashboardStore;
  viewId: string;
  label_field: string;
  position: string;
  description?: string;
  tone?: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const TimelineChart = defineComponent({
  name: 'TimelineChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    label_field: { type: String, required: true },
    position: { type: String, required: true },
    description: { type: String, default: undefined },
    tone: { type: String, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = buildTimelineData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        {
          label: props.label_field,
          position: props.position,
          description: props.description,
          tone: props.tone,
        },
      );
      return h(DsTimelineChart, {
        data: data as TimelineChartEvent[],
        label: props.label,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});
