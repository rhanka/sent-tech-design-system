import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";

export type HeikinAshiChartDatum = {
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type HeikinAshiChartProps = {
  data: HeikinAshiChartDatum[];
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

type HACandle = {
  label: string;
  haOpen: number;
  haHigh: number;
  haLow: number;
  haClose: number;
};

const MARGIN = { top: 12, right: 16, bottom: 32, left: 52 };

function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number): number {
  if (d1 === d0) return r0;
  return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
}

function niceTicks(min: number, max: number, target = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    const base = Number.isFinite(max) ? max : 0;
    return [base];
  }
  const range = max - min;
  const rough = range / Math.max(target - 1, 1);
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / pow;
  let step: number;
  if (norm < 1.5) step = 1 * pow;
  else if (norm < 3) step = 2 * pow;
  else if (norm < 7) step = 5 * pow;
  else step = 10 * pow;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) {
    ticks.push(Number(v.toFixed(10)));
  }
  return ticks;
}

function formatTick(v: number): string {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

function fmt(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(2);
}

// Heikin-Ashi : récurrence sur haOpen
function computeHeikinAshi(rows: HeikinAshiChartDatum[]): HACandle[] {
  const out: HACandle[] = [];
  for (let i = 0; i < rows.length; i++) {
    const d = rows[i];
    const haClose = (d.open + d.high + d.low + d.close) / 4;
    const haOpen =
      i === 0 ? (d.open + d.close) / 2 : (out[i - 1].haOpen + out[i - 1].haClose) / 2;
    const haHigh = Math.max(d.high, haOpen, haClose);
    const haLow = Math.min(d.low, haOpen, haClose);
    out.push({ label: d.label, haOpen, haHigh, haLow, haClose });
  }
  return out;
}

export const HeikinAshiChart = defineComponent({
  name: "HeikinAshiChart",
  props: {
    data: { type: Array as () => HeikinAshiChartDatum[], default: () => [] },
    label: { type: String, required: true },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 240 },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const hoveredIndex = ref<number | null>(null);

    function handleLeave() {
      hoveredIndex.value = null;
    }

    function handlePointerMove(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) { hoveredIndex.value = null; return; }
      const idx = Number(target.getAttribute("data-chart-index"));
      hoveredIndex.value = Number.isInteger(idx) ? idx : null;
    }

    return () => {
      const data = props.data ?? [];
      const label = props.label;
      const width = props.width ?? 480;
      const height = props.height ?? 240;

      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      // filter invalid candles BEFORE HA computation and domain
      const validData = data.filter(
        (d) =>
          Number.isFinite(d.open) &&
          Number.isFinite(d.high) &&
          Number.isFinite(d.low) &&
          Number.isFinite(d.close)
      );

      const haData = computeHeikinAshi(validData);

      const allVals: number[] = [];
      for (const d of haData) {
        // Domain over HA values (haOpen/haHigh/haLow/haClose)
        allVals.push(d.haOpen, d.haHigh, d.haLow, d.haClose);
      }
      const rawMin = allVals.length === 0 ? 0 : Math.min(...allVals);
      const rawMax = allVals.length === 0 ? 1 : Math.max(...allVals);
      // Flat domain → fallback range 1 to avoid division by zero
      const safeRawMax = rawMax === rawMin ? rawMin + 1 : rawMax;

      const ticks = niceTicks(rawMin, safeRawMax, 5);
      const domainMin = ticks[0] ?? rawMin;
      const domainMax = ticks[ticks.length - 1] ?? safeRawMax;

      const band = haData.length > 0 ? plotWidth / haData.length : plotWidth;
      const bodyW = band * 0.55;

      type Candle = {
        datum: HACandle;
        index: number;
        bullish: boolean;
        centerX: number;
        bodyX: number;
        bodyY: number;
        bodyW: number;
        bodyH: number;
        wickHighY: number;
        wickLowY: number;
        tooltipY: number;
      };

      const candles: Candle[] = haData.map((d, i) => {
        const bullish = d.haClose >= d.haOpen;
        const centerX = MARGIN.left + band * i + band / 2;

        const bodyTop = MARGIN.top + scaleLinear(Math.max(d.haOpen, d.haClose), domainMin, domainMax, plotHeight, 0);
        const bodyBot = MARGIN.top + scaleLinear(Math.min(d.haOpen, d.haClose), domainMin, domainMax, plotHeight, 0);
        const highY = MARGIN.top + scaleLinear(d.haHigh, domainMin, domainMax, plotHeight, 0);
        const lowY = MARGIN.top + scaleLinear(d.haLow, domainMin, domainMax, plotHeight, 0);

        return {
          datum: d, index: i, bullish, centerX,
          bodyX: centerX - bodyW / 2,
          bodyY: bodyTop,
          bodyW,
          bodyH: Math.max(bodyBot - bodyTop, 0.5),
          wickHighY: highY, wickLowY: lowY,
          tooltipY: bodyTop,
        };
      });

      const dataValueItems = haData.map(
        (d) => `${d.label}: O ${fmt(d.haOpen)} H ${fmt(d.haHigh)} L ${fmt(d.haLow)} C ${fmt(d.haClose)}`
      );

      const svgChildren: ReturnType<typeof h>[] = [];

      // gridlines + tick labels
      for (const tick of ticks) {
        const ty = MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0);
        svgChildren.push(h("line", { key: `g${tick}`, class: "st-heikinAshiChart__grid", x1: MARGIN.left, x2: width - MARGIN.right, y1: ty, y2: ty }));
        svgChildren.push(h("text", { key: `t${tick}`, class: "st-heikinAshiChart__tickLabel", x: MARGIN.left - 6, y: ty, "text-anchor": "end", "dominant-baseline": "middle" }, formatTick(tick)));
      }

      // axes
      svgChildren.push(h("line", { class: "st-heikinAshiChart__axis", x1: MARGIN.left, x2: MARGIN.left, y1: MARGIN.top, y2: height - MARGIN.bottom }));
      svgChildren.push(h("line", { class: "st-heikinAshiChart__axis", x1: MARGIN.left, x2: width - MARGIN.right, y1: height - MARGIN.bottom, y2: height - MARGIN.bottom }));

      for (const c of candles) {
        const i = c.index;
        // wick
        svgChildren.push(h("line", {
          key: `w${i}-${c.datum.label}`,
          class: `st-heikinAshiChart__wick st-heikinAshiChart__wick--${c.bullish ? "up" : "down"}`,
          x1: c.centerX, x2: c.centerX,
          y1: c.wickHighY, y2: c.wickLowY,
          "data-chart-index": i,
        }));
        // body
        const isDim = hoveredIndex.value !== null && hoveredIndex.value !== i;
        svgChildren.push(h("rect", {
          key: `b${i}-${c.datum.label}`,
          class: classNames(
            "st-heikinAshiChart__body",
            `st-heikinAshiChart__body--${c.bullish ? "up" : "down"}`,
            isDim ? "st-heikinAshiChart__body--dim" : undefined,
          ),
          x: c.bodyX, y: c.bodyY, width: c.bodyW, height: c.bodyH,
          rx: 1,
          "data-chart-index": i,
        }));
        // category label
        svgChildren.push(h("text", {
          key: `lbl${i}`,
          class: "st-heikinAshiChart__categoryLabel",
          x: c.centerX, y: height - MARGIN.bottom + 16,
          "text-anchor": "middle",
        }, c.datum.label));
      }

      const hoveredCandle = hoveredIndex.value !== null ? candles[hoveredIndex.value] : undefined;

      const children: (ReturnType<typeof h> | null)[] = [
        h("div", {
          class: "st-heikinAshiChart__visual",
          role: "img",
          "aria-label": label,
          onPointermove: handlePointerMove,
          onPointerleave: handleLeave,
        }, [
          h("svg", {
            viewBox: `0 0 ${width} ${height}`,
            preserveAspectRatio: "xMidYMid meet",
            width: "100%", height: "100%",
            focusable: "false", "aria-hidden": "true",
          }, svgChildren),
        ]),
        chartDataList(label, dataValueItems),
      ];

      if (hoveredCandle) {
        children.push(h("div", {
          class: "st-heikinAshiChart__tooltip",
          role: "presentation",
          style: `left:${(hoveredCandle.centerX / width) * 100}%;top:${(hoveredCandle.tooltipY / height) * 100}%`,
        }, [
          h("span", { class: "st-heikinAshiChart__tooltipLabel" }, hoveredCandle.datum.label),
          h("span", { class: "st-heikinAshiChart__tooltipValue" }, `O ${fmt(hoveredCandle.datum.haOpen)} H ${fmt(hoveredCandle.datum.haHigh)} L ${fmt(hoveredCandle.datum.haLow)} C ${fmt(hoveredCandle.datum.haClose)}`),
        ]));
      }

      return h("div", { ...attrs, class: classNames("st-heikinAshiChart", props.class) }, children);
    };
  },
});
