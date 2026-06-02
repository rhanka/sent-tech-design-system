import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type StackedBarSegment = { label: string; value: number; tone?: string };
export type StackedBarDatum = { label: string; segments: StackedBarSegment[] };
export type StackedBarTone = string;

export type StackedBarChartProps = {
  data: StackedBarDatum[];
  label?: string;
  width?: number;
  height?: number;
  class?: string;
};

const DATA_TONES = [
  "category1", "category2", "category3", "category4",
  "category5", "category6", "category7", "category8",
];

export const StackedBarChart = defineComponent({
  name: "StackedBarChart",
  props: {
    data: { type: Array as () => StackedBarDatum[], required: true },
    label: { type: String, default: "Stacked bar chart" },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const label = props.label ?? "Stacked bar chart";
      return h(
        "figure",
        {
          ...attrs,
          class: classNames("st-stackedBar", props.class),
          "aria-label": label,
        },
        [
          h("span", { class: "st-visually-hidden" }, label),
          h("svg", { viewBox: "0 0 320 160", "aria-hidden": "true" }, [
            ...props.data.map((bar, barIndex) => {
              let x = 16;
              const total = Math.max(bar.segments.reduce((sum, segment) => sum + segment.value, 0), 1);
              const rects = bar.segments.map((segment, index) => {
                const width = (segment.value / total) * 220;
                const rect = h("rect", {
                  key: segment.label,
                  class: classNames(
                    "st-stackedBar__seg",
                    `st-stackedBar__seg--${segment.tone ?? DATA_TONES[index % DATA_TONES.length]}`,
                  ),
                  x,
                  y: "0",
                  width,
                  height: "20",
                });
                x += width;
                return rect;
              });
              return h(
                "g",
                {
                  key: bar.label,
                  transform: `translate(0 ${barIndex * 32 + 16})`,
                },
                [
                  ...rects,
                  h("text", { class: "st-stackedBar__categoryLabel", x: "250", y: "15" }, bar.label),
                ],
              );
            }),
          ]),
        ],
      );
    };
  },
});
