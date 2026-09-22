import { defineComponent, h, type PropType } from 'vue';
import { SankeyChart as DsSankeyChart } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafeFlowModel } from './partOfWholeData.js';

export type SankeyChartProps = {
  store: DashboardStore;
  viewId: string;
  source: string;
  target: string;
  measure: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const SankeyChart = defineComponent({
  name: 'SankeyChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
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
      const model = buildSafeFlowModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        source: props.source,
        target: props.target,
        measure: props.measure,
      });
      return h(DsSankeyChart, {
        nodes: model.nodes,
        links: model.links,
        label: props.label,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});
