import { defineComponent, h, type PropType } from 'vue';
import { ForceGraph as DsForceGraph } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildForceGraphData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ForceGraphProps = {
  store: DashboardStore;
  viewId: string;
  source: string;
  target: string;
  weight?: string;
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

export const ForceGraph = defineComponent({
  name: 'ForceGraph',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    weight: { type: String, default: undefined },
    label: { type: String, required: true },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const graph = buildForceGraphData(props.store.model, props.store.applyCrossfilter(props.viewId), {
        source: props.source,
        target: props.target,
        weight: props.weight,
      });
      return h(DsForceGraph, {
        nodes: graph.nodes,
        edges: graph.edges,
        label: props.label,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});
