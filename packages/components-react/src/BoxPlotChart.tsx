import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";

export type BoxPlotChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type BoxPlotChartDatum = {
  label: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers?: number[];
  tone?: BoxPlotChartTone;
};

export type BoxPlotChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: BoxPlotChartDatum[];
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

const MARGIN = { top: 16, right: 20, bottom: 38, left: 48 } as const;
const TONES: BoxPlotChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.?0+$/, "");
}

function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number): number {
  if (d1 === d0) return r0;
  return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
}

export function BoxPlotChart({ data, width = 480, height = 260, label, className, ...rest }: BoxPlotChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  const allValues = data
    .flatMap((datum) => [datum.min, datum.q1, datum.median, datum.q3, datum.max, ...(datum.outliers ?? [])])
    .filter(Number.isFinite);
  const domainRaw = allValues.length === 0 ? { min: 0, max: 1 } : { min: Math.min(...allValues), max: Math.max(...allValues) };
  const pad = (domainRaw.max - domainRaw.min) * 0.08 || Math.max(Math.abs(domainRaw.max), 1) * 0.1;
  const domain = { min: domainRaw.min - pad, max: domainRaw.max + pad };

  const band = data.length > 0 ? plotWidth / data.length : plotWidth;
  const boxWidth = Math.min(54, Math.max(18, band * 0.44));

  const plots = data.map((datum, index) => {
    const cx = MARGIN.left + band * (index + 0.5);
    const y = (value: number) => MARGIN.top + scaleLinear(value, domain.min, domain.max, plotHeight, 0);
    const q1Y = y(datum.q1);
    const q3Y = y(datum.q3);
    return {
      datum,
      tone: datum.tone ?? TONES[index % TONES.length],
      cx,
      boxX: cx - boxWidth / 2,
      boxY: Math.min(q1Y, q3Y),
      boxWidth,
      boxHeight: Math.max(Math.abs(q1Y - q3Y), 1),
      medianY: y(datum.median),
      minY: y(datum.min),
      maxY: y(datum.max),
      capWidth: boxWidth * 0.72,
      outliers: (datum.outliers ?? []).filter(Number.isFinite).map((value) => ({ value, y: y(value) })),
    };
  });

  const dataValueItems = data.map((datum) => {
    const summary = `${datum.label}: min ${formatNumber(datum.min)}, q1 ${formatNumber(datum.q1)}, median ${formatNumber(datum.median)}, q3 ${formatNumber(datum.q3)}, max ${formatNumber(datum.max)}`;
    const outliersStr = datum.outliers?.length ? `, outliers ${datum.outliers.map(formatNumber).join(", ")}` : "";
    return `${summary}${outliersStr}`;
  });

  function handleVisualPointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredIndex(null);
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    setHoveredIndex(Number.isInteger(index) ? index : null);
  }

  const hoveredPlot = hoveredIndex !== null ? plots[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-boxPlotChart", className)}>
      <div
        className="st-boxPlotChart__visual"
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
          <line className="st-boxPlotChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
          <line className="st-boxPlotChart__axis" x1={MARGIN.left} x2={width - MARGIN.right} y1={height - MARGIN.bottom} y2={height - MARGIN.bottom} />

          {plots.map((plot, i) => (
            <React.Fragment key={plot.datum.label}>
              <line className="st-boxPlotChart__whisker" x1={plot.cx} x2={plot.cx} y1={plot.minY} y2={plot.maxY} data-chart-index={i} />
              <line className="st-boxPlotChart__whiskerCap" x1={plot.cx - plot.capWidth / 2} x2={plot.cx + plot.capWidth / 2} y1={plot.minY} y2={plot.minY} data-chart-index={i} />
              <line className="st-boxPlotChart__whiskerCap" x1={plot.cx - plot.capWidth / 2} x2={plot.cx + plot.capWidth / 2} y1={plot.maxY} y2={plot.maxY} data-chart-index={i} />
              <rect
                className={classNames(
                  "st-boxPlotChart__box",
                  `st-boxPlotChart__box--${plot.tone}`,
                  hoveredIndex !== null && hoveredIndex !== i ? "st-boxPlotChart__box--dim" : undefined,
                )}
                x={plot.boxX}
                y={plot.boxY}
                width={plot.boxWidth}
                height={plot.boxHeight}
                data-chart-index={i}
              />
              <line className="st-boxPlotChart__median" x1={plot.boxX} x2={plot.boxX + plot.boxWidth} y1={plot.medianY} y2={plot.medianY} data-chart-index={i} />
              {plot.outliers.map((outlier) => (
                <circle
                  key={`${plot.datum.label}-${outlier.value}`}
                  className="st-boxPlotChart__outlier"
                  cx={plot.cx}
                  cy={outlier.y}
                  r="3"
                  data-chart-index={i}
                />
              ))}
              <text className="st-boxPlotChart__label" x={plot.cx} y={height - MARGIN.bottom + 16} textAnchor="middle">
                {plot.datum.label}
              </text>
            </React.Fragment>
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hoveredPlot ? (
        <div
          className="st-boxPlotChart__tooltip"
          role="presentation"
          style={{ left: `${(hoveredPlot.cx / width) * 100}%`, top: `${(hoveredPlot.medianY / height) * 100}%` }}
        >
          <span className="st-boxPlotChart__tooltipLabel">{hoveredPlot.datum.label}</span>
          <span className="st-boxPlotChart__tooltipValue">Median {formatNumber(hoveredPlot.datum.median)}</span>
        </div>
      ) : null}
    </div>
  );
}
