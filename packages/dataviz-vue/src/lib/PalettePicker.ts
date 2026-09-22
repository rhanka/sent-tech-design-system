import { defineComponent, h, type PropType, type VNode } from 'vue';
import { Stack, Inline, ColorSwatch, ColorScaleBar } from '@sentropic/design-system-vue';
import { buildSequentialScale, buildDivergingScale } from '@sentropic/dataviz-core';

export type PalettePickerProps = {
  categorical?: string[];
  sequential?: string[];
  diverging?: string[];
  steps?: number;
  min?: string;
  max?: string;
  swatchSize?: number;
  label?: string;
  class?: string;
};

export const PalettePicker = defineComponent({
  name: 'PalettePicker',
  props: {
    categorical: { type: Array as PropType<string[]>, default: undefined },
    sequential: { type: Array as PropType<string[]>, default: undefined },
    diverging: { type: Array as PropType<string[]>, default: undefined },
    steps: { type: Number, default: 9 },
    min: { type: String, default: undefined },
    max: { type: String, default: undefined },
    swatchSize: { type: Number, default: 24 },
    label: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    return () => {
      const seqColors =
        props.sequential && props.sequential.length >= 2
          ? buildSequentialScale(props.sequential, props.steps)
          : null;
      let divColors: string[] | null = null;
      if (props.diverging && props.diverging.length >= 3) {
        divColors = buildDivergingScale(
          props.diverging[0]!,
          props.diverging[Math.floor(props.diverging.length / 2)]!,
          props.diverging[props.diverging.length - 1]!,
          props.steps,
        );
      }

      const children: VNode[] = [];
      if (props.categorical && props.categorical.length) {
        children.push(
          h(
            Inline,
            { gap: 1 },
            {
              default: () =>
                props.categorical!.map((c, i) =>
                  h(ColorSwatch, { key: i, color: c, shape: 'circle', size: props.swatchSize }),
                ),
            },
          ),
        );
      }
      if (seqColors) {
        children.push(
          h(ColorScaleBar, {
            colors: seqColors,
            min: props.min,
            max: props.max,
            label: props.label ? `${props.label} — séquentiel` : 'Échelle séquentielle',
          }),
        );
      }
      if (divColors) {
        children.push(
          h(ColorScaleBar, {
            colors: divColors,
            min: props.min,
            max: props.max,
            label: props.label ? `${props.label} — divergent` : 'Échelle divergente',
          }),
        );
      }

      return h(Stack, { gap: 3, class: props.class }, { default: () => children });
    };
  },
});
