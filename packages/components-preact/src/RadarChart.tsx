import type { HTMLAttributes } from "preact";
import { Fragment } from "preact";
import { useState } from "preact/hooks";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";
// Side-effect: installs the options.vnode SVG presentation-attribute
// normalisation in runtime.ts. This module renders intrinsic camelCase SVG
// attributes but otherwise references runtime only via `import type`, which
// TypeScript erases — without this import a bundler applying `sideEffects`
// barrel optimisation (or a direct deep import) would never evaluate
// runtime.js and attributes such as dominantBaseline would revert to broken
// camelCase attributes.
import "./runtime.js";
import type { TargetedPointerEvent } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type RadarChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type RadarChartSeries = {
  label: string;
  values: number[];
  tone?: RadarChartTone;
};

export type RadarChartProps = Omit<HTMLAttributes<HTMLDivElement>, "className"> & {
  axes: string[];
  series: RadarChartSeries[];
  /** Valeur plafond du domaine. PAS de plancher arbitraire à 100 - s'adapte aux données. */
  maxValue?: number;
  levels?: number;
  /** Plain value, or a signal in the Preact build (read at the edge). */
  legend?: MaybeSignal<boolean>;
  width?: number;
  height?: number;
  label: string;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

const TONES: RadarChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

function polarPoint(cx: number, cy: number, radius: number, angle: number): { x: number; y: number } {
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
}

export function RadarChart({
  axes,
  series,
  maxValue,
  levels = 4,
  legend: legendInput = false,
  width = 360,
  height = 320,
  label,
  className,
  ...rest
}: RadarChartProps) {
  const legend = useValue(legendInput);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.max(Math.min(width, height) / 2 - 42, 1);
  const levelCount = Math.max(1, Math.floor(levels));

  // Pas de plancher Math.max(100, …) - l'échelle s'adapte aux données
  const allValues = series.flatMap((s) => s.values).filter(Number.isFinite);
  const domainMax = Number.isFinite(maxValue) && (maxValue ?? 0) > 0 ? (maxValue as number) : Math.max(1, ...allValues);

  const angles = axes.map((_, index) => -Math.PI / 2 + (Math.PI * 2 * index) / Math.max(axes.length, 1));

  const rings = Array.from({ length: levelCount }, (_, index) => {
    const ringRadius = (radius * (index + 1)) / levelCount;
    return angles.map((angle) => polarPoint(cx, cy, ringRadius, angle)).map((p) => `${p.x},${p.y}`).join(" ");
  });

  const polygons = series.map((entry, seriesIndex) => {
    const tone = entry.tone ?? TONES[seriesIndex % TONES.length];
    const points = axes.map((_, axisIndex) => {
      const value = Math.max(0, entry.values[axisIndex] ?? 0);
      const scaled = Math.min(value / domainMax, 1) * radius;
      return polarPoint(cx, cy, scaled, angles[axisIndex]);
    });
    return {
      entry,
      tone,
      points,
      pointString: points.map((p) => `${p.x},${p.y}`).join(" "),
    };
  });

  const dataValueItems = series.flatMap((entry) =>
    axes.map((axis, axisIndex) => `${entry.label}, ${axis}: ${entry.values[axisIndex] ?? 0}`),
  );

  function handleVisualPointerMove(event: TargetedPointerEvent<HTMLDivElement>) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredIndex(null);
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    setHoveredIndex(Number.isInteger(index) ? index : null);
  }

  const hoveredPolygon = hoveredIndex !== null ? polygons[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-radarChart", className)}>
      <div
        className="st-radarChart__visual"
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
          {rings.map((ring, i) => (
            <polygon key={i} className="st-radarChart__ring" points={ring} />
          ))}

          {axes.map((axis, index) => {
            const end = polarPoint(cx, cy, radius, angles[index]);
            const labelPoint = polarPoint(cx, cy, radius + 22, angles[index]);
            return (
              <Fragment key={axis}>
                <line className="st-radarChart__axis" x1={cx} y1={cy} x2={end.x} y2={end.y} />
                <text
                  className="st-radarChart__axisLabel"
                  x={labelPoint.x}
                  y={labelPoint.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {axis}
                </text>
              </Fragment>
            );
          })}

          {polygons.map((polygon, i) => (
            <Fragment key={polygon.entry.label}>
              <polygon
                className={classNames(
                  "st-radarChart__polygon",
                  `st-radarChart__polygon--${polygon.tone}`,
                  hoveredIndex !== null && hoveredIndex !== i ? "st-radarChart__polygon--dim" : undefined,
                )}
                points={polygon.pointString}
                data-chart-index={i}
              />
              {polygon.points.map((point, pointIndex) => (
                <circle
                  key={`${polygon.entry.label}-${pointIndex}`}
                  className={classNames("st-radarChart__point", `st-radarChart__point--${polygon.tone}`)}
                  cx={point.x}
                  cy={point.y}
                  r="3"
                  data-chart-index={i}
                />
              ))}
            </Fragment>
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hoveredPolygon ? (
        <div className="st-radarChart__tooltip" role="presentation">
          <span className="st-radarChart__tooltipLabel">{hoveredPolygon.entry.label}</span>
        </div>
      ) : null}

      {legend && series.length > 0 ? (
        <ul className="st-radarChart__legend" aria-hidden="true">
          {series.map((item, index) => {
            const tone = item.tone ?? TONES[index % TONES.length];
            return (
              <li key={item.label} className="st-radarChart__legendItem">
                <span className={`st-radarChart__legendSwatch st-radarChart__legendSwatch--${tone}`} />
                {item.label}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
