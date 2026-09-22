import { defineComponent, h, type PropType } from 'vue';
import {
  StateTimelineChart as DsStateTimelineChart,
  type StateTimelineSeries,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildStateTimelineData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type StateTimelineChartProps = {
  store: DashboardStore;
  viewId: string;
  series: string;
  start: string;
  end: string;
  state: string;
  label?: string;
  width?: number;
  height?: number;
  class?: string;
};

export const StateTimelineChart = defineComponent({
  name: 'StateTimelineChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    series: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    state: { type: String, required: true },
    label: { type: String, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const storeState = useDashboard(props.store);
    return () => {
      void storeState.value;
      const data = buildStateTimelineData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        {
          series: props.series,
          start: props.start,
          end: props.end,
          state: props.state,
        },
      );
      return h(DsStateTimelineChart, {
        data: data as StateTimelineSeries[],
        label: props.label,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});
