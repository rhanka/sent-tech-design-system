import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type ColumnPyramidChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ColumnPyramidChartDatum = {
  category: string;
  value: number;
  tone?: ColumnPyramidChartTone;
};

export type ColumnPyramidChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: ColumnPyramidChartDatum[];
  width?: number;
  height?: number;
  label: string;
  /** Default tone for columns whose datum has no `tone`. */
  tone?: ColumnPyramidChartTone;
  className?: string;
};

const MARGIN = { top: 24, right: 16, bottom: 32, left: 44 };

export function ColumnPyramidChart({
  data = [],
  width = 480,
  height = 280,
  label,
  tone = "category1",
  className,
  ...rest
}: ColumnPyramidChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  // Valid data: finite, strictly-positive value (a triangle sitting on the X
  // axis is only meaningful for a value > 0).
  const validData = data.filter((d) => Number.isFinite(d.value) && d.value > 0);

  const values = validData.map((d) => d.value);
  const minRaw = 0;
  const maxRaw = Math.max(0, ...values);
  const ticks = niceTicks(minRaw, maxRaw, 5);
  const domainMin = ticks[0];
  const domainMax = ticks[ticks.length - 1];
  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  const columns = React.useMemo(() => {
    if (validData.length === 0) return [];
    const band = plotWidth / validData.length;
    const baseWidth = band * 0.7;
    const zeroY = MARGIN.top + scaleLinear(0, domainMin, domainMax, plotHeight, 0);
    return validData.map((d, i) => {
      const apexY = MARGIN.top + scaleLinear(d.value, domainMin, domainMax, plotHeight, 0);
      const cx = MARGIN.left + band * (i + 0.5);
      const leftX = cx - baseWidth / 2;
      const rightX = cx + baseWidth / 2;
      // Triangle: wide base on the X axis, apex centred at the value height.
      const points = `${leftX},${zeroY} ${rightX},${zeroY} ${cx},${apexY}`;
      return {
        datum: d,
        tone: (d.tone ?? tone) as ColumnPyramidChartTone,
        points,
        cx,
        cy: apexY,
        labelX: cx,
        labelY: height - MARGIN.bottom + 16,
      };
    });
  }, [validData, plotWidth, plotHeight, domainMin, domainMax, height, tone]);

  const dataValueItems = validData.map((d) => `${d.category}: ${d.value}`);

  const valueAxisTicks = ticks.map((tick) => ({
    value: tick,
    x1: MARGIN.left,
    x2: MARGIN.left + plotWidth,
    y: MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0),
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

  const hovered = hoveredIndex !== null ? columns[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-columnPyramidChart", className)}>
      <div
        className="st-columnPyramidChart__visual"
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
          {valueAxisTicks.map((tick) => (
            <React.Fragment key={tick.value}>
              <line className="st-columnPyramidChart__grid" x1={tick.x1} x2={tick.x2} y1={tick.y} y2={tick.y} />
              <text
                className="st-columnPyramidChart__tickLabel"
                x={MARGIN.left - 6}
                y={tick.y}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {formatTick(tick.value)}
              </text>
            </React.Fragment>
          ))}

          {/* axes */}
          <line
            className="st-columnPyramidChart__axis"
            x1={MARGIN.left}
            x2={MARGIN.left}
            y1={MARGIN.top}
            y2={height - MARGIN.bottom}
          />
          <line
            className="st-columnPyramidChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {/* category labels */}
          {columns.map((col) => (
            <text
              key={`cat-${col.datum.category}`}
              className="st-columnPyramidChart__categoryLabel"
              x={col.labelX}
              y={col.labelY}
              textAnchor="middle"
            >
              {col.datum.category}
            </text>
          ))}

          {/* pyramid columns (decorative, inside aria-hidden SVG) */}
          {columns.map((col, i) => (
            <polygon
              key={`col-${col.datum.category}`}
              className={`st-columnPyramidChart__column st-columnPyramidChart__column--${col.tone}`}
              points={col.points}
              data-chart-index={i}
            />
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hovered ? (
        <div
          className="st-columnPyramidChart__tooltip"
          role="presentation"
          style={{
            left: `${(hovered.cx / width) * 100}%`,
            top: `${(hovered.cy / height) * 100}%`,
          }}
        >
          <span className="st-columnPyramidChart__tooltipLabel">{hovered.datum.category}</span>
          <span className="st-columnPyramidChart__tooltipValue">{hovered.datum.value}</span>
        </div>
      ) : null}
    </div>
  );
}
