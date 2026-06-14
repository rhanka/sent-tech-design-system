import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type ContourChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ContourChartDatum = {
  x: number;
  y: number;
  /** Valeur scalaire de la cellule : pilote la bande de couleur. */
  value: number;
};

export type ContourChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: ContourChartDatum[];
  levels?: number;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  className?: string;
};

const MARGIN = { top: 16, right: 18, bottom: 36, left: 48 } as const;

const TONES: ContourChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

export function ContourChart({
  data,
  levels = 6,
  label,
  width = 640,
  height = 320,
  size,
  className,
  ...rest
}: ContourChartProps) {
  const [hoveredKey, setHoveredKey] = React.useState<string | null>(null);

  // Points valides : coordonnées finies, valeur finie.
  const validData = data.filter(
    (d) => d && Number.isFinite(d.x) && Number.isFinite(d.y) && Number.isFinite(d.value),
  );

  // Nombre de paliers effectif : entier ≥ 1, plafonné à 8 (les tons disponibles).
  const levelCount = Math.max(1, Math.min(TONES.length, Math.floor(Number.isFinite(levels) ? levels : 6)));

  const vals = validData.map((d) => d.value);
  const valueMin = vals.length ? Math.min(...vals) : 0;
  const valueMax = vals.length ? Math.max(...vals) : 0;

  // Palier (0..levelCount-1) puis ton catégoriel : valeur normalisée 0..1 → bande.
  function bandOf(value: number): { band: number; tone: ContourChartTone } {
    const ratio = valueMax > valueMin ? (value - valueMin) / (valueMax - valueMin) : 0;
    const band = Math.max(0, Math.min(levelCount - 1, Math.floor(ratio * levelCount)));
    const toneIndex = Math.max(
      0,
      Math.min(TONES.length - 1, Math.floor((band / Math.max(levelCount - 1, 1)) * (TONES.length - 1))),
    );
    return { band, tone: TONES[toneIndex] };
  }

  const xs = validData.map((d) => d.x);
  const ys = validData.map((d) => d.y);
  const xValues = Array.from(new Set(xs)).sort((a, b) => a - b);
  const yValues = Array.from(new Set(ys)).sort((a, b) => a - b);
  const xTicks = niceTicks(Math.min(...xs), Math.max(...xs));
  const yTicks = niceTicks(Math.min(...ys), Math.max(...ys));
  const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotH = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
  const xMin = xTicks[0];
  const xMax = xTicks[xTicks.length - 1];
  const yMin = yTicks[0];
  const yMax = yTicks[yTicks.length - 1];

  // Largeur/hauteur d'une cellule en espace data (grille régulière), avec repli.
  const dx = xValues.length > 1 ? xValues[1] - xValues[0] : 1;
  const dy = yValues.length > 1 ? yValues[1] - yValues[0] : 1;

  // Une bande rectangulaire par cellule de grille, peinte selon sa value.
  const cells = validData.map((d, i) => {
    const left = MARGIN.left + scaleLinear(d.x - dx / 2, xMin, xMax, 0, plotW);
    const right = MARGIN.left + scaleLinear(d.x + dx / 2, xMin, xMax, 0, plotW);
    const top = MARGIN.top + scaleLinear(d.y + dy / 2, yMin, yMax, plotH, 0);
    const bottom = MARGIN.top + scaleLinear(d.y - dy / 2, yMin, yMax, plotH, 0);
    const { tone } = bandOf(d.value);
    return {
      key: `${i}`,
      datum: d,
      x: Math.min(left, right),
      y: Math.min(top, bottom),
      width: Math.abs(right - left),
      height: Math.abs(bottom - top),
      cx: (left + right) / 2,
      cy: (top + bottom) / 2,
      tone,
    };
  });

  const dataValueItems = validData.map((d) => `x ${d.x}, y ${d.y} · ${formatTick(d.value)}`);

  const legendItems = Array.from({ length: levelCount }, (_, band) => {
    const toneIndex = Math.max(
      0,
      Math.min(TONES.length - 1, Math.floor((band / Math.max(levelCount - 1, 1)) * (TONES.length - 1))),
    );
    return { band, tone: TONES[toneIndex] };
  });
  const hasLegend = validData.length > 0;

  function handlePointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredKey(null);
      return;
    }
    setHoveredKey(target.getAttribute("data-chart-key"));
  }

  const hoveredCell = hoveredKey === null ? null : cells.find((c) => c.key === hoveredKey) ?? null;

  return (
    <div {...rest} className={classNames("st-contourChart", className)}>
      <div
        className="st-contourChart__visual"
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
          {cells.map((cell) => (
            <rect
              key={cell.key}
              className={classNames(
                "st-contourChart__cell",
                `st-contourChart__cell--${cell.tone}`,
                hoveredKey !== null && hoveredKey !== cell.key ? "st-contourChart__cell--dim" : undefined,
              )}
              x={cell.x}
              y={cell.y}
              width={cell.width}
              height={cell.height}
              data-chart-key={cell.key}
            />
          ))}

          {yTicks.map((t) => {
            const y = MARGIN.top + scaleLinear(t, yMin, yMax, plotH, 0);
            return (
              <React.Fragment key={`y${t}`}>
                <line className="st-contourChart__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={y} y2={y} />
                <text className="st-contourChart__tick" x={MARGIN.left - 6} y={y} textAnchor="end" dominantBaseline="middle">
                  {formatTick(t)}
                </text>
              </React.Fragment>
            );
          })}
          {xTicks.map((t) => {
            const x = MARGIN.left + scaleLinear(t, xMin, xMax, 0, plotW);
            return (
              <text key={`x${t}`} className="st-contourChart__tick" x={x} y={height - MARGIN.bottom + 16} textAnchor="middle">
                {formatTick(t)}
              </text>
            );
          })}

          <line className="st-contourChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
          <line
            className="st-contourChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />
        </svg>
      </div>

      {hasLegend ? (
        <div className="st-contourChart__legend" aria-hidden="true">
          <span className="st-contourChart__legendText">Low</span>
          <span className="st-contourChart__legendRamp">
            {legendItems.map((item) => (
              <span
                key={item.band}
                className={classNames("st-contourChart__legendSwatch", `st-contourChart__legendSwatch--${item.tone}`)}
              />
            ))}
          </span>
          <span className="st-contourChart__legendText">High</span>
        </div>
      ) : null}

      <ChartDataList label={label ?? "contour"} items={dataValueItems} />

      {hoveredCell ? (
        <div
          className="st-contourChart__tooltip"
          role="presentation"
          style={{ left: `${(hoveredCell.cx / width) * 100}%`, top: `${(hoveredCell.cy / height) * 100}%` }}
        >
          <span className="st-contourChart__tooltipLabel">
            x {hoveredCell.datum.x} · y {hoveredCell.datum.y}
          </span>
          <span className="st-contourChart__tooltipValue">{formatTick(hoveredCell.datum.value)}</span>
        </div>
      ) : null}
    </div>
  );
}
