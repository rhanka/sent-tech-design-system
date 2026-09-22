import { defineComponent, h, type PropType } from 'vue';
import { PackedBubblesChart as DsPackedBubblesChart } from '@sentropic/design-system-vue';
import type { DashboardStore, PartWholeSort } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafePackedBubbleModel, toPackedBubbleData } from './partOfWholeData.js';

export type PackedBubbleChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  sort?: PartWholeSort;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const PackedBubbleChart = defineComponent({
  name: 'PackedBubbleChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    category: { type: String, required: true },
    measure: { type: String, required: true },
    sort: { type: String as PropType<PartWholeSort>, default: 'value-desc' },
    width: { type: Number, default: 420 },
    height: { type: Number, default: 320 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = toPackedBubbleData(
        buildSafePackedBubbleModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
          category: props.category,
          measure: props.measure,
          sort: props.sort,
        }),
      );
      return h(DsPackedBubblesChart, {
        data,
        label: props.label,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});
