import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";
import {
  annotationDataListItems,
  polygonPoints,
  resolveAnnotations,
  type ChartAnnotation,
} from "./chartAnnotations.js";
import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from "./chartDataLabels.js";
import { resolveActiveIndex } from "./chartCrosshair.js";
import { datapointAriaLabel, datapointNavAction, rovingTabIndex } from "./chartKeyboardNav.js";

export type OHLCChartDatum = {
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type OHLCChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: OHLCChartDatum[];
  label: string;
  width?: number;
  height?: number;
  /**
   * Annotation overlay in DATA space. The x coordinate is CATEGORICAL — it
   * matches a bar by its `label` (centre of band) and is ignored otherwise; the
   * y coordinate (and `value`/`from`/`to`) are price-axis numbers. Regions
   * render behind the bars, every other kind above. Useful for support /
   * resistance lines (`line axis:y`), price zones (`region axis:y`), or events
   * (`point`/`label`). Additive: absent ⇒ unchanged.
   */
  annotations?: ChartAnnotation[];
  /**
   * Per-bar value labels. `false`/absent (default) → none. `true` → each bar's
   * `close` value with the chart's numeric formatter. Object → `format(value)`
   * and/or a `position` override. Default position is above the bar. Labels are
   * `aria-hidden` — the values already live in the accessible ChartDataList.
   */
  dataLabels?: DataLabelsProp;
  /**
   * CONTROLLED synchronised hover key (FR-3). A bar's key is its `label` (the
   * date/category). When provided (string or null), the crosshair + tooltip track
   * this key instead of the chart's internal pointer hover (null ⇒ nothing shown),
   * letting a parent share one hover channel across several aligned charts. Absent
   * (`undefined`) keeps the legacy uncontrolled behaviour.
   */
  hoverKey?: string | null;
  /**
   * Emitted when the user hovers a bar (its `label`) or leaves the plot (`null`).
   * Always fired on pointer move/leave — even while CONTROLLED — so dataviz can
   * keep the shared hover channel in sync.
   */
  onHoverKeyChange?: (key: string | null) => void;
  /**
   * FR-5 — keyboard navigation of the data points (roving tabindex). When `true`
   * (or implied by wiring `onSelectKey`), a thin focusable overlay is rendered
   * over the bars: the chart owns ONE tab stop, ←/↑/→/↓ move the focus between
   * bars (data order), Home/End jump to the first/last, Enter/Space select the
   * focused bar (`onSelectKey`), Escape leaves the navigation. Each focused bar
   * announces its `label` + O/H/L/C. Absent ⇒ no overlay, rendering unchanged.
   */
  keyboardNav?: boolean;
  /**
   * Emitted when the user selects the focused bar via Enter/Space (its `label`),
   * or `null` when the navigation is left via Escape. Wiring it also turns the
   * keyboard navigation on.
   */
  onSelectKey?: (key: string | null) => void;
  className?: string;
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

export function OHLCChart({
  data = [],
  label,
  width = 480,
  height = 240,
  annotations,
  dataLabels,
  hoverKey,
  onHoverKeyChange,
  keyboardNav,
  onSelectKey,
  className,
  ...rest
}: OHLCChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  // FR-5 — roving keyboard focus over the data points (separate from hover).
  const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);
  const datapointRefs = React.useRef<Array<SVGRectElement | null>>([]);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  // Filter invalid bars BEFORE domain
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

  const bars = React.useMemo(() => {
    if (validData.length === 0) return [];
    const band = plotWidth / validData.length;
    // length of the open/close tick (each side of the bar)
    const tickW = Math.min(band * 0.3, 12);

    return validData.map((d, i) => {
      // clamp high/low to guarantee high≥max(O,C) and low≤min(O,C)
      const clampedHigh = Math.max(d.high, d.open, d.close);
      const clampedLow = Math.min(d.low, d.open, d.close);

      const bullish = d.close >= d.open;
      const centerX = MARGIN.left + band * i + band / 2;

      const highY = MARGIN.top + scaleLinear(clampedHigh, domainMin, domainMax, plotHeight, 0);
      const lowY = MARGIN.top + scaleLinear(clampedLow, domainMin, domainMax, plotHeight, 0);
      const openY = MARGIN.top + scaleLinear(d.open, domainMin, domainMax, plotHeight, 0);
      const closeY = MARGIN.top + scaleLinear(d.close, domainMin, domainMax, plotHeight, 0);

      return {
        datum: d,
        index: i,
        bullish,
        centerX,
        band,
        barHighY: highY,
        barLowY: lowY,
        openY,
        closeY,
        openX: centerX - tickW,
        closeX: centerX + tickW,
        tooltipY: Math.min(highY, openY, closeY),
      };
    });
  }, [validData, plotWidth, domainMin, domainMax, plotHeight]);

  // --- Annotation overlay ---------------------------------------------------
  // The x coordinate is CATEGORICAL (a bar `label` → centre of band); the y
  // coordinate is a price-axis number. Regions render behind the bars, every
  // other kind above. The resolver maps each x via `xScale` (category → pixel)
  // and each y via `yScale` (price → pixel), both relative to the plot origin.
  const priceY = (v: number): number | null => {
    if (!Number.isFinite(v)) return null;
    return scaleLinear(v, domainMin, domainMax, plotHeight, 0);
  };
  const categoryPixel = (v: number | string): number | null => {
    const bar = bars.find((b) => b.datum.label === String(v));
    if (!bar) return null;
    return bar.centerX - MARGIN.left;
  };
  const resolvedAnnotations = resolveAnnotations(annotations, {
    xScale: (v) => categoryPixel(v),
    yScale: (v) => priceY(v),
    plotLeft: MARGIN.left,
    plotTop: MARGIN.top,
    plotWidth,
    plotHeight,
  });
  const annotationRegions = resolvedAnnotations.filter((a) => a.kind === "region");
  const annotationAbove = resolvedAnnotations.filter((a) => a.kind !== "region");

  // --- Data labels ----------------------------------------------------------
  // One `close` value label per bar, placed just above it. aria-hidden (values
  // are in the ChartDataList already).
  const dataLabelOpts = normalizeDataLabels(dataLabels);
  const dataLabelItems = dataLabelOpts.enabled
    ? bars.map((bar) => ({
        key: bar.datum.label,
        x: bar.centerX,
        y: bar.barHighY - 6,
        text: formatDataLabel(bar.datum.close, dataLabelOpts, formatTick),
      }))
    : [];

  const dataValueItems = [
    ...validData.map((d) => `${d.label}: O ${d.open} H ${d.high} L ${d.low} C ${d.close}`),
    ...annotationDataListItems(annotations),
  ];

  // Stable key per bar (FR-3): its `label`. Used to resolve a controlled
  // `hoverKey` to an index and to emit `onHoverKeyChange` from pointer events.
  const hoverKeys = bars.map((b) => b.datum.label);

  function emitHoverKey(index: number | null) {
    onHoverKeyChange?.(index == null ? null : hoverKeys[index] ?? null);
  }
  function handleLeave() {
    setHoveredIndex(null);
    emitHoverKey(null);
  }
  function handlePointerMove(event: React.PointerEvent) {
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
  const hoveredBar = activeIndex >= 0 ? bars[activeIndex] : undefined;

  // --- Keyboard navigation (FR-5) ------------------------------------------
  // Active when wired explicitly (`keyboardNav`) or implicitly (`onSelectKey`).
  const navEnabled = (keyboardNav === true || onSelectKey !== undefined) && bars.length > 0;
  function focusDatum(index: number) {
    setFocusedIndex(index);
    datapointRefs.current[index]?.focus();
    emitHoverKey(index);
  }
  function handleDatapointKeyDown(event: React.KeyboardEvent, index: number) {
    const action = datapointNavAction(event.key, index, bars.length);
    if (!action) return;
    event.preventDefault();
    if (action.kind === "move") {
      focusDatum(action.index);
    } else if (action.kind === "select") {
      onSelectKey?.(bars[index].datum.label);
    } else {
      setFocusedIndex(-1);
      emitHoverKey(null);
      onSelectKey?.(null);
      (event.currentTarget as SVGElement).blur();
    }
  }

  function ohlcAriaLabel(d: OHLCChartDatum): string {
    return datapointAriaLabel(d.label, `O ${d.open} H ${d.high} L ${d.low} C ${d.close}`);
  }

  return (
    <div {...rest} className={classNames("st-ohlcChart", className)}>
      <div
        className="st-ohlcChart__visual"
        role="img"
        aria-label={label}
        onPointerMove={handlePointerMove}
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
          {/* gridlines + tick labels */}
          {ticks.map((tick) => {
            const ty = MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0);
            return (
              <React.Fragment key={tick}>
                <line
                  className="st-ohlcChart__grid"
                  x1={MARGIN.left}
                  x2={width - MARGIN.right}
                  y1={ty}
                  y2={ty}
                />
                <text
                  className="st-ohlcChart__tickLabel"
                  x={MARGIN.left - 6}
                  y={ty}
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {formatTick(tick)}
                </text>
              </React.Fragment>
            );
          })}

          {/* axes */}
          <line
            className="st-ohlcChart__axis"
            x1={MARGIN.left}
            x2={MARGIN.left}
            y1={MARGIN.top}
            y2={height - MARGIN.bottom}
          />
          <line
            className="st-ohlcChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {/* Annotation regions sit BEHIND the bars (filled bands). */}
          {annotationRegions.length > 0 ? (
            <g className="st-ohlcChart__annotations st-ohlcChart__annotations--behind">
              {annotationRegions.map((a) =>
                a.kind === "region" ? (
                  <React.Fragment key={`ann-region-${a.key}`}>
                    <rect className="st-ohlcChart__annotationRegion" x={a.x} y={a.y} width={a.width} height={a.height} />
                    {a.label ? (
                      <text className="st-ohlcChart__annotationLabel" x={a.x + 4} y={a.y + 11}>
                        {a.label}
                      </text>
                    ) : null}
                  </React.Fragment>
                ) : null,
              )}
            </g>
          ) : null}

          {/* composite key to avoid duplicates */}
          {bars.map((b, i) => (
            <React.Fragment key={`${i}-${b.datum.label}`}>
              <g
                className={classNames(
                  "st-ohlcChart__bar",
                  `st-ohlcChart__bar--${b.bullish ? "up" : "down"}`,
                  hoveredIndex !== null && hoveredIndex !== i
                    ? "st-ohlcChart__bar--dim"
                    : undefined
                )}
              >
                {/* vertical low → high range */}
                <line
                  className="st-ohlcChart__range"
                  x1={b.centerX}
                  x2={b.centerX}
                  y1={b.barHighY}
                  y2={b.barLowY}
                  data-chart-index={i}
                />
                {/* open tick (left) */}
                <line
                  className="st-ohlcChart__open"
                  x1={b.openX}
                  x2={b.centerX}
                  y1={b.openY}
                  y2={b.openY}
                  data-chart-index={i}
                />
                {/* close tick (right) */}
                <line
                  className="st-ohlcChart__close"
                  x1={b.centerX}
                  x2={b.closeX}
                  y1={b.closeY}
                  y2={b.closeY}
                  data-chart-index={i}
                />
              </g>
              {/* category label */}
              <text
                className="st-ohlcChart__categoryLabel"
                x={b.centerX}
                y={height - MARGIN.bottom + 16}
                textAnchor="middle"
              >
                {b.datum.label}
              </text>
            </React.Fragment>
          ))}

          {/* Annotations ABOVE the bars: lines, shapes, points, labels. */}
          {annotationAbove.length > 0 ? (
            <g className="st-ohlcChart__annotations st-ohlcChart__annotations--above">
              {annotationAbove.map((a) => {
                if (a.kind === "line") {
                  return (
                    <React.Fragment key={`ann-line-${a.key}`}>
                      <line className="st-ohlcChart__annotationLine" x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} />
                      {a.label ? (
                        <text
                          className="st-ohlcChart__annotationLabel"
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
                      <polygon className="st-ohlcChart__annotationShape" points={polygonPoints(a.points)} />
                      {a.label ? (
                        <text className="st-ohlcChart__annotationLabel" x={a.labelX} y={a.labelY} textAnchor="middle">
                          {a.label}
                        </text>
                      ) : null}
                    </React.Fragment>
                  );
                }
                if (a.kind === "point") {
                  return (
                    <React.Fragment key={`ann-point-${a.key}`}>
                      <circle className="st-ohlcChart__annotationPoint" cx={a.x} cy={a.y} r="4.5" />
                      {a.label ? (
                        <text className="st-ohlcChart__annotationLabel" x={a.x} y={a.y - 8} textAnchor="middle">
                          {a.label}
                        </text>
                      ) : null}
                    </React.Fragment>
                  );
                }
                return (
                  <text key={`ann-label-${a.key}`} className="st-ohlcChart__annotationText" x={a.x} y={a.y} textAnchor={a.anchor}>
                    {a.text}
                  </text>
                );
              })}
            </g>
          ) : null}

          {/* Data labels — one close value per bar, drawn on top. aria-hidden. */}
          {dataLabelItems.length > 0 ? (
            <g className="st-ohlcChart__dataLabels" aria-hidden="true">
              {dataLabelItems.map((d) => (
                <text
                  key={d.key}
                  className="st-ohlcChart__dataLabel"
                  x={d.x}
                  y={d.y}
                  textAnchor="middle"
                  dominantBaseline="auto"
                >
                  {d.text}
                </text>
              ))}
            </g>
          ) : null}

          {/* Crosshair (FR-3) — a tokenised dashed vertical line at the active
              bar. Decorative (aria-hidden); the value is in the tooltip + list. */}
          {hoveredBar ? (
            <g className="st-ohlcChart__crosshair" aria-hidden="true">
              <line
                className="st-ohlcChart__crosshairLine"
                x1={hoveredBar.centerX}
                x2={hoveredBar.centerX}
                y1={MARGIN.top}
                y2={MARGIN.top + plotHeight}
              />
            </g>
          ) : null}
        </svg>

        {/* Keyboard navigation overlay (FR-5) — a focusable, transparent hit
            layer over the bars. NOT aria-hidden: it is the accessible roving
            cursor. Each rect announces its date + O/H/L/C. */}
        {navEnabled ? (
          <svg
            className="st-ohlcChart__navLayer"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
            width="100%"
            height="100%"
            role="group"
            aria-label={`${label} — points de données`}
          >
            {bars.map((bar, i) => (
              <rect
                key={`${i}-${bar.datum.label}`}
                ref={(el) => {
                  datapointRefs.current[i] = el;
                }}
                className="st-ohlcChart__navDatum"
                x={bar.centerX - bar.band / 2}
                y={MARGIN.top}
                width={bar.band}
                height={plotHeight}
                role="img"
                tabIndex={rovingTabIndex(i, focusedIndex, bars.length)}
                aria-label={ohlcAriaLabel(bar.datum)}
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

      {hoveredBar ? (
        <div
          className="st-ohlcChart__tooltip"
          role="presentation"
          style={{
            left: `${(hoveredBar.centerX / width) * 100}%`,
            top: `${(hoveredBar.tooltipY / height) * 100}%`,
          }}
        >
          <span className="st-ohlcChart__tooltipLabel">{hoveredBar.datum.label}</span>
          <span className="st-ohlcChart__tooltipValue">
            O {hoveredBar.datum.open} H {hoveredBar.datum.high} L {hoveredBar.datum.low}{" "}
            C {hoveredBar.datum.close}
          </span>
        </div>
      ) : null}
    </div>
  );
}
