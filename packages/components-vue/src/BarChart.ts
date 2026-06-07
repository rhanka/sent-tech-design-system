import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import {
  CHART_MARGIN,
  chartDataList,
  clampFraction,
  extendValueDomain,
  fixedLogTicks,
  fixedTicks,
  formatTick,
  logTicks,
  niceTicks,
  overlayDataListItems,
  overlayToneClass,
  smallestPositive,
  validLinearDomain,
  validLogDomain,
  type ChartBand,
  type ChartGoalLine,
  type ChartReferenceLine,
  type ChartScale,
} from "./chartScale.js";

export type BarChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type BarChartDatum = {
  label: string;
  value: number;
  tone?: BarChartTone;
  /** Lower error-bar extent (value-axis units). Drawn only when finite. */
  errorLow?: number;
  /** Upper error-bar extent (value-axis units). Drawn only when finite. */
  errorHigh?: number;
};

export type BarChartProps = {
  data: BarChartDatum[];
  width?: number;
  height?: number;
  orientation?: "vertical" | "horizontal";
  label: string;
  /**
   * Fixed value-axis domain `[min, max]`. When provided (and finite), the value
   * scale uses it instead of the data-derived min/max — letting several
   * BarCharts in a grid share one scale (small multiples). When absent or
   * invalid, the scale falls back to the auto data range (unchanged).
   */
  domain?: [number, number];
  /**
   * Keys of the currently selected bars (a bar's key is its `label`).
   * CONTROLLED — the parent owns the toggle; the component never stores
   * selection. When non-empty the selected bars stay full opacity (+ accent)
   * and the rest dim; when empty every bar is normal. Defaults to [].
   */
  selectedKeys?: string[];
  /**
   * Called with the bar's key (its `label`) when the user selects it. When
   * provided, an ACCESSIBLE row of filter chips (real <button>s) is rendered
   * OUTSIDE the aria-hidden SVG — that is the keyboard + screen-reader surface.
   * The SVG bars themselves stay decorative (aria-hidden) and only offer a
   * mouse click shortcut for sighted pointer users. When omitted the chart is
   * purely presentational (no interactivity, unchanged).
   */
  onSelect?: (key: string) => void;
  /** Reference lines on the value axis (default `axis: "y"`). */
  referenceLines?: ChartReferenceLine[];
  /** Shaded value-axis bands between `from`..`to`. */
  bands?: ChartBand[];
  /** A single goal line, emphasised above the bars. */
  goalLine?: ChartGoalLine;
  /**
   * Value-axis scale. `"linear"` (default) is unchanged. `"log"` switches the
   * value axis to base-10 logarithmic — values `<= 0` are ignored for
   * domain/ticks and clamped to the lowest tick when positioned.
   */
  scale?: ChartScale;
  /** Inverts the value axis (high values toward the origin). Default false. */
  invertAxis?: boolean;
  /**
   * Toggles the legend if the chart has one. BarChart has no separate legend
   * surface (its filter chips double as one); accepted for cross-chart parity
   * and otherwise ignored.
   */
  showLegend?: boolean;
  class?: string;
};

const MARGIN = CHART_MARGIN;

export const BarChart = defineComponent({
  name: "BarChart",
  props: {
    data: { type: Array as () => BarChartDatum[], required: true },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 240 },
    orientation: { type: String as () => "vertical" | "horizontal", default: "vertical" },
    label: { type: String, required: true },
    domain: { type: Array as unknown as () => [number, number], default: undefined },
    selectedKeys: { type: Array as () => string[], default: () => [] },
    onSelect: { type: Function as unknown as () => (key: string) => void, default: undefined },
    referenceLines: { type: Array as () => ChartReferenceLine[], default: undefined },
    bands: { type: Array as () => ChartBand[], default: undefined },
    goalLine: { type: Object as () => ChartGoalLine, default: undefined },
    scale: { type: String as () => ChartScale, default: "linear" },
    invertAxis: { type: Boolean, default: false },
    showLegend: { type: Boolean, default: undefined },
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
      const width = props.width ?? 480;
      const height = props.height ?? 240;
      const orientation = props.orientation ?? "vertical";
      const label = props.label;
      const data = props.data;

      // Selection (controlled): fast lookup + "is any bar selected" flag. Only
      // when something is selected do we dim the non-selected bars.
      const selectedSet = new Set(props.selectedKeys ?? []);
      const hasSelection = selectedSet.size > 0;
      const interactive = typeof props.onSelect === "function";

      const referenceLines = props.referenceLines;
      const bands = props.bands;
      // A finite goal value is required; otherwise the goal line is ignored.
      const goal = props.goalLine && Number.isFinite(props.goalLine.value) ? props.goalLine : null;
      // Finite error-bar extents must also stay inside the plot.
      const errorExtents = data.flatMap((d) =>
        [d.errorLow, d.errorHigh].filter((v): v is number => v !== undefined && Number.isFinite(v)),
      );

      const isLog = props.scale === "log";
      const domain = props.domain;
      const validDomain = isLog ? validLogDomain(domain) : validLinearDomain(domain);
      const valueAxis = orientation === "vertical" ? "y" : "x";
      const valueReferenceLines = (referenceLines ?? []).filter((r) => (r.axis ?? "y") === valueAxis);
      const invertAxis = props.invertAxis ?? false;
      const values = data.map((d) => d.value);
      let ticks: number[];
      if (isLog) {
        // A log axis is undefined for values <= 0; floor = smallest strictly-
        // positive value across data + finite overlays, ceil = the largest.
        const posOverlays = [
          ...valueReferenceLines.map((r) => r.value),
          ...(bands ?? []).flatMap((b) => [b.from, b.to]),
          ...(goal ? [goal.value] : []),
          ...errorExtents,
        ];
        let lo: number;
        let hi: number;
        if (validDomain) {
          lo = validDomain[0];
          hi = validDomain[1];
        } else {
          lo = smallestPositive(...values, ...posOverlays);
          hi = Math.max(lo, ...values.filter((v) => v > 0), ...posOverlays.filter((v) => v > 0));
        }
        ticks = validDomain ? fixedLogTicks(lo, hi) : logTicks(lo, hi);
      } else {
        let minRaw = validDomain ? validDomain[0] : Math.min(0, ...values);
        let maxRaw = validDomain ? validDomain[1] : Math.max(0, ...values);
        // A pinned domain is authoritative (small-multiples); only the auto
        // domain is widened to keep finite overlays + error bars on-plot.
        if (!validDomain) {
          [minRaw, maxRaw] = extendValueDomain(minRaw, maxRaw, {
            referenceLines,
            referenceAxis: valueAxis,
            bands,
            goalLine: goal,
            extraValues: errorExtents,
          });
        }
        ticks = validDomain ? fixedTicks(minRaw, maxRaw, 5) : niceTicks(minRaw, maxRaw, 5);
      }
      const domainMin = ticks[0];
      const domainMax = ticks[ticks.length - 1];
      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      // Maps a value to a fraction in [0,1] along the value axis, honouring log
      // scale + axis inversion. Linear + no invert reproduces prior behaviour.
      const valueFraction = (v: number) => {
        let f: number;
        if (isLog) {
          const lo = Math.log10(domainMin);
          const hi = Math.log10(domainMax);
          const clamped = v > 0 ? v : domainMin; // log undefined for v<=0 → clamp
          f = hi === lo ? 0 : (Math.log10(clamped) - lo) / (hi - lo);
        } else {
          f = domainMax === domainMin ? 0 : (v - domainMin) / (domainMax - domainMin);
        }
        return clampFraction(invertAxis ? 1 - f : f);
      };
      const baselineValue = isLog ? domainMin : Math.min(domainMax, Math.max(domainMin, 0));

      type Bar = {
        x: number;
        y: number;
        width: number;
        height: number;
        cx: number;
        cy: number;
        datum: BarChartDatum;
        tone: BarChartTone;
      };

      let bars: Bar[] = [];
      if (data.length !== 0) {
        if (orientation === "vertical") {
          const band = plotWidth / data.length;
          const barWidth = band * 0.62;
          const yOf = (v: number) => plotHeight * (1 - valueFraction(v));
          const zeroY = yOf(baselineValue);
          bars = data.map((d, i) => {
            const valueY = yOf(d.value);
            const y = Math.min(valueY, zeroY);
            const hh = Math.abs(zeroY - valueY);
            const x = MARGIN.left + band * i + (band - barWidth) / 2;
            return {
              x,
              y: MARGIN.top + y,
              width: barWidth,
              height: Math.max(hh, 0.5),
              cx: MARGIN.left + band * (i + 0.5),
              cy: MARGIN.top + valueY,
              datum: d,
              tone: (d.tone ?? "category1") as BarChartTone,
            };
          });
        } else {
          const band = plotHeight / data.length;
          const barHeight = band * 0.62;
          const xOf = (v: number) => plotWidth * valueFraction(v);
          const zeroX = xOf(baselineValue);
          bars = data.map((d, i) => {
            const valueX = xOf(d.value);
            const x = Math.min(valueX, zeroX);
            const w = Math.abs(valueX - zeroX);
            const y = MARGIN.top + band * i + (band - barHeight) / 2;
            return {
              x: MARGIN.left + x,
              y,
              width: Math.max(w, 0.5),
              height: barHeight,
              cx: MARGIN.left + valueX,
              cy: MARGIN.top + band * (i + 0.5),
              datum: d,
              tone: (d.tone ?? "category1") as BarChartTone,
            };
          });
        }
      }

      // --- Analytical overlays + error bars --------------------------------
      const isVertical = orientation === "vertical";
      const valuePos = (v: number) =>
        isVertical
          ? MARGIN.top + plotHeight * (1 - valueFraction(v))
          : MARGIN.left + plotWidth * valueFraction(v);
      const valueAxisEnd = isVertical ? MARGIN.left + plotWidth : MARGIN.top + plotHeight;

      type BandRect = { key: number; x: number; y: number; width: number; height: number; label?: string; tone?: ChartBand["tone"] };
      const bandRects: BandRect[] = (bands ?? [])
        .filter((b) => Number.isFinite(b.from) && Number.isFinite(b.to))
        .map((b, i) => {
          const p1 = valuePos(b.from);
          const p2 = valuePos(b.to);
          return isVertical
            ? { key: i, x: MARGIN.left, y: Math.min(p1, p2), width: plotWidth, height: Math.max(Math.abs(p2 - p1), 0.5), label: b.label, tone: b.tone }
            : { key: i, x: Math.min(p1, p2), y: MARGIN.top, width: Math.max(Math.abs(p2 - p1), 0.5), height: plotHeight, label: b.label, tone: b.tone };
        });

      type RefLine = { key: number; x1: number; x2: number; y1: number; y2: number; label?: string; tone?: ChartReferenceLine["tone"] };
      const refLines: RefLine[] = (referenceLines ?? [])
        .filter((r) => Number.isFinite(r.value))
        .map((r, i) => {
          const p = valuePos(r.value);
          return isVertical
            ? { key: i, x1: MARGIN.left, x2: MARGIN.left + plotWidth, y1: p, y2: p, label: r.label, tone: r.tone }
            : { key: i, x1: p, x2: p, y1: MARGIN.top, y2: MARGIN.top + plotHeight, label: r.label, tone: r.tone };
        });

      const goalGeom = goal ? { p: valuePos(goal.value), label: goal.label, value: goal.value } : null;

      type ErrGeom = {
        key: string;
        stem: { x1: number; y1: number; x2: number; y2: number };
        capLow: { x1: number; y1: number; x2: number; y2: number };
        capHigh: { x1: number; y1: number; x2: number; y2: number };
      };
      const errorBarGeom: ErrGeom[] = [];
      for (const bar of bars) {
        const { errorLow, errorHigh } = bar.datum;
        const hasLow = errorLow !== undefined && Number.isFinite(errorLow);
        const hasHigh = errorHigh !== undefined && Number.isFinite(errorHigh);
        if (!hasLow && !hasHigh) continue;
        const lowV = hasLow ? (errorLow as number) : bar.datum.value;
        const highV = hasHigh ? (errorHigh as number) : bar.datum.value;
        const lowP = valuePos(lowV);
        const highP = valuePos(highV);
        const cap = 4;
        if (isVertical) {
          const cx = bar.x + bar.width / 2;
          errorBarGeom.push({
            key: bar.datum.label,
            stem: { x1: cx, y1: lowP, x2: cx, y2: highP },
            capLow: { x1: cx - cap, y1: lowP, x2: cx + cap, y2: lowP },
            capHigh: { x1: cx - cap, y1: highP, x2: cx + cap, y2: highP },
          });
        } else {
          const cy = bar.y + bar.height / 2;
          errorBarGeom.push({
            key: bar.datum.label,
            stem: { x1: lowP, y1: cy, x2: highP, y2: cy },
            capLow: { x1: lowP, y1: cy - cap, x2: lowP, y2: cy + cap },
            capHigh: { x1: highP, y1: cy - cap, x2: highP, y2: cy + cap },
          });
        }
      }

      const dataValueItems = [
        ...data.map((d) => `${d.label}: ${d.value}`),
        ...overlayDataListItems({ referenceLines, bands, goalLine: goal, trend: null }),
      ];

      const gridChildren: ReturnType<typeof h>[] = [];
      if (orientation === "vertical") {
        for (const tick of ticks) {
          const y = MARGIN.top + plotHeight * (1 - valueFraction(tick));
          gridChildren.push(
            h("line", { key: `g${tick}`, class: "st-barChart__grid", x1: MARGIN.left, x2: MARGIN.left + plotWidth, y1: y, y2: y }),
            h(
              "text",
              { key: `t${tick}`, class: "st-barChart__tickLabel", x: MARGIN.left - 6, y, "text-anchor": "end", "dominant-baseline": "middle" },
              formatTick(tick),
            ),
          );
        }
      } else {
        for (const tick of ticks) {
          const x = MARGIN.left + plotWidth * valueFraction(tick);
          gridChildren.push(
            h("line", { key: `g${tick}`, class: "st-barChart__grid", x1: x, x2: x, y1: MARGIN.top, y2: MARGIN.top + plotHeight }),
            h(
              "text",
              { key: `t${tick}`, class: "st-barChart__tickLabel", x, y: height - MARGIN.bottom + 16, "text-anchor": "middle" },
              formatTick(tick),
            ),
          );
        }
      }

      const categoryLabels = bars.map((bar) =>
        orientation === "vertical"
          ? h(
              "text",
              { key: `c${bar.datum.label}`, class: "st-barChart__categoryLabel", x: bar.x + bar.width / 2, y: height - MARGIN.bottom + 16, "text-anchor": "middle" },
              bar.datum.label,
            )
          : h(
              "text",
              { key: `c${bar.datum.label}`, class: "st-barChart__categoryLabel", x: MARGIN.left - 6, y: bar.y + bar.height / 2, "text-anchor": "end", "dominant-baseline": "middle" },
              bar.datum.label,
            ),
      );

      // The bars live inside an aria-hidden SVG, so they are NEVER an accessible
      // surface. When `onSelect` is provided they only carry a mouse click
      // shortcut (cursor:pointer) for sighted pointer users — keyboard + screen
      // readers use the filter-chip buttons rendered below, outside this SVG.
      const barRects = bars.map((bar, i) => {
        const isSelected = selectedSet.has(bar.datum.label);
        return h("rect", {
          key: `b${bar.datum.label}`,
          class: classNames(
            "st-barChart__bar",
            `st-barChart__bar--${bar.tone}`,
            isSelected && "st-barChart__bar--selected",
            hasSelection && !isSelected && "st-barChart__bar--dim",
            interactive && "st-barChart__bar--interactive",
          ),
          x: bar.x,
          y: bar.y,
          width: bar.width,
          height: bar.height,
          rx: "2",
          "data-chart-index": i,
          onClick: interactive ? () => props.onSelect?.(bar.datum.label) : undefined,
        });
      });

      // Overlay vnodes — bands + reference lines below the bars; error bars on
      // top of the bars; the goal line above everything for emphasis.
      const belowOverlays: ReturnType<typeof h>[] = [];
      for (const b of bandRects) {
        belowOverlays.push(
          h("rect", {
            key: `band${b.key}`,
            class: classNames("st-barChart__band", overlayToneClass("st-barChart__band", b.tone)),
            x: b.x,
            y: b.y,
            width: b.width,
            height: b.height,
          }),
        );
        if (b.label) {
          belowOverlays.push(
            h("text", { key: `bandL${b.key}`, class: "st-barChart__overlayLabel", x: b.x + 4, y: b.y + 11 }, b.label),
          );
        }
      }
      for (const r of refLines) {
        belowOverlays.push(
          h("line", {
            key: `ref${r.key}`,
            class: classNames("st-barChart__refLine", overlayToneClass("st-barChart__refLine", r.tone)),
            x1: r.x1,
            x2: r.x2,
            y1: r.y1,
            y2: r.y2,
          }),
        );
        if (r.label) {
          belowOverlays.push(
            h(
              "text",
              {
                key: `refL${r.key}`,
                class: "st-barChart__overlayLabel",
                x: isVertical ? valueAxisEnd - 4 : r.x1 + 4,
                y: isVertical ? r.y1 - 4 : MARGIN.top + 11,
                "text-anchor": isVertical ? "end" : "start",
              },
              r.label,
            ),
          );
        }
      }

      const errorBarNodes = errorBarGeom.map((e) =>
        h("g", { key: `err${e.key}`, class: "st-barChart__errorBar" }, [
          h("line", { class: "st-barChart__errorStem", x1: e.stem.x1, y1: e.stem.y1, x2: e.stem.x2, y2: e.stem.y2 }),
          h("line", { class: "st-barChart__errorCap", x1: e.capLow.x1, y1: e.capLow.y1, x2: e.capLow.x2, y2: e.capLow.y2 }),
          h("line", { class: "st-barChart__errorCap", x1: e.capHigh.x1, y1: e.capHigh.y1, x2: e.capHigh.x2, y2: e.capHigh.y2 }),
        ]),
      );

      const goalOverlays: ReturnType<typeof h>[] = [];
      if (goalGeom) {
        goalOverlays.push(
          isVertical
            ? h("line", { class: "st-barChart__goalLine", x1: MARGIN.left, x2: MARGIN.left + plotWidth, y1: goalGeom.p, y2: goalGeom.p })
            : h("line", { class: "st-barChart__goalLine", x1: goalGeom.p, x2: goalGeom.p, y1: MARGIN.top, y2: MARGIN.top + plotHeight }),
          h(
            "text",
            {
              class: "st-barChart__goalLabel",
              x: isVertical ? MARGIN.left + plotWidth - 4 : goalGeom.p + 4,
              y: isVertical ? goalGeom.p - 4 : MARGIN.top + 11,
              "text-anchor": isVertical ? "end" : "start",
            },
            goalGeom.label ?? `Objectif ${goalGeom.value}`,
          ),
        );
      }

      // Accessible selection surface — real <button>s OUTSIDE the aria-hidden
      // SVG. This is the keyboard + screen-reader path for filtering.
      const filterGroup = interactive
        ? h(
            "div",
            { class: "st-barChart__filters", role: "group", "aria-label": `Filtrer par ${label}` },
            bars.map((bar) => {
              const isSelected = selectedSet.has(bar.datum.label);
              return h(
                "button",
                {
                  key: `f${bar.datum.label}`,
                  type: "button",
                  class: classNames(
                    "st-barChart__filterChip",
                    `st-barChart__filterChip--${bar.tone}`,
                    isSelected && "st-barChart__filterChip--selected",
                  ),
                  "aria-pressed": isSelected ? "true" : "false",
                  onClick: () => props.onSelect?.(bar.datum.label),
                },
                [
                  h("span", { class: "st-barChart__filterSwatch", "aria-hidden": "true" }),
                  `${bar.datum.label}: ${bar.datum.value}`,
                ],
              );
            }),
          )
        : null;

      const hoveredBar = hoveredIndex.value !== null ? bars[hoveredIndex.value] : undefined;

      return h("div", { ...attrs, class: classNames("st-barChart", props.class) }, [
        h(
          "div",
          {
            class: "st-barChart__visual",
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
              [
                ...gridChildren,
                h("line", { class: "st-barChart__axis", x1: MARGIN.left, x2: MARGIN.left, y1: MARGIN.top, y2: height - MARGIN.bottom }),
                h("line", { class: "st-barChart__axis", x1: MARGIN.left, x2: width - MARGIN.right, y1: height - MARGIN.bottom, y2: height - MARGIN.bottom }),
                ...categoryLabels,
                ...belowOverlays,
                ...barRects,
                ...errorBarNodes,
                ...goalOverlays,
              ],
            ),
          ],
        ),
        filterGroup,
        chartDataList(label, dataValueItems),
        hoveredBar
          ? h(
              "div",
              {
                class: "st-barChart__tooltip",
                role: "presentation",
                style: `left: ${(hoveredBar.cx / width) * 100}%; top: ${(hoveredBar.cy / height) * 100}%`,
              },
              [
                h("span", { class: "st-barChart__tooltipLabel" }, hoveredBar.datum.label),
                h("span", { class: "st-barChart__tooltipValue" }, String(hoveredBar.datum.value)),
              ],
            )
          : null,
      ]);
    };
  },
});
