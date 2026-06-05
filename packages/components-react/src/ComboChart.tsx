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
  width = 480,
  height = 240,
  label,
  className,
  ...rest
}: ComboChartProps) {
  const [hovered, setHovered] = React.useState<Hover>(null);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  // Left axis (bars): include zero in the domain so bars rest on a baseline.
  const leftScale = (() => {
    const values = bars.flatMap((s) => s.data);
    const minRaw = Math.min(0, ...(values.length ? values : [0]));
    const maxRaw = Math.max(0, ...(values.length ? values : [0]));
    const ticks = niceTicks(minRaw, maxRaw, 5);
    return { ticks, domainMin: ticks[0], domainMax: ticks[ticks.length - 1] };
  })();

  // Right axis (lines): padded domain like LineChart.
  const rightScale = (() => {
    const values = lines.flatMap((s) => s.data);
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
  const dataValueItems = [...bars.flatMap(seriesItems), ...lines.flatMap(seriesItems)];

  function handleLeave() {
    setHovered(null);
  }
  function handleVisualPointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHovered(null);
      return;
    }
    const kind = target.getAttribute("data-chart-kind");
    const a = Number(target.getAttribute("data-chart-a"));
    const b = Number(target.getAttribute("data-chart-b"));
    if (kind === "bar" && Number.isInteger(a) && Number.isInteger(b)) {
      setHovered({ kind: "bar", gi: a, si: b });
    } else if (kind === "line" && Number.isInteger(a) && Number.isInteger(b)) {
      setHovered({ kind: "line", li: a, pi: b });
    } else {
      setHovered(null);
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
          {lineSeries.map((series, li) => (
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
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {legend && legendItems.length > 0 ? (
        <ul className="st-comboChart__legend" aria-hidden="true">
          {legendItems.map((item) => (
            <li key={item.key} className="st-comboChart__legendItem">
              <span
                className={`st-comboChart__legendSwatch st-comboChart__legendSwatch--${item.kind} st-comboChart__legendSwatch--${item.tone}`}
              />
              {item.label}
            </li>
          ))}
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
