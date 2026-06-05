import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";

export type GaugeChartTone =
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

export type GaugeChartThreshold = {
  value: number;
  tone: GaugeChartTone;
};

export type GaugeChartFormat = "number" | "percent";

export type GaugeChartProps = {
  value: number;
  min?: number;
  max?: number;
  thresholds?: GaugeChartThreshold[];
  label?: string;
  format?: GaugeChartFormat;
  unit?: string;
  size?: number;
  thickness?: number;
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

export const GaugeChart = defineComponent({
  name: "GaugeChart",
  props: {
    value: { type: Number, required: true },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    thresholds: { type: Array as () => GaugeChartThreshold[], default: undefined },
    label: { type: String, default: undefined },
    format: { type: String as () => GaugeChartFormat, default: "number" },
    unit: { type: String, default: undefined },
    size: { type: Number, default: 220 },
    thickness: { type: Number, default: 22 },
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
      const label = props.label;
      const format = props.format ?? "number";
      const unit = props.unit;
      const size = props.size ?? 220;
      const thickness = props.thickness ?? 22;
      const startAngle = props.startAngle ?? 180;
      const endAngle = props.endAngle ?? 360;

      const span = Math.max(max - min, 0);
      const clamped = Math.min(Math.max(value, min), max);
      const frac = span > 0 ? (clamped - min) / span : 0;

      const cx = size / 2;
      const r = size / 2 - thickness / 2 - 2;
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
        const yOuter = cyRaw + (r + thickness / 2) * Math.sin(a);
        minY = Math.min(minY, yOuter);
        maxY = Math.max(maxY, yOuter);
      }
      minY = Math.min(minY, cyRaw - (r + thickness / 2));
      const vbHeightRaw = Math.min(maxY, size) - Math.max(minY, 0);
      const geometry = { cy: cyRaw, vbTop: Math.max(minY, 0), vbHeight: Math.max(vbHeightRaw, thickness) };
      const cy = geometry.cy;

      const arcPath = (fromFrac: number, toFrac: number): string => {
        const from = a0 + totalAngle * fromFrac;
        const to = a0 + totalAngle * toFrac;
        const [x0, y0] = polar(r, from, cx, cy);
        const [x1, y1] = polar(r, to, cx, cy);
        const large = Math.abs(to - from) > Math.PI ? 1 : 0;
        const sweep = totalAngle >= 0 ? 1 : 0;
        return `M ${x0} ${y0} A ${r} ${r} 0 ${large} ${sweep} ${x1} ${y1}`;
      };

      type Band = { from: number; to: number; tone: GaugeChartTone };
      let bands: Band[] = [];
      if (thresholds && thresholds.length > 0 && span > 0) {
        const sorted = [...thresholds].sort((a, b) => a.value - b.value);
        const segments: Band[] = [];
        let start = min;
        for (const t of sorted) {
          const end = Math.min(Math.max(t.value, min), max);
          if (end <= start) continue;
          segments.push({ from: (start - min) / span, to: (end - min) / span, tone: t.tone });
          start = end;
        }
        if (start < max) {
          const lastTone = sorted[sorted.length - 1]?.tone ?? "neutral";
          segments.push({ from: (start - min) / span, to: 1, tone: lastTone });
        }
        bands = segments;
      }

      const needleAngle = a0 + totalAngle * frac;
      const tip = polar(r + thickness / 2, needleAngle, cx, cy);
      const leftPt = polar(thickness * 0.18, needleAngle + Math.PI / 2, cx, cy);
      const rightPt = polar(thickness * 0.18, needleAngle - Math.PI / 2, cx, cy);
      const needle = `M ${leftPt[0]} ${leftPt[1]} L ${tip[0]} ${tip[1]} L ${rightPt[0]} ${rightPt[1]} Z`;

      let formatted: string;
      if (format === "percent") {
        const pct = span > 0 ? Math.round(frac * 100) : 0;
        formatted = `${pct}%`;
      } else {
        const num = Number.isInteger(clamped) ? String(clamped) : clamped.toFixed(1);
        formatted = unit ? `${num} ${unit}` : num;
      }

      // Inclure la bande de seuil active dans aria-valuetext (a11y : zone succès/alerte/erreur).
      let activeBandLabel: string | undefined;
      if (bands.length > 0) {
        const activeBand = bands.find((b) => b.to >= frac && b.from <= frac) ?? bands[bands.length - 1];
        if (activeBand) activeBandLabel = activeBand.tone;
      }
      const ariaValueText = [label ? `${label}: ${formatted}` : formatted, activeBandLabel ? `zone ${activeBandLabel}` : undefined]
        .filter(Boolean)
        .join(", ");
      const dataValueItems = [`${label ? `${label}: ` : ""}${formatted} (min ${min}, max ${max})`];

      const svgChildren: ReturnType<typeof h>[] = [
        h("path", { class: "st-gaugeChart__track", d: arcPath(0, 1), fill: "none", "stroke-width": thickness }),
      ];

      bands.forEach((band, i) => {
        svgChildren.push(
          h("path", {
            key: `band${i}`,
            class: `st-gaugeChart__band st-gaugeChart__band--${band.tone}`,
            d: arcPath(band.from, band.to),
            fill: "none",
            "stroke-width": thickness,
          }),
        );
      });

      if (bands.length === 0) {
        svgChildren.push(
          h("path", { class: "st-gaugeChart__progress", d: arcPath(0, frac), fill: "none", "stroke-width": thickness }),
        );
      }

      svgChildren.push(
        h("path", { class: "st-gaugeChart__needle", d: needle }),
        h("circle", { class: "st-gaugeChart__hub", cx, cy, r: Math.max(thickness * 0.22, 4) }),
        h(
          "text",
          { class: "st-gaugeChart__value", x: cx, y: cy - thickness * 0.55, "text-anchor": "middle", "dominant-baseline": "auto" },
          formatted,
        ),
      );
      if (label) {
        svgChildren.push(
          h(
            "text",
            { class: "st-gaugeChart__label", x: cx, y: cy - thickness * 0.05, "text-anchor": "middle", "dominant-baseline": "hanging" },
            label,
          ),
        );
      }

      return h("div", { ...attrs, class: classNames("st-gaugeChart", props.class) }, [
        h(
          "div",
          {
            class: "st-gaugeChart__visual",
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
