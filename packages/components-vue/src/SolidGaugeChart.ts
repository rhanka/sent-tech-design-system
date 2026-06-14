import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";

export type SolidGaugeTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type SolidGaugeThreshold = {
  value: number;
  tone: SolidGaugeTone;
};

export type SolidGaugeFormat = "number" | "percent";

export type SolidGaugeChartProps = {
  value: number;
  min?: number;
  max?: number;
  thresholds?: SolidGaugeThreshold[];
  innerRadius?: number;
  label?: string;
  format?: SolidGaugeFormat;
  unit?: string;
  size?: number;
  startAngle?: number;
  endAngle?: number;
  class?: string;
};

const toRad = (deg: number) => (deg * Math.PI) / 180;

const polar = (
  radius: number,
  angle: number,
  centerX: number,
  centerY: number,
): [number, number] => [centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle)];

export const SolidGaugeChart = defineComponent({
  name: "SolidGaugeChart",
  props: {
    value: { type: Number, required: true },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    thresholds: { type: Array as () => SolidGaugeThreshold[], default: undefined },
    innerRadius: { type: Number, default: 0.72 },
    label: { type: String, default: undefined },
    format: { type: String as () => SolidGaugeFormat, default: "number" },
    unit: { type: String, default: undefined },
    size: { type: Number, default: 220 },
    startAngle: { type: Number, default: 180 },
    endAngle: { type: Number, default: 360 },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const value = props.value;
      const min = props.min ?? 0;
      const max = props.max ?? 100;
      const thresholds = props.thresholds;
      const innerRadius = props.innerRadius ?? 0.72;
      const label = props.label;
      const format = props.format ?? "number";
      const unit = props.unit;
      const size = props.size ?? 220;
      const startAngle = props.startAngle ?? 180;
      const endAngle = props.endAngle ?? 360;

      const span = Math.max(max - min, 0);
      const clamped = Math.min(Math.max(value, min), max);
      const frac = span > 0 ? (clamped - min) / span : 0;

      const cx = size / 2;
      const r = size / 2 - 2;
      const innerR = Math.min(Math.max(innerRadius, 0), 0.95) * r;
      const thickness = Math.max(r - innerR, 1);
      const trackR = (r + innerR) / 2;
      const a0 = toRad(startAngle);
      const a1 = toRad(endAngle);
      const totalAngle = a1 - a0;

      // Hauteur réelle de l'arc pour cadrer le viewBox.
      const cyRaw = size / 2;
      const samples = 64;
      let minY = Infinity;
      let maxY = -Infinity;
      for (let i = 0; i <= samples; i++) {
        const a = a0 + (totalAngle * i) / samples;
        const yOuter = cyRaw + r * Math.sin(a);
        minY = Math.min(minY, yOuter);
        maxY = Math.max(maxY, yOuter);
      }
      minY = Math.min(minY, cyRaw - r);
      const vbHeightRaw = Math.min(maxY, size) - Math.max(minY, 0);
      const geometry = { cy: cyRaw, vbTop: Math.max(minY, 0), vbHeight: Math.max(vbHeightRaw, thickness) };
      const cy = geometry.cy;

      const arcPath = (fromFrac: number, toFrac: number): string => {
        const from = a0 + totalAngle * fromFrac;
        const to = a0 + totalAngle * toFrac;
        const [x0, y0] = polar(trackR, from, cx, cy);
        const [x1, y1] = polar(trackR, to, cx, cy);
        const large = Math.abs(to - from) > Math.PI ? 1 : 0;
        const sweep = totalAngle >= 0 ? 1 : 0;
        return `M ${x0} ${y0} A ${trackR} ${trackR} 0 ${large} ${sweep} ${x1} ${y1}`;
      };

      // Tons triés par seuil croissant : la zone contenant la valeur teinte l'arc.
      const sortedThresholds =
        thresholds && thresholds.length > 0 && span > 0
          ? [...thresholds].sort((a, b) => a.value - b.value)
          : [];

      let activeTone: SolidGaugeTone | null = null;
      if (sortedThresholds.length > 0) {
        activeTone = sortedThresholds[0].tone;
        for (const t of sortedThresholds) {
          if (clamped >= t.value) activeTone = t.tone;
        }
      }

      let formatted: string;
      if (format === "percent") {
        const pct = span > 0 ? Math.round(frac * 100) : 0;
        formatted = `${pct}%`;
      } else {
        const num = Number.isInteger(clamped) ? String(clamped) : clamped.toFixed(1);
        formatted = unit ? `${num} ${unit}` : num;
      }

      const ariaValueText = label ? `${label}: ${formatted}` : formatted;
      const dataValueItems = [`${label ? `${label}: ` : ""}${formatted} (min ${min}, max ${max})`];

      const progressClass = activeTone
        ? `st-solidGaugeChart__progress st-solidGaugeChart__progress--${activeTone}`
        : "st-solidGaugeChart__progress";

      const svgChildren: ReturnType<typeof h>[] = [
        h("path", { class: "st-solidGaugeChart__track", d: arcPath(0, 1), fill: "none", "stroke-width": thickness }),
      ];

      if (frac > 0) {
        svgChildren.push(
          h("path", { class: progressClass, d: arcPath(0, frac), fill: "none", "stroke-width": thickness }),
        );
      }

      svgChildren.push(
        h(
          "text",
          { class: "st-solidGaugeChart__value", x: cx, y: cy - thickness * 0.1, "text-anchor": "middle", "dominant-baseline": "auto" },
          formatted,
        ),
      );
      if (label) {
        svgChildren.push(
          h(
            "text",
            { class: "st-solidGaugeChart__label", x: cx, y: cy + thickness * 0.35, "text-anchor": "middle", "dominant-baseline": "hanging" },
            label,
          ),
        );
      }

      return h("div", { ...attrs, class: classNames("st-solidGaugeChart", props.class) }, [
        h(
          "div",
          {
            class: "st-solidGaugeChart__visual",
            role: "meter",
            "aria-valuenow": clamped,
            "aria-valuemin": min,
            "aria-valuemax": max,
            "aria-valuetext": ariaValueText,
            "aria-label": label,
          },
          [
            h(
              "svg",
              {
                viewBox: `0 ${geometry.vbTop} ${size} ${geometry.vbHeight}`,
                width: "100%",
                height: "100%",
                focusable: "false",
                "aria-hidden": "true",
              },
              svgChildren,
            ),
          ],
        ),
        chartDataList(label ?? "gauge", dataValueItems),
      ]);
    };
  },
});
