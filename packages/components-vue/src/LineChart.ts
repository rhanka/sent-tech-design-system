import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type LineChartDatum = { label?: string; x?: string | number; y?: number; value?: number; tone?: string };
export type LineChartTone = string;

export type LineChartProps = {
  data: LineChartDatum[];
  label?: string;
  width?: number;
  height?: number;
  class?: string;
};

function pointsFrom(values: Array<number | { x?: string | number; y?: number; value?: number }>, width: number, height: number): string {
  const ys = values.map((entry) => (typeof entry === "number" ? entry : (entry as { y?: number; value?: number }).y ?? (entry as { value?: number }).value ?? 0));
  const max = Math.max(...ys, 1);
  return ys
    .map((value, index) => {
      const x = ys.length === 1 ? width / 2 : (index / (ys.length - 1)) * width;
      const y = height - (value / max) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

export const LineChart = defineComponent({
  name: "LineChart",
  props: {
    data: { type: Array as () => LineChartDatum[], required: true },
    label: { type: String, default: undefined },
    width: { type: Number, default: 320 },
    height: { type: Number, default: 160 },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const width = props.width ?? 320;
      const height = props.height ?? 160;
      const points = pointsFrom(props.data, width, height);
      const accessibleLabel = props.label ?? "Line chart";
      const pointsList = points.split(" ");
      return h(
        "figure",
        {
          ...attrs,
          class: classNames("st-lineChart", props.class),
          "aria-label": accessibleLabel,
        },
        [
          h("span", { class: "st-visually-hidden" }, accessibleLabel),
          h("svg", { viewBox: `0 0 ${width} ${height}`, "aria-hidden": "true" }, [
            h("polyline", { class: "st-lineChart__line", points, fill: "none" }),
            ...props.data.map((_datum, index) =>
              h("circle", {
                key: index,
                class: "st-lineChart__dot",
                cx: pointsList[index]?.split(",")[0],
                cy: pointsList[index]?.split(",")[1],
                r: "4",
              }),
            ),
          ]),
        ],
      );
    };
  },
});
