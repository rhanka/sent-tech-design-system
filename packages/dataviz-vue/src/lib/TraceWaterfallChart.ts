import { defineComponent, h, type PropType } from 'vue';
import {
  TraceWaterfallChart as DsTraceWaterfallChart,
  type TraceSpan,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildTraceWaterfallData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type TraceWaterfallChartProps = {
  store: DashboardStore;
  viewId: string;
  spanId: string;
  parentSpanId: string;
  service: string;
  start: string;
  duration: string;
  width?: number;
  height?: number;
  size?: number;
  label?: string;
  class?: string;
};

export const TraceWaterfallChart = defineComponent({
  name: 'TraceWaterfallChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    spanId: { type: String, required: true },
    parentSpanId: { type: String, required: true },
    service: { type: String, required: true },
    start: { type: String, required: true },
    duration: { type: String, required: true },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    size: { type: Number, default: undefined },
    label: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = buildTraceWaterfallData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        {
          spanId: props.spanId,
          parentSpanId: props.parentSpanId,
          service: props.service,
          start: props.start,
          duration: props.duration,
        },
      );
      return h(DsTraceWaterfallChart, {
        data: data as { spans: TraceSpan[] },
        label: props.label,
        width: props.width as any,
        height: props.height as any,
        size: props.size as any,
        class: props.class as any,
      });
    };
  },
});
