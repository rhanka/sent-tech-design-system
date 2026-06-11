import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";

export type TileMapChartTile = {
  label: string;
  col: number;
  row: number;
  value: number;
};

export type TileMapChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: TileMapChartTile[];
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

const MARGIN = { top: 16, right: 16, bottom: 44, left: 16 } as const;
const TONES = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
] as const;
const GAP = 4;

function toneForValue(value: number, min: number, max: number): (typeof TONES)[number] {
  if (!Number.isFinite(value) || max <= min) return "category1";
  const index = Math.max(0, Math.min(TONES.length - 1, Math.floor(((value - min) / (max - min)) * TONES.length)));
  return TONES[index];
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.?0+$/, "");
}

export function TileMapChart({
  data,
  width = 480,
  height = 360,
  label,
  className,
  ...rest
}: TileMapChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  const valid = data.filter(
    (tile) => Number.isFinite(tile.col) && Number.isFinite(tile.row) && Number.isFinite(tile.value),
  );

  const tiles =
    valid.length > 0
      ? (() => {
          const cols = Math.max(...valid.map((t) => t.col)) + 1;
          const rows = Math.max(...valid.map((t) => t.row)) + 1;
          const values = valid.map((t) => t.value);
          const min = Math.min(...values);
          const max = Math.max(...values);

          const side = Math.max(Math.min(plotWidth / cols, plotHeight / rows) - GAP, 1);
          const gridW = cols * (side + GAP) - GAP;
          const gridH = rows * (side + GAP) - GAP;
          const offsetX = MARGIN.left + Math.max((plotWidth - gridW) / 2, 0);
          const offsetY = MARGIN.top + Math.max((plotHeight - gridH) / 2, 0);

          return valid.map((tile, index) => {
            const x = offsetX + tile.col * (side + GAP);
            const y = offsetY + tile.row * (side + GAP);
            return {
              tile,
              index,
              tone: toneForValue(tile.value, min, max),
              x,
              y,
              side,
              cx: x + side / 2,
              cy: y + side / 2,
            };
          });
        })()
      : [];

  const dataValueItems = valid.map((tile) => `${tile.label}: ${formatNumber(tile.value)}`);

  function handleVisualPointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredIndex(null);
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    setHoveredIndex(Number.isInteger(index) ? index : null);
  }

  const hovered = hoveredIndex !== null ? tiles[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-tileMapChart", className)}>
      <div
        className="st-tileMapChart__visual"
        role="img"
        aria-label={label}
        onPointerMove={handleVisualPointerMove}
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
          {tiles.map((tile, i) => (
            <g key={`${tile.tile.label}-${i}`}>
              <rect
                className={classNames(
                  "st-tileMapChart__tile",
                  `st-tileMapChart__tile--${tile.tone}`,
                  hoveredIndex !== null && hoveredIndex !== i ? "st-tileMapChart__tile--dim" : undefined,
                )}
                x={tile.x}
                y={tile.y}
                width={tile.side}
                height={tile.side}
                rx="3"
                data-chart-index={i}
              />
              {tile.side > 18 ? (
                <text
                  className="st-tileMapChart__tileLabel"
                  x={tile.cx}
                  y={tile.cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  pointerEvents="none"
                >
                  {tile.tile.label}
                </text>
              ) : null}
            </g>
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hovered ? (
        <div
          className="st-tileMapChart__tooltip"
          role="presentation"
          style={{ left: `${(hovered.cx / width) * 100}%`, top: `${(hovered.cy / height) * 100}%` }}
        >
          <span className="st-tileMapChart__tooltipLabel">{hovered.tile.label}</span>
          <span className="st-tileMapChart__tooltipValue">{formatNumber(hovered.tile.value)}</span>
        </div>
      ) : null}

      <div className="st-tileMapChart__legend" aria-hidden="true">
        <span className="st-tileMapChart__legendText">Low</span>
        <span className="st-tileMapChart__legendRamp">
          {TONES.map((tone) => (
            <span key={tone} className={`st-tileMapChart__legendSwatch st-tileMapChart__legendSwatch--${tone}`} />
          ))}
        </span>
        <span className="st-tileMapChart__legendText">High</span>
      </div>
    </div>
  );
}
