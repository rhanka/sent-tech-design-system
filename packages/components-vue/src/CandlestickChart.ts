import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";
import {
  annotationDataListItems,
  polygonPoints,
  resolveAnnotations,
  type ChartAnnotation,
} from "./chartAnnotations.js";
import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from "./chartDataLabels.js";
import { resolveActiveIndex } from "./chartCrosshair.js";
import { datapointAriaLabel, datapointNavAction, rovingTabIndex } from "./chartKeyboardNav.js";

export type CandlestickChartDatum = {
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type CandlestickChartProps = {
  data: CandlestickChartDatum[];
  label: string;
  width?: number;
  height?: number;
  annotations?: ChartAnnotation[];
  dataLabels?: DataLabelsProp;
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  keyboardNav?: boolean;
  onSelectKey?: (key: string | null) => void;
  class?: string;
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

export const CandlestickChart = defineComponent({
  name: "CandlestickChart",
  props: {
    data: { type: Array as () => CandlestickChartDatum[], default: () => [] },
    label: { type: String, required: true },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 240 },
    annotations: { type: Array as () => ChartAnnotation[], default: undefined },
    dataLabels: { type: [Boolean, Object] as unknown as () => DataLabelsProp, default: undefined },
    hoverKey: { type: String as unknown as () => string | null, default: undefined },
    onHoverKeyChange: { type: Function as unknown as () => (key: string | null) => void, default: undefined },
    keyboardNav: { type: Boolean, default: undefined },
    onSelectKey: { type: Function as unknown as () => (key: string | null) => void, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const hoveredIndex = ref<number | null>(null);
    // FR-5 — roving keyboard focus over the data points (separate from hover).
    const focusedIndex = ref<number>(-1);
    const datapointRefs: Array<SVGRectElement | null> = [];

    return () => {
      const data = props.data ?? [];
      const label = props.label;
      const width = props.width ?? 480;
      const height = props.height ?? 240;

      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      // FIX: filter invalid candles BEFORE domain
      const validData = data.filter(
        (d) =>
          Number.isFinite(d.open) &&
          Number.isFinite(d.high) &&
          Number.isFinite(d.low) &&
          Number.isFinite(d.close)
      );

      const allVals: number[] = [];
      for (const d of validData) {
        // Domain includes open/high/low/close (not just high/low)
        allVals.push(d.open, d.high, d.low, d.close);
      }
      const rawMin = allVals.length === 0 ? 0 : Math.min(...allVals);
      const rawMax = allVals.length === 0 ? 1 : Math.max(...allVals);
      // Flat domain → fallback range 1 to avoid division by zero
      const safeRawMax = rawMax === rawMin ? rawMin + 1 : rawMax;

      const ticks = niceTicks(rawMin, safeRawMax, 5);
      const domainMin = ticks[0] ?? rawMin;
      const domainMax = ticks[ticks.length - 1] ?? safeRawMax;

      const band = validData.length > 0 ? plotWidth / validData.length : plotWidth;
      const bodyW = band * 0.55;

      type Candle = {
        datum: CandlestickChartDatum;
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

      const candles: Candle[] = validData.map((d, i) => {
        // FIX: clamp high/low to guarantee high≥max(O,C) and low≤min(O,C)
        const clampedHigh = Math.max(d.high, d.open, d.close);
        const clampedLow = Math.min(d.low, d.open, d.close);
        const bullish = d.close >= d.open;
        const centerX = MARGIN.left + band * i + band / 2;

        const bodyTop = MARGIN.top + scaleLinear(Math.max(d.open, d.close), domainMin, domainMax, plotHeight, 0);
        const bodyBot = MARGIN.top + scaleLinear(Math.min(d.open, d.close), domainMin, domainMax, plotHeight, 0);
        const highY = MARGIN.top + scaleLinear(clampedHigh, domainMin, domainMax, plotHeight, 0);
        const lowY = MARGIN.top + scaleLinear(clampedLow, domainMin, domainMax, plotHeight, 0);

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

      // --- Annotation overlay -------------------------------------------------
      // The x coordinate is CATEGORICAL (a candle `label` → centre of band); the
      // y coordinate is a price-axis number. Regions render behind the candles,
      // every other kind above. The resolver maps each x via `xScale` (category
      // → pixel) and each y via `yScale` (price → pixel), relative to the plot.
      const priceY = (v: number): number | null => {
        if (!Number.isFinite(v)) return null;
        return scaleLinear(v, domainMin, domainMax, plotHeight, 0);
      };
      const categoryPixel = (v: number | string): number | null => {
        const candle = candles.find((c) => c.datum.label === String(v));
        if (!candle) return null;
        return candle.centerX - MARGIN.left;
      };
      const resolvedAnnotations = resolveAnnotations(props.annotations, {
        xScale: (v) => categoryPixel(v),
        yScale: (v) => priceY(v),
        plotLeft: MARGIN.left,
        plotTop: MARGIN.top,
        plotWidth,
        plotHeight,
      });
      const annotationRegions = resolvedAnnotations.filter((a) => a.kind === "region");
      const annotationAbove = resolvedAnnotations.filter((a) => a.kind !== "region");

      // --- Data labels ------------------------------------------------------
      // One `close` value label per candle, placed just above it. aria-hidden.
      const dataLabelOpts = normalizeDataLabels(props.dataLabels);
      type DataLabelItem = { key: string; x: number; y: number; text: string };
      const dataLabelItems: DataLabelItem[] = dataLabelOpts.enabled
        ? candles.map((candle) => ({
            key: candle.datum.label,
            x: candle.centerX,
            y: candle.wickHighY - 6,
            text: formatDataLabel(candle.datum.close, dataLabelOpts, formatTick),
          }))
        : [];

      const dataValueItems = [
        ...validData.map((d) => `${d.label}: O ${d.open} H ${d.high} L ${d.low} C ${d.close}`),
        ...annotationDataListItems(props.annotations),
      ];

      // Stable key per candle (FR-3): its `label`. Resolves a controlled
      // `hoverKey` to an index and feeds `onHoverKeyChange` from pointer events.
      const hoverKeys = candles.map((c) => c.datum.label);
      const emitHoverKey = (index: number | null) => {
        props.onHoverKeyChange?.(index == null ? null : hoverKeys[index] ?? null);
      };
      const handleLeave = () => {
        hoveredIndex.value = null;
        emitHoverKey(null);
      };
      const handlePointerMove = (event: PointerEvent) => {
        const target = event.target;
        if (!(target instanceof Element)) {
          hoveredIndex.value = null;
          emitHoverKey(null);
          return;
        }
        const raw = Number(target.getAttribute("data-chart-index"));
        const index = Number.isInteger(raw) ? raw : null;
        hoveredIndex.value = index;
        emitHoverKey(index);
      };

      // Index whose crosshair/tooltip is DISPLAYED: the controlled `hoverKey`
      // when provided (resolved against `hoverKeys`), else the pointer index.
      const activeIndex = resolveActiveIndex(props.hoverKey, hoveredIndex.value, hoverKeys);
      const hoveredCandle = activeIndex >= 0 ? candles[activeIndex] : undefined;

      // --- Keyboard navigation (FR-5) --------------------------------------
      // Active when wired explicitly (`keyboardNav`) or implicitly (`onSelectKey`).
      const navEnabled = (props.keyboardNav === true || props.onSelectKey !== undefined) && candles.length > 0;
      const focusDatum = (index: number) => {
        focusedIndex.value = index;
        datapointRefs[index]?.focus();
        emitHoverKey(index);
      };
      const handleDatapointKeyDown = (event: KeyboardEvent, index: number) => {
        const action = datapointNavAction(event.key, index, candles.length);
        if (!action) return;
        event.preventDefault();
        if (action.kind === "move") {
          focusDatum(action.index);
        } else if (action.kind === "select") {
          props.onSelectKey?.(candles[index].datum.label);
        } else {
          focusedIndex.value = -1;
          emitHoverKey(null);
          props.onSelectKey?.(null);
          (event.currentTarget as SVGElement).blur();
        }
      };
      const ohlcAriaLabel = (d: CandlestickChartDatum): string =>
        datapointAriaLabel(d.label, `O ${d.open} H ${d.high} L ${d.low} C ${d.close}`);

      const svgChildren: ReturnType<typeof h>[] = [];

      // gridlines + tick labels
      for (const tick of ticks) {
        const ty = MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0);
        svgChildren.push(h("line", { key: `g${tick}`, class: "st-candlestickChart__grid", x1: MARGIN.left, x2: width - MARGIN.right, y1: ty, y2: ty }));
        svgChildren.push(h("text", { key: `t${tick}`, class: "st-candlestickChart__tickLabel", x: MARGIN.left - 6, y: ty, "text-anchor": "end", "dominant-baseline": "middle" }, formatTick(tick)));
      }

      // axes
      svgChildren.push(h("line", { class: "st-candlestickChart__axis", x1: MARGIN.left, x2: MARGIN.left, y1: MARGIN.top, y2: height - MARGIN.bottom }));
      svgChildren.push(h("line", { class: "st-candlestickChart__axis", x1: MARGIN.left, x2: width - MARGIN.right, y1: height - MARGIN.bottom, y2: height - MARGIN.bottom }));

      // Annotation regions sit BEHIND the candles (filled bands).
      if (annotationRegions.length > 0) {
        svgChildren.push(
          h(
            "g",
            { class: "st-candlestickChart__annotations st-candlestickChart__annotations--behind" },
            annotationRegions.flatMap((a) => {
              if (a.kind !== "region") return [];
              const nodes: ReturnType<typeof h>[] = [
                h("rect", { key: `ann-region-${a.key}`, class: "st-candlestickChart__annotationRegion", x: a.x, y: a.y, width: a.width, height: a.height }),
              ];
              if (a.label) {
                nodes.push(h("text", { key: `ann-region-label-${a.key}`, class: "st-candlestickChart__annotationLabel", x: a.x + 4, y: a.y + 11 }, a.label));
              }
              return nodes;
            }),
          ),
        );
      }

      // FIX: composite key to avoid duplicates
      for (const c of candles) {
        const i = c.index;
        // wick
        svgChildren.push(h("line", {
          key: `w${i}-${c.datum.label}`,
          class: `st-candlestickChart__wick st-candlestickChart__wick--${c.bullish ? "up" : "down"}`,
          x1: c.centerX, x2: c.centerX,
          y1: c.wickHighY, y2: c.wickLowY,
          "data-chart-index": i,
        }));
        // body
        const isDim = hoveredIndex.value !== null && hoveredIndex.value !== i;
        svgChildren.push(h("rect", {
          key: `b${i}-${c.datum.label}`,
          class: classNames(
            "st-candlestickChart__body",
            `st-candlestickChart__body--${c.bullish ? "up" : "down"}`,
            isDim ? "st-candlestickChart__body--dim" : undefined,
          ),
          x: c.bodyX, y: c.bodyY, width: c.bodyW, height: c.bodyH,
          rx: 1,
          "data-chart-index": i,
        }));
        // category label
        svgChildren.push(h("text", {
          key: `lbl${i}`,
          class: "st-candlestickChart__categoryLabel",
          x: c.centerX, y: height - MARGIN.bottom + 16,
          "text-anchor": "middle",
        }, c.datum.label));
      }

      // Annotations ABOVE the candles: lines, shapes, points, labels.
      if (annotationAbove.length > 0) {
        svgChildren.push(
          h(
            "g",
            { class: "st-candlestickChart__annotations st-candlestickChart__annotations--above" },
            annotationAbove.flatMap((a) => {
              if (a.kind === "line") {
                const nodes: ReturnType<typeof h>[] = [
                  h("line", { key: `ann-line-${a.key}`, class: "st-candlestickChart__annotationLine", x1: a.x1, y1: a.y1, x2: a.x2, y2: a.y2 }),
                ];
                if (a.label) {
                  nodes.push(
                    h(
                      "text",
                      {
                        key: `ann-line-label-${a.key}`,
                        class: "st-candlestickChart__annotationLabel",
                        x: a.axis === "x" ? a.x1 + 4 : MARGIN.left + plotWidth - 4,
                        y: a.axis === "x" ? MARGIN.top + 11 : a.y1 - 4,
                        "text-anchor": a.axis === "x" ? "start" : "end",
                      },
                      a.label,
                    ),
                  );
                }
                return nodes;
              }
              if (a.kind === "shape") {
                const nodes: ReturnType<typeof h>[] = [
                  h("polygon", { key: `ann-shape-${a.key}`, class: "st-candlestickChart__annotationShape", points: polygonPoints(a.points) }),
                ];
                if (a.label) {
                  nodes.push(h("text", { key: `ann-shape-label-${a.key}`, class: "st-candlestickChart__annotationLabel", x: a.labelX, y: a.labelY, "text-anchor": "middle" }, a.label));
                }
                return nodes;
              }
              if (a.kind === "point") {
                const nodes: ReturnType<typeof h>[] = [
                  h("circle", { key: `ann-point-${a.key}`, class: "st-candlestickChart__annotationPoint", cx: a.x, cy: a.y, r: "4.5" }),
                ];
                if (a.label) {
                  nodes.push(h("text", { key: `ann-point-label-${a.key}`, class: "st-candlestickChart__annotationLabel", x: a.x, y: a.y - 8, "text-anchor": "middle" }, a.label));
                }
                return nodes;
              }
              return [
                h("text", { key: `ann-label-${a.key}`, class: "st-candlestickChart__annotationText", x: a.x, y: a.y, "text-anchor": a.anchor }, a.text),
              ];
            }),
          ),
        );
      }

      // Data labels — one close value per candle, drawn on top. aria-hidden.
      if (dataLabelItems.length > 0) {
        svgChildren.push(
          h(
            "g",
            { class: "st-candlestickChart__dataLabels", "aria-hidden": "true" },
            dataLabelItems.map((d) =>
              h("text", { key: `dl-${d.key}`, class: "st-candlestickChart__dataLabel", x: d.x, y: d.y, "text-anchor": "middle", "dominant-baseline": "auto" }, d.text),
            ),
          ),
        );
      }

      // Crosshair (FR-3) — a tokenised dashed vertical line at the active candle.
      if (hoveredCandle) {
        svgChildren.push(
          h("g", { class: "st-candlestickChart__crosshair", "aria-hidden": "true" }, [
            h("line", {
              class: "st-candlestickChart__crosshairLine",
              x1: hoveredCandle.centerX, x2: hoveredCandle.centerX,
              y1: MARGIN.top, y2: MARGIN.top + plotHeight,
            }),
          ]),
        );
      }

      // Keyboard navigation overlay (FR-5) — a focusable, transparent hit layer
      // over the candles. NOT aria-hidden: the accessible roving cursor.
      const navLayer = navEnabled
        ? h(
            "svg",
            {
              class: "st-candlestickChart__navLayer",
              viewBox: `0 0 ${width} ${height}`,
              preserveAspectRatio: "xMidYMid meet",
              width: "100%",
              height: "100%",
              role: "group",
              "aria-label": `${label} — points de données`,
            },
            candles.map((candle, i) =>
              h("rect", {
                key: `nav${i}-${candle.datum.label}`,
                ref: ((el: Element | null) => {
                  datapointRefs[i] = el as SVGRectElement | null;
                }) as never,
                class: "st-candlestickChart__navDatum",
                x: candle.centerX - band / 2,
                y: MARGIN.top,
                width: band,
                height: plotHeight,
                role: "img",
                tabindex: rovingTabIndex(i, focusedIndex.value, candles.length),
                "aria-label": ohlcAriaLabel(candle.datum),
                onKeydown: (event: KeyboardEvent) => handleDatapointKeyDown(event, i),
                onFocus: () => {
                  focusedIndex.value = i;
                  emitHoverKey(i);
                },
              }),
            ),
          )
        : null;

      const children: (ReturnType<typeof h> | null)[] = [
        h("div", {
          class: "st-candlestickChart__visual",
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
          ...(navLayer ? [navLayer] : []),
        ]),
        chartDataList(label, dataValueItems),
      ];

      if (hoveredCandle) {
        children.push(h("div", {
          class: "st-candlestickChart__tooltip",
          role: "presentation",
          style: `left:${(hoveredCandle.centerX / width) * 100}%;top:${(hoveredCandle.tooltipY / height) * 100}%`,
        }, [
          h("span", { class: "st-candlestickChart__tooltipLabel" }, hoveredCandle.datum.label),
          h("span", { class: "st-candlestickChart__tooltipValue" }, `O ${hoveredCandle.datum.open} H ${hoveredCandle.datum.high} L ${hoveredCandle.datum.low} C ${hoveredCandle.datum.close}`),
        ]));
      }

      return h("div", { ...attrs, class: classNames("st-candlestickChart", props.class) }, children);
    };
  },
});
