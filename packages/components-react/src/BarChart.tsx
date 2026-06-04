import React from "react";
import { classNames } from "./classNames.js";
import { CHART_MARGIN, ChartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type BarChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type BarChartDatum = {
  label: string;
  value: number;
  tone?: BarChartTone;
};

export type BarChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: BarChartDatum[];
  width?: number;
  height?: number;
  orientation?: "vertical" | "horizontal";
  label: string;
  className?: string;
};

const MARGIN = CHART_MARGIN;

export function BarChart({
  data,
  width = 480,
  height = 240,
  orientation = "vertical",
  label,
  className,
  ...rest
}: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const values = data.map((d) => d.value);
  const minRaw = Math.min(0, ...values);
  const maxRaw = Math.max(0, ...values);
  const ticks = niceTicks(minRaw, maxRaw, 5);
  const domainMin = ticks[0];
  const domainMax = ticks[ticks.length - 1];
  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  const bars = (() => {
    if (data.length === 0) return [] as Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      cx: number;
      cy: number;
      datum: BarChartDatum;
      tone: BarChartTone;
    }>;
    if (orientation === "vertical") {
      const band = plotWidth / data.length;
      const barWidth = band * 0.62;
      const zeroY = scaleLinear(0, domainMin, domainMax, plotHeight, 0);
      return data.map((d, i) => {
        const valueY = scaleLinear(d.value, domainMin, domainMax, plotHeight, 0);
        const y = Math.min(valueY, zeroY);
        const h = Math.abs(zeroY - valueY);
        const x = MARGIN.left + band * i + (band - barWidth) / 2;
        return {
          x,
          y: MARGIN.top + y,
          width: barWidth,
          height: Math.max(h, 0.5),
          cx: MARGIN.left + band * (i + 0.5),
          cy: MARGIN.top + valueY,
          datum: d,
          tone: (d.tone ?? "category1") as BarChartTone,
        };
      });
    }
    const band = plotHeight / data.length;
    const barHeight = band * 0.62;
    const zeroX = scaleLinear(0, domainMin, domainMax, 0, plotWidth);
    return data.map((d, i) => {
      const valueX = scaleLinear(d.value, domainMin, domainMax, 0, plotWidth);
      const x = Math.min(valueX, zeroX);
      const w = Math.abs(valueX - zeroX);
      const y = MARGIN.top + band * i + (band - barHeight) / 2;
      return {
        x: MARGIN.left + x,
        y,
        width: Math.max(w, 0.5),
        height: barHeight,
        cx: MARGIN.left + valueX,
        cy: MARGIN.top + band * (i + 0.5),
        datum: d,
        tone: (d.tone ?? "category1") as BarChartTone,
      };
    });
  })();

  const dataValueItems = data.map((d) => `${d.label}: ${d.value}`);

  const valueAxisTicks =
    orientation === "vertical"
      ? ticks.map((tick) => ({
          value: tick,
          x1: MARGIN.left,
          x2: MARGIN.left + plotWidth,
          y: MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0),
        }))
      : ticks.map((tick) => ({
          value: tick,
          x: MARGIN.left + scaleLinear(tick, domainMin, domainMax, 0, plotWidth),
          y1: MARGIN.top,
          y2: MARGIN.top + plotHeight,
        }));

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

  const hoveredBar = hoveredIndex !== null ? bars[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-barChart", className)}>
      <div
        className="st-barChart__visual"
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
          {orientation === "vertical"
            ? (valueAxisTicks as Array<{ value: number; x1: number; x2: number; y: number }>).map((tick) => (
                <React.Fragment key={tick.value}>
                  <line className="st-barChart__grid" x1={tick.x1} x2={tick.x2} y1={tick.y} y2={tick.y} />
                  <text
                    className="st-barChart__tickLabel"
                    x={MARGIN.left - 6}
                    y={tick.y}
                    textAnchor="end"
                    dominantBaseline="middle"
                  >
                    {formatTick(tick.value)}
                  </text>
                </React.Fragment>
              ))
            : (valueAxisTicks as Array<{ value: number; x: number; y1: number; y2: number }>).map((tick) => (
                <React.Fragment key={tick.value}>
                  <line className="st-barChart__grid" x1={tick.x} x2={tick.x} y1={tick.y1} y2={tick.y2} />
                  <text
                    className="st-barChart__tickLabel"
                    x={tick.x}
                    y={height - MARGIN.bottom + 16}
                    textAnchor="middle"
                  >
                    {formatTick(tick.value)}
                  </text>
                </React.Fragment>
              ))}

          <line className="st-barChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
          <line
            className="st-barChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {bars.map((bar) =>
            orientation === "vertical" ? (
              <text
                key={bar.datum.label}
                className="st-barChart__categoryLabel"
                x={bar.x + bar.width / 2}
                y={height - MARGIN.bottom + 16}
                textAnchor="middle"
              >
                {bar.datum.label}
              </text>
            ) : (
              <text
                key={bar.datum.label}
                className="st-barChart__categoryLabel"
                x={MARGIN.left - 6}
                y={bar.y + bar.height / 2}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {bar.datum.label}
              </text>
            ),
          )}

          {bars.map((bar, i) => (
            <rect
              key={bar.datum.label}
              className={classNames("st-barChart__bar", `st-barChart__bar--${bar.tone}`)}
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              rx="2"
              data-chart-index={i}
            />
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hoveredBar ? (
        <div
          className="st-barChart__tooltip"
          role="presentation"
          style={{ left: `${(hoveredBar.cx / width) * 100}%`, top: `${(hoveredBar.cy / height) * 100}%` }}
        >
          <span className="st-barChart__tooltipLabel">{hoveredBar.datum.label}</span>
          <span className="st-barChart__tooltipValue">{hoveredBar.datum.value}</span>
        </div>
      ) : null}
    </div>
  );
}
