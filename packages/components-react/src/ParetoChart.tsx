import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type ParetoChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ParetoChartDatum = {
  label: string;
  value: number;
  tone?: ParetoChartTone;
};

export type ParetoChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: ParetoChartDatum[];
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

// Right margin larger than BarChart's to host the % axis labels.
const MARGIN = { top: 12, right: 44, bottom: 32, left: 44 };
const DOT_RADIUS = 4;

export function ParetoChart({
  data = [],
  width = 480,
  height = 240,
  label,
  className,
  ...rest
}: ParetoChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  // Valid data: finite, non-negative value. Sorted descending by value.
  const sortedData = data
    .filter((d) => Number.isFinite(d.value) && d.value >= 0)
    .slice()
    .sort((a, b) => b.value - a.value);

  const total = sortedData.reduce((acc, d) => acc + d.value, 0);

  const values = sortedData.map((d) => d.value);
  const ticks = niceTicks(0, Math.max(0, ...values), 5);
  const domainMin = ticks[0];
  const domainMax = ticks[ticks.length - 1];
  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  const entries = React.useMemo(() => {
    if (sortedData.length === 0) return [];
    const band = plotWidth / sortedData.length;
    const barWidth = band * 0.62;
    const zeroY = scaleLinear(0, domainMin, domainMax, plotHeight, 0);
    let running = 0;
    return sortedData.map((d, i) => {
      running += d.value;
      const cumPercent = total > 0 ? (running / total) * 100 : 0;
      const valueY = scaleLinear(d.value, domainMin, domainMax, plotHeight, 0);
      const y = Math.min(valueY, zeroY);
      const h = Math.abs(zeroY - valueY);
      const x = MARGIN.left + band * i + (band - barWidth) / 2;
      const cy = MARGIN.top + scaleLinear(cumPercent, 0, 100, plotHeight, 0);
      return {
        datum: d,
        tone: (d.tone ?? "category1") as ParetoChartTone,
        x,
        y: MARGIN.top + y,
        width: barWidth,
        height: Math.max(h, 0.5),
        cumPercent,
        cx: MARGIN.left + band * (i + 0.5),
        cy,
      };
    });
  }, [sortedData, total, plotWidth, plotHeight, domainMin, domainMax]);

  const cumulativePath = entries
    .map((e, i) => `${i === 0 ? "M" : "L"} ${e.cx} ${e.cy}`)
    .join(" ");

  const dataValueItems = entries.map(
    (e) => `${e.datum.label}: ${e.datum.value} (${formatTick(e.cumPercent)}% cumulé)`
  );

  const valueAxisTicks = ticks.map((tick) => ({
    value: tick,
    x1: MARGIN.left,
    x2: MARGIN.left + plotWidth,
    y: MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0),
  }));

  const percentAxisTicks = [0, 25, 50, 75, 100].map((pct) => ({
    value: pct,
    y: MARGIN.top + scaleLinear(pct, 0, 100, plotHeight, 0),
  }));

  function handlePointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredIndex(null);
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    setHoveredIndex(Number.isInteger(index) ? index : null);
  }

  const hovered = hoveredIndex !== null ? entries[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-paretoChart", className)}>
      <div
        className="st-paretoChart__visual"
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
          {/* value-axis gridlines + left tick labels */}
          {valueAxisTicks.map((tick) => (
            <React.Fragment key={`v-${tick.value}`}>
              <line className="st-paretoChart__grid" x1={tick.x1} x2={tick.x2} y1={tick.y} y2={tick.y} />
              <text
                className="st-paretoChart__tickLabel"
                x={MARGIN.left - 6}
                y={tick.y}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {formatTick(tick.value)}
              </text>
            </React.Fragment>
          ))}

          {/* right percentage-axis labels */}
          {percentAxisTicks.map((tick) => (
            <text
              key={`p-${tick.value}`}
              className="st-paretoChart__percentLabel"
              x={width - MARGIN.right + 6}
              y={tick.y}
              textAnchor="start"
              dominantBaseline="middle"
            >
              {tick.value}%
            </text>
          ))}

          {/* axes */}
          <line
            className="st-paretoChart__axis"
            x1={MARGIN.left}
            x2={MARGIN.left}
            y1={MARGIN.top}
            y2={height - MARGIN.bottom}
          />
          <line
            className="st-paretoChart__axis"
            x1={width - MARGIN.right}
            x2={width - MARGIN.right}
            y1={MARGIN.top}
            y2={height - MARGIN.bottom}
          />
          <line
            className="st-paretoChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {/* category labels */}
          {entries.map((e) => (
            <text
              key={`cat-${e.datum.label}`}
              className="st-paretoChart__categoryLabel"
              x={e.x + e.width / 2}
              y={height - MARGIN.bottom + 16}
              textAnchor="middle"
            >
              {e.datum.label}
            </text>
          ))}

          {/* bars */}
          {entries.map((e, i) => (
            <rect
              key={`bar-${e.datum.label}`}
              className={`st-paretoChart__bar st-paretoChart__bar--${e.tone}`}
              x={e.x}
              y={e.y}
              width={e.width}
              height={e.height}
              rx={2}
              data-chart-index={i}
            />
          ))}

          {/* cumulative % line + dots */}
          {entries.length > 0 ? (
            <>
              <path className="st-paretoChart__cumLine" d={cumulativePath} fill="none" />
              {entries.map((e, i) => (
                <circle
                  key={`dot-${e.datum.label}`}
                  className="st-paretoChart__cumDot"
                  cx={e.cx}
                  cy={e.cy}
                  r={DOT_RADIUS}
                  data-chart-index={i}
                />
              ))}
            </>
          ) : null}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hovered ? (
        <div
          className="st-paretoChart__tooltip"
          role="presentation"
          style={{
            left: `${(hovered.cx / width) * 100}%`,
            top: `${(hovered.cy / height) * 100}%`,
          }}
        >
          <span className="st-paretoChart__tooltipLabel">{hovered.datum.label}</span>
          <span className="st-paretoChart__tooltipValue">
            {hovered.datum.value} · {formatTick(hovered.cumPercent)}%
          </span>
        </div>
      ) : null}
    </div>
  );
}
