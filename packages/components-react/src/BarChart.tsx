import React from "react";
import { classNames } from "./classNames.js";
import {
  CHART_MARGIN,
  ChartDataList,
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
import {
  annotationDataListItems,
  polygonPoints,
  resolveAnnotations,
  type ChartAnnotation,
} from "./chartAnnotations.js";
import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from "./chartDataLabels.js";

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

export type BarChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "onSelect"> & {
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
   * Annotation overlay in DATA space. The x coordinate is CATEGORICAL — it
   * matches a bar by its `label` (centre of band) and is ignored otherwise; the
   * y coordinate (and `value`/`from`/`to`) are value-axis numbers. Regions
   * render behind the bars, every other kind above. Additive: absent ⇒
   * unchanged.
   */
  annotations?: ChartAnnotation[];
  /**
   * Per-bar value labels. `false`/absent (default) → none. `true` → each bar's
   * value with the chart's numeric formatter. Object → `format(value)` and/or a
   * `position` override. Default position is `outside` (above the bar in
   * vertical mode, past the bar end in horizontal mode). Labels are
   * `aria-hidden` — the values already live in the accessible ChartDataList.
   */
  dataLabels?: DataLabelsProp;
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
  className?: string;
};

const MARGIN = CHART_MARGIN;

export function BarChart({
  data,
  width = 480,
  height = 240,
  orientation = "vertical",
  label,
  domain,
  selectedKeys = [],
  onSelect,
  referenceLines,
  bands,
  goalLine,
  annotations,
  dataLabels,
  scale = "linear",
  invertAxis = false,
  // Destructured to keep it off `...rest` (the wrapper div); parity no-op since
  // BarChart has no dedicated legend surface.
  showLegend: _showLegend,
  className,
  ...rest
}: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  // Selection (controlled): fast lookup + "is any bar selected" flag. Only when
  // something is selected do we dim the non-selected bars.
  const selectedSet = React.useMemo(() => new Set(selectedKeys), [selectedKeys]);
  const hasSelection = selectedSet.size > 0;
  const interactive = typeof onSelect === "function";

  // A finite goal value is required; otherwise the goal line is ignored.
  const goal = goalLine && Number.isFinite(goalLine.value) ? goalLine : null;
  // Finite error-bar extents must also stay inside the plot.
  const errorExtents = data.flatMap((d) =>
    [d.errorLow, d.errorHigh].filter((v): v is number => v !== undefined && Number.isFinite(v)),
  );

  const isLog = scale === "log";
  // Log domains must be strictly positive; invalid fixed domains fall back to
  // the data-derived range.
  const validDomain = isLog ? validLogDomain(domain) : validLinearDomain(domain);
  const valueAxis = orientation === "vertical" ? "y" : "x";
  const valueReferenceLines = (referenceLines ?? []).filter((r) => (r.axis ?? "y") === valueAxis);
  const values = data.map((d) => d.value);
  let ticks: number[];
  if (isLog) {
    // A log axis is undefined for values <= 0; floor = smallest strictly-positive
    // value across data + finite overlays, ceil = the largest. No linear "0 base".
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
    // A pinned domain is authoritative (small-multiples); only the auto domain is
    // widened to keep finite overlays + error bars on-plot.
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

  // Maps a value to a fraction in [0,1] along the value axis, honouring log scale
  // and axis inversion. Linear + no invert reproduces the previous behaviour.
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
  // Bar baseline value: 0 on a linear axis when it is in-domain, otherwise the
  // nearest fixed-domain bound. Log uses the lowest positive bound.
  const baselineValue = isLog ? domainMin : Math.min(domainMax, Math.max(domainMin, 0));

  const bars = (() => {
    if (data.length === 0) return [] as Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      cx: number;
      cy: number;
      datum: BarChartDatum;
      tone: BarChartTone;
    }>;
    if (orientation === "vertical") {
      const band = plotWidth / data.length;
      const barWidth = band * 0.62;
      const yOf = (v: number) => plotHeight * (1 - valueFraction(v));
      const zeroY = yOf(baselineValue);
      return data.map((d, i) => {
        const valueY = yOf(d.value);
        const y = Math.min(valueY, zeroY);
        const h = Math.abs(zeroY - valueY);
        const x = MARGIN.left + band * i + (band - barWidth) / 2;
        return {
          x,
          y: MARGIN.top + y,
          width: barWidth,
          height: Math.max(h, 0.5),
          cx: MARGIN.left + band * (i + 0.5),
          cy: MARGIN.top + valueY,
          datum: d,
          tone: (d.tone ?? "category1") as BarChartTone,
        };
      });
    }
    const band = plotHeight / data.length;
    const barHeight = band * 0.62;
    const xOf = (v: number) => plotWidth * valueFraction(v);
    const zeroX = xOf(baselineValue);
    return data.map((d, i) => {
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
  })();

  // --- Analytical overlays + error bars ------------------------------------
  // The value axis is vertical (y) when orientation === "vertical", else
  // horizontal (x). `valuePos` maps a value to its pixel coordinate on that
  // axis; everything else is shared geometry.
  const isVertical = orientation === "vertical";
  const valuePos = (v: number) =>
    isVertical
      ? MARGIN.top + plotHeight * (1 - valueFraction(v))
      : MARGIN.left + plotWidth * valueFraction(v);
  const valueAxisEnd = isVertical ? MARGIN.left + plotWidth : MARGIN.top + plotHeight;

  const bandRects = (bands ?? [])
    .filter((b) => Number.isFinite(b.from) && Number.isFinite(b.to))
    .map((b, i) => {
      const p1 = valuePos(b.from);
      const p2 = valuePos(b.to);
      return isVertical
        ? {
            key: i,
            x: MARGIN.left,
            y: Math.min(p1, p2),
            width: plotWidth,
            height: Math.max(Math.abs(p2 - p1), 0.5),
            label: b.label,
            tone: b.tone,
          }
        : {
            key: i,
            x: Math.min(p1, p2),
            y: MARGIN.top,
            width: Math.max(Math.abs(p2 - p1), 0.5),
            height: plotHeight,
            label: b.label,
            tone: b.tone,
          };
    });

  const refLines = (referenceLines ?? [])
    .filter((r) => Number.isFinite(r.value))
    .map((r, i) => {
      // For a BarChart the value axis carries `axis: "y"` for vertical bars and
      // `axis: "x"` for horizontal; a reference always tracks the VALUE axis.
      const p = valuePos(r.value);
      return isVertical
        ? { key: i, x1: MARGIN.left, x2: MARGIN.left + plotWidth, y1: p, y2: p, label: r.label, tone: r.tone }
        : { key: i, x1: p, x2: p, y1: MARGIN.top, y2: MARGIN.top + plotHeight, label: r.label, tone: r.tone };
    });

  const goalGeom = goal
    ? isVertical
      ? { vertical: true as const, p: valuePos(goal.value), label: goal.label, value: goal.value }
      : { vertical: false as const, p: valuePos(goal.value), label: goal.label, value: goal.value }
    : null;

  // Error bars: a whisker along the value axis, centred on each bar.
  const errorBarGeom = bars
    .map((bar) => {
      const { errorLow, errorHigh } = bar.datum;
      const hasLow = errorLow !== undefined && Number.isFinite(errorLow);
      const hasHigh = errorHigh !== undefined && Number.isFinite(errorHigh);
      if (!hasLow && !hasHigh) return null;
      const lowV = hasLow ? (errorLow as number) : bar.datum.value;
      const highV = hasHigh ? (errorHigh as number) : bar.datum.value;
      const lowP = valuePos(lowV);
      const highP = valuePos(highV);
      const cap = 4;
      if (isVertical) {
        const cx = bar.x + bar.width / 2;
        return {
          key: bar.datum.label,
          stem: { x1: cx, x2: cx, y1: lowP, y2: highP },
          capLow: { x1: cx - cap, x2: cx + cap, y1: lowP, y2: lowP },
          capHigh: { x1: cx - cap, x2: cx + cap, y1: highP, y2: highP },
        };
      }
      const cy = bar.y + bar.height / 2;
      return {
        key: bar.datum.label,
        stem: { x1: lowP, x2: highP, y1: cy, y2: cy },
        capLow: { x1: lowP, x2: lowP, y1: cy - cap, y2: cy + cap },
        capHigh: { x1: highP, x2: highP, y1: cy - cap, y2: cy + cap },
      };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);

  // --- Annotation overlay ---------------------------------------------------
  // The x coordinate is CATEGORICAL (a bar `label` → centre of band); the y
  // coordinate is a value-axis number. For a HORIZONTAL chart the value axis is
  // x and the category axis is y, so the data-space (x=category, y=value)
  // convention is transposed onto the pixel axes: the resolver's `xScale` maps
  // the value, `yScale` the category, and each annotation's `axis`/coords are
  // swapped so a value reference (`axis: "y"`) still spans the full plot.
  const categoryPixel = (v: number | string): number | null => {
    const bar = bars.find((b) => b.datum.label === String(v));
    if (!bar) return null;
    return isVertical ? bar.cx - MARGIN.left : bar.cy - MARGIN.top;
  };
  const valuePixelRel = (v: number): number | null => {
    if (!Number.isFinite(v)) return null;
    return valuePos(v) - (isVertical ? MARGIN.top : MARGIN.left);
  };
  const transposeAnnotations = (list: ChartAnnotation[] | undefined): ChartAnnotation[] | undefined => {
    if (!list || isVertical) return list;
    // Horizontal: swap the data-space x/y (and the region/line axis) so the
    // generic resolver — which always emits xScale→x-pixel, yScale→y-pixel —
    // lands the value on the x axis and the category on the y axis.
    return list.map((a): ChartAnnotation => {
      switch (a.kind) {
        case "line":
          return { ...a, axis: a.axis === "x" ? "y" : "x" };
        case "region":
          return { ...a, axis: a.axis === "x" ? "y" : "x" };
        case "point":
          return { ...a, x: a.y, y: typeof a.x === "number" ? a.x : NaN } as ChartAnnotation;
        case "label":
          return { ...a, x: a.y, y: typeof a.x === "number" ? a.x : NaN } as ChartAnnotation;
        case "shape":
          return { ...a, points: a.points.map((p) => ({ x: p.y, y: typeof p.x === "number" ? p.x : NaN })) };
      }
    });
  };
  const annXScale = (v: number | string): number | null =>
    isVertical ? categoryPixel(v) : typeof v === "number" ? valuePixelRel(v) : null;
  const annYScale = (v: number): number | null => (isVertical ? valuePixelRel(v) : categoryPixel(v));
  const resolvedAnnotations = resolveAnnotations(transposeAnnotations(annotations), {
    xScale: annXScale,
    yScale: annYScale,
    plotLeft: MARGIN.left,
    plotTop: MARGIN.top,
    plotWidth,
    plotHeight,
  });
  const annotationRegions = resolvedAnnotations.filter((a) => a.kind === "region");
  const annotationAbove = resolvedAnnotations.filter((a) => a.kind !== "region");

  // --- Data labels ----------------------------------------------------------
  // One value label per bar, placed at the bar's value end. Default `outside`:
  // above the bar (vertical) / past the bar end (horizontal). `inside`/`center`
  // sit at the bar's mid-length. Labels are aria-hidden (values are in the
  // ChartDataList already).
  const dataLabelOpts = normalizeDataLabels(dataLabels);
  const dataLabelItems = dataLabelOpts.enabled
    ? bars.map((bar) => {
        const text = formatDataLabel(bar.datum.value, dataLabelOpts, formatTick);
        const pos = dataLabelOpts.position ?? "outside";
        const inside = pos === "inside" || pos === "center";
        if (isVertical) {
          const x = bar.cx;
          const y = inside ? (bar.y + bar.height / 2) : (bar.cy - 6);
          return { key: bar.datum.label, x, y, text, anchor: "middle" as const, baseline: (inside ? "middle" : "auto") as "middle" | "auto" };
        }
        const y = bar.cy;
        const x = inside ? (bar.x + bar.width / 2) : (bar.cx + 4);
        return { key: bar.datum.label, x, y, text, anchor: inside ? ("middle" as const) : ("start" as const), baseline: "middle" as const };
      })
    : [];

  const dataValueItems = [
    ...data.map((d) => `${d.label}: ${d.value}`),
    ...overlayDataListItems({ referenceLines, bands, goalLine: goal, trend: null }),
    ...annotationDataListItems(annotations),
  ];

  const valueAxisTicks =
    orientation === "vertical"
      ? ticks.map((tick) => ({
          value: tick,
          x1: MARGIN.left,
          x2: MARGIN.left + plotWidth,
          y: MARGIN.top + plotHeight * (1 - valueFraction(tick)),
        }))
      : ticks.map((tick) => ({
          value: tick,
          x: MARGIN.left + plotWidth * valueFraction(tick),
          y1: MARGIN.top,
          y2: MARGIN.top + plotHeight,
        }));

  function handleLeave() {
    setHoveredIndex(null);
  }
  function handleVisualPointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredIndex(null);
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    setHoveredIndex(Number.isInteger(index) ? index : null);
  }

  const hoveredBar = hoveredIndex !== null ? bars[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-barChart", className)}>
      <div
        className="st-barChart__visual"
        role="img"
        aria-label={label}
        onPointerMove={handleVisualPointerMove}
        onPointerLeave={handleLeave}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          {orientation === "vertical"
            ? (valueAxisTicks as Array<{ value: number; x1: number; x2: number; y: number }>).map((tick) => (
                <React.Fragment key={tick.value}>
                  <line className="st-barChart__grid" x1={tick.x1} x2={tick.x2} y1={tick.y} y2={tick.y} />
                  <text
                    className="st-barChart__tickLabel"
                    x={MARGIN.left - 6}
                    y={tick.y}
                    textAnchor="end"
                    dominantBaseline="middle"
                  >
                    {formatTick(tick.value)}
                  </text>
                </React.Fragment>
              ))
            : (valueAxisTicks as Array<{ value: number; x: number; y1: number; y2: number }>).map((tick) => (
                <React.Fragment key={tick.value}>
                  <line className="st-barChart__grid" x1={tick.x} x2={tick.x} y1={tick.y1} y2={tick.y2} />
                  <text
                    className="st-barChart__tickLabel"
                    x={tick.x}
                    y={height - MARGIN.bottom + 16}
                    textAnchor="middle"
                  >
                    {formatTick(tick.value)}
                  </text>
                </React.Fragment>
              ))}

          <line className="st-barChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
          <line
            className="st-barChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {bars.map((bar) =>
            orientation === "vertical" ? (
              <text
                key={bar.datum.label}
                className="st-barChart__categoryLabel"
                x={bar.x + bar.width / 2}
                y={height - MARGIN.bottom + 16}
                textAnchor="middle"
              >
                {bar.datum.label}
              </text>
            ) : (
              <text
                key={bar.datum.label}
                className="st-barChart__categoryLabel"
                x={MARGIN.left - 6}
                y={bar.y + bar.height / 2}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {bar.datum.label}
              </text>
            ),
          )}

          {/* Analytical overlays — bands + reference lines BELOW the bars. */}
          {bandRects.map((b) => (
            <React.Fragment key={`band-${b.key}`}>
              <rect
                className={classNames("st-barChart__band", overlayToneClass("st-barChart__band", b.tone))}
                x={b.x}
                y={b.y}
                width={b.width}
                height={b.height}
              />
              {b.label ? (
                <text className="st-barChart__overlayLabel" x={b.x + 4} y={b.y + 11}>
                  {b.label}
                </text>
              ) : null}
            </React.Fragment>
          ))}

          {refLines.map((r) => (
            <React.Fragment key={`ref-${r.key}`}>
              <line
                className={classNames("st-barChart__refLine", overlayToneClass("st-barChart__refLine", r.tone))}
                x1={r.x1}
                x2={r.x2}
                y1={r.y1}
                y2={r.y2}
              />
              {r.label ? (
                <text
                  className="st-barChart__overlayLabel"
                  x={isVertical ? valueAxisEnd - 4 : r.x1 + 4}
                  y={isVertical ? r.y1 - 4 : MARGIN.top + 11}
                  textAnchor={isVertical ? "end" : "start"}
                >
                  {r.label}
                </text>
              ) : null}
            </React.Fragment>
          ))}

          {/* Annotation regions sit BEHIND the bars (filled bands). */}
          {annotationRegions.length > 0 ? (
            <g className="st-barChart__annotations st-barChart__annotations--behind">
              {annotationRegions.map((a) =>
                a.kind === "region" ? (
                  <React.Fragment key={`ann-region-${a.key}`}>
                    <rect className="st-barChart__annotationRegion" x={a.x} y={a.y} width={a.width} height={a.height} />
                    {a.label ? (
                      <text className="st-barChart__annotationLabel" x={a.x + 4} y={a.y + 11}>
                        {a.label}
                      </text>
                    ) : null}
                  </React.Fragment>
                ) : null,
              )}
            </g>
          ) : null}

          {/* The bars live inside an aria-hidden SVG, so they are NEVER an
              accessible surface. When `onSelect` is provided they only carry a
              mouse click shortcut (cursor:pointer) for sighted pointer users —
              keyboard + screen readers use the filter-chip buttons below, which
              are rendered outside this SVG. */}
          {bars.map((bar, i) => {
            const isSelected = selectedSet.has(bar.datum.label);
            return (
              <rect
                key={bar.datum.label}
                className={classNames(
                  "st-barChart__bar",
                  `st-barChart__bar--${bar.tone}`,
                  isSelected && "st-barChart__bar--selected",
                  hasSelection && !isSelected && "st-barChart__bar--dim",
                  interactive && "st-barChart__bar--interactive",
                )}
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                rx="2"
                data-chart-index={i}
                onClick={interactive ? () => onSelect?.(bar.datum.label) : undefined}
              />
            );
          })}

          {/* Error bars ride on top of their bar (still below the goal line). */}
          {errorBarGeom.map((e) => (
            <g key={`err-${e.key}`} className="st-barChart__errorBar">
              <line className="st-barChart__errorStem" x1={e.stem.x1} y1={e.stem.y1} x2={e.stem.x2} y2={e.stem.y2} />
              <line className="st-barChart__errorCap" x1={e.capLow.x1} y1={e.capLow.y1} x2={e.capLow.x2} y2={e.capLow.y2} />
              <line className="st-barChart__errorCap" x1={e.capHigh.x1} y1={e.capHigh.y1} x2={e.capHigh.x2} y2={e.capHigh.y2} />
            </g>
          ))}

          {/* Goal line — emphasised, ABOVE the bars. */}
          {goalGeom ? (
            <>
              {goalGeom.vertical ? (
                <line
                  className="st-barChart__goalLine"
                  x1={MARGIN.left}
                  x2={MARGIN.left + plotWidth}
                  y1={goalGeom.p}
                  y2={goalGeom.p}
                />
              ) : (
                <line
                  className="st-barChart__goalLine"
                  x1={goalGeom.p}
                  x2={goalGeom.p}
                  y1={MARGIN.top}
                  y2={MARGIN.top + plotHeight}
                />
              )}
              <text
                className="st-barChart__goalLabel"
                x={goalGeom.vertical ? MARGIN.left + plotWidth - 4 : goalGeom.p + 4}
                y={goalGeom.vertical ? goalGeom.p - 4 : MARGIN.top + 11}
                textAnchor={goalGeom.vertical ? "end" : "start"}
              >
                {goalGeom.label ?? `Objectif ${goalGeom.value}`}
              </text>
            </>
          ) : null}

          {/* Annotations ABOVE the bars: lines, shapes, points, labels. */}
          {annotationAbove.length > 0 ? (
            <g className="st-barChart__annotations st-barChart__annotations--above">
              {annotationAbove.map((a) => {
                if (a.kind === "line") {
                  return (
                    <React.Fragment key={`ann-line-${a.key}`}>
                      <line className="st-barChart__annotationLine" x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} />
                      {a.label ? (
                        <text
                          className="st-barChart__annotationLabel"
                          x={a.axis === "x" ? a.x1 + 4 : MARGIN.left + plotWidth - 4}
                          y={a.axis === "x" ? MARGIN.top + 11 : a.y1 - 4}
                          textAnchor={a.axis === "x" ? "start" : "end"}
                        >
                          {a.label}
                        </text>
                      ) : null}
                    </React.Fragment>
                  );
                }
                if (a.kind === "shape") {
                  return (
                    <React.Fragment key={`ann-shape-${a.key}`}>
                      <polygon className="st-barChart__annotationShape" points={polygonPoints(a.points)} />
                      {a.label ? (
                        <text className="st-barChart__annotationLabel" x={a.labelX} y={a.labelY} textAnchor="middle">
                          {a.label}
                        </text>
                      ) : null}
                    </React.Fragment>
                  );
                }
                if (a.kind === "point") {
                  return (
                    <React.Fragment key={`ann-point-${a.key}`}>
                      <circle className="st-barChart__annotationPoint" cx={a.x} cy={a.y} r="4.5" />
                      {a.label ? (
                        <text className="st-barChart__annotationLabel" x={a.x} y={a.y - 8} textAnchor="middle">
                          {a.label}
                        </text>
                      ) : null}
                    </React.Fragment>
                  );
                }
                return (
                  <text key={`ann-label-${a.key}`} className="st-barChart__annotationText" x={a.x} y={a.y} textAnchor={a.anchor}>
                    {a.text}
                  </text>
                );
              })}
            </g>
          ) : null}

          {/* Data labels — one value per bar, drawn on top. aria-hidden. */}
          {dataLabelItems.length > 0 ? (
            <g className="st-barChart__dataLabels" aria-hidden="true">
              {dataLabelItems.map((d) => (
                <text
                  key={d.key}
                  className="st-barChart__dataLabel"
                  x={d.x}
                  y={d.y}
                  textAnchor={d.anchor}
                  dominantBaseline={d.baseline}
                >
                  {d.text}
                </text>
              ))}
            </g>
          ) : null}
        </svg>
      </div>

      {interactive ? (
        <div className="st-barChart__filters" role="group" aria-label={`Filtrer par ${label}`}>
          {bars.map((bar) => {
            const isSelected = selectedSet.has(bar.datum.label);
            return (
              <button
                key={bar.datum.label}
                type="button"
                className={classNames(
                  "st-barChart__filterChip",
                  `st-barChart__filterChip--${bar.tone}`,
                  isSelected && "st-barChart__filterChip--selected",
                )}
                aria-pressed={isSelected}
                onClick={() => onSelect?.(bar.datum.label)}
              >
                <span className="st-barChart__filterSwatch" aria-hidden="true" />
                {`${bar.datum.label}: ${bar.datum.value}`}
              </button>
            );
          })}
        </div>
      ) : null}

      <ChartDataList label={label} items={dataValueItems} />

      {hoveredBar ? (
        <div
          className="st-barChart__tooltip"
          role="presentation"
          style={{ left: `${(hoveredBar.cx / width) * 100}%`, top: `${(hoveredBar.cy / height) * 100}%` }}
        >
          <span className="st-barChart__tooltipLabel">{hoveredBar.datum.label}</span>
          <span className="st-barChart__tooltipValue">{hoveredBar.datum.value}</span>
        </div>
      ) : null}
    </div>
  );
}
