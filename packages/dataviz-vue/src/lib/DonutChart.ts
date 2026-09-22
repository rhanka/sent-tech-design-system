import { defineComponent, h, type PropType } from 'vue';
import { DonutChart as DsDonutChart, type DonutChartDatum, type DataLabelsProp as ChartDataLabels } from '@sentropic/design-system-vue';
import type { DashboardStore, PartWholeSort } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { buildSafePartWholeModel, toPartWholeData } from './partOfWholeData.js';

export type DonutChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  sort?: PartWholeSort;
  size?: number;
  thickness?: number;
  centerLabel?: string | null;
  label: string;
  dataLabels?: ChartDataLabels;
  class?: string;
};

export const DonutChart = defineComponent({
  name: 'DonutChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    category: { type: String, required: true },
    measure: { type: String, required: true },
    sort: { type: String as PropType<PartWholeSort>, default: 'input' },
    size: { type: Number, default: undefined },
    thickness: { type: Number, default: undefined },
    centerLabel: { type: String as PropType<string | null>, default: undefined },
    label: { type: String, required: true },
    dataLabels: { type: [Boolean, Object] as PropType<ChartDataLabels>, default: undefined },
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
      const data: DonutChartDatum[] = toPartWholeData(model.items);
      return h(DsDonutChart, {
        data,
        label: props.label,
        size: props.size,
        thickness: props.thickness,
        centerLabel: props.centerLabel,
        dataLabels: props.dataLabels,
        class: props.class,
      });
    };
  },
});
