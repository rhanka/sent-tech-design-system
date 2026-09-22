import { defineComponent, h, type PropType } from 'vue';
import {
  WindBarbChart as DsWindBarbChart,
  type WindBarbChartDatum as DsWindBarbChartDatum,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildWindBarbData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type WindBarbChartProps = {
  store: DashboardStore;
  viewId: string;
  at: string;
  speed: string;
  direction: string;
  width?: number;
  height?: number;
  size?: number;
  label?: string;
  class?: string;
};

export const WindBarbChart = defineComponent({
  name: 'WindBarbChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    at: { type: String, required: true },
    speed: { type: String, required: true },
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
      const data = buildWindBarbData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        {
          at: props.at,
          speed: props.speed,
          direction: props.direction,
        },
      );
      return h(DsWindBarbChart, {
        data: data as DsWindBarbChartDatum[],
        label: props.label,
        width: props.width as any,
        height: props.height as any,
        size: props.size as any,
        class: props.class as any,
      });
    };
  },
});
