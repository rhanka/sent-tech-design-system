import { defineComponent, h, type PropType } from 'vue';
import { SunburstChart as DsSunburstChart } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafePartWholeHierarchy, toHierarchyDatum } from './partOfWholeData.js';

export type SunburstChartProps = {
  store: DashboardStore;
  viewId: string;
  hierarchy: string[];
  measure: string;
  legend?: boolean;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const SunburstChart = defineComponent({
  name: 'SunburstChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    hierarchy: { type: Array as PropType<string[]>, required: true },
    measure: { type: String, required: true },
    legend: { type: Boolean, default: true },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const model = buildSafePartWholeHierarchy(props.store.model, props.store.applyCrossfilter(props.viewId), {
        hierarchy: props.hierarchy,
        measure: props.measure,
      });
      return h(DsSunburstChart, {
        data: toHierarchyDatum(model),
        label: props.label,
        legend: props.legend,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});
