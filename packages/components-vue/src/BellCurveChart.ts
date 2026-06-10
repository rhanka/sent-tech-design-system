import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import {
  CHART_MARGIN,
  buildLinearPath,
  buildSmoothPath,
  chartDataList,
  formatTick,
  niceTicks,
  scaleLinear,
} from "./chartScale.js";

export type BellCurveChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type BellCurveChartProps = {
  data: number[];
  width?: number;
  height?: number;
  tone?: BellCurveChartTone;
  smooth?: boolean;
  intervals?: number;
  label: string;
  class?: string;
};

const MARGIN = { ...CHART_MARGIN };
const SQRT_2PI = Math.sqrt(2 * Math.PI);

let gradientCounter = 0;

// Sample statistics: μ = mean, σ = sample standard deviation (n-1). Returns
// null when fewer than two finite values exist or σ collapses to 0.
function computeStats(sample: number[]): { mean: number; sd: number; n: number } | null {
  const n = sample.length;
  if (n < 2) return null;
  const mean = sample.reduce((a, b) => a + b, 0) / n;
  const variance = sample.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (n - 1);
  const sd = Math.sqrt(variance);
  if (!(sd > 0) || !Number.isFinite(sd)) return null;
  return { mean, sd, n };
}

function pdf(x: number, mean: number, sd: number): number {
  const z = (x - mean) / sd;
  return Math.exp(-(z * z) / 2) / (sd * SQRT_2PI);
}

function roundStat(v: number): number {
  return Math.round(v * 100) / 100;
}

export const BellCurveChart = defineComponent({
  name: "BellCurveChart",
  props: {
    data: { type: Array as () => number[], default: () => [] },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 240 },
    tone: { type: String as () => BellCurveChartTone, default: "category1" },
    smooth: { type: Boolean, default: true },
    intervals: { type: Number, default: 64 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const hoveredIndex = ref<number | null>(null);
    const gradientId = `st-bellcurve-gradient-${(gradientCounter++).toString(36)}-${Math.random().toString(36).substring(2, 9)}`;

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
      const width = props.width ?? 480;
      const height = props.height ?? 240;
      const tone = props.tone ?? "category1";
      const smooth = props.smooth ?? true;
      const label = props.label;

      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      // Finite values only.
      const sample = (props.data ?? []).filter((d) => Number.isFinite(d));
      const stats = computeStats(sample);

      const sampleCount = Math.max(8, Math.floor(props.intervals ?? 64) || 64);

      const xDomain = stats
        ? { min: stats.mean - 4 * stats.sd, max: stats.mean + 4 * stats.sd }
        : { min: 0, max: 1 };

      // Peak density at x=μ: pdf(μ) = 1/(σ·√(2π)).
      const yMax = stats ? pdf(stats.mean, stats.mean, stats.sd) : 1;
      const yDomain = { min: 0, max: yMax * 1.08 };

      const xTicks = stats ? niceTicks(xDomain.min, xDomain.max, 5) : [0];

      const baseY = MARGIN.top + plotHeight;

      type CurvePoint = { x: number; y: number; vx: number };
      let curvePoints: CurvePoint[] = [];
      if (stats) {
        for (let i = 0; i <= sampleCount; i++) {
          const vx = xDomain.min + ((xDomain.max - xDomain.min) * i) / sampleCount;
          const vy = pdf(vx, stats.mean, stats.sd);
          curvePoints.push({
            x: MARGIN.left + scaleLinear(vx, xDomain.min, xDomain.max, 0, plotWidth),
            y: MARGIN.top + scaleLinear(vy, yDomain.min, yDomain.max, plotHeight, 0),
            vx,
          });
        }
      }

      const linePath =
        curvePoints.length === 0 ? "" : smooth ? buildSmoothPath(curvePoints) : buildLinearPath(curvePoints);

      let areaPath = "";
      if (curvePoints.length !== 0) {
        const first = curvePoints[0];
        const last = curvePoints[curvePoints.length - 1];
        areaPath = `${linePath} L${last.x.toFixed(2)},${baseY.toFixed(2)} L${first.x.toFixed(2)},${baseY.toFixed(2)} Z`;
      }

      const meanMark = stats
        ? {
            x: MARGIN.left + scaleLinear(stats.mean, xDomain.min, xDomain.max, 0, plotWidth),
            yTop: MARGIN.top + scaleLinear(yMax, yDomain.min, yDomain.max, plotHeight, 0),
          }
        : null;

      const sdMarks = stats
        ? [-2, -1, 1, 2].map((k) => {
            const vx = stats.mean + k * stats.sd;
            const vy = pdf(vx, stats.mean, stats.sd);
            return {
              k,
              x: MARGIN.left + scaleLinear(vx, xDomain.min, xDomain.max, 0, plotWidth),
              yTop: MARGIN.top + scaleLinear(vy, yDomain.min, yDomain.max, plotHeight, 0),
            };
          })
        : [];

      const gridLines = xTicks.map((tick) => ({
        value: tick,
        x: MARGIN.left + scaleLinear(tick, xDomain.min, xDomain.max, 0, plotWidth),
      }));

      const dataValueItems = stats
        ? [
            `Moyenne (μ): ${roundStat(stats.mean)}`,
            `Écart-type (σ): ${roundStat(stats.sd)}`,
            `Taille de l'échantillon (n): ${stats.n}`,
          ]
        : [
            sample.length < 2
              ? "Échantillon insuffisant (au moins 2 valeurs requises)"
              : "Écart-type nul (valeurs identiques)",
          ];

      const ariaLabel = stats
        ? `${label} — μ ${roundStat(stats.mean)}, σ ${roundStat(stats.sd)}, n ${stats.n}`
        : label;

      const svgChildren: ReturnType<typeof h>[] = [
        h("defs", {}, [
          h("linearGradient", { id: gradientId, x1: "0", y1: "0", x2: "0", y2: "1" }, [
            h("stop", { offset: "0%", "stop-color": "currentColor", "stop-opacity": "0.3" }),
            h("stop", { offset: "100%", "stop-color": "currentColor", "stop-opacity": "0.0" }),
          ]),
        ]),
      ];

      for (const g of gridLines) {
        svgChildren.push(
          h("line", { key: `g${g.value}`, class: "st-bellCurveChart__grid", x1: g.x, x2: g.x, y1: MARGIN.top, y2: baseY }),
          h(
            "text",
            { key: `t${g.value}`, class: "st-bellCurveChart__tickLabel", x: g.x, y: baseY + 16, "text-anchor": "middle" },
            formatTick(g.value),
          ),
        );
      }

      svgChildren.push(
        h("line", { class: "st-bellCurveChart__axis", x1: MARGIN.left, x2: MARGIN.left, y1: MARGIN.top, y2: baseY }),
        h("line", { class: "st-bellCurveChart__axis", x1: MARGIN.left, x2: width - MARGIN.right, y1: baseY, y2: baseY }),
      );

      if (areaPath) {
        svgChildren.push(h("path", { class: "st-bellCurveChart__area", d: areaPath, fill: `url(#${gradientId})` }));
      }
      if (linePath) {
        svgChildren.push(
          h("path", {
            class: "st-bellCurveChart__line",
            d: linePath,
            fill: "none",
            "stroke-width": 2,
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
          }),
        );
      }

      for (const m of sdMarks) {
        svgChildren.push(
          h("line", { key: `s${m.k}`, class: "st-bellCurveChart__sdMark", x1: m.x, x2: m.x, y1: m.yTop, y2: baseY }),
        );
      }

      if (meanMark) {
        svgChildren.push(
          h("line", { class: "st-bellCurveChart__mean", x1: meanMark.x, x2: meanMark.x, y1: meanMark.yTop, y2: baseY }),
          h(
            "text",
            { class: "st-bellCurveChart__meanLabel", x: meanMark.x, y: MARGIN.top - 2, "text-anchor": "middle" },
            "μ",
          ),
        );
      }

      curvePoints.forEach((p, i) => {
        svgChildren.push(
          h("circle", { key: `h${i}`, class: "st-bellCurveChart__hit", cx: p.x, cy: p.y, r: 6, "data-chart-index": i }),
        );
      });

      const hoveredPoint = hoveredIndex.value !== null ? curvePoints[hoveredIndex.value] : undefined;

      return h("div", { ...attrs, class: classNames("st-bellCurveChart", `st-bellCurveChart--${tone}`, props.class) }, [
        h(
          "div",
          {
            class: "st-bellCurveChart__visual",
            role: "img",
            "aria-label": ariaLabel,
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
        chartDataList(ariaLabel, dataValueItems),
        hoveredPoint && stats
          ? h(
              "div",
              {
                class: "st-bellCurveChart__tooltip",
                role: "presentation",
                style: `left: ${(hoveredPoint.x / width) * 100}%; top: ${(hoveredPoint.y / height) * 100}%`,
              },
              [
                h("span", { class: "st-bellCurveChart__tooltipLabel" }, `x ≈ ${roundStat(hoveredPoint.vx)}`),
                h(
                  "span",
                  { class: "st-bellCurveChart__tooltipValue" },
                  `densité ${hoveredPoint.y === baseY ? 0 : roundStat(pdf(hoveredPoint.vx, stats.mean, stats.sd))}`,
                ),
              ],
            )
          : null,
      ]);
    };
  },
});
