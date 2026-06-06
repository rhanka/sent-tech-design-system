import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";
import { contrastTextForTone } from "./chartContrast.js";

export type MarimekkoChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type MarimekkoChartSegment = {
  label: string;
  value: number;
  tone?: MarimekkoChartTone;
};

export type MarimekkoChartDatum = {
  label: string;
  width: number;
  segments: MarimekkoChartSegment[];
};

export type MarimekkoChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: MarimekkoChartDatum[];
  label: string;
  width?: number;
  height?: number;
  className?: string;
};

const TONES: MarimekkoChartTone[] = [
  "category1", "category2", "category3", "category4",
  "category5", "category6", "category7", "category8",
];

const MARGIN = { top: 12, right: 16, bottom: 32, left: 8 };

export function MarimekkoChart({
  data = [],
  label,
  width = 480,
  height = 300,
  className,
  ...rest
}: MarimekkoChartProps) {
  const [hoveredKey, setHoveredKey] = React.useState<string | null>(null);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  // FIX: ignore (skip) non-finite or <=0 widths, NO Math.abs
  const totalWidth = React.useMemo(() => {
    const sum = data.reduce((acc, d) => {
      const w = d.width;
      return acc + (Number.isFinite(w) && w > 0 ? w : 0);
    }, 0);
    return sum > 0 ? sum : 1;
  }, [data]);

  const cells = React.useMemo(() => {
    let xCursor = MARGIN.left;
    const result: {
      key: string;
      catLabel: string;
      segLabel: string;
      tone: MarimekkoChartTone;
      x: number;
      y: number;
      w: number;
      h: number;
      cx: number;
      cy: number;
      pct: number;
      colPct: number;
    }[] = [];

    for (const datum of data) {
      const safeW = Number.isFinite(datum.width) && datum.width > 0 ? datum.width : 0;
      // FIX: skip invalid columns (zero or non-finite width)
      if (safeW <= 0) continue;
      const colW = (safeW / totalWidth) * plotWidth;
      const colPct = safeW / totalWidth;

      // FIX: ignore non-finite or <=0 segments (NO Math.abs, NO 0.5px floor)
      const validSegs = datum.segments.filter(
        (s) => Number.isFinite(s.value) && s.value > 0
      );
      const segSum = validSegs.reduce((acc, s) => acc + s.value, 0);
      const safeSum = segSum > 0 ? segSum : 1;

      let yCursor = MARGIN.top;
      for (let si = 0; si < validSegs.length; si++) {
        const seg = validSegs[si];
        const pct = seg.value / safeSum;
        const segH = pct * plotHeight;
        const tone = seg.tone ?? TONES[si % TONES.length];
        result.push({
          key: `${datum.label}-${seg.label}`,
          catLabel: datum.label,
          segLabel: seg.label,
          tone,
          x: xCursor,
          y: yCursor,
          // FIX: no min floor at 0.5px for zeros (they are filtered)
          w: Math.max(colW - 1, 1),
          h: Math.max(segH, 1),
          cx: xCursor + colW / 2,
          cy: yCursor + segH / 2,
          pct,
          colPct,
        });
        yCursor += segH;
      }
      xCursor += colW;
    }
    return result;
  }, [data, totalWidth, plotWidth, plotHeight]);

  // FIX a11y: SR includes column width share (colPct) in addition to segment %
  const dataValueItems = cells.map(
    (c) =>
      `${c.catLabel}, ${c.segLabel}: ${Math.round(c.pct * 100)}% (colonne ${Math.round(c.colPct * 100)}%)`
  );

  function handlePointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) { setHoveredKey(null); return; }
    setHoveredKey(target.getAttribute("data-chart-key") ?? null);
  }

  const hoveredCell = hoveredKey !== null ? cells.find((c) => c.key === hoveredKey) ?? null : null;

  return (
    <div {...rest} className={classNames("st-marimekkoChart", className)}>
      <div
        className="st-marimekkoChart__visual"
        role="img"
        aria-label={label}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoveredKey(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          {/* axis */}
          <line
            className="st-marimekkoChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {/* cells */}
          {cells.map((cell) => (
            <React.Fragment key={cell.key}>
              <rect
                className={classNames(
                  "st-marimekkoChart__cell",
                  `st-marimekkoChart__cell--${cell.tone}`,
                  hoveredKey !== null && hoveredKey !== cell.key
                    ? "st-marimekkoChart__cell--dim"
                    : undefined
                )}
                x={cell.x}
                y={cell.y}
                width={cell.w}
                height={cell.h}
                data-chart-key={cell.key}
              />
              {cell.w > 28 && cell.h > 14 ? (
                <text
                  className="st-marimekkoChart__cellLabel"
                  x={cell.cx}
                  y={cell.cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fill: contrastTextForTone(cell.tone) }}
                  pointerEvents="none"
                >
                  {Math.round(cell.pct * 100)}%
                </text>
              ) : null}
            </React.Fragment>
          ))}

          {/* category labels below axis */}
          {data.map((datum) => {
            if (!Number.isFinite(datum.width) || datum.width <= 0) return null;
            const colW = (datum.width / totalWidth) * plotWidth;
            const startX = cells.find((c) => c.catLabel === datum.label)?.x ?? MARGIN.left;
            return (
              <text
                key={datum.label}
                className="st-marimekkoChart__catLabel"
                x={startX + colW / 2}
                y={height - MARGIN.bottom + 16}
                textAnchor="middle"
              >
                {datum.label}
              </text>
            );
          })}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hoveredCell !== null ? (
        <div
          className="st-marimekkoChart__tooltip"
          role="presentation"
          style={{
            left: `${(hoveredCell.cx / width) * 100}%`,
            top: `${(hoveredCell.cy / height) * 100}%`,
          }}
        >
          <span className="st-marimekkoChart__tooltipLabel">
            {hoveredCell.catLabel} / {hoveredCell.segLabel}
          </span>
          <span className="st-marimekkoChart__tooltipValue">
            {Math.round(hoveredCell.pct * 100)}%
          </span>
        </div>
      ) : null}
    </div>
  );
}
