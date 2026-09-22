import { defineComponent, h, type PropType } from 'vue';
import {
  Density2DChart as DsDensity2DChart,
  type Density2DPoint as DsDensity2DPoint,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildDensity2DData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type Density2DChartProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
  weight?: string;
  bins?: number;
  width?: number;
  height?: number;
  size?: number;
  label?: string;
  class?: string;
};

export const Density2DChart = defineComponent({
  name: 'Density2DChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    x: { type: String, required: true },
    y: { type: String, required: true },
    weight: { type: String, default: undefined },
    bins: { type: Number, default: undefined },
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
      const data = buildDensity2DData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        {
          x: props.x,
          y: props.y,
          weight: props.weight,
        },
      );
      return h(DsDensity2DChart, {
        data: data as DsDensity2DPoint[],
        bins: props.bins as any,
        label: props.label,
        width: props.width as any,
        height: props.height as any,
        size: props.size as any,
        class: props.class as any,
      });
    };
  },
});
