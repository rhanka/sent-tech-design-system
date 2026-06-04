import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type ScatterPlotTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ScatterPlotDatum = {
  x: number;
  y: number;
  label?: string;
  tone?: ScatterPlotTone;
};

export type ScatterPlotProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: ScatterPlotDatum[];
  width?: number;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  radius?: number;
  label: string;
  className?: string;
};

const MARGIN = { top: 14, right: 18, bottom: 36, left: 48 } as const;

const TONES: ScatterPlotTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

export function ScatterPlot({
  data,
  width = 480,
  height = 280,
  xLabel,
  yLabel,
  radius = 5,
  label,
  className,
  ...rest
}: ScatterPlotProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const xs = data.map((d) => d.x);
  const ys = data.map((d) => d.y);
  const xTicks = niceTicks(Math.min(...xs), Math.max(...xs));
  const yTicks = niceTicks(Math.min(...ys), Math.max(...ys));
  const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotH = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
  const xMin = xTicks[0];
  const xMax = xTicks[xTicks.length - 1];
  const yMin = yTicks[0];
  const yMax = yTicks[yTicks.length - 1];

  const points = data.map((d, i) => ({
    cx: MARGIN.left + scaleLinear(d.x, xMin, xMax, 0, plotW),
    cy: MARGIN.top + scaleLinear(d.y, yMin, yMax, plotH, 0),
    datum: d,
    tone: (d.tone ?? TONES[i % TONES.length]) as ScatterPlotTone,
  }));

  const dataValueItems = data.map((d) => (d.label ? `${d.label}: x ${d.x}, y ${d.y}` : `x ${d.x}, y ${d.y}`));

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

  const hovered = hoveredIndex !== null ? points[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-scatterPlot", className)}>
      <div
        className="st-scatterPlot__visual"
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
          {yTicks.map((t) => {
            const y = MARGIN.top + scaleLinear(t, yMin, yMax, plotH, 0);
            return (
              <React.Fragment key={`y${t}`}>
                <line className="st-scatterPlot__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={y} y2={y} />
                <text className="st-scatterPlot__tick" x={MARGIN.left - 6} y={y} textAnchor="end" dominantBaseline="middle">
                  {formatTick(t)}
                </text>
              </React.Fragment>
            );
          })}
          {xTicks.map((t) => {
            const x = MARGIN.left + scaleLinear(t, xMin, xMax, 0, plotW);
            return (
              <text
                key={`x${t}`}
                className="st-scatterPlot__tick"
                x={x}
                y={height - MARGIN.bottom + 16}
                textAnchor="middle"
              >
                {formatTick(t)}
              </text>
            );
          })}

          <line className="st-scatterPlot__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
          <line
            className="st-scatterPlot__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {xLabel ? (
            <text className="st-scatterPlot__axisLabel" x={MARGIN.left + plotW / 2} y={height - 4} textAnchor="middle">
              {xLabel}
            </text>
          ) : null}
          {yLabel ? (
            <text
              className="st-scatterPlot__axisLabel"
              x={12}
              y={MARGIN.top + plotH / 2}
              textAnchor="middle"
              transform={`rotate(-90 12 ${MARGIN.top + plotH / 2})`}
            >
              {yLabel}
            </text>
          ) : null}

          {points.map((p, i) => (
            <circle
              key={i}
              className={classNames("st-scatterPlot__point", `st-scatterPlot__point--${p.tone}`)}
              cx={p.cx}
              cy={p.cy}
              r={radius}
              data-chart-index={i}
            />
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hovered ? (
        <div
          className="st-scatterPlot__tooltip"
          role="presentation"
          style={{ left: `${(hovered.cx / width) * 100}%`, top: `${(hovered.cy / height) * 100}%` }}
        >
          {hovered.datum.label ? <span className="st-scatterPlot__tooltipLabel">{hovered.datum.label}</span> : null}
          <span className="st-scatterPlot__tooltipValue">
            x {hovered.datum.x} · y {hovered.datum.y}
          </span>
        </div>
      ) : null}
    </div>
  );
}
