import { defineComponent, h, type PropType } from 'vue';
import {
  OrganizationChart as DsOrganizationChart,
  type OrganizationChartNode,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildHierarchyData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type OrganizationChartProps = {
  store: DashboardStore;
  viewId: string;
  id_field: string;
  parent_field: string;
  label_field: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const OrganizationChart = defineComponent({
  name: 'OrganizationChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    id_field: { type: String, required: true },
    parent_field: { type: String, required: true },
    label_field: { type: String, required: true },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = buildHierarchyData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        { id: props.id_field, parentId: props.parent_field, label: props.label_field },
      );
      return h(DsOrganizationChart, {
        data: data as OrganizationChartNode[],
        label: props.label,
        width: props.width as any,
        height: props.height as any,
        class: props.class as any,
      });
    };
  },
});
