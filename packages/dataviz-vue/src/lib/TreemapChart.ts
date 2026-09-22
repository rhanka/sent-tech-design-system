import { defineComponent, h, type PropType } from 'vue';
import { TreemapChart as DsTreemapChart } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafePartWholeHierarchy, toTreemapData } from './partOfWholeData.js';

export type TreemapChartProps = {
  store: DashboardStore;
  viewId: string;
  hierarchy: string[];
  measure: string;
  showLabels?: boolean;
  legend?: boolean;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const TreemapChart = defineComponent({
  name: 'TreemapChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    hierarchy: { type: Array as PropType<string[]>, required: true },
    measure: { type: String, required: true },
    showLabels: { type: Boolean, default: true },
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
      return h(DsTreemapChart, {
        data: toTreemapData(model),
        label: props.label,
        showLabels: props.showLabels,
        legend: props.legend,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});
