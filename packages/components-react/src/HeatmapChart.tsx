import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";

export type HeatmapChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type HeatmapChartDatum = {
  x: string;
  y: string;
  value: number;
  tone?: HeatmapChartTone;
};

export type HeatmapChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: HeatmapChartDatum[];
  width?: number;
  height?: number;
  legend?: boolean;
  label: string;
  className?: string;
};

const MARGIN = { top: 28, right: 18, bottom: 44, left: 64 } as const;
const TONES: HeatmapChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

function uniqueInOrder(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    if (!seen.has(value)) {
      seen.add(value);
      out.push(value);
    }
  }
  return out;
}

function toneForValue(value: number, min: number, max: number): HeatmapChartTone {
  if (!Number.isFinite(value) || max <= min) return "category1";
  const index = Math.max(0, Math.min(TONES.length - 1, Math.floor(((value - min) / (max - min)) * TONES.length)));
  return TONES[index];
}

export function HeatmapChart({
  data,
  width = 480,
  height = 300,
  legend = false,
  label,
  className,
  ...rest
}: HeatmapChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const xLabels = uniqueInOrder(data.map((d) => d.x));
  const yLabels = uniqueInOrder(data.map((d) => d.y));
  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
  const cellWidth = xLabels.length > 0 ? plotWidth / xLabels.length : plotWidth;
  const cellHeight = yLabels.length > 0 ? plotHeight / yLabels.length : plotHeight;

  // Fix: filtrer NaN avant min/max
  const finiteValues = data.map((d) => d.value).filter(Number.isFinite);
  const minValue = finiteValues.length > 0 ? Math.min(...finiteValues) : 0;
  const maxValue = finiteValues.length > 0 ? Math.max(...finiteValues) : 1;

  const cells = data.map((datum, index) => {
    const xIndex = Math.max(0, xLabels.indexOf(datum.x));
    const yIndex = Math.max(0, yLabels.indexOf(datum.y));
    const x = MARGIN.left + xIndex * cellWidth;
    const y = MARGIN.top + yIndex * cellHeight;
    return {
      datum,
      index,
      tone: datum.tone ?? toneForValue(datum.value, minValue, maxValue),
      x,
      y,
      width: Math.max(cellWidth - 2, 1),
      height: Math.max(cellHeight - 2, 1),
      cx: x + cellWidth / 2,
      cy: y + cellHeight / 2,
    };
  });

  const dataValueItems = data.map((d) => `${d.y}, ${d.x}: ${d.value}`);

  const legendItems = TONES.map((tone, index) => ({
    tone,
    label: index === 0 ? "Low" : index === TONES.length - 1 ? "High" : "",
  }));

  function handleVisualPointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredIndex(null);
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    setHoveredIndex(Number.isInteger(index) ? index : null);
  }

  const hoveredCell = hoveredIndex !== null ? cells[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-heatmapChart", className)}>
      <div
        className="st-heatmapChart__visual"
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
          {yLabels.map((yLabel, index) => (
            <text
              key={yLabel}
              className="st-heatmapChart__axisLabel st-heatmapChart__axisLabel--y"
              x={MARGIN.left - 8}
              y={MARGIN.top + (index + 0.5) * (plotHeight / Math.max(yLabels.length, 1))}
              textAnchor="end"
              dominantBaseline="middle"
            >
              {yLabel}
            </text>
          ))}
          {xLabels.map((xLabel, index) => (
            <text
              key={xLabel}
              className="st-heatmapChart__axisLabel st-heatmapChart__axisLabel--x"
              x={MARGIN.left + (index + 0.5) * (plotWidth / Math.max(xLabels.length, 1))}
              y={height - MARGIN.bottom + 20}
              textAnchor="middle"
            >
              {xLabel}
            </text>
          ))}
          <rect
            className="st-heatmapChart__plot"
            x={MARGIN.left}
            y={MARGIN.top}
            width={plotWidth}
            height={plotHeight}
          />
          {cells.map((cell, i) => (
            <rect
              key={`${cell.datum.y}-${cell.datum.x}-${i}`}
              className={classNames(
                "st-heatmapChart__cell",
                `st-heatmapChart__cell--${cell.tone}`,
                hoveredIndex !== null && hoveredIndex !== i ? "st-heatmapChart__cell--dim" : undefined,
              )}
              x={cell.x}
              y={cell.y}
              width={cell.width}
              height={cell.height}
              rx="2"
              data-chart-index={i}
            />
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hoveredCell ? (
        <div
          className="st-heatmapChart__tooltip"
          role="presentation"
          style={{ left: `${(hoveredCell.cx / width) * 100}%`, top: `${(hoveredCell.cy / height) * 100}%` }}
        >
          <span className="st-heatmapChart__tooltipLabel">
            {hoveredCell.datum.y}, {hoveredCell.datum.x}
          </span>
          <span className="st-heatmapChart__tooltipValue">{hoveredCell.datum.value}</span>
        </div>
      ) : null}

      {legend ? (
        <div className="st-heatmapChart__legend" aria-hidden="true">
          <span className="st-heatmapChart__legendText">Low</span>
          <span className="st-heatmapChart__legendRamp">
            {legendItems.map((item) => (
              <span
                key={item.tone}
                className={`st-heatmapChart__legendSwatch st-heatmapChart__legendSwatch--${item.tone}`}
              />
            ))}
          </span>
          <span className="st-heatmapChart__legendText">High</span>
        </div>
      ) : null}
    </div>
  );
}
