import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";

export type BumpChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type BumpChartSeries = {
  label: string;
  ranks: (number | null | undefined)[];
  tone?: BumpChartTone;
};

export type BumpChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: BumpChartSeries[];
  categories: string[];
  label: string;
  width?: number;
  height?: number;
  className?: string;
};

const TONES: BumpChartTone[] = [
  "category1", "category2", "category3", "category4",
  "category5", "category6", "category7", "category8",
];

const MARGIN = { top: 16, right: 80, bottom: 32, left: 80 };

// FIX: valid rank = integer ≥1 only
function isValidRank(r: unknown): r is number {
  return (
    typeof r === "number" &&
    Number.isFinite(r) &&
    Number.isInteger(r) &&
    r >= 1
  );
}

/**
 * Builds an SVG bump path with GAP for invalid ranks.
 * Uses cubic bezier curves for smooth bumps.
 */
function buildBumpPath(points: ({ x: number; y: number } | null)[]): string {
  const parts: string[] = [];
  let segment: { x: number; y: number }[] = [];

  function flushSegment() {
    if (segment.length >= 2) {
      let d = `M${segment[0].x.toFixed(2)},${segment[0].y.toFixed(2)}`;
      for (let i = 0; i < segment.length - 1; i++) {
        const p1 = segment[i];
        const p2 = segment[i + 1];
        const mx = (p1.x + p2.x) / 2;
        d += ` C${mx.toFixed(2)},${p1.y.toFixed(2)} ${mx.toFixed(2)},${p2.y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
      }
      parts.push(d);
    } else if (segment.length === 1) {
      parts.push(`M${segment[0].x.toFixed(2)},${segment[0].y.toFixed(2)}`);
    }
    segment = [];
  }

  for (const pt of points) {
    if (pt === null) {
      flushSegment();
    } else {
      segment.push(pt);
    }
  }
  flushSegment();
  return parts.join(" ");
}

export function BumpChart({
  data = [],
  categories = [],
  label,
  width = 480,
  height = 300,
  className,
  ...rest
}: BumpChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  const maxRank = React.useMemo(() => {
    let m = 1;
    for (const s of data) {
      for (const r of s.ranks) {
        if (isValidRank(r) && r > m) m = r;
      }
    }
    return m;
  }, [data]);

  // FIX: align ranks and categories using Math.min(ranks.length, categories.length)
  const catCount = Math.max(categories.length, 2);

  function rankToY(rank: number): number {
    // rank 1 = top
    return MARGIN.top + ((rank - 1) / Math.max(maxRank - 1, 1)) * plotHeight;
  }

  function catToX(ci: number): number {
    return MARGIN.left + (ci / Math.max(catCount - 1, 1)) * plotWidth;
  }

  const series = React.useMemo(() => {
    return data.map((s, si) => {
      const tone = s.tone ?? TONES[si % TONES.length];
      // FIX: align ranks/categories; invalid rank → null (GAP)
      const alignedLength = Math.min(s.ranks.length, categories.length);
      const points: ({ x: number; y: number } | null)[] = [];
      for (let ci = 0; ci < alignedLength; ci++) {
        const r = s.ranks[ci];
        if (isValidRank(r)) {
          points.push({ x: catToX(ci), y: rankToY(r) });
        } else {
          points.push(null); // GAP
        }
      }
      return {
        label: s.label,
        ranks: s.ranks,
        tone,
        points,
        index: si,
        path: buildBumpPath(points),
        alignedLength,
      };
    });
  }, [data, categories, maxRank, catCount]);

  const rankTicks = React.useMemo(() => {
    const ticks: number[] = [];
    for (let r = 1; r <= maxRank; r++) ticks.push(r);
    return ticks;
  }, [maxRank]);

  // FIX: SR does not announce #1 for absent rank (uses "?" instead)
  const dataValueItems = data.map((s) => {
    const alignedLength = Math.min(s.ranks.length, categories.length);
    return (
      `${s.label}: ` +
      categories.slice(0, alignedLength).map((cat, ci) => {
        const r = s.ranks[ci];
        return `${cat} ${isValidRank(r) ? `#${r}` : "?"}`;
      }).join(", ")
    );
  });

  function handlePointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) { setHoveredIndex(null); return; }
    const idx = Number(target.getAttribute("data-chart-index"));
    setHoveredIndex(Number.isInteger(idx) ? idx : null);
  }

  return (
    <div {...rest} className={classNames("st-bumpChart", className)}>
      <div
        className="st-bumpChart__visual"
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
          {/* horizontal rank grid lines */}
          {rankTicks.map((rank) => {
            const ty = rankToY(rank);
            return (
              <React.Fragment key={rank}>
                <line
                  className="st-bumpChart__grid"
                  x1={MARGIN.left}
                  x2={width - MARGIN.right}
                  y1={ty}
                  y2={ty}
                />
                <text
                  className="st-bumpChart__rankLabel"
                  x={MARGIN.left - 8}
                  y={ty}
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  #{rank}
                </text>
              </React.Fragment>
            );
          })}

          {/* category labels */}
          {categories.map((cat, ci) => (
            <text
              key={cat}
              className="st-bumpChart__catLabel"
              x={catToX(ci)}
              y={height - MARGIN.bottom + 16}
              textAnchor="middle"
            >
              {cat}
            </text>
          ))}

          {/* FIX: composite key to avoid duplicates on s.label */}
          {series.map((s, si) => (
            <React.Fragment key={`${si}-${s.label}`}>
              <path
                className={classNames(
                  "st-bumpChart__line",
                  `st-bumpChart__line--${s.tone}`,
                  hoveredIndex !== null && hoveredIndex !== s.index
                    ? "st-bumpChart__line--dim"
                    : undefined,
                  hoveredIndex === s.index ? "st-bumpChart__line--active" : undefined
                )}
                d={s.path}
                fill="none"
                data-chart-index={s.index}
              />
              {/* FIX: dots only for valid ranks (non-null) */}
              {s.points.map((pt, ci) => {
                if (pt === null) return null;
                return (
                  <circle
                    key={`${si}-${s.label}-${ci}`}
                    className={classNames(
                      "st-bumpChart__dot",
                      `st-bumpChart__dot--${s.tone}`,
                      hoveredIndex !== null && hoveredIndex !== s.index
                        ? "st-bumpChart__dot--dim"
                        : undefined
                    )}
                    cx={pt.x}
                    cy={pt.y}
                    r={4}
                    data-chart-index={s.index}
                  />
                );
              })}
              {/* end label: last valid point */}
              {s.points.some((p) => p !== null) ? (() => {
                const lastValidPt = [...s.points].reverse().find((p) => p !== null);
                const firstValidPt = s.points.find((p) => p !== null);
                const validCount = s.points.filter((p) => p !== null).length;
                return (
                  <>
                    {lastValidPt ? (
                      <text
                        className="st-bumpChart__seriesLabel"
                        x={lastValidPt.x + 8}
                        y={lastValidPt.y}
                        dominantBaseline="middle"
                      >
                        {s.label}
                      </text>
                    ) : null}
                    {firstValidPt && validCount > 1 ? (
                      <text
                        className="st-bumpChart__seriesLabel"
                        x={firstValidPt.x - 8}
                        y={firstValidPt.y}
                        textAnchor="end"
                        dominantBaseline="middle"
                      >
                        {s.label}
                      </text>
                    ) : null}
                  </>
                );
              })() : null}
            </React.Fragment>
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />
    </div>
  );
}
