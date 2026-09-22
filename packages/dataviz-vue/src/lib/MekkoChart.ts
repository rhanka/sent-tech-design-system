import { defineComponent, h, type PropType } from 'vue';
import { MarimekkoChart as DsMarimekkoChart } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafeMekkoModel, toMarimekkoData } from './partOfWholeData.js';

export type MekkoChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  series: string;
  measure: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const MekkoChart = defineComponent({
  name: 'MekkoChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    category: { type: String, required: true },
    series: { type: String, required: true },
    measure: { type: String, required: true },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const model = buildSafeMekkoModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        category: props.category,
        series: props.series,
        measure: props.measure,
      });
      return h(DsMarimekkoChart, {
        data: toMarimekkoData(model),
        width: props.width,
        height: props.height,
        label: props.label,
        class: props.class,
      });
    };
  },
});
