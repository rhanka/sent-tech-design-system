import { defineComponent, h, type PropType } from 'vue';
import {
  TileMapChart as DsTileMapChart,
  type TileMapChartTile,
} from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildTileMapData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type TileMapChartProps = {
  store: DashboardStore;
  viewId: string;
  label_field: string;
  col: string;
  row: string;
  value: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const TileMapChart = defineComponent({
  name: 'TileMapChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    label_field: { type: String, required: true },
    col: { type: String, required: true },
    row: { type: String, required: true },
    value: { type: String, required: true },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const data = buildTileMapData(
        props.store.model,
        props.store.applyCrossfilter(props.viewId),
        {
          label: props.label_field,
          col: props.col,
          row: props.row,
          value: props.value,
        },
      );
      return h(DsTileMapChart, {
        data: data as TileMapChartTile[],
        label: props.label,
        width: props.width,
        height: props.height,
        class: props.class,
      });
    };
  },
});
