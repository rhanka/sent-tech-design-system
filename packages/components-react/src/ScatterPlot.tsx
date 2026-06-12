import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";
import {
  annotationDataListItems,
  polygonPoints,
  resolveAnnotations,
  type ChartAnnotation,
} from "./chartAnnotations.js";
import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from "./chartDataLabels.js";
import { resolveActiveIndex } from "./chartCrosshair.js";
import { datapointAriaLabel, datapointNavAction, rovingTabIndex } from "./chartKeyboardNav.js";

export type ScatterPlotTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ScatterPlotDatum = {
  x: number;
  y: number;
  label?: string;
  tone?: ScatterPlotTone;
  /**
   * Per-datum radius, clamped to a sane maximum (32). Non-finite or
   * negative ⇒ falls back to the global `radius`.
   */
  r?: number;
};

/** Cluster centroid marker (ring + cross), drawn above the data points. */
export type ScatterPlotCentroid = {
  x: number;
  y: number;
  tone?: ScatterPlotTone;
  label?: string;
};

export type ScatterPlotProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: ScatterPlotDatum[];
  width?: number;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  radius?: number;
  /**
   * Cluster centroid markers (ring + cross), drawn above the points. Their
   * coordinates are folded into the axis domain. Non-finite x/y are skipped.
   */
  centroids?: ScatterPlotCentroid[];
  /**
   * Annotation overlay in DATA space (points, labels, axis lines, regions,
   * polygons). Both axes are continuous (linear), so `xScale`/`yScale` are
   * linear. Resolved to pixels via the chart's scales and drawn in a dedicated
   * `<g class="st-scatterPlot__annotations">` — regions behind the points,
   * every other kind above them. Additive: absent ⇒ unchanged.
   */
  annotations?: ChartAnnotation[];
  /**
   * Per-point value labels. `false`/absent (default) → none. `true` → each
   * point's value with the chart's numeric formatter (the datum `label` wins
   * when present). Object → `format(value)` and/or a `position` override.
   * Default position is `top` (above the point). Labels are `aria-hidden` — the
   * values already live in the accessible ChartDataList.
   */
  dataLabels?: DataLabelsProp;
  /**
   * CONTROLLED synchronised hover key (FR-3). A point's key is its `label` when
   * present, otherwise `"x,y"` (the serialised coordinates). When provided
   * (string or null), the crosshair + tooltip track this key instead of the
   * chart's internal pointer hover (null ⇒ nothing shown), letting a parent
   * share one hover channel across several aligned charts. Absent (`undefined`)
   * keeps the legacy uncontrolled behaviour.
   */
  hoverKey?: string | null;
  /**
   * Emitted when the user hovers a point (its key) or leaves the plot (`null`).
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
   * point announces its key + value. Absent ⇒ no overlay, rendering unchanged.
   */
  keyboardNav?: boolean;
  /**
   * Emitted when the user selects the focused point via Enter/Space (its key,
   * `label` or `"x,y"`), or `null` when the navigation is left via Escape.
   * Wiring it also turns the keyboard navigation on.
   */
  onSelectKey?: (key: string | null) => void;
  label: string;
  className?: string;
};

const MARGIN = { top: 14, right: 18, bottom: 36, left: 48 } as const;

// Sane upper bound for a per-datum radius (keeps oversized bubbles inside
// the plot); non-finite/negative values fall back to the global radius.
const MAX_POINT_RADIUS = 32;

const TONES: ScatterPlotTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

/** Stable hover/selection key of a point: its label, else `"x,y"`. */
function keyForPoint(d: ScatterPlotDatum): string {
  return d.label ?? `${d.x},${d.y}`;
}

export function ScatterPlot({
  data,
  width = 480,
  height = 280,
  xLabel,
  yLabel,
  radius = 5,
  centroids,
  annotations,
  dataLabels,
  hoverKey,
  onHoverKeyChange,
  keyboardNav,
  onSelectKey,
  label,
  className,
  ...rest
}: ScatterPlotProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  // FR-5 — roving keyboard focus over the data points (separate from hover).
  const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);
  const datapointRefs = React.useRef<Array<SVGRectElement | null>>([]);

  // Centroids guarded once: non-finite coordinates are skipped entirely.
  const validCentroids = (centroids ?? []).filter((c) => Number.isFinite(c.x) && Number.isFinite(c.y));

  // Centroid coordinates are folded into the domain so markers always sit
  // inside the plot (and a centroids-only chart still gets a real scale).
  const xs = [...data.map((d) => d.x), ...validCentroids.map((c) => c.x)].filter(Number.isFinite);
  const ys = [...data.map((d) => d.y), ...validCentroids.map((c) => c.y)].filter(Number.isFinite);
  const xTicks = niceTicks(Math.min(...xs), Math.max(...xs));
  const yTicks = niceTicks(Math.min(...ys), Math.max(...ys));
  const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotH = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
  const xMin = xTicks[0];
  const xMax = xTicks[xTicks.length - 1];
  const yMin = yTicks[0];
  const yMax = yTicks[yTicks.length - 1];

  const points = data.map((d, i) => ({
    cx: MARGIN.left + scaleLinear(d.x, xMin, xMax, 0, plotW),
    cy: MARGIN.top + scaleLinear(d.y, yMin, yMax, plotH, 0),
    r: typeof d.r === "number" && Number.isFinite(d.r) && d.r >= 0 ? Math.min(d.r, MAX_POINT_RADIUS) : radius,
    datum: d,
    index: i,
    tone: (d.tone ?? TONES[i % TONES.length]) as ScatterPlotTone,
  }));

  const centroidMarks = validCentroids.map((c, i) => ({
    cx: MARGIN.left + scaleLinear(c.x, xMin, xMax, 0, plotW),
    cy: MARGIN.top + scaleLinear(c.y, yMin, yMax, plotH, 0),
    tone: (c.tone ?? TONES[i % TONES.length]) as ScatterPlotTone,
    label: c.label,
  }));

  // --- Annotation overlay ---------------------------------------------------
  // Both axes continuous: `xScale`/`yScale` are linear and reject coordinates
  // outside the (tick-padded) domain, so an annotation never escapes the plot.
  const annotationXScale = (v: number | string): number | null => {
    if (typeof v !== "number" || !Number.isFinite(v)) return null;
    if (v < xMin || v > xMax) return null;
    return scaleLinear(v, xMin, xMax, 0, plotW);
  };
  const annotationYScale = (v: number): number | null => {
    if (!Number.isFinite(v)) return null;
    if (v < yMin || v > yMax) return null;
    return scaleLinear(v, yMin, yMax, plotH, 0);
  };
  const resolvedAnnotations = resolveAnnotations(annotations, {
    xScale: annotationXScale,
    yScale: annotationYScale,
    plotLeft: MARGIN.left,
    plotTop: MARGIN.top,
    plotWidth: plotW,
    plotHeight: plotH,
  });
  const annotationRegions = resolvedAnnotations.filter((a) => a.kind === "region");
  const annotationAbove = resolvedAnnotations.filter((a) => a.kind !== "region");

  // --- Data labels ----------------------------------------------------------
  // One label per point. Default `top`: just above the dot. `center`/`inside`
  // sits on the dot. The datum `label` wins; otherwise the y value. aria-hidden
  // (values are in the ChartDataList already).
  const dataLabelOpts = normalizeDataLabels(dataLabels);
  const dataLabelItems = dataLabelOpts.enabled
    ? points.map((p) => {
        const text = p.datum.label ?? formatDataLabel(p.datum.y, dataLabelOpts, formatTick);
        const center = dataLabelOpts.position === "center" || dataLabelOpts.position === "inside";
        return {
          key: p.index,
          x: p.cx,
          y: center ? p.cy : p.cy - (p.r + 5),
          text,
          baseline: (center ? "middle" : "auto") as "middle" | "auto",
        };
      })
    : [];

  const dataValueItems = [
    ...data.map((d) => (d.label ? `${d.label}: x ${d.x}, y ${d.y}` : `x ${d.x}, y ${d.y}`)),
    ...validCentroids.map((c) =>
      c.label ? `Centroïde ${c.label}: (${c.x}, ${c.y})` : `Centroïde: (${c.x}, ${c.y})`,
    ),
    ...annotationDataListItems(annotations),
  ];

  // Stable key per point (FR-3): `label` else `"x,y"`. Used both to resolve a
  // controlled `hoverKey` to an index and to emit `onHoverKeyChange`.
  const hoverKeys = data.map((d) => keyForPoint(d));

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
  const hovered = activeIndex >= 0 ? points[activeIndex] : undefined;

  // --- Keyboard navigation (FR-5) ------------------------------------------
  // Active when wired explicitly (`keyboardNav`) or implicitly (`onSelectKey`).
  // Renders a focusable overlay (one transparent hit-rect per point) carrying a
  // single roving tab stop. Arrow/Home/End move focus, Enter/Space select,
  // Escape leaves. Focus also feeds the shared hover channel (FR-3 synergy).
  const navEnabled = (keyboardNav === true || onSelectKey !== undefined) && points.length > 0;
  // Comfortable square hit area centred on each dot.
  const NAV_HIT = 18;
  function focusDatum(index: number) {
    setFocusedIndex(index);
    datapointRefs.current[index]?.focus();
    emitHoverKey(index);
  }
  function handleDatapointKeyDown(event: React.KeyboardEvent, index: number) {
    const action = datapointNavAction(event.key, index, points.length);
    if (!action) return;
    event.preventDefault();
    if (action.kind === "move") {
      focusDatum(action.index);
    } else if (action.kind === "select") {
      onSelectKey?.(hoverKeys[index] ?? null);
    } else {
      setFocusedIndex(-1);
      emitHoverKey(null);
      onSelectKey?.(null);
      (event.currentTarget as SVGElement).blur();
    }
  }

  return (
    <div {...rest} className={classNames("st-scatterPlot", className)}>
      <div
        className="st-scatterPlot__visual"
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
          {yTicks.map((t) => {
            const y = MARGIN.top + scaleLinear(t, yMin, yMax, plotH, 0);
            return (
              <React.Fragment key={`y${t}`}>
                <line className="st-scatterPlot__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={y} y2={y} />
                <text className="st-scatterPlot__tick" x={MARGIN.left - 6} y={y} textAnchor="end" dominantBaseline="middle">
                  {formatTick(t)}
                </text>
              </React.Fragment>
            );
          })}
          {xTicks.map((t) => {
            const x = MARGIN.left + scaleLinear(t, xMin, xMax, 0, plotW);
            return (
              <text
                key={`x${t}`}
                className="st-scatterPlot__tick"
                x={x}
                y={height - MARGIN.bottom + 16}
                textAnchor="middle"
              >
                {formatTick(t)}
              </text>
            );
          })}

          <line className="st-scatterPlot__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
          <line
            className="st-scatterPlot__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {xLabel ? (
            <text className="st-scatterPlot__axisLabel" x={MARGIN.left + plotW / 2} y={height - 4} textAnchor="middle">
              {xLabel}
            </text>
          ) : null}
          {yLabel ? (
            <text
              className="st-scatterPlot__axisLabel"
              x={12}
              y={MARGIN.top + plotH / 2}
              textAnchor="middle"
              transform={`rotate(-90 12 ${MARGIN.top + plotH / 2})`}
            >
              {yLabel}
            </text>
          ) : null}

          {/* Annotation regions sit BEHIND the points (filled bands). */}
          {annotationRegions.length > 0 ? (
            <g className="st-scatterPlot__annotations st-scatterPlot__annotations--behind">
              {annotationRegions.map((a) =>
                a.kind === "region" ? (
                  <React.Fragment key={`ann-region-${a.key}`}>
                    <rect className="st-scatterPlot__annotationRegion" x={a.x} y={a.y} width={a.width} height={a.height} />
                    {a.label ? (
                      <text className="st-scatterPlot__annotationLabel" x={a.x + 4} y={a.y + 11}>
                        {a.label}
                      </text>
                    ) : null}
                  </React.Fragment>
                ) : null,
              )}
            </g>
          ) : null}

          {points.map((p, i) => (
            <circle
              key={i}
              className={classNames("st-scatterPlot__point", `st-scatterPlot__point--${p.tone}`)}
              cx={p.cx}
              cy={p.cy}
              r={p.r}
              data-chart-index={i}
            />
          ))}

          {/* cluster centroids — distinct ring + cross markers, above the points */}
          {centroidMarks.map((c, i) => (
            <g key={`c${i}`} className={classNames("st-scatterPlot__centroid", `st-scatterPlot__centroid--${c.tone}`)}>
              <circle className="st-scatterPlot__centroidRing" cx={c.cx} cy={c.cy} r="7" />
              <line className="st-scatterPlot__centroidCross" x1={c.cx - 3.5} x2={c.cx + 3.5} y1={c.cy} y2={c.cy} />
              <line className="st-scatterPlot__centroidCross" x1={c.cx} x2={c.cx} y1={c.cy - 3.5} y2={c.cy + 3.5} />
            </g>
          ))}

          {/* Annotations ABOVE the points: lines, shapes, points, labels. */}
          {annotationAbove.length > 0 ? (
            <g className="st-scatterPlot__annotations st-scatterPlot__annotations--above">
              {annotationAbove.map((a) => {
                if (a.kind === "line") {
                  return (
                    <React.Fragment key={`ann-line-${a.key}`}>
                      <line className="st-scatterPlot__annotationLine" x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} />
                      {a.label ? (
                        <text
                          className="st-scatterPlot__annotationLabel"
                          x={a.axis === "x" ? a.x1 + 4 : MARGIN.left + plotW - 4}
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
                      <polygon className="st-scatterPlot__annotationShape" points={polygonPoints(a.points)} />
                      {a.label ? (
                        <text className="st-scatterPlot__annotationLabel" x={a.labelX} y={a.labelY} textAnchor="middle">
                          {a.label}
                        </text>
                      ) : null}
                    </React.Fragment>
                  );
                }
                if (a.kind === "point") {
                  return (
                    <React.Fragment key={`ann-point-${a.key}`}>
                      <circle className="st-scatterPlot__annotationPoint" cx={a.x} cy={a.y} r="4.5" />
                      {a.label ? (
                        <text className="st-scatterPlot__annotationLabel" x={a.x} y={a.y - 8} textAnchor="middle">
                          {a.label}
                        </text>
                      ) : null}
                    </React.Fragment>
                  );
                }
                return (
                  <text key={`ann-label-${a.key}`} className="st-scatterPlot__annotationText" x={a.x} y={a.y} textAnchor={a.anchor}>
                    {a.text}
                  </text>
                );
              })}
            </g>
          ) : null}

          {/* Data labels — one value per point, drawn on top. aria-hidden. */}
          {dataLabelItems.length > 0 ? (
            <g className="st-scatterPlot__dataLabels" aria-hidden="true">
              {dataLabelItems.map((d) => (
                <text
                  key={d.key}
                  className="st-scatterPlot__dataLabel"
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

          {/* Crosshair (FR-3) — a tokenised CROSSED pair (vertical + horizontal)
              at the active key, plus an emphasised marker on the point.
              Decorative (aria-hidden); the value is in the tooltip + list. */}
          {hovered ? (
            <g className="st-scatterPlot__crosshair" aria-hidden="true">
              <line
                className="st-scatterPlot__crosshairLine"
                x1={hovered.cx}
                x2={hovered.cx}
                y1={MARGIN.top}
                y2={MARGIN.top + plotH}
              />
              <line
                className="st-scatterPlot__crosshairLine"
                x1={MARGIN.left}
                x2={MARGIN.left + plotW}
                y1={hovered.cy}
                y2={hovered.cy}
              />
              <circle className="st-scatterPlot__crosshairMarker" cx={hovered.cx} cy={hovered.cy} r="5" />
            </g>
          ) : null}
        </svg>

        {/* Keyboard navigation overlay (FR-5) — a focusable, transparent hit
            layer over the points. NOT aria-hidden: it is the accessible roving
            cursor. Each rect announces its key + value; the focus ring is
            tokenised via CSS. Absent unless keyboard nav is enabled. */}
        {navEnabled ? (
          <svg
            className="st-scatterPlot__navLayer"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
            width="100%"
            height="100%"
            role="group"
            aria-label={`${label} — points de données`}
          >
            {points.map((p, i) => (
              <rect
                key={p.index}
                ref={(el) => {
                  datapointRefs.current[i] = el;
                }}
                className="st-scatterPlot__navDatum"
                x={p.cx - NAV_HIT / 2}
                y={p.cy - NAV_HIT / 2}
                width={NAV_HIT}
                height={NAV_HIT}
                rx="3"
                role="img"
                tabIndex={rovingTabIndex(i, focusedIndex, points.length)}
                aria-label={datapointAriaLabel(p.datum.label ?? `${p.datum.x}, ${p.datum.y}`, p.datum.y)}
                onKeyDown={(event) => handleDatapointKeyDown(event, i)}
                onFocus={() => {
                  setFocusedIndex(i);
                  emitHoverKey(i);
                }}
              />
            ))}
          </svg>
        ) : null}
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hovered ? (
        <div
          className="st-scatterPlot__tooltip"
          role="presentation"
          style={{ left: `${(hovered.cx / width) * 100}%`, top: `${(hovered.cy / height) * 100}%` }}
        >
          {hovered.datum.label ? <span className="st-scatterPlot__tooltipLabel">{hovered.datum.label}</span> : null}
          <span className="st-scatterPlot__tooltipValue">
            x {hovered.datum.x} · y {hovered.datum.y}
          </span>
        </div>
      ) : null}
    </div>
  );
}
