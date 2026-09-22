import { defineComponent, h, type PropType } from 'vue';
import {
  ContourChart as DsContourChart,
  type ContourChartDatum as DsContourChartDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildContourData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ContourChartProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
  value: string;
  levels?: number;
  width?: number;
  height?: number;
  size?: number;
  label?: string;
  class?: string;
};

export const ContourChart = defineComponent({
  name: 'ContourChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    x: { type: String, required: true },
    y: { type: String, required: true },
    value: { type: String, required: true },
    levels: { type: Number, default: undefined },
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
      const data = buildContourData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        {
          x: props.x,
          y: props.y,
          value: props.value,
        },
      );
      return h(DsContourChart, {
        data: data as DsContourChartDatum[],
        levels: props.levels as any,
        label: props.label,
        width: props.width as any,
        height: props.height as any,
        size: props.size as any,
        class: props.class as any,
      });
    };
  },
});
