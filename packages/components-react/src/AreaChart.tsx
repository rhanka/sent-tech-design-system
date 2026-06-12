import React from "react";
import { classNames } from "./classNames.js";
import {
  buildLinearPath,
  buildSmoothPath,
  CHART_MARGIN,
  ChartDataList,
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

export type AreaChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
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
  className?: string;
};

const MARGIN = CHART_MARGIN;

export function AreaChart({
  data = [],
  width = 480,
  height = 240,
  tone = "category1",
  smooth = false,
  label,
  annotations,
  dataLabels,
  hoverKey,
  onHoverKeyChange,
  keyboardNav,
  onSelectKey,
  className,
  ...rest
}: AreaChartProps) {
  const reactId = React.useId();
  const gradientId = `st-areachart-gradient-${reactId.replace(/:/g, "")}`;
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  // FR-5 — roving keyboard focus over the data points (separate from hover).
  const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);
  const datapointRefs = React.useRef<Array<SVGRectElement | null>>([]);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  const normalizedData: AreaChartDatum[] = data.map((d, i) =>
    typeof d === "number" ? ({ x: i, y: d } as AreaChartDatum) : d,
  );

  const xDomain = (() => {
    if (normalizedData.length === 0) return { kind: "ordinal" as const, values: [] as (number | string)[] };
    const allNumeric = normalizedData.every((d) => isNumeric(d.x));
    if (allNumeric) {
      const xs = normalizedData.map((d) => d.x as number);
      return { kind: "numeric" as const, min: Math.min(...xs), max: Math.max(...xs) };
    }
    return { kind: "ordinal" as const, values: normalizedData.map((d) => d.x) };
  })();

  const yTicks = (() => {
    const ys = normalizedData.map((d) => d.y);
    if (ys.length === 0) return [0];
    const minRaw = Math.min(...ys);
    const maxRaw = Math.max(...ys);
    const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
    const minTickVal = Math.min(0, minRaw - padded);
    return niceTicks(minTickVal, maxRaw + padded, 5);
  })();

  const yDomain = yTicks.length === 0 ? { min: 0, max: 1 } : { min: yTicks[0], max: yTicks[yTicks.length - 1] };

  const points = (() => {
    if (normalizedData.length === 0) return [] as Array<{ x: number; y: number; datum: AreaChartDatum; index: number }>;
    return normalizedData.map((d, i) => {
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
  })();

  // --- Annotation overlay ---------------------------------------------------
  // `xScale` honours the ordinal/numeric x domain; `yScale` mirrors the point
  // y mapping. Out-of-domain coordinates yield `null` → the resolver drops them.
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
  // One value label per point. Default `top`: just above the dot. `center` sits
  // on the dot. aria-hidden (values are in the ChartDataList already).
  const dataLabelOpts = normalizeDataLabels(dataLabels);
  const dataLabelItems = dataLabelOpts.enabled
    ? points.map((p) => {
        const text = formatDataLabel(p.datum.y, dataLabelOpts, formatTick);
        const center = dataLabelOpts.position === "center" || dataLabelOpts.position === "inside";
        return { key: p.index, x: p.x, y: center ? p.y : p.y - 8, text, baseline: (center ? "middle" : "auto") as "middle" | "auto" };
      })
    : [];

  const dataValueItems = [
    ...normalizedData.map((d) => `${d.x}: ${d.y}`),
    ...annotationDataListItems(annotations),
  ];

  const linePath = points.length === 0 ? "" : smooth ? buildSmoothPath(points) : buildLinearPath(points);

  const areaPath = (() => {
    if (points.length === 0) return "";
    const base = MARGIN.top + scaleLinear(Math.max(0, yDomain.min), yDomain.min, yDomain.max, plotHeight, 0);
    const first = points[0];
    const last = points[points.length - 1];
    return `${linePath} L${last.x.toFixed(2)},${base.toFixed(2)} L${first.x.toFixed(2)},${base.toFixed(2)} Z`;
  })();

  const gridLines = yTicks.map((tick) => ({
    value: tick,
    y: MARGIN.top + scaleLinear(tick, yDomain.min, yDomain.max, plotHeight, 0),
  }));

  const xTickEntries = (() => {
    if (normalizedData.length === 0) return [] as Array<{ x: number; label: string }>;
    if (xDomain.kind === "ordinal") {
      return points.map((p, i) => ({ x: p.x, label: String(normalizedData[i].x) }));
    }
    const target = Math.min(5, normalizedData.length);
    const stride = Math.max(1, Math.round((normalizedData.length - 1) / (target - 1 || 1)));
    const entries: { x: number; label: string }[] = [];
    for (let i = 0; i < normalizedData.length; i += stride) {
      entries.push({ x: points[i].x, label: String(normalizedData[i].x) });
    }
    const lastIdx = normalizedData.length - 1;
    if (entries[entries.length - 1]?.label !== String(normalizedData[lastIdx].x)) {
      entries.push({ x: points[lastIdx].x, label: String(normalizedData[lastIdx].x) });
    }
    return entries;
  })();

  // Stable key per datum (FR-3): `String(x)` of the normalised datum (a bare
  // number becomes its index). Resolves a controlled `hoverKey` to an index and
  // feeds `onHoverKeyChange` from pointer events.
  const hoverKeys = normalizedData.map((d) => keyForX(d.x));

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
    <div {...rest} className={classNames("st-areaChart", `st-areaChart--${tone}`, className)}>
      <div
        className="st-areaChart__visual"
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
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {gridLines.map((g) => (
            <React.Fragment key={g.value}>
              <line className="st-areaChart__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={g.y} y2={g.y} />
              <text
                className="st-areaChart__tickLabel"
                x={MARGIN.left - 6}
                y={g.y}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {formatTick(g.value)}
              </text>
            </React.Fragment>
          ))}

          <line className="st-areaChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
          <line
            className="st-areaChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {xTickEntries.map((tick, i) => (
            <text
              key={i}
              className="st-areaChart__tickLabel"
              x={tick.x}
              y={height - MARGIN.bottom + 16}
              textAnchor="middle"
            >
              {tick.label}
            </text>
          ))}

          {/* Annotation regions sit BEHIND the area. */}
          {annotationRegions.length > 0 ? (
            <g className="st-areaChart__annotations st-areaChart__annotations--behind">
              {annotationRegions.map((a) =>
                a.kind === "region" ? (
                  <React.Fragment key={`ann-region-${a.key}`}>
                    <rect className="st-areaChart__annotationRegion" x={a.x} y={a.y} width={a.width} height={a.height} />
                    {a.label ? (
                      <text className="st-areaChart__annotationLabel" x={a.x + 4} y={a.y + 11}>
                        {a.label}
                      </text>
                    ) : null}
                  </React.Fragment>
                ) : null,
              )}
            </g>
          ) : null}

          {areaPath ? <path className="st-areaChart__area" d={areaPath} fill={`url(#${gradientId})`} /> : null}
          {linePath ? (
            <path
              className="st-areaChart__line"
              d={linePath}
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {points.map((p) => (
            <circle key={p.index} className="st-areaChart__dot" cx={p.x} cy={p.y} r="4" data-chart-index={p.index} />
          ))}

          {/* Annotations ABOVE the area: lines, shapes, points, labels. */}
          {annotationAbove.length > 0 ? (
            <g className="st-areaChart__annotations st-areaChart__annotations--above">
              {annotationAbove.map((a) => {
                if (a.kind === "line") {
                  return (
                    <React.Fragment key={`ann-line-${a.key}`}>
                      <line className="st-areaChart__annotationLine" x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} />
                      {a.label ? (
                        <text
                          className="st-areaChart__annotationLabel"
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
                      <polygon className="st-areaChart__annotationShape" points={polygonPoints(a.points)} />
                      {a.label ? (
                        <text className="st-areaChart__annotationLabel" x={a.labelX} y={a.labelY} textAnchor="middle">
                          {a.label}
                        </text>
                      ) : null}
                    </React.Fragment>
                  );
                }
                if (a.kind === "point") {
                  return (
                    <React.Fragment key={`ann-point-${a.key}`}>
                      <circle className="st-areaChart__annotationPoint" cx={a.x} cy={a.y} r="4.5" />
                      {a.label ? (
                        <text className="st-areaChart__annotationLabel" x={a.x} y={a.y - 8} textAnchor="middle">
                          {a.label}
                        </text>
                      ) : null}
                    </React.Fragment>
                  );
                }
                return (
                  <text key={`ann-label-${a.key}`} className="st-areaChart__annotationText" x={a.x} y={a.y} textAnchor={a.anchor}>
                    {a.text}
                  </text>
                );
              })}
            </g>
          ) : null}

          {/* Data labels — one value per point, drawn on top. aria-hidden. */}
          {dataLabelItems.length > 0 ? (
            <g className="st-areaChart__dataLabels" aria-hidden="true">
              {dataLabelItems.map((d) => (
                <text
                  key={d.key}
                  className="st-areaChart__dataLabel"
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
            <g className="st-areaChart__crosshair" aria-hidden="true">
              <line
                className="st-areaChart__crosshairLine"
                x1={hoveredPoint.x}
                x2={hoveredPoint.x}
                y1={MARGIN.top}
                y2={MARGIN.top + plotHeight}
              />
              <circle className="st-areaChart__crosshairMarker" cx={hoveredPoint.x} cy={hoveredPoint.y} r="5" />
            </g>
          ) : null}
        </svg>

        {/* Keyboard navigation overlay (FR-5) — a focusable, transparent hit
            layer over the points. NOT aria-hidden: it is the accessible roving
            cursor. Each rect announces its category + value; the focus ring is
            tokenised via CSS. Absent unless keyboard nav is enabled. */}
        {navEnabled ? (
          <svg
            className="st-areaChart__navLayer"
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
                className="st-areaChart__navDatum"
                x={p.x - NAV_HIT / 2}
                y={p.y - NAV_HIT / 2}
                width={NAV_HIT}
                height={NAV_HIT}
                rx="3"
                role="img"
                tabIndex={rovingTabIndex(i, focusedIndex, points.length)}
                aria-label={datapointAriaLabel(p.datum.x, p.datum.y)}
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

      {hoveredPoint ? (
        <div
          className="st-areaChart__tooltip"
          role="presentation"
          style={{ left: `${(hoveredPoint.x / width) * 100}%`, top: `${(hoveredPoint.y / height) * 100}%` }}
        >
          <span className="st-areaChart__tooltipLabel">{hoveredPoint.datum.x}</span>
          <span className="st-areaChart__tooltipValue">{hoveredPoint.datum.y}</span>
        </div>
      ) : null}
    </div>
  );
}
