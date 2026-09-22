import { defineComponent, h, type PropType } from 'vue';
import { RoseChart as DsRoseChart } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafeRoseModel, toRoseData } from './partOfWholeData.js';

export type RoseChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const RoseChart = defineComponent({
  name: 'RoseChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    category: { type: String, required: true },
    measure: { type: String, required: true },
    width: { type: Number, default: 360 },
    height: { type: Number, default: 360 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = toRoseData(
        buildSafeRoseModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
          category: props.category,
          measure: props.measure,
        }),
      );
      return h(DsRoseChart, {
        data,
        label: props.label,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});
