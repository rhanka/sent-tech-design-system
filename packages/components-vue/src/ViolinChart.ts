import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";

export type ViolinChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ViolinChartDatum = {
  label: string;
  values: number[];
  tone?: ViolinChartTone;
};

export type ViolinChartProps = {
  data: ViolinChartDatum[];
  bins?: number;
  quartiles?: boolean;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const MARGIN = { top: 16, right: 20, bottom: 38, left: 48 } as const;
const TONES: ViolinChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.?0+$/, "");
}

function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number): number {
  if (d1 === d0) return r0;
  return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const next = sorted[base + 1];
  return next !== undefined ? sorted[base] + rest * (next - sorted[base]) : sorted[base];
}

export const ViolinChart = defineComponent({
  name: "ViolinChart",
  props: {
    data: { type: Array as () => ViolinChartDatum[], required: true },
    bins: { type: Number, default: 20 },
    quartiles: { type: Boolean, default: true },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 280 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const hoveredIndex = ref<number | null>(null);

    function handleLeave() {
      hoveredIndex.value = null;
    }

    function handleVisualPointerMove(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) {
        hoveredIndex.value = null;
        return;
      }
      const index = Number(target.getAttribute("data-chart-index"));
      hoveredIndex.value = Number.isInteger(index) ? index : null;
    }

    return () => {
      const data = props.data ?? [];
      const width = props.width ?? 480;
      const height = props.height ?? 280;
      const quartiles = props.quartiles ?? true;
      const label = props.label;

      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
      const binCount = Math.max(1, Math.floor(props.bins ?? 20));

      const cleaned = data
        .map((datum, index) => ({ datum, index, finite: datum.values.filter(Number.isFinite) }))
        .filter((entry) => entry.finite.length > 0);

      const all = cleaned.flatMap((entry) => entry.finite);
      let domainMin = 0;
      let domainMax = 1;
      if (all.length > 0) {
        const min = Math.min(...all);
        const max = Math.max(...all);
        if (min === max) {
          const pad = Math.max(Math.abs(max), 1) * 0.1;
          domainMin = min - pad;
          domainMax = max + pad;
        } else {
          const pad = (max - min) * 0.06;
          domainMin = min - pad;
          domainMax = max + pad;
        }
      }

      const band = cleaned.length > 0 ? plotWidth / cleaned.length : plotWidth;
      const halfWidth = Math.min(54, Math.max(14, band * 0.36));
      const step = (domainMax - domainMin) / binCount;
      const yOf = (value: number) => MARGIN.top + scaleLinear(value, domainMin, domainMax, plotHeight, 0);

      const violins = cleaned.map((entry, position) => {
        const cx = MARGIN.left + band * (position + 0.5);
        const tone = entry.datum.tone ?? TONES[entry.index % TONES.length];

        const counts = new Array<number>(binCount).fill(0);
        for (const value of entry.finite) {
          const raw = step > 0 ? Math.floor((value - domainMin) / step) : 0;
          const bin = Math.max(0, Math.min(binCount - 1, raw));
          counts[bin] += 1;
        }
        const maxCount = Math.max(1, ...counts);

        const profile = counts.map((count, bin) => {
          const center = domainMin + step * (bin + 0.5);
          return { y: yOf(center), w: (count / maxCount) * halfWidth };
        });

        const right = profile.map((p) => `${cx + p.w},${p.y}`);
        const left = [...profile].reverse().map((p) => `${cx - p.w},${p.y}`);
        const path = `M ${right.join(" L ")} L ${left.join(" L ")} Z`;

        const sorted = [...entry.finite].sort((a, b) => a - b);
        const median = quantile(sorted, 0.5);
        const q1 = quantile(sorted, 0.25);
        const q3 = quantile(sorted, 0.75);

        return {
          datum: entry.datum,
          tone,
          cx,
          path,
          n: entry.finite.length,
          min: sorted[0],
          max: sorted[sorted.length - 1],
          median,
          medianY: yOf(median),
          q1Y: yOf(q1),
          q3Y: yOf(q3),
          boxWidth: Math.max(halfWidth * 0.4, 4),
        };
      });

      const svgChildren: ReturnType<typeof h>[] = [];

      svgChildren.push(
        h("line", { class: "st-violinChart__axis", x1: MARGIN.left, x2: MARGIN.left, y1: MARGIN.top, y2: height - MARGIN.bottom }),
        h("line", { class: "st-violinChart__axis", x1: MARGIN.left, x2: width - MARGIN.right, y1: height - MARGIN.bottom, y2: height - MARGIN.bottom }),
      );

      violins.forEach((violin, i) => {
        const isDim = hoveredIndex.value !== null && hoveredIndex.value !== i;
        svgChildren.push(
          h("path", {
            key: `v${violin.datum.label}`,
            class: classNames(
              "st-violinChart__shape",
              `st-violinChart__shape--${violin.tone}`,
              isDim ? "st-violinChart__shape--dim" : undefined,
            ),
            d: violin.path,
            "data-chart-index": i,
          }),
        );
        if (quartiles) {
          svgChildren.push(
            h("rect", {
              key: `box${violin.datum.label}`,
              class: "st-violinChart__box",
              x: violin.cx - violin.boxWidth / 2,
              y: Math.min(violin.q1Y, violin.q3Y),
              width: violin.boxWidth,
              height: Math.max(Math.abs(violin.q1Y - violin.q3Y), 1),
              "data-chart-index": i,
            }),
            h("line", {
              key: `med${violin.datum.label}`,
              class: "st-violinChart__median",
              x1: violin.cx - violin.boxWidth / 2,
              x2: violin.cx + violin.boxWidth / 2,
              y1: violin.medianY,
              y2: violin.medianY,
              "data-chart-index": i,
            }),
          );
        }
        svgChildren.push(
          h(
            "text",
            {
              key: `lbl${violin.datum.label}`,
              class: "st-violinChart__label",
              x: violin.cx,
              y: height - MARGIN.bottom + 16,
              "text-anchor": "middle",
            },
            violin.datum.label,
          ),
        );
      });

      const dataValueItems = violins.map(
        (v) =>
          `${v.datum.label}: ${v.n} points, min ${formatNumber(v.min)}, median ${formatNumber(v.median)}, max ${formatNumber(v.max)}`,
      );
      const hovered = hoveredIndex.value !== null ? violins[hoveredIndex.value] : undefined;

      return h("div", { ...attrs, class: classNames("st-violinChart", props.class) }, [
        h(
          "div",
          {
            class: "st-violinChart__visual",
            role: "img",
            "aria-label": label,
            onPointermove: handleVisualPointerMove,
            onPointerleave: handleLeave,
          },
          [
            h(
              "svg",
              {
                viewBox: `0 0 ${width} ${height}`,
                preserveAspectRatio: "xMidYMid meet",
                width: "100%",
                height: "100%",
                focusable: "false",
                "aria-hidden": "true",
              },
              svgChildren,
            ),
          ],
        ),
        chartDataList(label, dataValueItems),
        hovered
          ? h(
              "div",
              {
                class: "st-violinChart__tooltip",
                role: "presentation",
                style: `left: ${(hovered.cx / width) * 100}%; top: ${(hovered.medianY / height) * 100}%`,
              },
              [
                h("span", { class: "st-violinChart__tooltipLabel" }, hovered.datum.label),
                h("span", { class: "st-violinChart__tooltipValue" }, `Median ${formatNumber(hovered.median)}`),
              ],
            )
          : null,
      ]);
    };
  },
});
