import type { HTMLAttributes } from "preact";
import { Fragment } from "preact";
import { useState } from "preact/hooks";
import { classNames } from "./classNames.js";
import { ChartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";
// Side-effect: installs the options.vnode SVG presentation-attribute
// normalisation in runtime.ts. This module renders intrinsic camelCase SVG
// attributes but otherwise references runtime only via `import type`, which
// TypeScript erases — without this import a bundler applying `sideEffects`
// barrel optimisation (or a direct deep import) would never evaluate
// runtime.js and attributes such as dominantBaseline would revert to broken
// camelCase attributes.
import "./runtime.js";
import type { TargetedPointerEvent } from "./runtime.js";
import type { MaybeSignal } from "./signals.js";

export type PolygonChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type PolygonChartPoint = {
  x: number;
  y: number;
};

export type PolygonChartProps = Omit<HTMLAttributes<HTMLDivElement>, "className"> & {
  data: PolygonChartPoint[];
  label: string;
  tone?: PolygonChartTone;
  width?: number;
  height?: number;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

const MARGIN = { top: 14, right: 18, bottom: 36, left: 48 } as const;

export function PolygonChart({
  data,
  label,
  tone = "category1",
  width = 480,
  height = 360,
  className,
  ...rest
}: PolygonChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Non-finite coordinates are dropped before anything else.
  const validData = (data ?? []).filter((d) => Number.isFinite(d.x) && Number.isFinite(d.y));

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

  const points = validData.map((d) => ({
    cx: MARGIN.left + scaleLinear(d.x, xMin, xMax, 0, plotW),
    cy: MARGIN.top + scaleLinear(d.y, yMin, yMax, plotH, 0),
    datum: d,
  }));

  const polygonPoints = points.map((p) => `${p.cx},${p.cy}`).join(" ");

  const dataValueItems = validData.map((d) => `x ${d.x}, y ${d.y}`);

  function handleLeave() {
    setHoveredIndex(null);
  }
  function handleVisualPointerMove(event: TargetedPointerEvent<HTMLDivElement>) {
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
    <div {...rest} className={classNames("st-polygonChart", className)}>
      <div
        className="st-polygonChart__visual"
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
              <Fragment key={`y${t}`}>
                <line className="st-polygonChart__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={y} y2={y} />
                <text className="st-polygonChart__tick" x={MARGIN.left - 6} y={y} textAnchor="end" dominantBaseline="middle">
                  {formatTick(t)}
                </text>
              </Fragment>
            );
          })}
          {xTicks.map((t) => {
            const x = MARGIN.left + scaleLinear(t, xMin, xMax, 0, plotW);
            return (
              <text
                key={`x${t}`}
                className="st-polygonChart__tick"
                x={x}
                y={height - MARGIN.bottom + 16}
                textAnchor="middle"
              >
                {formatTick(t)}
              </text>
            );
          })}

          <line className="st-polygonChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
          <line
            className="st-polygonChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {points.length >= 2 ? (
            <polygon
              className={classNames("st-polygonChart__polygon", `st-polygonChart__polygon--${tone}`)}
              points={polygonPoints}
            />
          ) : null}

          {points.map((p, i) => (
            <circle
              key={i}
              className={classNames("st-polygonChart__vertex", `st-polygonChart__vertex--${tone}`)}
              cx={p.cx}
              cy={p.cy}
              r={3.5}
              data-chart-index={i}
            />
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hovered ? (
        <div
          className="st-polygonChart__tooltip"
          role="presentation"
          style={{ left: `${(hovered.cx / width) * 100}%`, top: `${(hovered.cy / height) * 100}%` }}
        >
          <span className="st-polygonChart__tooltipValue">
            x {hovered.datum.x} · y {hovered.datum.y}
          </span>
        </div>
      ) : null}
    </div>
  );
}
