import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";

export type Density2DTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type Density2DChartScale = "categorical" | "sequential";

export type Density2DPoint = {
  x: number;
  y: number;
  weight?: number;
};

export type Density2DChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: Density2DPoint[];
  bins?: number;
  scale?: Density2DChartScale;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  className?: string;
};

const MARGIN = { top: 16, right: 18, bottom: 36, left: 48 };
const TONES: Density2DTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

function normalizedScale(value: Density2DChartScale | undefined): Density2DChartScale {
  return value === "categorical" ? "categorical" : "sequential";
}

// Continuous scale: density normalised 0..max → category1..8 (shared with
// HeatmapChart). max ≤ 0 or non-finite density → category1 (floor intensity).
function toneForDensity(density: number, densityMax: number): Density2DTone {
  if (!Number.isFinite(density) || densityMax <= 0) return "category1";
  const ratio = Math.max(0, Math.min(1, density / densityMax));
  const index = Math.max(0, Math.min(TONES.length - 1, Math.floor(ratio * TONES.length)));
  return TONES[index];
}

function niceTicks(min: number, max: number, target = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    return [Number.isFinite(max) ? max : 0];
  }
  const range = max - min;
  const rough = range / Math.max(target - 1, 1);
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / pow;
  let step: number;
  if (norm < 1.5) step = pow;
  else if (norm < 3) step = 2 * pow;
  else if (norm < 7) step = 5 * pow;
  else step = 10 * pow;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) ticks.push(Number(v.toFixed(10)));
  return ticks;
}

function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number): number {
  if (d1 === d0) return r0;
  return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
}

function formatTick(v: number): string {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

type Bin = {
  key: string;
  ix: number;
  iy: number;
  density: number;
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  tone: Density2DTone;
};

export function Density2DChart({
  data = [],
  bins = 12,
  scale = "sequential",
  label,
  width,
  height = 320,
  size,
  className,
  ...rest
}: Density2DChartProps) {
  const [hoveredKey, setHoveredKey] = React.useState<string | null>(null);
  const resolvedScale = normalizedScale(scale);

  const resolvedWidth = width ?? size ?? 640;
  const plotWidth = Math.max(resolvedWidth - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  // Effective bin count: integer ≥ 1, capped to stay legible.
  const binCount = Math.max(1, Math.min(40, Math.floor(Number.isFinite(bins) ? bins : 12)));

  // Normalise: keep only finite-coordinate points.
  const validData = data.filter((d) => d && Number.isFinite(d.x) && Number.isFinite(d.y));

  // Extent [minX,maxX]×[minY,maxY] + nice ticks for the axes.
  const xs = validData.map((d) => d.x);
  const ys = validData.map((d) => d.y);
  const xTicks = niceTicks(xs.length ? Math.min(...xs) : 0, xs.length ? Math.max(...xs) : 1);
  const yTicks = niceTicks(ys.length ? Math.min(...ys) : 0, ys.length ? Math.max(...ys) : 1);
  const xMin = xTicks[0];
  const xMax = xTicks[xTicks.length - 1];
  const yMin = yTicks[0];
  const yMax = yTicks[yTicks.length - 1];

  // Regular binning: binCount×binCount grid over the extent; each point falls
  // into a cell, whose density = sum of weights (default 1).
  let densityMax = 0;
  const binCells: Bin[] = [];
  if (validData.length > 0 && xMax !== xMin && yMax !== yMin) {
    const counts = new Float64Array(binCount * binCount);
    const idx = (ix: number, iy: number) => iy * binCount + ix;
    for (const d of validData) {
      const fx = (d.x - xMin) / (xMax - xMin);
      const fy = (d.y - yMin) / (yMax - yMin);
      const ix = Math.max(0, Math.min(binCount - 1, Math.floor(fx * binCount)));
      const iy = Math.max(0, Math.min(binCount - 1, Math.floor(fy * binCount)));
      const w = typeof d.weight === "number" && Number.isFinite(d.weight) ? d.weight : 1;
      counts[idx(ix, iy)] += w;
    }
    for (let i = 0; i < counts.length; i++) densityMax = Math.max(densityMax, counts[i]);

    const cellW = plotWidth / binCount;
    const cellH = plotHeight / binCount;
    for (let iy = 0; iy < binCount; iy++) {
      for (let ix = 0; ix < binCount; ix++) {
        const density = counts[idx(ix, iy)];
        if (density <= 0) continue;
        const x = MARGIN.left + ix * cellW;
        const y = MARGIN.top + (binCount - 1 - iy) * cellH;
        binCells.push({
          key: `${ix}-${iy}`,
          ix,
          iy,
          density,
          x,
          y,
          width: Math.max(cellW - 1, 1),
          height: Math.max(cellH - 1, 1),
          cx: x + cellW / 2,
          cy: y + cellH / 2,
          x0: xMin + (ix / binCount) * (xMax - xMin),
          x1: xMin + ((ix + 1) / binCount) * (xMax - xMin),
          y0: yMin + (iy / binCount) * (yMax - yMin),
          y1: yMin + ((iy + 1) / binCount) * (yMax - yMin),
          tone: toneForDensity(density, densityMax),
        });
      }
    }
  }

  const xAxisTicks = xTicks.map((t) => ({
    value: t,
    x: MARGIN.left + scaleLinear(t, xMin, xMax, 0, plotWidth),
  }));
  const yAxisTicks = yTicks.map((t) => ({
    value: t,
    y: MARGIN.top + scaleLinear(t, yMin, yMax, plotHeight, 0),
  }));

  const dataValueItems = binCells.map(
    (b) =>
      `[${formatTick(b.x0)}–${formatTick(b.x1)}] × [${formatTick(b.y0)}–${formatTick(b.y1)}]: ${b.density}`,
  );

  const legendItems = TONES.map((tone) => ({ tone }));
  const hasLegend = binCells.length > 0;

  function handlePointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredKey(null);
      return;
    }
    setHoveredKey(target.getAttribute("data-chart-key"));
  }

  const hoveredCell = hoveredKey !== null ? binCells.find((b) => b.key === hoveredKey) ?? null : null;

  return (
    <div {...rest} className={classNames("st-density2DChart", `st-density2DChart--${resolvedScale}`, className)}>
      <div
        className="st-density2DChart__visual"
        role="img"
        aria-label={label}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoveredKey(null)}
      >
        <svg
          viewBox={`0 0 ${resolvedWidth} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          {/* tick labels (Y axis) */}
          {yAxisTicks.map((tick) => (
            <text
              key={`y${tick.value}`}
              className="st-density2DChart__tickLabel"
              x={MARGIN.left - 8}
              y={tick.y}
              textAnchor="end"
              dominantBaseline="middle"
            >
              {formatTick(tick.value)}
            </text>
          ))}

          {/* tick labels (X axis) */}
          {xAxisTicks.map((tick) => (
            <text
              key={`x${tick.value}`}
              className="st-density2DChart__tickLabel"
              x={tick.x}
              y={height - MARGIN.bottom + 16}
              textAnchor="middle"
            >
              {formatTick(tick.value)}
            </text>
          ))}

          {/* axes */}
          <line
            className="st-density2DChart__axis"
            x1={MARGIN.left}
            x2={MARGIN.left}
            y1={MARGIN.top}
            y2={height - MARGIN.bottom}
          />
          <line
            className="st-density2DChart__axis"
            x1={MARGIN.left}
            x2={resolvedWidth - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {/* density cells (binCount×binCount grid, color ∝ density) */}
          {binCells.map((cell) => (
            <rect
              key={cell.key}
              className={classNames(
                "st-density2DChart__cell",
                `st-density2DChart__cell--${cell.tone}`,
                hoveredKey !== null && hoveredKey !== cell.key
                  ? "st-density2DChart__cell--dim"
                  : undefined,
              )}
              x={cell.x}
              y={cell.y}
              width={cell.width}
              height={cell.height}
              rx="1"
              data-chart-key={cell.key}
            />
          ))}
        </svg>
      </div>

      {hasLegend ? (
        <div className="st-density2DChart__legend" aria-hidden="true">
          <span className="st-density2DChart__legendText">Low</span>
          <span className="st-density2DChart__legendRamp">
            {legendItems.map((item) => (
              <span
                key={item.tone}
                className={`st-density2DChart__legendSwatch st-density2DChart__legendSwatch--${item.tone}`}
              />
            ))}
          </span>
          <span className="st-density2DChart__legendText">High</span>
        </div>
      ) : null}

      <ChartDataList label={label ?? "density 2d"} items={dataValueItems} />

      {hoveredCell ? (
        <div
          className="st-density2DChart__tooltip"
          role="presentation"
          style={{
            left: `${(hoveredCell.cx / resolvedWidth) * 100}%`,
            top: `${(hoveredCell.cy / height) * 100}%`,
          }}
        >
          <span className="st-density2DChart__tooltipLabel">
            [{formatTick(hoveredCell.x0)}–{formatTick(hoveredCell.x1)}] × [
            {formatTick(hoveredCell.y0)}–{formatTick(hoveredCell.y1)}]
          </span>
          <span className="st-density2DChart__tooltipValue">{hoveredCell.density}</span>
        </div>
      ) : null}
    </div>
  );
}
