import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type SparklineTone = "neutral" | "success" | "warning" | "error";

export type SparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  tone?: SparklineTone;
  strokeWidth?: number;
  area?: boolean;
  label?: string;
  class?: string;
};

const PADDING = 2;

export const Sparkline = defineComponent({
  name: "Sparkline",
  props: {
    data: { type: Array as () => number[], required: true },
    width: { type: Number, default: 120 },
    height: { type: Number, default: 28 },
    tone: { type: String as () => SparklineTone, default: "neutral" },
    strokeWidth: { type: Number, default: 1.5 },
    area: { type: Boolean, default: false },
    label: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const width = props.width ?? 120;
      const height = props.height ?? 28;
      const tone = props.tone ?? "neutral";
      const strokeWidth = props.strokeWidth ?? 1.5;
      const area = props.area ?? false;
      const label = props.label;
      const data = props.data;

      let line = "";
      let areaPath = "";
      if (data && data.length !== 0) {
        const min = Math.min(...data);
        const max = Math.max(...data);
        const span = max - min || 1;
        const innerWidth = Math.max(width - PADDING * 2, 1);
        const innerHeight = Math.max(height - PADDING * 2, 1);
        const step = data.length > 1 ? innerWidth / (data.length - 1) : 0;
        const pts = data.map((value, index) => {
          const x = PADDING + step * index;
          const normalised = (value - min) / span;
          const y = PADDING + (1 - normalised) * innerHeight;
          return { x, y };
        });
        line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
        const baseline = height - PADDING;
        const first = pts[0];
        const last = pts[pts.length - 1];
        areaPath = `${line} L${last.x.toFixed(2)},${baseline.toFixed(2)} L${first.x.toFixed(2)},${baseline.toFixed(2)} Z`;
      }

      const svgChildren: ReturnType<typeof h>[] = [];
      if (area && areaPath) {
        svgChildren.push(h("path", { d: areaPath, class: "st-sparkline__area" }));
      }
      if (line) {
        svgChildren.push(
          h("path", {
            d: line,
            class: "st-sparkline__line",
            fill: "none",
            "stroke-width": strokeWidth,
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
          }),
        );
      }

      return h(
        "span",
        {
          ...attrs,
          class: classNames("st-sparkline", `st-sparkline--${tone}`, props.class),
          role: "img",
          "aria-label": label,
        },
        [
          h(
            "svg",
            {
              width,
              height,
              viewBox: `0 0 ${width} ${height}`,
              preserveAspectRatio: "none",
              "aria-hidden": label ? "true" : undefined,
              focusable: "false",
            },
            svgChildren,
          ),
        ],
      );
    };
  },
});
