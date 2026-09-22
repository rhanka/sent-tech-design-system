import { defineComponent, h, type PropType } from 'vue';
import { ChordDiagram as DsChordDiagram } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafeFlowModel, toFlowData } from './partOfWholeData.js';

export type ChordChartProps = {
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

export const ChordChart = defineComponent({
  name: 'ChordChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    measure: { type: String, required: true },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 360 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const { data, labels } = toFlowData(
        buildSafeFlowModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
          source: props.source,
          target: props.target,
          measure: props.measure,
        }),
      );
      return h(DsChordDiagram, {
        data,
        labels,
        label: props.label,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});
