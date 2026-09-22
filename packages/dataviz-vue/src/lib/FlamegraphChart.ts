import { defineComponent, h, type PropType } from 'vue';
import {
  FlamegraphChart as DsFlamegraphChart,
  type FlamegraphNode as DsFlamegraphNode,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildFlamegraphData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type FlamegraphChartProps = {
  store: DashboardStore;
  viewId: string;
  id: string;
  parentId: string;
  name: string;
  value: string;
  width?: number;
  height?: number;
  size?: number;
  label?: string;
  class?: string;
};

export const FlamegraphChart = defineComponent({
  name: 'FlamegraphChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    id: { type: String, required: true },
    parentId: { type: String, required: true },
    name: { type: String, required: true },
    value: { type: String, required: true },
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
      const data = buildFlamegraphData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        {
          id: props.id,
          parentId: props.parentId,
          name: props.name,
          value: props.value,
        },
      );
      return h(DsFlamegraphChart, {
        data: data as DsFlamegraphNode,
        label: props.label,
        width: props.width as any,
        height: props.height as any,
        size: props.size as any,
        class: props.class as any,
      });
    };
  },
});
