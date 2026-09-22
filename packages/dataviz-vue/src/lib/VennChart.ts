import { defineComponent, h, type PropType } from 'vue';
import {
  VennChart as DsVennChart,
  type VennChartArea,
} from '@sentropic/design-system-vue';

export type VennChartProps = {
  areas: VennChartArea[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

export const VennChart = defineComponent({
  name: 'VennChart',
  props: {
    areas: { type: Array as PropType<VennChartArea[]>, required: true },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props) {
    return () => h(DsVennChart, {
      data: props.areas,
      label: props.label,
      width: props.width as any,
      height: props.height as any,
      class: props.class as any,
    });
  },
});
