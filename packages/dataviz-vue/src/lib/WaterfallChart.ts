import { defineComponent, h, type PropType } from 'vue';
import { WaterfallChart as DsWaterfallChart } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafeWaterfallModel, toWaterfallData } from './partOfWholeData.js';

export type WaterfallChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  totalLabel?: string;
  connectors?: boolean;
  format?: (value: number) => string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const WaterfallChart = defineComponent({
  name: 'WaterfallChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    category: { type: String, required: true },
    measure: { type: String, required: true },
    totalLabel: { type: String, default: undefined },
    connectors: { type: Boolean, default: true },
    format: { type: Function as PropType<(value: number) => string>, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const model = buildSafeWaterfallModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        category: props.category,
        measure: props.measure,
        totalLabel: props.totalLabel,
      });
      return h(DsWaterfallChart, {
        data: toWaterfallData(model),
        label: props.label,
        connectors: props.connectors,
        format: props.format,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});
