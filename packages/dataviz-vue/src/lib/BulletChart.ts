import { defineComponent, h, type PropType } from 'vue';
import { BulletChart as DsBulletChart } from '@sentropic/design-system-vue';
import type { BulletChartConfig, DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildBulletData } from './distributionData.js';

export type BulletChartProps = {
  store: DashboardStore;
  viewId?: string;
  value: BulletChartConfig['value'];
  target: BulletChartConfig['target'];
  category?: BulletChartConfig['category'];
  ranges?: BulletChartConfig['ranges'];
  label: string;
  orientation?: 'horizontal' | 'vertical';
  width?: number;
  height?: number;
  class?: string;
};

export const BulletChart = defineComponent({
  name: 'BulletChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, default: undefined },
    value: { type: String, required: true },
    target: { type: String, required: true },
    category: { type: String, default: undefined },
    ranges: { type: Array as unknown as PropType<BulletChartConfig['ranges']>, default: undefined },
    label: { type: String, required: true },
    orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      return h(DsBulletChart, {
        data: buildBulletData(props.store.model, props.store.applyCrossfilter(props.viewId), {
          value: props.value,
          target: props.target,
          category: props.category,
          ranges: props.ranges,
          label: props.label,
        }),
        label: props.label,
        orientation: props.orientation,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});
