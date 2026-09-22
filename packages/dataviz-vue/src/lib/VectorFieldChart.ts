import { defineComponent, h, type PropType } from 'vue';
import {
  VectorFieldChart as DsVectorFieldChart,
  type VectorFieldChartDatum as DsVectorFieldChartDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildVectorFieldData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type VectorFieldChartProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
  length: string;
  direction: string;
  width?: number;
  height?: number;
  size?: number;
  label?: string;
  class?: string;
};

export const VectorFieldChart = defineComponent({
  name: 'VectorFieldChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    x: { type: String, required: true },
    y: { type: String, required: true },
    length: { type: String, required: true },
    direction: { type: String, required: true },
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
      const data = buildVectorFieldData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        {
          x: props.x,
          y: props.y,
          length: props.length,
          direction: props.direction,
        },
      );
      return h(DsVectorFieldChart, {
        data: data as DsVectorFieldChartDatum[],
        label: props.label,
        width: props.width as any,
        height: props.height as any,
        size: props.size as any,
        class: props.class as any,
      });
    };
  },
});
