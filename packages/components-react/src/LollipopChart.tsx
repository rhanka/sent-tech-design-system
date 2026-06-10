import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";
import { contrastTextForTone } from "./chartContrast.js";

export type LollipopChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type LollipopChartDatum = {
  label: string;
  value: number;
  tone?: LollipopChartTone;
};

export type LollipopChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: LollipopChartDatum[];
  width?: number;
  height?: number;
  orientation?: "vertical" | "horizontal";
  label: string;
  /**
   * Fixed value-axis domain `[min, max]`. When provided (and finite), the value
   * scale uses it instead of the data-derived min/max — letting several
   * LollipopCharts in a grid share one scale. When absent or invalid, the scale
   * falls back to the auto data range (unchanged).
   */
  domain?: [number, number];
  className?: string;
};

const MARGIN = { top: 24, right: 16, bottom: 32, left: 44 };
const DOT_RADIUS = 5;

export function LollipopChart({
  data = [],
  width = 480,
  height = 240,
  orientation = "vertical",
  label,
  domain,
  className,
  ...rest
}: LollipopChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  // Valid data: finite value.
  const validData = data.filter((d) => Number.isFinite(d.value));

  // A domain is honoured only when finite and ordered (min < max).
  const validDomain: [number, number] | null = (() => {
    if (!domain) return null;
    const [d0, d1] = domain;
    if (!Number.isFinite(d0) || !Number.isFinite(d1) || d0 >= d1) return null;
    return [d0, d1];
  })();

  const values = validData.map((d) => d.value);
  const minRaw = validDomain ? validDomain[0] : Math.min(0, ...values);
  const maxRaw = validDomain ? validDomain[1] : Math.max(0, ...values);
  const ticks = niceTicks(minRaw, maxRaw, 5);
  const domainMin = ticks[0];
  const domainMax = ticks[ticks.length - 1];
  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  const lollipops = React.useMemo(() => {
    if (validData.length === 0) return [];
    if (orientation === "vertical") {
      const band = plotWidth / validData.length;
      const zeroY = scaleLinear(0, domainMin, domainMax, plotHeight, 0);
      return validData.map((d, i) => {
        const valueY = scaleLinear(d.value, domainMin, domainMax, plotHeight, 0);
        const cx = MARGIN.left + band * (i + 0.5);
        return {
          datum: d,
          tone: (d.tone ?? "category1") as LollipopChartTone,
          stemX1: cx,
          stemY1: MARGIN.top + zeroY,
          stemX2: cx,
          stemY2: MARGIN.top + valueY,
          cx,
          cy: MARGIN.top + valueY,
          labelX: cx,
          labelY: height - MARGIN.bottom + 16,
        };
      });
    }
    // horizontal
    const band = plotHeight / validData.length;
    const zeroX = scaleLinear(0, domainMin, domainMax, 0, plotWidth);
    return validData.map((d, i) => {
      const valueX = scaleLinear(d.value, domainMin, domainMax, 0, plotWidth);
      const cy = MARGIN.top + band * (i + 0.5);
      return {
        datum: d,
        tone: (d.tone ?? "category1") as LollipopChartTone,
        stemX1: MARGIN.left + zeroX,
        stemY1: cy,
        stemX2: MARGIN.left + valueX,
        stemY2: cy,
        cx: MARGIN.left + valueX,
        cy,
        labelX: MARGIN.left - 6,
        labelY: cy,
      };
    });
  }, [validData, orientation, plotWidth, plotHeight, domainMin, domainMax, height]);

  const dataValueItems = validData.map((d) => `${d.label}: ${d.value}`);

  const valueAxisTicks = ticks.map((tick) => {
    if (orientation === "vertical") {
      return {
        value: tick,
        x1: MARGIN.left,
        x2: MARGIN.left + plotWidth,
        y: MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0),
        x: undefined as number | undefined,
        y1: undefined as number | undefined,
        y2: undefined as number | undefined,
      };
    }
    return {
      value: tick,
      x: MARGIN.left + scaleLinear(tick, domainMin, domainMax, 0, plotWidth),
      y1: MARGIN.top,
      y2: MARGIN.top + plotHeight,
      x1: undefined as number | undefined,
      x2: undefined as number | undefined,
      y: undefined as number | undefined,
    };
  });

  function handlePointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredIndex(null);
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    setHoveredIndex(Number.isInteger(index) ? index : null);
  }

  const hovered = hoveredIndex !== null ? lollipops[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-lollipopChart", className)}>
      <div
        className="st-lollipopChart__visual"
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
          {/* gridlines + value axis ticks */}
          {valueAxisTicks.map((tick) =>
            orientation === "vertical" ? (
              <React.Fragment key={tick.value}>
                <line className="st-lollipopChart__grid" x1={tick.x1} x2={tick.x2} y1={tick.y} y2={tick.y} />
                <text
                  className="st-lollipopChart__tickLabel"
                  x={MARGIN.left - 6}
                  y={tick.y}
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {formatTick(tick.value)}
                </text>
              </React.Fragment>
            ) : (
              <React.Fragment key={tick.value}>
                <line className="st-lollipopChart__grid" x1={tick.x} x2={tick.x} y1={tick.y1} y2={tick.y2} />
                <text
                  className="st-lollipopChart__tickLabel"
                  x={tick.x}
                  y={height - MARGIN.bottom + 16}
                  textAnchor="middle"
                >
                  {formatTick(tick.value)}
                </text>
              </React.Fragment>
            )
          )}

          {/* axes */}
          <line
            className="st-lollipopChart__axis"
            x1={MARGIN.left}
            x2={MARGIN.left}
            y1={MARGIN.top}
            y2={height - MARGIN.bottom}
          />
          <line
            className="st-lollipopChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {/* category labels */}
          {lollipops.map((pop) =>
            orientation === "vertical" ? (
              <text
                key={`cat-${pop.datum.label}`}
                className="st-lollipopChart__categoryLabel"
                x={pop.labelX}
                y={pop.labelY}
                textAnchor="middle"
              >
                {pop.datum.label}
              </text>
            ) : (
              <text
                key={`cat-${pop.datum.label}`}
                className="st-lollipopChart__categoryLabel"
                x={pop.labelX}
                y={pop.labelY}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {pop.datum.label}
              </text>
            )
          )}

          {/* stems + dots + value labels */}
          {lollipops.map((pop, i) => (
            <React.Fragment key={`pop-${pop.datum.label}`}>
              <line
                className="st-lollipopChart__stem"
                x1={pop.stemX1}
                y1={pop.stemY1}
                x2={pop.stemX2}
                y2={pop.stemY2}
              />
              <circle
                className={`st-lollipopChart__dot st-lollipopChart__dot--${pop.tone}`}
                cx={pop.cx}
                cy={pop.cy}
                r={DOT_RADIUS}
                data-chart-index={i}
              />
              <text
                className="st-lollipopChart__valueLabel"
                x={pop.cx}
                y={orientation === "vertical" ? pop.cy - DOT_RADIUS - 4 : pop.cy}
                dx={orientation === "vertical" ? 0 : DOT_RADIUS + 4}
                textAnchor={orientation === "vertical" ? "middle" : "start"}
                dominantBaseline={orientation === "vertical" ? "auto" : "middle"}
                style={{ fill: contrastTextForTone(pop.tone) }}
              >
                {formatTick(pop.datum.value)}
              </text>
            </React.Fragment>
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hovered ? (
        <div
          className="st-lollipopChart__tooltip"
          role="presentation"
          style={{
            left: `${(hovered.cx / width) * 100}%`,
            top: `${(hovered.cy / height) * 100}%`,
          }}
        >
          <span className="st-lollipopChart__tooltipLabel">{hovered.datum.label}</span>
          <span className="st-lollipopChart__tooltipValue">{hovered.datum.value}</span>
        </div>
      ) : null}
    </div>
  );
}
