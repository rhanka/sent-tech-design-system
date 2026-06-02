import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type DonutChartDatum = { label?: string; x?: string | number; y?: number; value?: number; tone?: string };
export type DonutChartTone = string;

export type DonutChartProps = {
  data: DonutChartDatum[];
  label?: string;
  width?: number;
  height?: number;
  class?: string;
};

const DATA_TONES = [
  "category1", "category2", "category3", "category4",
  "category5", "category6", "category7", "category8",
];

export const DonutChart = defineComponent({
  name: "DonutChart",
  props: {
    data: { type: Array as () => DonutChartDatum[], required: true },
    label: { type: String, default: "Donut chart" },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const label = props.label ?? "Donut chart";
      const total = props.data.reduce((sum, datum) => sum + (datum.value ?? datum.y ?? 0), 0);
      return h(
        "figure",
        {
          ...attrs,
          class: classNames("st-donutChart", props.class),
          "aria-label": label,
        },
        [
          h("span", { class: "st-visually-hidden" }, label),
          h("svg", { viewBox: "0 0 120 120", "aria-hidden": "true" }, [
            ...props.data.map((datum, index) =>
              h("circle", {
                key: index,
                class: classNames(
                  "st-donutChart__slice",
                  `st-donutChart__slice--${datum.tone ?? DATA_TONES[index % DATA_TONES.length]}`,
                ),
                cx: "60",
                cy: "60",
                r: 36 - index * 3,
                fill: "none",
                "stroke-width": "8",
              }),
            ),
            h("text", { class: "st-donutChart__center", x: "60", y: "64", "text-anchor": "middle" }, String(total)),
          ]),
        ],
      );
    };
  },
});
