import { defineComponent, h, type PropType } from 'vue';
import { FunnelChart as DsFunnelChart, type FunnelChartDatum } from '@sentropic/design-system-vue';
import type { DashboardStore, PartWholeSort } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafePartWholeModel, toPartWholeData } from './partOfWholeData.js';

export type FunnelChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  sort?: PartWholeSort;
  orientation?: 'vertical' | 'horizontal';
  showPercentages?: boolean;
  percentMode?: 'ofFirst' | 'ofPrevious';
  legend?: boolean;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const FunnelChart = defineComponent({
  name: 'FunnelChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    category: { type: String, required: true },
    measure: { type: String, required: true },
    sort: { type: String as PropType<PartWholeSort>, default: 'value-desc' },
    orientation: { type: String as PropType<'vertical' | 'horizontal'>, default: 'vertical' },
    showPercentages: { type: Boolean, default: true },
    percentMode: { type: String as PropType<'ofFirst' | 'ofPrevious'>, default: 'ofFirst' },
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
      const model = buildSafePartWholeModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
        category: props.category,
        measure: props.measure,
        sort: props.sort,
      });
      const data: FunnelChartDatum[] = toPartWholeData(model.items);
      return h(DsFunnelChart, {
        data,
        label: props.label,
        orientation: props.orientation,
        showPercentages: props.showPercentages,
        percentMode: props.percentMode,
        legend: props.legend,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});
