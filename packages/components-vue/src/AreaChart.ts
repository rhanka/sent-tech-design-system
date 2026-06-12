import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import {
  buildLinearPath,
  buildSmoothPath,
  CHART_MARGIN,
  chartDataList,
  formatTick,
  isNumeric,
  niceTicks,
  scaleLinear,
} from "./chartScale.js";
import {
  annotationDataListItems,
  polygonPoints,
  resolveAnnotations,
  type ChartAnnotation,
} from "./chartAnnotations.js";
import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from "./chartDataLabels.js";
import { keyForX, resolveActiveIndex } from "./chartCrosshair.js";
import { datapointAriaLabel, datapointNavAction, rovingTabIndex } from "./chartKeyboardNav.js";

export type AreaChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type AreaChartDatum = {
  x: number | string;
  y: number;
};

export type AreaChartProps = {
  data: (number | AreaChartDatum)[];
  width?: number;
  height?: number;
  tone?: AreaChartTone;
  smooth?: boolean;
  label: string;
  /**
   * Annotation overlay in DATA space (points, labels, axis lines, regions,
   * polygons), resolved to pixels via the chart scales. Regions render behind
   * the area, every other kind above it. Additive: absent ⇒ unchanged.
   */
  annotations?: ChartAnnotation[];
  /**
   * Per-point value labels. `false`/absent (default) → none. `true` → each
   * point's value with the chart's numeric formatter. Object → `format(value)`
   * and/or a `position` override. Default position is `top` (above the point).
   * Labels are `aria-hidden` — the values already live in the accessible
   * ChartDataList.
   */
  dataLabels?: DataLabelsProp;
  /**
   * CONTROLLED synchronised hover key (FR-3). A datum's key is `String(x)`. When
   * provided (string or null), the crosshair + tooltip track this key instead of
   * the chart's internal pointer hover (null ⇒ nothing shown), letting a parent
   * share one hover channel across several aligned charts. Absent (`undefined`)
   * keeps the legacy uncontrolled behaviour.
   */
  hoverKey?: string | null;
  /**
   * Emitted when the user hovers a datum (its key) or leaves the plot (`null`).
   * Always fired on pointer move/leave — even while CONTROLLED — so dataviz can
   * keep the shared hover channel in sync.
   */
  onHoverKeyChange?: (key: string | null) => void;
  /**
   * FR-5 — keyboard navigation of the data points (roving tabindex). When `true`
   * (or implied by wiring `onSelectKey`), a thin focusable overlay is rendered
   * over the points: the chart owns ONE tab stop, ←/↑/→/↓ move the focus between
   * points (data order), Home/End jump to the first/last, Enter/Space select the
   * focused point (`onSelectKey`), Escape leaves the navigation. Each focused
   * point announces its `x` + value. Absent ⇒ no overlay, rendering unchanged.
   */
  keyboardNav?: boolean;
  /**
   * Emitted when the user selects the focused point via Enter/Space (its key,
   * `String(x)`), or `null` when the navigation is left via Escape. Wiring it
   * also turns the keyboard navigation on.
   */
  onSelectKey?: (key: string | null) => void;
  class?: string;
};

const MARGIN = CHART_MARGIN;

let gradientCounter = 0;

export const AreaChart = defineComponent({
  name: "AreaChart",
  props: {
    data: { type: Array as () => (number | AreaChartDatum)[], default: () => [] },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 240 },
    tone: { type: String as () => AreaChartTone, default: "category1" },
    smooth: { type: Boolean, default: false },
    label: { type: String, required: true },
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
    const gradientId = `st-areachart-gradient-${(gradientCounter++).toString(36)}-${Math.random().toString(36).substring(2, 9)}`;

    return () => {
      const width = props.width ?? 480;
      const height = props.height ?? 240;
      const tone = props.tone ?? "category1";
      const smooth = props.smooth ?? false;
      const label = props.label;

      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      const normalizedData: AreaChartDatum[] = (props.data ?? []).map((d, i) =>
        typeof d === "number" ? ({ x: i, y: d } as AreaChartDatum) : d,
      );

      const dataValueItems = [
        ...normalizedData.map((d) => `${d.x}: ${d.y}`),
        ...annotationDataListItems(props.annotations),
      ];

      let xDomain:
        | { kind: "ordinal"; values: (number | string)[] }
        | { kind: "numeric"; min: number; max: number };
      if (normalizedData.length === 0) {
        xDomain = { kind: "ordinal", values: [] };
      } else if (normalizedData.every((d) => isNumeric(d.x))) {
        const xs = normalizedData.map((d) => d.x as number);
        xDomain = { kind: "numeric", min: Math.min(...xs), max: Math.max(...xs) };
      } else {
        xDomain = { kind: "ordinal", values: normalizedData.map((d) => d.x) };
      }

      let yTicks: number[];
      const ys = normalizedData.map((d) => d.y);
      if (ys.length === 0) {
        yTicks = [0];
      } else {
        const yMin = Math.min(...ys);
        const yMax = Math.max(...ys);
        const padded = (yMax - yMin) * 0.08 || Math.max(Math.abs(yMax), 1) * 0.1;
        const minTickVal = Math.min(0, yMin - padded);
        yTicks = niceTicks(minTickVal, yMax + padded, 5);
      }
      const yDomain = yTicks.length === 0 ? { min: 0, max: 1 } : { min: yTicks[0], max: yTicks[yTicks.length - 1] };

      type Point = { x: number; y: number; datum: AreaChartDatum; index: number };
      let points: Point[] = [];
      if (normalizedData.length !== 0) {
        points = normalizedData.map((d, i) => {
          let x: number;
          if (xDomain.kind === "numeric") {
            x = scaleLinear(d.x as number, xDomain.min, xDomain.max, 0, plotWidth);
          } else {
            const denom = Math.max(normalizedData.length - 1, 1);
            x = normalizedData.length === 1 ? plotWidth / 2 : (i / denom) * plotWidth;
          }
          const y = scaleLinear(d.y, yDomain.min, yDomain.max, plotHeight, 0);
          return { x: MARGIN.left + x, y: MARGIN.top + y, datum: d, index: i };
        });
      }

      // --- Annotation overlay -------------------------------------------------
      // `xScale` honours the ordinal/numeric x domain; `yScale` mirrors the
      // point y mapping. Out-of-domain coordinates yield `null` → the resolver
      // drops them.
      const ordinalIndex = (v: number | string) => {
        if (xDomain.kind !== "ordinal") return null;
        const i = normalizedData.findIndex((d) => d.x === v);
        if (i < 0) return null;
        const denom = Math.max(normalizedData.length - 1, 1);
        return normalizedData.length === 1 ? plotWidth / 2 : (i / denom) * plotWidth;
      };
      const annotationXScale = (v: number | string): number | null => {
        if (xDomain.kind === "numeric") {
          if (typeof v !== "number" || !Number.isFinite(v)) return null;
          if (v < xDomain.min || v > xDomain.max) return null;
          return scaleLinear(v, xDomain.min, xDomain.max, 0, plotWidth);
        }
        return ordinalIndex(v);
      };
      const annotationYScale = (v: number): number | null => {
        if (!Number.isFinite(v) || v < yDomain.min || v > yDomain.max) return null;
        return scaleLinear(v, yDomain.min, yDomain.max, plotHeight, 0);
      };
      const resolvedAnnotations = resolveAnnotations(props.annotations, {
        xScale: annotationXScale,
        yScale: annotationYScale,
        plotLeft: MARGIN.left,
        plotTop: MARGIN.top,
        plotWidth,
        plotHeight,
      });
      const annotationRegions = resolvedAnnotations.filter((a) => a.kind === "region");
      const annotationAbove = resolvedAnnotations.filter((a) => a.kind !== "region");

      // --- Data labels ------------------------------------------------------
      // One value label per point. Default `top`: just above the dot. `center`
      // sits on the dot. aria-hidden (values are in the ChartDataList already).
      const dataLabelOpts = normalizeDataLabels(props.dataLabels);
      type DataLabelItem = { key: number; x: number; y: number; text: string; baseline: string };
      const dataLabelItems: DataLabelItem[] = dataLabelOpts.enabled
        ? points.map((p) => {
            const text = formatDataLabel(p.datum.y, dataLabelOpts, formatTick);
            const center = dataLabelOpts.position === "center" || dataLabelOpts.position === "inside";
            return { key: p.index, x: p.x, y: center ? p.y : p.y - 8, text, baseline: center ? "middle" : "auto" };
          })
        : [];

      const linePath = points.length === 0 ? "" : smooth ? buildSmoothPath(points) : buildLinearPath(points);

      let areaPath = "";
      if (points.length !== 0) {
        const base = MARGIN.top + scaleLinear(Math.max(0, yDomain.min), yDomain.min, yDomain.max, plotHeight, 0);
        const first = points[0];
        const last = points[points.length - 1];
        areaPath = `${linePath} L${last.x.toFixed(2)},${base.toFixed(2)} L${first.x.toFixed(2)},${base.toFixed(2)} Z`;
      }

      const gridLines = yTicks.map((tick) => ({
        value: tick,
        y: MARGIN.top + scaleLinear(tick, yDomain.min, yDomain.max, plotHeight, 0),
      }));

      let xTickEntries: { x: number; label: string }[] = [];
      if (normalizedData.length !== 0) {
        if (xDomain.kind === "ordinal") {
          xTickEntries = points.map((p, i) => ({ x: p.x, label: String(normalizedData[i].x) }));
        } else {
          const target = Math.min(5, normalizedData.length);
          const stride = Math.max(1, Math.round((normalizedData.length - 1) / (target - 1 || 1)));
          for (let i = 0; i < normalizedData.length; i += stride) {
            xTickEntries.push({ x: points[i].x, label: String(normalizedData[i].x) });
          }
          const lastIdx = normalizedData.length - 1;
          if (xTickEntries[xTickEntries.length - 1]?.label !== String(normalizedData[lastIdx].x)) {
            xTickEntries.push({ x: points[lastIdx].x, label: String(normalizedData[lastIdx].x) });
          }
        }
      }

      const gridChildren: ReturnType<typeof h>[] = [];
      for (const g of gridLines) {
        gridChildren.push(
          h("line", { key: `g${g.value}`, class: "st-areaChart__grid", x1: MARGIN.left, x2: width - MARGIN.right, y1: g.y, y2: g.y }),
          h(
            "text",
            { key: `t${g.value}`, class: "st-areaChart__tickLabel", x: MARGIN.left - 6, y: g.y, "text-anchor": "end", "dominant-baseline": "middle" },
            formatTick(g.value),
          ),
        );
      }

      const xLabels = xTickEntries.map((tick, i) =>
        h(
          "text",
          { key: `x${i}`, class: "st-areaChart__tickLabel", x: tick.x, y: height - MARGIN.bottom + 16, "text-anchor": "middle" },
          tick.label,
        ),
      );

      const dots = points.map((p) =>
        h("circle", { key: p.index, class: "st-areaChart__dot", cx: p.x, cy: p.y, r: "4", "data-chart-index": p.index }),
      );

      // Annotation regions sit BEHIND the area.
      const annotationRegionGroup =
        annotationRegions.length > 0
          ? h(
              "g",
              { class: "st-areaChart__annotations st-areaChart__annotations--behind" },
              annotationRegions.flatMap((a) => {
                if (a.kind !== "region") return [];
                const nodes: ReturnType<typeof h>[] = [
                  h("rect", { key: `ann-region-${a.key}`, class: "st-areaChart__annotationRegion", x: a.x, y: a.y, width: a.width, height: a.height }),
                ];
                if (a.label) {
                  nodes.push(
                    h("text", { key: `ann-region-label-${a.key}`, class: "st-areaChart__annotationLabel", x: a.x + 4, y: a.y + 11 }, a.label),
                  );
                }
                return nodes;
              }),
            )
          : null;

      // Annotations ABOVE the area: lines, shapes, points, labels.
      const annotationAboveGroup =
        annotationAbove.length > 0
          ? h(
              "g",
              { class: "st-areaChart__annotations st-areaChart__annotations--above" },
              annotationAbove.flatMap((a) => {
                if (a.kind === "line") {
                  const nodes: ReturnType<typeof h>[] = [
                    h("line", { key: `ann-line-${a.key}`, class: "st-areaChart__annotationLine", x1: a.x1, y1: a.y1, x2: a.x2, y2: a.y2 }),
                  ];
                  if (a.label) {
                    nodes.push(
                      h(
                        "text",
                        {
                          key: `ann-line-label-${a.key}`,
                          class: "st-areaChart__annotationLabel",
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
                    h("polygon", { key: `ann-shape-${a.key}`, class: "st-areaChart__annotationShape", points: polygonPoints(a.points) }),
                  ];
                  if (a.label) {
                    nodes.push(
                      h("text", { key: `ann-shape-label-${a.key}`, class: "st-areaChart__annotationLabel", x: a.labelX, y: a.labelY, "text-anchor": "middle" }, a.label),
                    );
                  }
                  return nodes;
                }
                if (a.kind === "point") {
                  const nodes: ReturnType<typeof h>[] = [
                    h("circle", { key: `ann-point-${a.key}`, class: "st-areaChart__annotationPoint", cx: a.x, cy: a.y, r: "4.5" }),
                  ];
                  if (a.label) {
                    nodes.push(
                      h("text", { key: `ann-point-label-${a.key}`, class: "st-areaChart__annotationLabel", x: a.x, y: a.y - 8, "text-anchor": "middle" }, a.label),
                    );
                  }
                  return nodes;
                }
                return [
                  h("text", { key: `ann-label-${a.key}`, class: "st-areaChart__annotationText", x: a.x, y: a.y, "text-anchor": a.anchor }, a.text),
                ];
              }),
            )
          : null;

      // Data labels — one value per point, drawn on top. aria-hidden.
      const dataLabelGroup =
        dataLabelItems.length > 0
          ? h(
              "g",
              { class: "st-areaChart__dataLabels", "aria-hidden": "true" },
              dataLabelItems.map((d) =>
                h(
                  "text",
                  { key: `dl-${d.key}`, class: "st-areaChart__dataLabel", x: d.x, y: d.y, "text-anchor": "middle", "dominant-baseline": d.baseline },
                  d.text,
                ),
              ),
            )
          : null;

      const svgChildren: ReturnType<typeof h>[] = [
        h("defs", {}, [
          h("linearGradient", { id: gradientId, x1: "0", y1: "0", x2: "0", y2: "1" }, [
            h("stop", { offset: "0%", "stop-color": "currentColor", "stop-opacity": "0.3" }),
            h("stop", { offset: "100%", "stop-color": "currentColor", "stop-opacity": "0.0" }),
          ]),
        ]),
        ...gridChildren,
        h("line", { class: "st-areaChart__axis", x1: MARGIN.left, x2: MARGIN.left, y1: MARGIN.top, y2: height - MARGIN.bottom }),
        h("line", { class: "st-areaChart__axis", x1: MARGIN.left, x2: width - MARGIN.right, y1: height - MARGIN.bottom, y2: height - MARGIN.bottom }),
        ...xLabels,
      ];
      if (annotationRegionGroup) {
        svgChildren.push(annotationRegionGroup);
      }
      if (areaPath) {
        svgChildren.push(h("path", { class: "st-areaChart__area", d: areaPath, fill: `url(#${gradientId})` }));
      }
      if (linePath) {
        svgChildren.push(
          h("path", { class: "st-areaChart__line", d: linePath, fill: "none", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }),
        );
      }
      svgChildren.push(...dots);
      if (annotationAboveGroup) {
        svgChildren.push(annotationAboveGroup);
      }
      if (dataLabelGroup) {
        svgChildren.push(dataLabelGroup);
      }

      // Stable key per datum (FR-3): `String(x)` of the normalised datum (a bare
      // number becomes its index). Resolves a controlled `hoverKey` to an index
      // and feeds `onHoverKeyChange` from pointer events.
      const hoverKeys = normalizedData.map((d) => keyForX(d.x));
      const emitHoverKey = (index: number | null) => {
        props.onHoverKeyChange?.(index == null ? null : hoverKeys[index] ?? null);
      };
      const handleLeave = () => {
        hoveredIndex.value = null;
        emitHoverKey(null);
      };
      const handleVisualPointerMove = (event: PointerEvent) => {
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
      const hoveredPoint = activeIndex >= 0 ? points[activeIndex] : undefined;

      // --- Keyboard navigation (FR-5) --------------------------------------
      // Active when wired explicitly (`keyboardNav`) or implicitly (`onSelectKey`).
      // Renders a focusable overlay (one transparent hit-rect per point) carrying
      // a single roving tab stop. Arrow/Home/End move focus, Enter/Space select,
      // Escape leaves. Focus also feeds the shared hover channel (FR-3 synergy).
      const navEnabled = (props.keyboardNav === true || props.onSelectKey !== undefined) && points.length > 0;
      // Comfortable square hit area centred on each dot.
      const NAV_HIT = 18;
      const focusDatum = (index: number) => {
        focusedIndex.value = index;
        datapointRefs[index]?.focus();
        emitHoverKey(index);
      };
      const handleDatapointKeyDown = (event: KeyboardEvent, index: number) => {
        const action = datapointNavAction(event.key, index, points.length);
        if (!action) return;
        event.preventDefault();
        if (action.kind === "move") {
          focusDatum(action.index);
        } else if (action.kind === "select") {
          props.onSelectKey?.(hoverKeys[index] ?? null);
        } else {
          focusedIndex.value = -1;
          emitHoverKey(null);
          props.onSelectKey?.(null);
          (event.currentTarget as SVGElement).blur();
        }
      };
      const navLayer = navEnabled
        ? h(
            "svg",
            {
              class: "st-areaChart__navLayer",
              viewBox: `0 0 ${width} ${height}`,
              preserveAspectRatio: "xMidYMid meet",
              width: "100%",
              height: "100%",
              role: "group",
              "aria-label": `${label} — points de données`,
            },
            points.map((p, i) =>
              h("rect", {
                key: p.index,
                ref: ((el: Element | null) => {
                  datapointRefs[i] = el as SVGRectElement | null;
                }) as never,
                class: "st-areaChart__navDatum",
                x: p.x - NAV_HIT / 2,
                y: p.y - NAV_HIT / 2,
                width: NAV_HIT,
                height: NAV_HIT,
                rx: "3",
                role: "img",
                tabindex: rovingTabIndex(i, focusedIndex.value, points.length),
                "aria-label": datapointAriaLabel(p.datum.x, p.datum.y),
                onKeydown: (event: KeyboardEvent) => handleDatapointKeyDown(event, i),
                onFocus: () => {
                  focusedIndex.value = i;
                  emitHoverKey(i);
                },
              }),
            ),
          )
        : null;

      // Crosshair vnodes (FR-3) — tokenised vertical line + marker at the active
      // key. Decorative (aria-hidden). Appended last so it sits on top.
      if (hoveredPoint) {
        svgChildren.push(
          h("g", { class: "st-areaChart__crosshair", "aria-hidden": "true" }, [
            h("line", {
              class: "st-areaChart__crosshairLine",
              x1: hoveredPoint.x,
              x2: hoveredPoint.x,
              y1: MARGIN.top,
              y2: MARGIN.top + plotHeight,
            }),
            h("circle", { class: "st-areaChart__crosshairMarker", cx: hoveredPoint.x, cy: hoveredPoint.y, r: "5" }),
          ]),
        );
      }

      return h("div", { ...attrs, class: classNames("st-areaChart", `st-areaChart--${tone}`, props.class) }, [
        h(
          "div",
          {
            class: "st-areaChart__visual",
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
            // Keyboard navigation overlay (FR-5) — a focusable, transparent hit
            // layer over the points. NOT aria-hidden: it is the accessible roving
            // cursor. Each rect announces its category + value; the focus ring is
            // tokenised via CSS. Absent unless keyboard nav is enabled.
            ...(navLayer ? [navLayer] : []),
          ],
        ),
        chartDataList(label, dataValueItems),
        hoveredPoint
          ? h(
              "div",
              {
                class: "st-areaChart__tooltip",
                role: "presentation",
                style: `left: ${(hoveredPoint.x / width) * 100}%; top: ${(hoveredPoint.y / height) * 100}%`,
              },
              [
                h("span", { class: "st-areaChart__tooltipLabel" }, String(hoveredPoint.datum.x)),
                h("span", { class: "st-areaChart__tooltipValue" }, String(hoveredPoint.datum.y)),
              ],
            )
          : null,
      ]);
    };
  },
});
