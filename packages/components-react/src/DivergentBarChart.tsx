import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type DivergentBarChartTone = "positive" | "negative" | "neutral";

export type DivergentBarChartDatum = {
  label: string;
  value: number;
  tone?: DivergentBarChartTone;
};

export type DivergentBarChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: DivergentBarChartDatum[];
  width?: number;
  height?: number;
  domain?: [number, number];
  format?: (value: number) => string;
  showLegend?: boolean;
  label: string;
  className?: string;
};

const MARGIN = { top: 14, right: 16, bottom: 34, left: 88 } as const;

function signFor(value: number): "positive" | "negative" | "zero" {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "zero";
}

function toneFor(datum: DivergentBarChartDatum): DivergentBarChartTone {
  if (datum.tone) return datum.tone;
  if (datum.value > 0) return "positive";
  if (datum.value < 0) return "negative";
  return "neutral";
}

function resolveDomain(data: DivergentBarChartDatum[], domain?: [number, number]) {
  const plotDomain =
    domain && Number.isFinite(domain[0]) && Number.isFinite(domain[1]) && domain[0] < domain[1] && domain[0] <= 0 && domain[1] >= 0
      ? domain
      : null;

  if (plotDomain) {
    const ticks = niceTicks(plotDomain[0], plotDomain[1]).filter((tick) => tick >= plotDomain[0] && tick <= plotDomain[1]);
    return { domainMin: plotDomain[0], domainMax: plotDomain[1], ticks: ticks.length ? ticks : [0] };
  }

  const maxAbs = Math.max(1, ...data.map((d) => Math.abs(d.value)));
  const ticks = niceTicks(-maxAbs, maxAbs);
  return { domainMin: ticks[0], domainMax: ticks[ticks.length - 1], ticks };
}

export function DivergentBarChart({
  data,
  width = 480,
  height = 260,
  domain,
  format = formatTick,
  showLegend = true,
  label,
  className,
  ...rest
}: DivergentBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const validData = data.filter((d) => Number.isFinite(d.value));
  const { domainMin, domainMax, ticks } = resolveDomain(validData, domain);
  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
  const zeroAxisX = MARGIN.left + scaleLinear(0, domainMin, domainMax, 0, plotWidth);

  const bars =
    validData.length === 0
      ? []
      : validData.map((datum, index) => {
          const band = plotHeight / validData.length;
          const barHeight = Math.max(band * 0.56, 1);
          const valueX = MARGIN.left + scaleLinear(datum.value, domainMin, domainMax, 0, plotWidth);
          const x = Math.min(zeroAxisX, valueX);
          const barWidth = Math.max(Math.abs(valueX - zeroAxisX), 0.5);
          const y = MARGIN.top + band * index + (band - barHeight) / 2;
          return {
            datum,
            index,
            x,
            y,
            width: barWidth,
            height: barHeight,
            cx: datum.value === 0 ? zeroAxisX : x + barWidth / 2,
            cy: y + barHeight / 2,
            sign: signFor(datum.value),
            tone: toneFor(datum),
          };
        });

  const gridTicks = ticks.map((tick) => ({
    value: tick,
    x: MARGIN.left + scaleLinear(tick, domainMin, domainMax, 0, plotWidth),
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

  const hoveredBar = hoveredIndex !== null ? bars[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-divergentBarChart", className)}>
      <div
        className="st-divergentBarChart__visual"
        role="img"
        aria-label={label}
        onPointerMove={handleVisualPointerMove}
        onPointerLeave={() => setHoveredIndex(null)}
      >
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
          {gridTicks.map((tick) => (
            <React.Fragment key={tick.value}>
              <line className="st-divergentBarChart__grid" x1={tick.x} x2={tick.x} y1={MARGIN.top} y2={height - MARGIN.bottom} />
              <text className="st-divergentBarChart__tickLabel" x={tick.x} y={height - MARGIN.bottom + 16} textAnchor="middle">
                {formatTick(tick.value)}
              </text>
            </React.Fragment>
          ))}

          <line className="st-divergentBarChart__axis" x1={MARGIN.left} x2={width - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />
          <line className="st-divergentBarChart__zeroAxis" x1={zeroAxisX} x2={zeroAxisX} y1={MARGIN.top} y2={height - MARGIN.bottom} />

          {bars.map((bar) => (
            <React.Fragment key={bar.datum.label}>
              <text className="st-divergentBarChart__categoryLabel" x={MARGIN.left - 8} y={bar.cy} textAnchor="end" dominantBaseline="middle">
                {bar.datum.label}
              </text>
              <rect
                className={classNames(
                  "st-divergentBarChart__bar",
                  `st-divergentBarChart__bar--${bar.sign}`,
                  `st-divergentBarChart__bar--${bar.tone}`,
                )}
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                rx="2"
                data-chart-index={bar.index}
                data-chart-key={bar.datum.label}
              />
            </React.Fragment>
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={validData.map((d) => `${d.label}: ${format(d.value)}`)} />

      {hoveredBar ? (
        <div
          className="st-divergentBarChart__tooltip"
          role="presentation"
          style={{ left: `${(hoveredBar.cx / width) * 100}%`, top: `${(hoveredBar.cy / height) * 100}%` }}
        >
          <span className="st-divergentBarChart__tooltipLabel">{hoveredBar.datum.label}</span>
          <span className="st-divergentBarChart__tooltipValue">{format(hoveredBar.datum.value)}</span>
        </div>
      ) : null}

      {showLegend ? (
        <ul className="st-divergentBarChart__legend">
          <li className="st-divergentBarChart__legendItem">
            <span className="st-divergentBarChart__legendSwatch st-divergentBarChart__legendSwatch--positive" aria-hidden="true" />
            Positive
          </li>
          <li className="st-divergentBarChart__legendItem">
            <span className="st-divergentBarChart__legendSwatch st-divergentBarChart__legendSwatch--negative" aria-hidden="true" />
            Negative
          </li>
          <li className="st-divergentBarChart__legendItem">
            <span className="st-divergentBarChart__legendSwatch st-divergentBarChart__legendSwatch--neutral" aria-hidden="true" />
            Zero
          </li>
        </ul>
      ) : null}
    </div>
  );
}
