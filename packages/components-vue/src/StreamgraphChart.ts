import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { buildLinearPath, buildSmoothPath, chartDataList, scaleLinear } from "./chartScale.js";

export type StreamgraphChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type StreamgraphChartSeriesValue = {
  label: string;
  value: number;
  tone?: StreamgraphChartTone;
};

export type StreamgraphChartDatum = {
  category: string;
  values: StreamgraphChartSeriesValue[];
};

export type StreamgraphChartProps = {
  data: StreamgraphChartDatum[];
  width?: number;
  height?: number;
  label: string;
  smooth?: boolean;
  showLegend?: boolean;
  class?: string;
};

const MARGIN = { top: 12, right: 16, bottom: 32, left: 16 } as const;

const TONES: StreamgraphChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

// Valeur non-finie ou négative → 0 (le streamgraph empile des grandeurs ≥ 0).
const safeValue = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0);

export const StreamgraphChart = defineComponent({
  name: "StreamgraphChart",
  props: {
    data: { type: Array as () => StreamgraphChartDatum[], default: () => [] },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 240 },
    label: { type: String, required: true },
    smooth: { type: Boolean, default: true },
    showLegend: { type: Boolean, default: true },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const hovered = ref<number | null>(null);

    function handleLeave() {
      hovered.value = null;
    }
    function handleVisualPointerMove(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) {
        hovered.value = null;
        return;
      }
      const si = Number(target.getAttribute("data-series-index"));
      hovered.value = Number.isInteger(si) ? si : null;
    }

    return () => {
      const width = props.width ?? 480;
      const height = props.height ?? 240;
      const smooth = props.smooth ?? true;
      const showLegend = props.showLegend ?? true;
      const label = props.label;
      const data = props.data ?? [];

      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      const seen = new Map<string, StreamgraphChartTone>();
      data.forEach((d) =>
        d.values.forEach((sv) => {
          if (!seen.has(sv.label)) seen.set(sv.label, sv.tone ?? TONES[seen.size % TONES.length]);
        }),
      );
      const series = [...seen.entries()].map(([seriesLabel, tone]) => ({ seriesLabel, tone }));

      let halfMaxRaw = 0;
      for (const d of data) {
        let sum = 0;
        for (const sv of d.values) sum += safeValue(sv.value);
        if (sum > halfMaxRaw) halfMaxRaw = sum;
      }
      const halfMax = halfMaxRaw / 2 || 1;

      const n = data.length;
      const xs = data.map((_, i) => {
        const denom = Math.max(n - 1, 1);
        const xRatio = n === 1 ? 0.5 : i / denom;
        return MARGIN.left + xRatio * plotWidth;
      });
      const midY = MARGIN.top + plotHeight / 2;
      const valToY = (signed: number) => midY - scaleLinear(signed, 0, halfMax, 0, plotHeight / 2);

      const bands: { x: number; top: number; bottom: number }[][] = series.map(() => []);
      data.forEach((d, xi) => {
        const total = d.values.reduce((s, sv) => s + safeValue(sv.value), 0);
        let acc = -total / 2;
        series.forEach((s, si) => {
          const sv = d.values.find((v) => v.label === s.seriesLabel);
          const v = sv ? safeValue(sv.value) : 0;
          const lower = acc;
          const upper = acc + v;
          acc = upper;
          bands[si].push({ x: xs[xi], top: valToY(upper), bottom: valToY(lower) });
        });
      });

      const areas = series.map((s, si) => {
        const band = bands[si];
        if (!band || band.length === 0) return { tone: s.tone, seriesLabel: s.seriesLabel, d: "" };
        const topPts = band.map((b) => ({ x: b.x, y: b.top }));
        const bottomPts = band.map((b) => ({ x: b.x, y: b.bottom })).reverse();
        const topPath = smooth ? buildSmoothPath(topPts) : buildLinearPath(topPts);
        const bottomPath = (smooth ? buildSmoothPath(bottomPts) : buildLinearPath(bottomPts)).replace(/^M/, "L");
        return { tone: s.tone, seriesLabel: s.seriesLabel, d: `${topPath} ${bottomPath} Z` };
      });

      let xTickEntries: { x: number; label: string }[] = [];
      if (n !== 0) {
        const target = Math.min(5, n);
        const stride = Math.max(1, Math.round((n - 1) / (target - 1 || 1)));
        for (let i = 0; i < n; i += stride) xTickEntries.push({ x: xs[i], label: data[i].category });
        const lastIdx = n - 1;
        if (xTickEntries[xTickEntries.length - 1]?.label !== data[lastIdx].category) {
          xTickEntries.push({ x: xs[lastIdx], label: data[lastIdx].category });
        }
      }

      const dataValueItems = series.map((s) => {
        const total = data.reduce((sum, d) => {
          const sv = d.values.find((v) => v.label === s.seriesLabel);
          return sum + (sv ? safeValue(sv.value) : 0);
        }, 0);
        return `${s.seriesLabel}: ${total}`;
      });
      const grand = data.reduce((sum, d) => sum + d.values.reduce((s, sv) => s + safeValue(sv.value), 0), 0);
      if (series.length > 0) dataValueItems.push(`Total: ${grand}`);

      const svgChildren: ReturnType<typeof h>[] = [
        h("line", {
          class: "st-streamgraphChart__axis",
          x1: MARGIN.left,
          x2: width - MARGIN.right,
          y1: height - MARGIN.bottom,
          y2: height - MARGIN.bottom,
        }),
      ];

      xTickEntries.forEach((tick, i) => {
        svgChildren.push(
          h(
            "text",
            { key: `x${i}`, class: "st-streamgraphChart__tickLabel", x: tick.x, y: height - MARGIN.bottom + 16, "text-anchor": "middle" },
            tick.label,
          ),
        );
      });

      areas.forEach((area, si) => {
        if (!area.d) return;
        svgChildren.push(
          h("path", {
            key: area.seriesLabel,
            class: classNames(
              "st-streamgraphChart__area",
              `st-streamgraphChart__area--${area.tone}`,
              hovered.value !== null && hovered.value !== si && "st-streamgraphChart__area--dim",
            ),
            d: area.d,
            "data-series-index": si,
          }),
        );
      });

      let tooltip: { label: string; value: number; cx: number; cy: number } | null = null;
      if (hovered.value !== null && series[hovered.value]) {
        const s = series[hovered.value];
        const band = bands[hovered.value];
        if (band && band.length > 0) {
          const mid = band[Math.floor(band.length / 2)];
          const total = data.reduce((sum, d) => {
            const sv = d.values.find((v) => v.label === s.seriesLabel);
            return sum + (sv ? safeValue(sv.value) : 0);
          }, 0);
          tooltip = { label: s.seriesLabel, value: total, cx: mid.x, cy: (mid.top + mid.bottom) / 2 };
        }
      }

      return h("div", { ...attrs, class: classNames("st-streamgraphChart", props.class) }, [
        h(
          "div",
          {
            class: "st-streamgraphChart__visual",
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
        tooltip
          ? h(
              "div",
              {
                class: "st-streamgraphChart__tooltip",
                role: "presentation",
                style: `left: ${(tooltip.cx / width) * 100}%; top: ${(tooltip.cy / height) * 100}%`,
              },
              [
                h("span", { class: "st-streamgraphChart__tooltipLabel" }, tooltip.label),
                h("span", { class: "st-streamgraphChart__tooltipValue" }, String(tooltip.value)),
              ],
            )
          : null,
        showLegend && series.length > 0
          ? h(
              "ul",
              { class: "st-streamgraphChart__legend" },
              series.map((item) =>
                h("li", { key: item.seriesLabel, class: "st-streamgraphChart__legendItem" }, [
                  h("span", {
                    class: classNames("st-streamgraphChart__legendSwatch", `st-streamgraphChart__legendSwatch--${item.tone}`),
                    "aria-hidden": "true",
                  }),
                  item.seriesLabel,
                ]),
              ),
            )
          : null,
      ]);
    };
  },
});
