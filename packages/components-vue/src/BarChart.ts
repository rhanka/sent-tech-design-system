import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type BarChartDatum = { label?: string; x?: string | number; y?: number; value?: number; tone?: string };
export type BarChartTone = string;

export type BarChartProps = {
  data: BarChartDatum[];
  label?: string;
  width?: number;
  height?: number;
  class?: string;
};

const DATA_TONES = [
  "category1", "category2", "category3", "category4",
  "category5", "category6", "category7", "category8",
];

export const BarChart = defineComponent({
  name: "BarChart",
  props: {
    data: { type: Array as () => BarChartDatum[], required: true },
    label: { type: String, default: "Bar chart" },
    width: { type: Number, default: 320 },
    height: { type: Number, default: 160 },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const width = props.width ?? 320;
      const height = props.height ?? 160;
      const label = props.label ?? "Bar chart";
      const max = Math.max(...props.data.map((datum) => datum.value ?? datum.y ?? 0), 1);
      return h(
        "figure",
        {
          ...attrs,
          class: classNames("st-barChart", props.class),
          "aria-label": label,
        },
        [
          h("span", { class: "st-visually-hidden" }, label),
          h("svg", { viewBox: `0 0 ${width} ${height}`, "aria-hidden": "true" }, [
            ...props.data.map((datum, index) => {
              const value = datum.value ?? datum.y ?? 0;
              const barWidth = width / Math.max(props.data.length, 1) - 8;
              const barHeight = (value / max) * height;
              return h("rect", {
                key: index,
                class: classNames(
                  "st-barChart__bar",
                  `st-barChart__bar--${datum.tone ?? DATA_TONES[index % DATA_TONES.length]}`,
                ),
                x: index * (barWidth + 8) + 4,
                y: height - barHeight,
                width: barWidth,
                height: barHeight,
              });
            }),
          ]),
        ],
      );
    };
  },
});
