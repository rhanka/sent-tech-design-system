import { defineComponent, h, type PropType } from 'vue';
import {
  AnomalySwimLaneChart as DsAnomalySwimLaneChart,
  type AnomalySwimLaneSeries,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildAnomalySwimLaneData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type AnomalySwimLaneChartProps = {
  store: DashboardStore;
  viewId: string;
  job: string;
  at: string;
  score: string;
  max?: number;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

export const AnomalySwimLaneChart = defineComponent({
  name: 'AnomalySwimLaneChart',
  props: {
    store:  { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    job:    { type: String, required: true },
    at:     { type: String, required: true },
    score:  { type: String, required: true },
    max:    { type: Number, default: undefined },
    label:  { type: String, default: undefined },
    width:  { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    size:   { type: Number, default: undefined },
    class:  { type: String, default: undefined },
  },
  setup(props) {
    const storeState = useDashboard(props.store);
    return () => {
      void storeState.value;
      const data = buildAnomalySwimLaneData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        {
          job:   props.job,
          at:    props.at,
          score: props.score,
        },
      );
      return h(DsAnomalySwimLaneChart, {
        data:   data as AnomalySwimLaneSeries[],
        max:    props.max,
        label:  props.label,
        width:  props.width,
        height: props.height,
        size:   props.size,
        class:  props.class,
      });
    };
  },
});
