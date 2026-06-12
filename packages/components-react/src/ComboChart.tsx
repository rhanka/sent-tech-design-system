import React from "react";
import { classNames } from "./classNames.js";
import {
  buildLinearPath,
  buildSmoothPath,
  ChartDataList,
  formatTick,
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

export type ComboChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ComboChartBarSeries = {
  label: string;
  data: number[];
  tone?: ComboChartTone;
};

export type ComboChartLineSeries = {
  label: string;
  data: number[];
  tone?: ComboChartTone;
  smooth?: boolean;
};

export type ComboChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  categories: string[];
  bars?: ComboChartBarSeries[];
  lines?: ComboChartLineSeries[];
  leftAxisLabel?: string;
  rightAxisLabel?: string;
  legend?: boolean;
  /**
   * Interactive legend (FR-4). Ids/labels of bar/line series hidden from the
   * render (controlled by the parent; default = all visible). Hidden series
   * are omitted and their legend item is shown "off" (`aria-pressed`).
   * Undefined → legacy non-interactive legend, unless `onToggleSeries` is set.
   */
  hiddenSeries?: string[];
  /** Emitted on click / Enter / Space on a legend item. */
  onToggleSeries?: (seriesId: string) => void;
  /**
   * Annotation overlay in DATA space. The x coordinate is CATEGORICAL — it
   * matches a category by equality (band centre) and is ignored otherwise; the
   * y coordinate (and `value`/`from`/`to`) are LEFT (bar) value-axis numbers.
   * Regions render behind the bars, every other kind above. Additive: absent ⇒
   * unchanged.
   */
  annotations?: ChartAnnotation[];
  /**
   * Per-datum value labels on BOTH the bars and the line points. `false`/absent
   * (default) → none. `true` → each value with the chart's numeric formatter.
   * Object → `format(value)` and/or a `position` override. Bars default to
   * `outside` (above the bar), line points to `top` (above the dot). Labels are
   * `aria-hidden` — the values already live in the accessible ChartDataList.
   */
  dataLabels?: DataLabelsProp;
  /**
   * CONTROLLED synchronised hover key (FR-3). The key is the CATEGORY string.
   * When provided (string or null), the crosshair tracks this key instead of the
   * chart's internal pointer hover (null ⇒ nothing shown), letting a parent share
   * one hover channel across several aligned charts. Absent (`undefined`) keeps
   * the legacy uncontrolled behaviour.
   */
  hoverKey?: string | null;
  /**
   * Emitted when the user hovers a bar/point (its CATEGORY) or leaves the plot
   * (`null`). Always fired on pointer move/leave — even while CONTROLLED — so
   * dataviz can keep the shared hover channel in sync.
   */
  onHoverKeyChange?: (key: string | null) => void;
  /**
   * FR-5 — keyboard navigation of the data points (roving tabindex). When `true`
   * (or implied by wiring `onSelectKey`), a thin focusable overlay is rendered
   * over the CATEGORY bands: the chart owns ONE tab stop, ←/↑/→/↓ move the focus
   * between categories (data order), Home/End jump to first/last, Enter/Space
   * select the focused category (`onSelectKey`), Escape leaves the navigation.
   * Each focused band announces its category + value summary. Absent ⇒ no
   * overlay, rendering unchanged.
   */
  keyboardNav?: boolean;
  /**
   * Emitted when the user selects the focused category via Enter/Space, or `null`
   * when the navigation is left via Escape. Wiring it also turns the keyboard
   * navigation on.
   */
  onSelectKey?: (key: string | null) => void;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

const MARGIN = { top: 12, right: 52, bottom: 32, left: 52 };

type Hover =
  | { kind: "bar"; gi: number; si: number }
  | { kind: "line"; li: number; pi: number }
  | null;

export function ComboChart({
  categories,
  bars = [],
  lines = [],
  leftAxisLabel,
  rightAxisLabel,
  legend = true,
  hiddenSeries,
  onToggleSeries,
  annotations,
  dataLabels,
  hoverKey,
  onHoverKeyChange,
  keyboardNav,
  onSelectKey,
  width = 480,
  height = 240,
  label,
  className,
  ...rest
}: ComboChartProps) {
  const [hovered, setHovered] = React.useState<Hover>(null);
  // FR-5 — roving keyboard focus over the category bands (separate from hover).
  const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);
  const datapointRefs = React.useRef<Array<SVGRectElement | null>>([]);

  // Interactive legend is active as soon as the parent wires either prop.
  const legendInteractive = onToggleSeries !== undefined || hiddenSeries !== undefined;
  const hiddenSet = new Set(hiddenSeries ?? []);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  // Left axis (bars): include zero in the domain so bars rest on a baseline.
  // Hidden series are excluded so the axis rescales to what is visible.
  const leftScale = (() => {
    const values = bars.filter((s) => !hiddenSet.has(s.label)).flatMap((s) => s.data);
    const minRaw = Math.min(0, ...(values.length ? values : [0]));
    const maxRaw = Math.max(0, ...(values.length ? values : [0]));
    const ticks = niceTicks(minRaw, maxRaw, 5);
    return { ticks, domainMin: ticks[0], domainMax: ticks[ticks.length - 1] };
  })();

  // Right axis (lines): padded domain like LineChart.
  const rightScale = (() => {
    const values = lines.filter((s) => !hiddenSet.has(s.label)).flatMap((s) => s.data);
    if (values.length === 0) {
      const ticks = niceTicks(0, 1, 5);
      return { ticks, domainMin: ticks[0], domainMax: ticks[ticks.length - 1] };
    }
    const minRaw = Math.min(...values);
    const maxRaw = Math.max(...values);
    const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
    const ticks = niceTicks(minRaw - padded, maxRaw + padded, 5);
    return { ticks, domainMin: ticks[0], domainMax: ticks[ticks.length - 1] };
  })();

  // Categories are ordinal: each gets a band centred at the band midpoint.
  function bandCenter(i: number): number {
    const band = plotWidth / Math.max(categories.length, 1);
    return MARGIN.left + band * (i + 0.5);
  }

  const barGroups = (() => {
    if (categories.length === 0 || bars.length === 0)
      return [] as Array<
        Array<{
          x: number;
          y: number;
          width: number;
          height: number;
          cx: number;
          cy: number;
          value: number;
          seriesLabel: string;
          category: string;
          tone: string;
        }>
      >;
    const { domainMin, domainMax } = leftScale;
    const band = plotWidth / categories.length;
    const groupWidth = band * 0.62;
    const barWidth = groupWidth / bars.length;
    const zeroY = scaleLinear(0, domainMin, domainMax, plotHeight, 0);
    return categories.map((_, ci) => {
      const groupX = MARGIN.left + band * ci + (band - groupWidth) / 2;
      const segments = bars.flatMap((series, si) => {
        if (hiddenSet.has(series.label)) return [];
        const raw = series.data[ci];
        // Donnée manquante/non finie → pas de barre (jamais une fausse barre à 0).
        if (raw == null || !Number.isFinite(raw)) return [];
        const value = raw;
        const valueY = scaleLinear(value, domainMin, domainMax, plotHeight, 0);
        const y = Math.min(valueY, zeroY);
        const h = Math.abs(zeroY - valueY);
        return [
          {
            x: groupX + barWidth * si,
            y: MARGIN.top + y,
            width: barWidth,
            height: Math.max(h, 0.5),
            cx: groupX + barWidth * (si + 0.5),
            cy: MARGIN.top + valueY,
            value,
            seriesLabel: series.label,
            category: categories[ci],
            tone: series.tone ?? `category${(si % 8) + 1}`,
          },
        ];
      });
      return segments;
    });
  })();

  const lineSeries = (() => {
    if (categories.length === 0 || lines.length === 0)
      return [] as Array<{
        path: string;
        points: Array<{ x: number; y: number; value: number; category: string; index: number }>;
        seriesLabel: string;
        hidden: boolean;
        tone: string;
      }>;
    const { domainMin, domainMax } = rightScale;
    return lines.map((series, li) => {
      // Seuls les points définis/finis sont tracés ; les manquants créent un
      // trou dans la ligne (pas de chute artificielle vers 0).
      const points = categories.flatMap((_, ci) => {
        const raw = series.data[ci];
        if (raw == null || !Number.isFinite(raw)) return [];
        return [
          {
            x: bandCenter(ci),
            y: MARGIN.top + scaleLinear(raw, domainMin, domainMax, plotHeight, 0),
            value: raw,
            category: categories[ci],
            index: ci,
          },
        ];
      });
      // Découpe en segments contigus (indices de catégorie consécutifs) pour
      // dessiner des trous là où des points manquent.
      const runs: Array<typeof points> = [];
      let current: typeof points = [];
      for (const p of points) {
        if (current.length === 0 || p.index === current[current.length - 1].index + 1) {
          current.push(p);
        } else {
          runs.push(current);
          current = [p];
        }
      }
      if (current.length > 0) runs.push(current);
      const path = runs
        .map((run) => (series.smooth ? buildSmoothPath(run) : buildLinearPath(run)))
        .join(" ");
      return {
        path,
        points,
        seriesLabel: series.label,
        hidden: hiddenSet.has(series.label),
        tone: series.tone ?? `category${((bars.length + li) % 8) + 1}`,
      };
    });
  })();

  const leftGridLines = leftScale.ticks.map((tick) => ({
    value: tick,
    y: MARGIN.top + scaleLinear(tick, leftScale.domainMin, leftScale.domainMax, plotHeight, 0),
  }));

  const rightTickEntries =
    lines.length === 0
      ? []
      : rightScale.ticks.map((tick) => ({
          value: tick,
          y: MARGIN.top + scaleLinear(tick, rightScale.domainMin, rightScale.domainMax, plotHeight, 0),
        }));

  const legendItems = [
    ...bars.map((s, i) => ({
      key: `bar-${i}`,
      label: s.label,
      tone: s.tone ?? `category${(i % 8) + 1}`,
      kind: "bar" as const,
    })),
    ...lines.map((s, i) => ({
      key: `line-${i}`,
      label: s.label,
      tone: s.tone ?? `category${((bars.length + i) % 8) + 1}`,
      kind: "line" as const,
    })),
  ];

  // Les valeurs manquantes/non finies sont omises (cohérent avec les trous visuels).
  const seriesItems = (s: { label: string; data: number[] }) =>
    categories.flatMap((c, ci) => {
      const raw = s.data[ci];
      return raw == null || !Number.isFinite(raw) ? [] : [`${s.label}, ${c}: ${raw}`];
    });
  const visibleSeriesItems = (s: { label: string; data: number[] }) =>
    hiddenSet.has(s.label) ? [] : seriesItems(s);
  const dataValueItems = [
    ...bars.flatMap(visibleSeriesItems),
    ...lines.flatMap(visibleSeriesItems),
    ...annotationDataListItems(annotations),
  ];

  // --- Annotation overlay ---------------------------------------------------
  // Data-space annotations resolved to absolute pixels. `xScale` matches a
  // category by equality → its band centre (relative to the plot); `yScale`
  // maps a LEFT (bar) value-axis number. Out-of-domain coords yield `null` →
  // the resolver drops them, so an annotation never escapes the plot.
  const categoryPixel = (v: number | string): number | null => {
    const i = categories.indexOf(String(v));
    if (i < 0) return null;
    return bandCenter(i) - MARGIN.left;
  };
  const leftValuePixel = (v: number): number | null => {
    if (!Number.isFinite(v)) return null;
    return scaleLinear(v, leftScale.domainMin, leftScale.domainMax, plotHeight, 0);
  };
  const resolvedAnnotations = resolveAnnotations(annotations, {
    xScale: categoryPixel,
    yScale: leftValuePixel,
    plotLeft: MARGIN.left,
    plotTop: MARGIN.top,
    plotWidth,
    plotHeight,
  });
  const annotationRegions = resolvedAnnotations.filter((a) => a.kind === "region");
  const annotationAbove = resolvedAnnotations.filter((a) => a.kind !== "region");

  // --- Data labels ----------------------------------------------------------
  // One value label per visible bar (outside: above the bar) and per visible
  // line point (top: above the dot). aria-hidden (values live in the data list).
  const dataLabelOpts = normalizeDataLabels(dataLabels);
  const barDataLabelItems = dataLabelOpts.enabled
    ? barGroups.flatMap((group, gi) =>
        group.map((seg, si) => {
          const text = formatDataLabel(seg.value, dataLabelOpts, formatTick);
          const inside = dataLabelOpts.position === "inside" || dataLabelOpts.position === "center";
          return {
            key: `bar-${gi}-${si}`,
            x: seg.cx,
            y: inside ? seg.y + seg.height / 2 : seg.cy - 6,
            text,
            baseline: (inside ? "middle" : "auto") as "middle" | "auto",
          };
        }),
      )
    : [];
  const lineDataLabelItems = dataLabelOpts.enabled
    ? lineSeries.flatMap((series, li) =>
        series.hidden
          ? []
          : series.points.map((p, pi) => {
              const text = formatDataLabel(p.value, dataLabelOpts, formatTick);
              const center = dataLabelOpts.position === "center" || dataLabelOpts.position === "inside";
              return { key: `line-${li}-${pi}`, x: p.x, y: center ? p.y : p.y - 8, text, baseline: (center ? "middle" : "auto") as "middle" | "auto" };
            }),
      )
    : [];

  // --- Crosshair + keyboard nav keys (FR-3 / FR-5) --------------------------
  // The shared datum is the CATEGORY: its key is the category string, its x the
  // band centre. Crosshair = a vertical line at that x; keyboard nav = one
  // focusable full-height column per category.
  const hoverKeys = categories.map((c) => keyForX(c));
  // Compact value summary per category for the a11y label (every visible series).
  const categorySummary = (ci: number): string => {
    const parts = [
      ...bars.filter((s) => !hiddenSet.has(s.label)),
      ...lines.filter((s) => !hiddenSet.has(s.label)),
    ]
      .map((s) => {
        const raw = s.data[ci];
        return raw == null || !Number.isFinite(raw) ? null : `${s.label}: ${raw}`;
      })
      .filter((v): v is string => v !== null);
    return parts.join(", ");
  };

  function emitHoverKey(index: number | null) {
    onHoverKeyChange?.(index == null ? null : hoverKeys[index] ?? null);
  }
  function handleLeave() {
    setHovered(null);
    emitHoverKey(null);
  }
  function handleVisualPointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHovered(null);
      emitHoverKey(null);
      return;
    }
    const kind = target.getAttribute("data-chart-kind");
    const a = Number(target.getAttribute("data-chart-a"));
    const b = Number(target.getAttribute("data-chart-b"));
    if (kind === "bar" && Number.isInteger(a) && Number.isInteger(b)) {
      setHovered({ kind: "bar", gi: a, si: b });
      emitHoverKey(a); // gi === category index
    } else if (kind === "line" && Number.isInteger(a) && Number.isInteger(b)) {
      setHovered({ kind: "line", li: a, pi: b });
      emitHoverKey(b); // pi === category index
    } else {
      setHovered(null);
      emitHoverKey(null);
    }
  }

  // Category index whose crosshair is DISPLAYED: the controlled `hoverKey` when
  // provided (resolved against the category keys), else the internal pointer
  // category (derived from the hovered bar/line datum).
  const internalCategoryIndex =
    hovered == null ? null : hovered.kind === "bar" ? hovered.gi : hovered.pi;
  const activeCategoryIndex = resolveActiveIndex(hoverKey, internalCategoryIndex, hoverKeys);
  const crosshairX = activeCategoryIndex >= 0 ? bandCenter(activeCategoryIndex) : null;

  // --- Keyboard navigation (FR-5) ------------------------------------------
  // Active when wired explicitly (`keyboardNav`) or implicitly (`onSelectKey`).
  // One focusable transparent column per category carries the roving tab stop.
  const navEnabled = (keyboardNav === true || onSelectKey !== undefined) && categories.length > 0;
  function focusDatum(index: number) {
    setFocusedIndex(index);
    datapointRefs.current[index]?.focus();
    emitHoverKey(index);
  }
  function handleDatapointKeyDown(event: React.KeyboardEvent, index: number) {
    const action = datapointNavAction(event.key, index, categories.length);
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

  const tooltip = (() => {
    if (!hovered) return null;
    if (hovered.kind === "bar") {
      const seg = barGroups[hovered.gi]?.[hovered.si];
      if (!seg) return null;
      return { cx: seg.cx, cy: seg.cy, label: `${seg.seriesLabel} · ${seg.category}`, value: seg.value };
    }
    const series = lineSeries[hovered.li];
    const p = series?.points[hovered.pi];
    if (!series || !p) return null;
    return { cx: p.x, cy: p.y, label: `${series.seriesLabel} · ${p.category}`, value: p.value };
  })();

  return (
    <div {...rest} className={classNames("st-comboChart", className)}>
      <div
        className="st-comboChart__visual"
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
          {/* gridlines + left (bar) axis ticks */}
          {leftGridLines.map((g) => (
            <React.Fragment key={g.value}>
              <line className="st-comboChart__grid" x1={MARGIN.left} x2={MARGIN.left + plotWidth} y1={g.y} y2={g.y} />
              <text
                className="st-comboChart__tickLabel"
                x={MARGIN.left - 6}
                y={g.y}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {formatTick(g.value)}
              </text>
            </React.Fragment>
          ))}

          {/* right (line) axis ticks */}
          {rightTickEntries.map((g) => (
            <text
              key={g.value}
              className="st-comboChart__tickLabel"
              x={MARGIN.left + plotWidth + 6}
              y={g.y}
              textAnchor="start"
              dominantBaseline="middle"
            >
              {formatTick(g.value)}
            </text>
          ))}

          {/* axes */}
          <line className="st-comboChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
          <line
            className="st-comboChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />
          {lines.length > 0 ? (
            <line
              className="st-comboChart__axis"
              x1={MARGIN.left + plotWidth}
              x2={MARGIN.left + plotWidth}
              y1={MARGIN.top}
              y2={height - MARGIN.bottom}
            />
          ) : null}

          {/* axis labels */}
          {leftAxisLabel ? (
            <text
              className="st-comboChart__axisLabel"
              textAnchor="middle"
              transform={`translate(${MARGIN.left - 40}, ${MARGIN.top + plotHeight / 2}) rotate(-90)`}
            >
              {leftAxisLabel}
            </text>
          ) : null}
          {rightAxisLabel ? (
            <text
              className="st-comboChart__axisLabel"
              textAnchor="middle"
              transform={`translate(${MARGIN.left + plotWidth + 40}, ${MARGIN.top + plotHeight / 2}) rotate(90)`}
            >
              {rightAxisLabel}
            </text>
          ) : null}

          {/* category labels */}
          {categories.map((category, ci) => (
            <text
              key={ci}
              className="st-comboChart__categoryLabel"
              x={bandCenter(ci)}
              y={height - MARGIN.bottom + 16}
              textAnchor="middle"
            >
              {category}
            </text>
          ))}

          {/* Annotation regions sit BEHIND the bars (filled bands). */}
          {annotationRegions.length > 0 ? (
            <g className="st-comboChart__annotations st-comboChart__annotations--behind">
              {annotationRegions.map((a) =>
                a.kind === "region" ? (
                  <React.Fragment key={`ann-region-${a.key}`}>
                    <rect className="st-comboChart__annotationRegion" x={a.x} y={a.y} width={a.width} height={a.height} />
                    {a.label ? (
                      <text className="st-comboChart__annotationLabel" x={a.x + 4} y={a.y + 11}>
                        {a.label}
                      </text>
                    ) : null}
                  </React.Fragment>
                ) : null,
              )}
            </g>
          ) : null}

          {/* bars */}
          {barGroups.map((group, gi) =>
            group.map((seg, si) => (
              <rect
                key={`${gi}-${si}`}
                className={`st-comboChart__bar st-comboChart__bar--${seg.tone}`}
                x={seg.x}
                y={seg.y}
                width={seg.width}
                height={seg.height}
                rx="2"
                data-chart-kind="bar"
                data-chart-a={gi}
                data-chart-b={si}
              />
            )),
          )}

          {/* lines */}
          {lineSeries.map((series, li) =>
            series.hidden ? null : (
              <React.Fragment key={li}>
                <path
                  className={`st-comboChart__line st-comboChart__line--${series.tone}`}
                  d={series.path}
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {series.points.map((p, pi) => (
                  <circle
                    key={pi}
                    className={`st-comboChart__dot st-comboChart__dot--${series.tone}`}
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    data-chart-kind="line"
                    data-chart-a={li}
                    data-chart-b={pi}
                  />
                ))}
              </React.Fragment>
            ),
          )}

          {/* Annotations ABOVE the bars/lines: lines, shapes, points, labels. */}
          {annotationAbove.length > 0 ? (
            <g className="st-comboChart__annotations st-comboChart__annotations--above">
              {annotationAbove.map((a) => {
                if (a.kind === "line") {
                  return (
                    <React.Fragment key={`ann-line-${a.key}`}>
                      <line className="st-comboChart__annotationLine" x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} />
                      {a.label ? (
                        <text
                          className="st-comboChart__annotationLabel"
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
                      <polygon className="st-comboChart__annotationShape" points={polygonPoints(a.points)} />
                      {a.label ? (
                        <text className="st-comboChart__annotationLabel" x={a.labelX} y={a.labelY} textAnchor="middle">
                          {a.label}
                        </text>
                      ) : null}
                    </React.Fragment>
                  );
                }
                if (a.kind === "point") {
                  return (
                    <React.Fragment key={`ann-point-${a.key}`}>
                      <circle className="st-comboChart__annotationPoint" cx={a.x} cy={a.y} r="4.5" />
                      {a.label ? (
                        <text className="st-comboChart__annotationLabel" x={a.x} y={a.y - 8} textAnchor="middle">
                          {a.label}
                        </text>
                      ) : null}
                    </React.Fragment>
                  );
                }
                return (
                  <text key={`ann-label-${a.key}`} className="st-comboChart__annotationText" x={a.x} y={a.y} textAnchor={a.anchor}>
                    {a.text}
                  </text>
                );
              })}
            </g>
          ) : null}

          {/* Data labels — one value per bar + per line point, on top. aria-hidden. */}
          {barDataLabelItems.length + lineDataLabelItems.length > 0 ? (
            <g className="st-comboChart__dataLabels" aria-hidden="true">
              {barDataLabelItems.map((d) => (
                <text
                  key={d.key}
                  className="st-comboChart__dataLabel"
                  x={d.x}
                  y={d.y}
                  textAnchor="middle"
                  dominantBaseline={d.baseline}
                >
                  {d.text}
                </text>
              ))}
              {lineDataLabelItems.map((d) => (
                <text
                  key={d.key}
                  className="st-comboChart__dataLabel"
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

          {/* Crosshair (FR-3) — a tokenised dashed line on the CATEGORY axis at
              the active (hovered/controlled) category. Decorative (aria-hidden);
              the value is in the tooltip + list. */}
          {crosshairX !== null ? (
            <g className="st-comboChart__crosshair" aria-hidden="true">
              <line
                className="st-comboChart__crosshairLine"
                x1={crosshairX}
                x2={crosshairX}
                y1={MARGIN.top}
                y2={MARGIN.top + plotHeight}
              />
            </g>
          ) : null}
        </svg>

        {/* Keyboard navigation overlay (FR-5) — a focusable, transparent hit
            layer of one column per category. NOT aria-hidden: it is the
            accessible roving cursor. Each column announces its category + value
            summary; the focus ring is tokenised via CSS. */}
        {navEnabled ? (
          <svg
            className="st-comboChart__navLayer"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
            width="100%"
            height="100%"
            role="group"
            aria-label={`${label} — points de données`}
          >
            {categories.map((category, ci) => {
              const band = plotWidth / Math.max(categories.length, 1);
              return (
                <rect
                  key={ci}
                  ref={(el) => {
                    datapointRefs.current[ci] = el;
                  }}
                  className="st-comboChart__navDatum"
                  x={MARGIN.left + band * ci}
                  y={MARGIN.top}
                  width={band}
                  height={plotHeight}
                  role="img"
                  tabIndex={rovingTabIndex(ci, focusedIndex, categories.length)}
                  aria-label={datapointAriaLabel(category, categorySummary(ci))}
                  onKeyDown={(event) => handleDatapointKeyDown(event, ci)}
                  onFocus={() => {
                    setFocusedIndex(ci);
                    emitHoverKey(ci);
                  }}
                />
              );
            })}
          </svg>
        ) : null}
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {legend && legendItems.length > 0 ? (
        <ul className="st-comboChart__legend" aria-hidden={legendInteractive ? undefined : "true"}>
          {legendItems.map((item) => {
            const off = hiddenSet.has(item.label);
            const swatch = (
              <span
                className={`st-comboChart__legendSwatch st-comboChart__legendSwatch--${item.kind} st-comboChart__legendSwatch--${item.tone}`}
              />
            );
            return (
              <li
                key={item.key}
                className={classNames("st-comboChart__legendItem", legendInteractive && off && "st-comboChart__legendItem--off")}
              >
                {legendInteractive ? (
                  <button
                    type="button"
                    className="st-comboChart__legendButton"
                    aria-pressed={off}
                    onClick={() => onToggleSeries?.(item.label)}
                  >
                    {swatch}
                    {item.label}
                  </button>
                ) : (
                  <>
                    {swatch}
                    {item.label}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}

      {tooltip ? (
        <div
          className="st-comboChart__tooltip"
          role="presentation"
          style={{ left: `${(tooltip.cx / width) * 100}%`, top: `${(tooltip.cy / height) * 100}%` }}
        >
          <span className="st-comboChart__tooltipLabel">{tooltip.label}</span>
          <span className="st-comboChart__tooltipValue">{tooltip.value}</span>
        </div>
      ) : null}
    </div>
  );
}
