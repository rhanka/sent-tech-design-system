import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type DivergentBarChartTone = "positive" | "negative" | "neutral";

export type DivergentBarChartDatum = {
  label: string;
  value: number;
  tone?: DivergentBarChartTone;
};

export type DivergentBarChartProps = {
  data: DivergentBarChartDatum[];
  width?: number;
  height?: number;
  domain?: [number, number];
  format?: (value: number) => string;
  showLegend?: boolean;
  label: string;
  class?: string;
};

const MARGIN = { top: 14, right: 16, bottom: 34, left: 88 } as const;

function signFor(value: number): "positive" | "negative" | "zero" {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "zero";
}

function toneFor(datum: DivergentBarChartDatum): DivergentBarChartTone {
  if (datum.tone) return datum.tone;
  if (datum.value > 0) return "positive";
  if (datum.value < 0) return "negative";
  return "neutral";
}

function resolveDomain(data: DivergentBarChartDatum[], domain?: [number, number]) {
  const plotDomain =
    domain && Number.isFinite(domain[0]) && Number.isFinite(domain[1]) && domain[0] < domain[1] && domain[0] <= 0 && domain[1] >= 0
      ? domain
      : null;

  if (plotDomain) {
    const ticks = niceTicks(plotDomain[0], plotDomain[1]).filter((tick) => tick >= plotDomain[0] && tick <= plotDomain[1]);
    return { domainMin: plotDomain[0], domainMax: plotDomain[1], ticks: ticks.length ? ticks : [0] };
  }

  const maxAbs = Math.max(1, ...data.map((d) => Math.abs(d.value)));
  const ticks = niceTicks(-maxAbs, maxAbs);
  return { domainMin: ticks[0], domainMax: ticks[ticks.length - 1], ticks };
}

export const DivergentBarChart = defineComponent({
  name: "DivergentBarChart",
  props: {
    data: { type: Array as () => DivergentBarChartDatum[], required: true },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 260 },
    domain: { type: Array as unknown as () => [number, number], default: undefined },
    format: { type: Function as unknown as () => (value: number) => string, default: undefined },
    showLegend: { type: Boolean, default: true },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const hoveredIndex = ref<number | null>(null);

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
      const height = props.height ?? 260;
      const formatter = props.format ?? formatTick;
      const validData = props.data.filter((d) => Number.isFinite(d.value));
      const { domainMin, domainMax, ticks } = resolveDomain(validData, props.domain);
      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
      const zeroAxisX = MARGIN.left + scaleLinear(0, domainMin, domainMax, 0, plotWidth);

      const bars =
        validData.length === 0
          ? []
          : validData.map((datum, index) => {
              const band = plotHeight / validData.length;
              const barHeight = Math.max(band * 0.56, 1);
              const valueX = MARGIN.left + scaleLinear(datum.value, domainMin, domainMax, 0, plotWidth);
              const x = Math.min(zeroAxisX, valueX);
              const barWidth = Math.max(Math.abs(valueX - zeroAxisX), 0.5);
              const y = MARGIN.top + band * index + (band - barHeight) / 2;
              return {
                datum,
                index,
                x,
                y,
                width: barWidth,
                height: barHeight,
                cx: datum.value === 0 ? zeroAxisX : x + barWidth / 2,
                cy: y + barHeight / 2,
                sign: signFor(datum.value),
                tone: toneFor(datum),
              };
            });

      const grid = ticks.map((tick) => {
        const x = MARGIN.left + scaleLinear(tick, domainMin, domainMax, 0, plotWidth);
        return [
          h("line", { key: `g${tick}`, class: "st-divergentBarChart__grid", x1: x, x2: x, y1: MARGIN.top, y2: height - MARGIN.bottom }),
          h("text", { key: `t${tick}`, class: "st-divergentBarChart__tickLabel", x, y: height - MARGIN.bottom + 16, "text-anchor": "middle" }, formatTick(tick)),
        ];
      });

      const barNodes = bars.flatMap((bar) => [
        h(
          "text",
          { key: `l${bar.datum.label}`, class: "st-divergentBarChart__categoryLabel", x: MARGIN.left - 8, y: bar.cy, "text-anchor": "end", "dominant-baseline": "middle" },
          bar.datum.label,
        ),
        h("rect", {
          key: `b${bar.datum.label}`,
          class: classNames("st-divergentBarChart__bar", `st-divergentBarChart__bar--${bar.sign}`, `st-divergentBarChart__bar--${bar.tone}`),
          x: bar.x,
          y: bar.y,
          width: bar.width,
          height: bar.height,
          rx: "2",
          "data-chart-index": bar.index,
          "data-chart-key": bar.datum.label,
          onPointermove: handleVisualPointerMove,
        }),
      ]);

      const hoveredBar = hoveredIndex.value !== null ? bars[hoveredIndex.value] : undefined;

      return h("div", { ...attrs, class: classNames("st-divergentBarChart", props.class) }, [
        h(
          "div",
          {
            class: "st-divergentBarChart__visual",
            role: "img",
            "aria-label": props.label,
            onPointermove: handleVisualPointerMove,
            onPointerleave: () => {
              hoveredIndex.value = null;
            },
          },
          [
            h(
              "svg",
              { viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: "xMidYMid meet", width: "100%", height: "100%", focusable: "false", "aria-hidden": "true" },
              [
                grid,
                h("line", { class: "st-divergentBarChart__axis", x1: MARGIN.left, x2: width - MARGIN.right, y1: height - MARGIN.bottom, y2: height - MARGIN.bottom }),
                h("line", { class: "st-divergentBarChart__zeroAxis", x1: zeroAxisX, x2: zeroAxisX, y1: MARGIN.top, y2: height - MARGIN.bottom }),
                barNodes,
              ],
            ),
          ],
        ),
        chartDataList(props.label, validData.map((d) => `${d.label}: ${formatter(d.value)}`)),
        hoveredBar
          ? h(
              "div",
              {
                class: "st-divergentBarChart__tooltip",
                role: "presentation",
                style: { left: `${(hoveredBar.cx / width) * 100}%`, top: `${(hoveredBar.cy / height) * 100}%` },
              },
              [
                h("span", { class: "st-divergentBarChart__tooltipLabel" }, hoveredBar.datum.label),
                h("span", { class: "st-divergentBarChart__tooltipValue" }, formatter(hoveredBar.datum.value)),
              ],
            )
          : null,
        props.showLegend
          ? h("ul", { class: "st-divergentBarChart__legend" }, [
              h("li", { class: "st-divergentBarChart__legendItem" }, [
                h("span", { class: "st-divergentBarChart__legendSwatch st-divergentBarChart__legendSwatch--positive", "aria-hidden": "true" }),
                "Positive",
              ]),
              h("li", { class: "st-divergentBarChart__legendItem" }, [
                h("span", { class: "st-divergentBarChart__legendSwatch st-divergentBarChart__legendSwatch--negative", "aria-hidden": "true" }),
                "Negative",
              ]),
              h("li", { class: "st-divergentBarChart__legendItem" }, [
                h("span", { class: "st-divergentBarChart__legendSwatch st-divergentBarChart__legendSwatch--neutral", "aria-hidden": "true" }),
                "Zero",
              ]),
            ])
          : null,
      ]);
    };
  },
});
