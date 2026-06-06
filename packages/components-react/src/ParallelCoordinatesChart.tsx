import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";

export type ParallelCoordinatesChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ParallelAxis = {
  key: string;
  label: string;
  min?: number;
  max?: number;
};

export type ParallelCoordinatesChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  axes: ParallelAxis[];
  data: Record<string, unknown>[];
  label: string;
  // FIX: prop is `tones` (PLURAL) — consistency with other charts
  tones?: ParallelCoordinatesChartTone[];
  width?: number;
  height?: number;
  className?: string;
};

const TONES: ParallelCoordinatesChartTone[] = [
  "category1", "category2", "category3", "category4",
  "category5", "category6", "category7", "category8",
];

const MARGIN = { top: 32, right: 24, bottom: 16, left: 24 };

function formatTick(v: number): string {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}k`;
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

// FIX: strict parse of a row value. Returns null if not finite → GAP in path.
function parseStrictFinite(raw: unknown): number | null {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  if (typeof raw === "string" && raw !== "") {
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * Builds an SVG path with GAP (M...L... M...) for null points.
 * A segment containing a null point is not drawn.
 */
function buildPathWithGaps(points: ({ x: number; y: number } | null)[]): string {
  const parts: string[] = [];
  let segment: { x: number; y: number }[] = [];

  for (const pt of points) {
    if (pt === null) {
      if (segment.length > 0) {
        parts.push(
          segment.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ")
        );
        segment = [];
      }
    } else {
      segment.push(pt);
    }
  }
  if (segment.length > 0) {
    parts.push(
      segment.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ")
    );
  }
  return parts.join(" ");
}

export function ParallelCoordinatesChart({
  axes = [],
  data = [],
  label,
  tones,
  width = 480,
  height = 300,
  className,
  ...rest
}: ParallelCoordinatesChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  // FIX: per-axis domains with strict parse, no silent Number() coercion
  function axisDomain(axis: ParallelAxis): { min: number; max: number } {
    const vals = data
      .map((d) => {
        const raw = d[axis.key];
        if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
        if (typeof raw === "string" && raw !== "") {
          const n = Number(raw);
          return Number.isFinite(n) ? n : null;
        }
        return null;
      })
      .filter((v): v is number => v !== null);

    const rawMin = vals.length > 0 ? Math.min(...vals) : 0;
    const rawMax = vals.length > 0 ? Math.max(...vals) : 1;
    const safeMax = rawMax === rawMin ? rawMin + 1 : rawMax;

    return {
      min: Number.isFinite(axis.min) ? (axis.min as number) : rawMin,
      max: Number.isFinite(axis.max) ? (axis.max as number) : safeMax,
    };
  }

  const axisX = axes.map(
    (_, i) =>
      MARGIN.left +
      (axes.length <= 1 ? plotWidth / 2 : (i / (axes.length - 1)) * plotWidth)
  );

  const lines = React.useMemo(() => {
    return data.map((row, ri) => {
      const seriesTones = tones ?? [];
      const rowTone = seriesTones[ri] ?? TONES[ri % TONES.length];
      const points: ({ x: number; y: number } | null)[] = axes.map((axis, ai) => {
        const domain = axisDomain(axis);
        // FIX: strict parse → null if invalid
        const val = parseStrictFinite(row[axis.key]);
        if (val === null) return null; // GAP
        // FIX: clamp to domain bounds
        const clamped = Math.min(Math.max(val, domain.min), domain.max);
        const t =
          domain.max === domain.min ? 0.5 : (clamped - domain.min) / (domain.max - domain.min);
        return { x: axisX[ai], y: MARGIN.top + (1 - t) * plotHeight };
      });
      return { points, tone: rowTone, index: ri, row, path: buildPathWithGaps(points) };
    });
  }, [data, axes, tones, axisX, plotHeight]);

  const dataValueItems = data.map((row) =>
    axes.map((axis) => `${axis.label}: ${row[axis.key] ?? ""}`).join(", ")
  );

  function handlePointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) { setHoveredIndex(null); return; }
    const idx = Number(target.getAttribute("data-chart-index"));
    setHoveredIndex(Number.isInteger(idx) ? idx : null);
  }

  return (
    <div {...rest} className={classNames("st-parallelCoordinatesChart", className)}>
      <div
        className="st-parallelCoordinatesChart__visual"
        role="img"
        aria-label={label}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoveredIndex(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          {/* polylines */}
          {lines.map((line) => (
            <path
              key={line.index}
              className={classNames(
                "st-parallelCoordinatesChart__line",
                `st-parallelCoordinatesChart__line--${line.tone}`,
                hoveredIndex !== null && hoveredIndex !== line.index
                  ? "st-parallelCoordinatesChart__line--dim"
                  : undefined,
                hoveredIndex === line.index
                  ? "st-parallelCoordinatesChart__line--active"
                  : undefined
              )}
              d={line.path}
              fill="none"
              data-chart-index={line.index}
            />
          ))}

          {/* axes and labels */}
          {axes.map((axis, ai) => {
            const domain = axisDomain(axis);
            const ax = axisX[ai];
            return (
              <React.Fragment key={axis.key}>
                <line
                  className="st-parallelCoordinatesChart__axis"
                  x1={ax}
                  x2={ax}
                  y1={MARGIN.top}
                  y2={MARGIN.top + plotHeight}
                />
                <text
                  className="st-parallelCoordinatesChart__axisLabel"
                  x={ax}
                  y={MARGIN.top - 10}
                  textAnchor="middle"
                >
                  {axis.label}
                </text>
                {/* min/max ticks */}
                <text
                  className="st-parallelCoordinatesChart__tickLabel"
                  x={ax + 4}
                  y={MARGIN.top + plotHeight}
                  dominantBaseline="auto"
                >
                  {formatTick(domain.min)}
                </text>
                <text
                  className="st-parallelCoordinatesChart__tickLabel"
                  x={ax + 4}
                  y={MARGIN.top}
                  dominantBaseline="hanging"
                >
                  {formatTick(domain.max)}
                </text>
              </React.Fragment>
            );
          })}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />
    </div>
  );
}
