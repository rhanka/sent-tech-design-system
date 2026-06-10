import React from "react";
import { classNames } from "./classNames.js";
import {
  CHART_MARGIN,
  ChartDataList,
  buildLinearPath,
  buildSmoothPath,
  formatTick,
  niceTicks,
  scaleLinear,
} from "./chartScale.js";

export type BellCurveChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type BellCurveChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: number[];
  width?: number;
  height?: number;
  tone?: BellCurveChartTone;
  smooth?: boolean;
  intervals?: number;
  label: string;
  className?: string;
};

const MARGIN = { ...CHART_MARGIN };
const SQRT_2PI = Math.sqrt(2 * Math.PI);

// Sample statistics: μ = mean, σ = sample standard deviation (n-1). Returns
// null when fewer than two finite values exist or σ collapses to 0.
function computeStats(sample: number[]): { mean: number; sd: number; n: number } | null {
  const n = sample.length;
  if (n < 2) return null;
  const mean = sample.reduce((a, b) => a + b, 0) / n;
  const variance = sample.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (n - 1);
  const sd = Math.sqrt(variance);
  if (!(sd > 0) || !Number.isFinite(sd)) return null;
  return { mean, sd, n };
}

function pdf(x: number, mean: number, sd: number): number {
  const z = (x - mean) / sd;
  return Math.exp(-(z * z) / 2) / (sd * SQRT_2PI);
}

function roundStat(v: number): number {
  return Math.round(v * 100) / 100;
}

export function BellCurveChart({
  data = [],
  width = 480,
  height = 240,
  tone = "category1",
  smooth = true,
  intervals = 64,
  label,
  className,
  ...rest
}: BellCurveChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  // Finite values only.
  const sample = data.filter((d) => Number.isFinite(d));
  const stats = computeStats(sample);

  const sampleCount = Math.max(8, Math.floor(intervals) || 64);

  const xDomain = stats
    ? { min: stats.mean - 4 * stats.sd, max: stats.mean + 4 * stats.sd }
    : { min: 0, max: 1 };

  // Peak density at x=μ: pdf(μ) = 1/(σ·√(2π)).
  const yMax = stats ? pdf(stats.mean, stats.mean, stats.sd) : 1;
  const yDomain = { min: 0, max: yMax * 1.08 };

  const xTicks = stats ? niceTicks(xDomain.min, xDomain.max, 5) : [0];

  const baseY = MARGIN.top + plotHeight;

  type CurvePoint = { x: number; y: number; vx: number };
  const curvePoints: CurvePoint[] = (() => {
    if (!stats) return [];
    const pts: CurvePoint[] = [];
    for (let i = 0; i <= sampleCount; i++) {
      const vx = xDomain.min + ((xDomain.max - xDomain.min) * i) / sampleCount;
      const vy = pdf(vx, stats.mean, stats.sd);
      pts.push({
        x: MARGIN.left + scaleLinear(vx, xDomain.min, xDomain.max, 0, plotWidth),
        y: MARGIN.top + scaleLinear(vy, yDomain.min, yDomain.max, plotHeight, 0),
        vx,
      });
    }
    return pts;
  })();

  const linePath =
    curvePoints.length === 0 ? "" : smooth ? buildSmoothPath(curvePoints) : buildLinearPath(curvePoints);

  const areaPath = (() => {
    if (curvePoints.length === 0) return "";
    const first = curvePoints[0];
    const last = curvePoints[curvePoints.length - 1];
    return `${linePath} L${last.x.toFixed(2)},${baseY.toFixed(2)} L${first.x.toFixed(2)},${baseY.toFixed(2)} Z`;
  })();

  const meanMark = stats
    ? {
        x: MARGIN.left + scaleLinear(stats.mean, xDomain.min, xDomain.max, 0, plotWidth),
        yTop: MARGIN.top + scaleLinear(yMax, yDomain.min, yDomain.max, plotHeight, 0),
      }
    : null;

  const sdMarks = stats
    ? [-2, -1, 1, 2].map((k) => {
        const vx = stats.mean + k * stats.sd;
        const vy = pdf(vx, stats.mean, stats.sd);
        return {
          k,
          x: MARGIN.left + scaleLinear(vx, xDomain.min, xDomain.max, 0, plotWidth),
          yTop: MARGIN.top + scaleLinear(vy, yDomain.min, yDomain.max, plotHeight, 0),
        };
      })
    : [];

  const gridLines = xTicks.map((tick) => ({
    value: tick,
    x: MARGIN.left + scaleLinear(tick, xDomain.min, xDomain.max, 0, plotWidth),
  }));

  const dataValueItems = stats
    ? [
        `Moyenne (μ): ${roundStat(stats.mean)}`,
        `Écart-type (σ): ${roundStat(stats.sd)}`,
        `Taille de l'échantillon (n): ${stats.n}`,
      ]
    : [
        sample.length < 2
          ? "Échantillon insuffisant (au moins 2 valeurs requises)"
          : "Écart-type nul (valeurs identiques)",
      ];

  const ariaLabel = stats
    ? `${label} — μ ${roundStat(stats.mean)}, σ ${roundStat(stats.sd)}, n ${stats.n}`
    : label;

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

  // Unique gradient id to avoid conflicts when several charts share a page.
  const gradientId = React.useId().replace(/[:]/g, "");

  const hoveredPoint = hoveredIndex !== null ? curvePoints[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-bellCurveChart", `st-bellCurveChart--${tone}`, className)}>
      <div
        className="st-bellCurveChart__visual"
        role="img"
        aria-label={ariaLabel}
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
              <line className="st-bellCurveChart__grid" x1={g.x} x2={g.x} y1={MARGIN.top} y2={baseY} />
              <text className="st-bellCurveChart__tickLabel" x={g.x} y={baseY + 16} textAnchor="middle">
                {formatTick(g.value)}
              </text>
            </React.Fragment>
          ))}

          <line className="st-bellCurveChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={baseY} />
          <line
            className="st-bellCurveChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={baseY}
            y2={baseY}
          />

          {areaPath ? <path className="st-bellCurveChart__area" d={areaPath} fill={`url(#${gradientId})`} /> : null}
          {linePath ? (
            <path
              className="st-bellCurveChart__line"
              d={linePath}
              fill="none"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {sdMarks.map((m) => (
            <line key={m.k} className="st-bellCurveChart__sdMark" x1={m.x} x2={m.x} y1={m.yTop} y2={baseY} />
          ))}

          {meanMark ? (
            <>
              <line
                className="st-bellCurveChart__mean"
                x1={meanMark.x}
                x2={meanMark.x}
                y1={meanMark.yTop}
                y2={baseY}
              />
              <text className="st-bellCurveChart__meanLabel" x={meanMark.x} y={MARGIN.top - 2} textAnchor="middle">
                μ
              </text>
            </>
          ) : null}

          {curvePoints.map((p, i) => (
            <circle key={i} className="st-bellCurveChart__hit" cx={p.x} cy={p.y} r={6} data-chart-index={i} />
          ))}
        </svg>
      </div>

      <ChartDataList label={ariaLabel} items={dataValueItems} />

      {hoveredPoint && stats ? (
        <div
          className="st-bellCurveChart__tooltip"
          role="presentation"
          style={{ left: `${(hoveredPoint.x / width) * 100}%`, top: `${(hoveredPoint.y / height) * 100}%` }}
        >
          <span className="st-bellCurveChart__tooltipLabel">{`x ≈ ${roundStat(hoveredPoint.vx)}`}</span>
          <span className="st-bellCurveChart__tooltipValue">{`densité ${
            hoveredPoint.y === baseY ? 0 : roundStat(pdf(hoveredPoint.vx, stats.mean, stats.sd))
          }`}</span>
        </div>
      ) : null}
    </div>
  );
}
