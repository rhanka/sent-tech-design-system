import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type VectorFieldChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type VectorFieldChartDatum = {
  x: number;
  y: number;
  /** Magnitude (≥ 0) : pilote la longueur normalisée et la couleur. */
  length: number;
  /** Direction en DEGRÉS (0° = +X, sens trigonométrique). */
  direction: number;
};

export type VectorFieldChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: VectorFieldChartDatum[];
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  className?: string;
};

const MARGIN = { top: 16, right: 18, bottom: 36, left: 48 } as const;

const TONES: VectorFieldChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

export function VectorFieldChart({
  data,
  label,
  width = 640,
  height = 320,
  size = 26,
  className,
  ...rest
}: VectorFieldChartProps) {
  const [hoveredKey, setHoveredKey] = React.useState<string | null>(null);

  // Points valides : coordonnées finies, magnitude finie ≥ 0.
  const validData = data.filter(
    (d) =>
      d &&
      Number.isFinite(d.x) &&
      Number.isFinite(d.y) &&
      Number.isFinite(d.length) &&
      d.length >= 0 &&
      Number.isFinite(d.direction),
  );

  const xs = validData.map((d) => d.x);
  const ys = validData.map((d) => d.y);
  const xTicks = niceTicks(Math.min(...xs), Math.max(...xs));
  const yTicks = niceTicks(Math.min(...ys), Math.max(...ys));
  const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotH = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
  const xMin = xTicks[0];
  const xMax = xTicks[xTicks.length - 1];
  const yMin = yTicks[0];
  const yMax = yTicks[yTicks.length - 1];

  const maxLength = validData.reduce((max, d) => (d.length > max ? d.length : max), 0);

  // Une flèche par point : segment (base → pointe) + 2 traits de pointe.
  const arrows = validData.map((d, i) => {
    const cx = MARGIN.left + scaleLinear(d.x, xMin, xMax, 0, plotW);
    const cy = MARGIN.top + scaleLinear(d.y, yMin, yMax, plotH, 0);
    const max = maxLength > 0 ? maxLength : 1;
    // Longueur normalisée (la plus grande magnitude = `size`).
    const len = (d.length / max) * size;
    // Direction trigonométrique : +X à droite, +Y vers le haut (-sin en écran).
    const rad = (d.direction * Math.PI) / 180;
    const dx = Math.cos(rad) * len;
    const dy = -Math.sin(rad) * len;
    const x1 = cx - dx / 2;
    const y1 = cy - dy / 2;
    const x2 = cx + dx / 2;
    const y2 = cy + dy / 2;
    const head = Math.min(Math.max(len * 0.28, 3), 8);
    const headAngle = (28 * Math.PI) / 180;
    const baseAngle = Math.atan2(y2 - y1, x2 - x1);
    const hx1 = x2 - head * Math.cos(baseAngle - headAngle);
    const hy1 = y2 - head * Math.sin(baseAngle - headAngle);
    const hx2 = x2 - head * Math.cos(baseAngle + headAngle);
    const hy2 = y2 - head * Math.sin(baseAngle + headAngle);
    const bin = Math.min(Math.floor((d.length / max) * TONES.length), TONES.length - 1);
    return {
      key: `${i}`,
      datum: d,
      cx,
      cy,
      x1,
      y1,
      x2,
      y2,
      hx1,
      hy1,
      hx2,
      hy2,
      tone: TONES[Math.max(0, bin)],
    };
  });

  const dataValueItems = validData.map(
    (d) => `x ${d.x}, y ${d.y} · |v| ${formatTick(d.length)} @ ${formatTick(d.direction)}°`,
  );

  function handlePointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredKey(null);
      return;
    }
    setHoveredKey(target.getAttribute("data-chart-key"));
  }

  const hoveredArrow = hoveredKey === null ? null : arrows.find((a) => a.key === hoveredKey) ?? null;

  return (
    <div {...rest} className={classNames("st-vectorFieldChart", className)}>
      <div
        className="st-vectorFieldChart__visual"
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
          {yTicks.map((t) => {
            const y = MARGIN.top + scaleLinear(t, yMin, yMax, plotH, 0);
            return (
              <React.Fragment key={`y${t}`}>
                <line className="st-vectorFieldChart__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={y} y2={y} />
                <text className="st-vectorFieldChart__tick" x={MARGIN.left - 6} y={y} textAnchor="end" dominantBaseline="middle">
                  {formatTick(t)}
                </text>
              </React.Fragment>
            );
          })}
          {xTicks.map((t) => {
            const x = MARGIN.left + scaleLinear(t, xMin, xMax, 0, plotW);
            return (
              <text key={`x${t}`} className="st-vectorFieldChart__tick" x={x} y={height - MARGIN.bottom + 16} textAnchor="middle">
                {formatTick(t)}
              </text>
            );
          })}

          <line className="st-vectorFieldChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
          <line
            className="st-vectorFieldChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {arrows.map((a) => (
            <g
              key={a.key}
              className={classNames(
                "st-vectorFieldChart__arrow",
                `st-vectorFieldChart__arrow--${a.tone}`,
                hoveredKey !== null && hoveredKey !== a.key ? "st-vectorFieldChart__arrow--dim" : undefined,
              )}
            >
              <line className="st-vectorFieldChart__shaft" x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} data-chart-key={a.key} />
              <line className="st-vectorFieldChart__head" x1={a.x2} y1={a.y2} x2={a.hx1} y2={a.hy1} />
              <line className="st-vectorFieldChart__head" x1={a.x2} y1={a.y2} x2={a.hx2} y2={a.hy2} />
            </g>
          ))}
        </svg>
      </div>

      <ChartDataList label={label ?? "vector field"} items={dataValueItems} />

      {hoveredArrow ? (
        <div
          className="st-vectorFieldChart__tooltip"
          role="presentation"
          style={{ left: `${(hoveredArrow.cx / width) * 100}%`, top: `${(hoveredArrow.cy / height) * 100}%` }}
        >
          <span className="st-vectorFieldChart__tooltipLabel">
            x {hoveredArrow.datum.x} · y {hoveredArrow.datum.y}
          </span>
          <span className="st-vectorFieldChart__tooltipValue">
            |v| {formatTick(hoveredArrow.datum.length)} @ {formatTick(hoveredArrow.datum.direction)}°
          </span>
        </div>
      ) : null}
    </div>
  );
}
