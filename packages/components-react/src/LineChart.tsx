import React from "react";
import { classNames } from "./classNames.js";
import {
  buildLinearPath,
  buildSmoothPath,
  CHART_MARGIN,
  ChartDataList,
  clampFraction,
  extendValueDomain,
  fixedLogTicks,
  fixedTicks,
  forecastRuns,
  formatTick,
  isNumeric,
  linearRegression,
  logTicks,
  niceTicks,
  overlayDataListItems,
  overlayToneClass,
  scaleLinear,
  smallestPositive,
  validLinearDomain,
  validLogDomain,
  type ChartBand,
  type ChartGoalLine,
  type ChartReferenceLine,
  type ChartScale,
  type ForecastRun,
} from "./chartScale.js";
import {
  annotationDataListItems,
  polygonPoints,
  resolveAnnotations,
  type ChartAnnotation,
} from "./chartAnnotations.js";
import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from "./chartDataLabels.js";
import { keyForX, resolveActiveIndex } from "./chartCrosshair.js";

export type LineChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type LineChartDatum = {
  x: number | string;
  y: number;
  /**
   * Marks the datum as a FORECAST point. Forecast points render with the
   * dedicated forecast tone and every segment touching a forecast point is
   * dashed — including the segment between the last actual point and the
   * first forecast point, so the line stays connected. Absent/false ⇒
   * rendering unchanged (additive).
   */
  forecast?: boolean;
};

export type LineChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: LineChartDatum[];
  width?: number;
  height?: number;
  tone?: LineChartTone;
  smooth?: boolean;
  area?: boolean;
  label: string;
  /** Reference lines (default `axis: "y"` → horizontal at `value`). */
  referenceLines?: ChartReferenceLine[];
  /** Shaded value-axis bands between `from`..`to`. */
  bands?: ChartBand[];
  /** A single goal line, emphasised above the data. */
  goalLine?: ChartGoalLine;
  /** Least-squares trend line over the data points. */
  trend?: boolean;
  /**
   * Annotation overlay in DATA space (points, labels, axis lines, regions,
   * polygons). Resolved to pixels via the chart's scales and drawn in a
   * dedicated `<g class="st-lineChart__annotations">` — regions behind the
   * series, every other kind above it. Additive: absent ⇒ unchanged.
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
   * Fixed value-axis (y) domain `[min, max]`. When provided (and finite,
   * min<max) the y scale uses it instead of the data-derived range. Invalid or
   * absent → auto range (unchanged).
   */
  domain?: [number, number];
  /**
   * Value-axis scale. `"linear"` (default) is unchanged. `"log"` switches the
   * y axis to base-10 logarithmic — values `<= 0` are ignored for domain/ticks
   * and clamped to the lowest tick when positioned.
   */
  scale?: ChartScale;
  /** Inverts the value (y) axis. Default false. */
  invertAxis?: boolean;
  /**
   * Toggles the legend if the chart has one. LineChart is single-series and has
   * no legend surface; accepted for parity and otherwise ignored.
   */
  showLegend?: boolean;
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
  className?: string;
};

const MARGIN = CHART_MARGIN;

export function LineChart({
  data,
  width = 480,
  height = 240,
  tone = "category1",
  smooth = false,
  area = false,
  label,
  referenceLines,
  bands,
  goalLine,
  trend = false,
  annotations,
  dataLabels,
  domain,
  scale = "linear",
  invertAxis = false,
  // Destructured to keep it off `...rest`; parity no-op (no legend surface).
  showLegend: _showLegend,
  hoverKey,
  onHoverKeyChange,
  className,
  ...rest
}: LineChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  const xDomain = (() => {
    if (data.length === 0) return { kind: "ordinal" as const, values: [] as (number | string)[] };
    const allNumeric = data.every((d) => isNumeric(d.x));
    if (allNumeric) {
      const xs = data.map((d) => d.x as number);
      return { kind: "numeric" as const, min: Math.min(...xs), max: Math.max(...xs) };
    }
    return { kind: "ordinal" as const, values: data.map((d) => d.x) };
  })();

  // A valid goal line needs a finite value; otherwise it is ignored entirely.
  const goal = goalLine && Number.isFinite(goalLine.value) ? goalLine : null;

  const isLog = scale === "log";
  // A fixed log domain must be strictly positive; otherwise the scale falls
  // back to the data-derived positive range.
  const validDomain = isLog ? validLogDomain(domain) : validLinearDomain(domain);

  const yTicks = (() => {
    const ys = data.map((d) => d.y).filter((y) => Number.isFinite(y));
    if (isLog) {
      const posOverlays = [
        ...(referenceLines ?? []).filter((r) => (r.axis ?? "y") === "y").map((r) => r.value),
        ...(bands ?? []).flatMap((b) => [b.from, b.to]),
        ...(goal ? [goal.value] : []),
      ];
      let lo: number;
      let hi: number;
      if (validDomain) {
        lo = validDomain[0];
        hi = validDomain[1];
      } else {
        lo = smallestPositive(...ys, ...posOverlays);
        hi = Math.max(lo, ...ys.filter((y) => y > 0), ...posOverlays.filter((v) => v > 0));
      }
      return validDomain ? fixedLogTicks(lo, hi) : logTicks(lo, hi);
    }
    if (validDomain) return fixedTicks(validDomain[0], validDomain[1], 5);
    if (ys.length === 0 && !referenceLines?.length && !bands?.length && !goal) return [0];
    let minRaw = ys.length ? Math.min(...ys) : 0;
    let maxRaw = ys.length ? Math.max(...ys) : 0;
    // Fold overlay values into the domain so they never fall outside the plot.
    [minRaw, maxRaw] = extendValueDomain(minRaw, maxRaw, {
      referenceLines,
      bands,
      goalLine: goal,
    });
    const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
    return niceTicks(minRaw - padded, maxRaw + padded, 5);
  })();

  const yDomain = yTicks.length === 0 ? { min: 0, max: 1 } : { min: yTicks[0], max: yTicks[yTicks.length - 1] };

  // Maps a y value to a fraction in [0,1] (0 = yDomain.min, 1 = yDomain.max),
  // honouring log scale + axis inversion. Linear + no invert is unchanged.
  const valueFraction = (v: number) => {
    let f: number;
    if (isLog) {
      const lo = Math.log10(yDomain.min);
      const hi = Math.log10(yDomain.max);
      const clamped = v > 0 ? v : yDomain.min;
      f = hi === lo ? 0 : (Math.log10(clamped) - lo) / (hi - lo);
    } else {
      f = yDomain.max === yDomain.min ? 0 : (v - yDomain.min) / (yDomain.max - yDomain.min);
    }
    return clampFraction(invertAxis ? 1 - f : f);
  };

  const points = (() => {
    if (data.length === 0) return [] as Array<{ x: number; y: number; datum: LineChartDatum; index: number }>;
    return data.map((d, i) => {
      let x: number;
      if (xDomain.kind === "numeric") {
        x = scaleLinear(d.x as number, xDomain.min, xDomain.max, 0, plotWidth);
      } else {
        const denom = Math.max(data.length - 1, 1);
        x = data.length === 1 ? plotWidth / 2 : (i / denom) * plotWidth;
      }
      const y = plotHeight * (1 - valueFraction(d.y));
      return { x: MARGIN.left + x, y: MARGIN.top + y, datum: d, index: i };
    });
  })();

  // --- Analytical overlays -------------------------------------------------
  // All overlays live in the chart's coordinate space, below the data series
  // (the goal line is the single exception, drawn above for emphasis).
  const valueToY = (v: number) => MARGIN.top + plotHeight * (1 - valueFraction(v));
  const dataValueToX = (v: number) =>
    xDomain.kind === "numeric"
      ? MARGIN.left + scaleLinear(v, xDomain.min, xDomain.max, 0, plotWidth)
      : null;

  const bandRects = (bands ?? [])
    .filter((b) => Number.isFinite(b.from) && Number.isFinite(b.to))
    .map((b, i) => {
      const y1 = valueToY(b.from);
      const y2 = valueToY(b.to);
      return {
        key: i,
        x: MARGIN.left,
        y: Math.min(y1, y2),
        width: plotWidth,
        height: Math.max(Math.abs(y2 - y1), 0.5),
        label: b.label,
        tone: b.tone,
      };
    });

  const refLines = (referenceLines ?? [])
    .filter((r) => Number.isFinite(r.value))
    .map((r, i) => {
      const axis = r.axis ?? "y";
      if (axis === "x") {
        const x = dataValueToX(r.value);
        if (x === null) return null; // x reference needs a numeric x domain
        return { key: i, axis, x1: x, x2: x, y1: MARGIN.top, y2: MARGIN.top + plotHeight, label: r.label, tone: r.tone };
      }
      const y = valueToY(r.value);
      return { key: i, axis, x1: MARGIN.left, x2: MARGIN.left + plotWidth, y1: y, y2: y, label: r.label, tone: r.tone };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  const goalGeom = goal
    ? { y: valueToY(goal.value), x1: MARGIN.left, x2: MARGIN.left + plotWidth, label: goal.label, value: goal.value }
    : null;

  // Trend = least-squares regression in DATA space, then projected to pixels.
  const trendModel =
    trend && xDomain.kind === "numeric"
      ? linearRegression(data.map((d) => ({ x: d.x as number, y: d.y })))
      : null;
  const trendLine =
    trendModel && xDomain.kind === "numeric"
      ? {
          x1: MARGIN.left + scaleLinear(trendModel.minX, xDomain.min, xDomain.max, 0, plotWidth),
          y1: valueToY(trendModel.slope * trendModel.minX + trendModel.intercept),
          x2: MARGIN.left + scaleLinear(trendModel.maxX, xDomain.min, xDomain.max, 0, plotWidth),
          y2: valueToY(trendModel.slope * trendModel.maxX + trendModel.intercept),
        }
      : null;

  // --- Annotation overlay ---------------------------------------------------
  // Data-space annotations resolved to absolute pixels via the chart scales.
  // `xScale` honours the ordinal/numeric x domain (a category matches by
  // equality, a numeric value must sit inside the domain); `yScale` reuses the
  // value fraction. Out-of-domain coordinates yield `null` → the resolver drops
  // them, so an annotation never escapes the plot.
  const ordinalIndex = (v: number | string) => {
    if (xDomain.kind !== "ordinal") return null;
    const i = data.findIndex((d) => d.x === v);
    if (i < 0) return null;
    const denom = Math.max(data.length - 1, 1);
    return data.length === 1 ? plotWidth / 2 : (i / denom) * plotWidth;
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
    if (!Number.isFinite(v)) return null;
    return plotHeight * (1 - valueFraction(v));
  };
  const resolvedAnnotations = resolveAnnotations(annotations, {
    xScale: annotationXScale,
    yScale: annotationYScale,
    plotLeft: MARGIN.left,
    plotTop: MARGIN.top,
    plotWidth,
    plotHeight,
  });
  const annotationRegions = resolvedAnnotations.filter((a) => a.kind === "region");
  const annotationAbove = resolvedAnnotations.filter((a) => a.kind !== "region");

  // --- Data labels ----------------------------------------------------------
  // One value label per point. Default `top`: just above the dot. `center`
  // sits on the dot. aria-hidden (values are in the ChartDataList already).
  const dataLabelOpts = normalizeDataLabels(dataLabels);
  const dataLabelItems = dataLabelOpts.enabled
    ? points.map((p) => {
        const text = formatDataLabel(p.datum.y, dataLabelOpts, formatTick);
        const center = dataLabelOpts.position === "center" || dataLabelOpts.position === "inside";
        return { key: p.index, x: p.x, y: center ? p.y : p.y - 8, text, baseline: (center ? "middle" : "auto") as "middle" | "auto" };
      })
    : [];

  // --- Forecast segments ------------------------------------------------------
  // A datum with `forecast: true` renders as a forecast point: its dot takes
  // the forecast tone and every segment touching a forecast point is dashed,
  // so the actual→forecast transition stays connected. Without any forecast
  // datum the single solid path below is identical to before (additive).
  const forecastFlags = data.map((d) => d.forecast === true);
  const hasForecast = forecastFlags.some(Boolean);

  const dataValueItems = [
    ...data.map((d, i) => (forecastFlags[i] ? `${d.x}: ${d.y} (prévision)` : `${d.x}: ${d.y}`)),
    ...overlayDataListItems({ referenceLines, bands, goalLine: goal, trend: trendModel }),
    ...annotationDataListItems(annotations),
  ];

  // Full-series path (area fill always covers the whole series).
  const fullLinePath = points.length === 0 ? "" : smooth ? buildSmoothPath(points) : buildLinearPath(points);

  // Solid (actual) + dashed (forecast) sub-paths. Without any forecast datum
  // the solid list is exactly [fullLinePath] — the previous single path.
  const segmentPath = (run: ForecastRun) => {
    const seg = points.slice(run.start, run.end + 1);
    return smooth ? buildSmoothPath(seg) : buildLinearPath(seg);
  };
  const runs = hasForecast ? forecastRuns(forecastFlags) : [];
  const solidPaths = hasForecast
    ? runs.filter((r) => !r.forecast).map(segmentPath)
    : fullLinePath
      ? [fullLinePath]
      : [];
  const forecastPaths = runs.filter((r) => r.forecast).map(segmentPath);

  const areaPath = (() => {
    if (!area || points.length === 0) return "";
    const base = MARGIN.top + plotHeight;
    const first = points[0];
    const last = points[points.length - 1];
    return `${fullLinePath} L${last.x.toFixed(2)},${base.toFixed(2)} L${first.x.toFixed(2)},${base.toFixed(2)} Z`;
  })();

  const gridLines = yTicks.map((tick) => ({
    value: tick,
    y: MARGIN.top + plotHeight * (1 - valueFraction(tick)),
  }));

  const xTickEntries = (() => {
    if (data.length === 0) return [] as Array<{ x: number; label: string }>;
    if (xDomain.kind === "ordinal") {
      return points.map((p, i) => ({ x: p.x, label: String(data[i].x) }));
    }
    const target = Math.min(5, data.length);
    const stride = Math.max(1, Math.round((data.length - 1) / (target - 1 || 1)));
    const entries: { x: number; label: string }[] = [];
    for (let i = 0; i < data.length; i += stride) {
      entries.push({ x: points[i].x, label: String(data[i].x) });
    }
    const lastIdx = data.length - 1;
    if (entries[entries.length - 1]?.label !== String(data[lastIdx].x)) {
      entries.push({ x: points[lastIdx].x, label: String(data[lastIdx].x) });
    }
    return entries;
  })();

  // Stable key per datum (FR-3): `String(x)`. Used both to resolve a controlled
  // `hoverKey` to an index and to emit `onHoverKeyChange` from pointer events.
  const hoverKeys = data.map((d) => keyForX(d.x));

  function emitHoverKey(index: number | null) {
    onHoverKeyChange?.(index == null ? null : hoverKeys[index] ?? null);
  }
  function handleLeave() {
    setHoveredIndex(null);
    emitHoverKey(null);
  }
  function handleVisualPointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredIndex(null);
      emitHoverKey(null);
      return;
    }
    const raw = Number(target.getAttribute("data-chart-index"));
    const index = Number.isInteger(raw) ? raw : null;
    setHoveredIndex(index);
    emitHoverKey(index);
  }

  // Index whose crosshair/tooltip is DISPLAYED: the controlled `hoverKey` when
  // provided (resolved against `hoverKeys`), else the internal pointer index.
  const activeIndex = resolveActiveIndex(hoverKey, hoveredIndex, hoverKeys);
  const hoveredPoint = activeIndex >= 0 ? points[activeIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-lineChart", `st-lineChart--${tone}`, className)}>
      <div
        className="st-lineChart__visual"
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
          {gridLines.map((g) => (
            <React.Fragment key={g.value}>
              <line className="st-lineChart__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={g.y} y2={g.y} />
              <text
                className="st-lineChart__tickLabel"
                x={MARGIN.left - 6}
                y={g.y}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {formatTick(g.value)}
              </text>
            </React.Fragment>
          ))}

          <line className="st-lineChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
          <line
            className="st-lineChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {xTickEntries.map((tick, i) => (
            <text
              key={i}
              className="st-lineChart__tickLabel"
              x={tick.x}
              y={height - MARGIN.bottom + 16}
              textAnchor="middle"
            >
              {tick.label}
            </text>
          ))}

          {/* Analytical overlays — bands + reference lines + trend sit BELOW the
              data (markers, not series); the goal line is drawn above. */}
          {bandRects.map((b) => (
            <React.Fragment key={`band-${b.key}`}>
              <rect
                className={classNames("st-lineChart__band", overlayToneClass("st-lineChart__band", b.tone))}
                x={b.x}
                y={b.y}
                width={b.width}
                height={b.height}
              />
              {b.label ? (
                <text className="st-lineChart__overlayLabel" x={b.x + 4} y={b.y + 11}>
                  {b.label}
                </text>
              ) : null}
            </React.Fragment>
          ))}

          {refLines.map((r) => (
            <React.Fragment key={`ref-${r.key}`}>
              <line
                className={classNames("st-lineChart__refLine", overlayToneClass("st-lineChart__refLine", r.tone))}
                x1={r.x1}
                x2={r.x2}
                y1={r.y1}
                y2={r.y2}
              />
              {r.label ? (
                <text
                  className="st-lineChart__overlayLabel"
                  x={r.axis === "x" ? r.x1 + 4 : MARGIN.left + plotWidth - 4}
                  y={r.axis === "x" ? MARGIN.top + 11 : r.y1 - 4}
                  textAnchor={r.axis === "x" ? "start" : "end"}
                >
                  {r.label}
                </text>
              ) : null}
            </React.Fragment>
          ))}

          {trendLine ? (
            <line
              className="st-lineChart__trend"
              x1={trendLine.x1}
              y1={trendLine.y1}
              x2={trendLine.x2}
              y2={trendLine.y2}
            />
          ) : null}

          {/* Annotation regions sit BEHIND the series (filled bands). */}
          {annotationRegions.length > 0 ? (
            <g className="st-lineChart__annotations st-lineChart__annotations--behind">
              {annotationRegions.map((a) =>
                a.kind === "region" ? (
                  <React.Fragment key={`ann-region-${a.key}`}>
                    <rect className="st-lineChart__annotationRegion" x={a.x} y={a.y} width={a.width} height={a.height} />
                    {a.label ? (
                      <text className="st-lineChart__annotationLabel" x={a.x + 4} y={a.y + 11}>
                        {a.label}
                      </text>
                    ) : null}
                  </React.Fragment>
                ) : null,
              )}
            </g>
          ) : null}

          {area && areaPath ? <path className="st-lineChart__area" d={areaPath} /> : null}
          {solidPaths.map((d, i) => (
            <path
              key={`line-${i}`}
              className="st-lineChart__line"
              d={d}
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {forecastPaths.map((d, i) => (
            <path
              key={`forecast-${i}`}
              className="st-lineChart__line st-lineChart__line--forecast"
              d={d}
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {points.map((p) => (
            <circle
              key={p.index}
              className={classNames("st-lineChart__dot", forecastFlags[p.index] && "st-lineChart__dot--forecast")}
              cx={p.x}
              cy={p.y}
              r="4"
              data-chart-index={p.index}
            />
          ))}

          {/* Goal line — emphasised, ABOVE the data. */}
          {goalGeom ? (
            <>
              <line
                className="st-lineChart__goalLine"
                x1={goalGeom.x1}
                x2={goalGeom.x2}
                y1={goalGeom.y}
                y2={goalGeom.y}
              />
              <text
                className="st-lineChart__goalLabel"
                x={MARGIN.left + plotWidth - 4}
                y={goalGeom.y - 4}
                textAnchor="end"
              >
                {goalGeom.label ?? `Objectif ${goalGeom.value}`}
              </text>
            </>
          ) : null}

          {/* Annotations ABOVE the series: lines, shapes, points, labels. */}
          {annotationAbove.length > 0 ? (
            <g className="st-lineChart__annotations st-lineChart__annotations--above">
              {annotationAbove.map((a) => {
                if (a.kind === "line") {
                  return (
                    <React.Fragment key={`ann-line-${a.key}`}>
                      <line className="st-lineChart__annotationLine" x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} />
                      {a.label ? (
                        <text
                          className="st-lineChart__annotationLabel"
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
                      <polygon className="st-lineChart__annotationShape" points={polygonPoints(a.points)} />
                      {a.label ? (
                        <text className="st-lineChart__annotationLabel" x={a.labelX} y={a.labelY} textAnchor="middle">
                          {a.label}
                        </text>
                      ) : null}
                    </React.Fragment>
                  );
                }
                if (a.kind === "point") {
                  return (
                    <React.Fragment key={`ann-point-${a.key}`}>
                      <circle className="st-lineChart__annotationPoint" cx={a.x} cy={a.y} r="4.5" />
                      {a.label ? (
                        <text className="st-lineChart__annotationLabel" x={a.x} y={a.y - 8} textAnchor="middle">
                          {a.label}
                        </text>
                      ) : null}
                    </React.Fragment>
                  );
                }
                return (
                  <text key={`ann-label-${a.key}`} className="st-lineChart__annotationText" x={a.x} y={a.y} textAnchor={a.anchor}>
                    {a.text}
                  </text>
                );
              })}
            </g>
          ) : null}

          {/* Data labels — one value per point, drawn on top. aria-hidden. */}
          {dataLabelItems.length > 0 ? (
            <g className="st-lineChart__dataLabels" aria-hidden="true">
              {dataLabelItems.map((d) => (
                <text
                  key={d.key}
                  className="st-lineChart__dataLabel"
                  x={d.x}
                  y={d.y}
                  textAnchor="middle"
                  dominantBaseline={d.baseline}
                >
                  {d.text}
                </text>
              ))}
            </g>
          ) : null}

          {/* Crosshair (FR-3) — a tokenised vertical line + marker at the active
              key. Decorative (aria-hidden); the value is in the tooltip + list. */}
          {hoveredPoint ? (
            <g className="st-lineChart__crosshair" aria-hidden="true">
              <line
                className="st-lineChart__crosshairLine"
                x1={hoveredPoint.x}
                x2={hoveredPoint.x}
                y1={MARGIN.top}
                y2={MARGIN.top + plotHeight}
              />
              <circle className="st-lineChart__crosshairMarker" cx={hoveredPoint.x} cy={hoveredPoint.y} r="5" />
            </g>
          ) : null}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hoveredPoint ? (
        <div
          className="st-lineChart__tooltip"
          role="presentation"
          style={{ left: `${(hoveredPoint.x / width) * 100}%`, top: `${(hoveredPoint.y / height) * 100}%` }}
        >
          <span className="st-lineChart__tooltipLabel">{hoveredPoint.datum.x}</span>
          <span className="st-lineChart__tooltipValue">{hoveredPoint.datum.y}</span>
        </div>
      ) : null}
    </div>
  );
}
