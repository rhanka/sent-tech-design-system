import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type ScatterPlotDatum = { x: number; y: number; label?: string; tone?: string };
export type ScatterPlotTone = string;

export type ScatterPlotProps = {
  data: ScatterPlotDatum[];
  label?: string;
  width?: number;
  height?: number;
  class?: string;
};

const DATA_TONES = [
  "category1", "category2", "category3", "category4",
  "category5", "category6", "category7", "category8",
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export const ScatterPlot = defineComponent({
  name: "ScatterPlot",
  props: {
    data: { type: Array as () => ScatterPlotDatum[], required: true },
    label: { type: String, default: "Scatter chart" },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const label = props.label ?? "Scatter chart";
      return h(
        "figure",
        {
          ...attrs,
          class: classNames("st-scatterPlot", props.class),
          "aria-label": label,
        },
        [
          h("span", { class: "st-visually-hidden" }, label),
          h("svg", { viewBox: "0 0 320 160", "aria-hidden": "true" }, [
            ...props.data.map((datum, index) =>
              h(
                "circle",
                {
                  key: index,
                  class: classNames(
                    "st-scatterPlot__point",
                    `st-scatterPlot__point--${datum.tone ?? DATA_TONES[index % DATA_TONES.length]}`,
                  ),
                  cx: clamp(datum.x * 24 + 24, 12, 308),
                  cy: clamp(148 - datum.y * 24, 12, 148),
                  r: "5",
                },
                [h("title", {}, datum.label ?? `${datum.x}, ${datum.y}`)],
              ),
            ),
          ]),
        ],
      );
    };
  },
});
