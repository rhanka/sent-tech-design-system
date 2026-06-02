import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type SparklineTone = "neutral" | "success" | "warning" | "error";

export type SparklineProps = {
  data: number[];
  label?: string;
  tone?: SparklineTone;
  class?: string;
};

function pointsFrom(values: number[], width: number, height: number): string {
  const max = Math.max(...values, 1);
  return values
    .map((value, index) => {
      const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
      const y = height - (value / max) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

export const Sparkline = defineComponent({
  name: "Sparkline",
  props: {
    data: { type: Array as () => number[], required: true },
    label: { type: String, default: "Sparkline" },
    tone: { type: String as () => SparklineTone, default: "neutral" },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const label = props.label ?? "Sparkline";
      const tone = props.tone ?? "neutral";
      return h(
        "figure",
        {
          ...attrs,
          class: classNames("st-sparkline", `st-sparkline--${tone}`, props.class),
          "aria-label": label,
        },
        [
          h("span", { class: "st-visually-hidden" }, label),
          h("svg", { viewBox: "0 0 120 40", "aria-hidden": "true" }, [
            h("polyline", {
              class: "st-sparkline__line",
              points: pointsFrom(props.data, 120, 40),
              fill: "none",
            }),
          ]),
        ],
      );
    };
  },
});
