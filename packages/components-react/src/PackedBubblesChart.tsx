import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";
import { contrastTextForTone } from "./chartContrast.js";

export type PackedBubblesChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type PackedBubblesChartDatum = {
  label: string;
  value: number;
  tone?: PackedBubblesChartTone;
};

export type PackedBubblesChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: PackedBubblesChartDatum[];
  /** Largeur du viewBox (défaut 360). */
  width?: number;
  /** Hauteur du viewBox (défaut 360). */
  height?: number;
  label: string;
  className?: string;
};

const TONES: PackedBubblesChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

const PADDING = 2;
const LABEL_MIN_RADIUS = 18;

function magnitude(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

type Bubble = {
  label: string;
  value: number;
  tone: PackedBubblesChartTone;
  textColor: string;
  cx: number;
  cy: number;
  r: number;
  index: number;
};

export function PackedBubblesChart({
  data,
  width = 360,
  height = 360,
  label,
  className,
  ...rest
}: PackedBubblesChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const bubbles = React.useMemo<Bubble[]>(() => {
    const cx = width / 2;
    const cy = height / 2;

    const valid = data
      .map((datum, index) => ({ datum, index, value: magnitude(datum.value) }))
      .filter((entry) => entry.value > 0)
      .sort((a, b) => b.value - a.value);

    if (valid.length === 0) return [];

    const maxValue = Math.max(...valid.map((entry) => entry.value));
    const limit = Math.max(Math.min(width, height) / 2 - 4, 1);
    const baseMax = Math.sqrt(maxValue);
    const targetMax = Math.min(limit * 0.42, limit);
    const radiusOf = (value: number) => Math.max((Math.sqrt(value) / baseMax) * targetMax, 3);

    const placed: Array<{ cx: number; cy: number; r: number }> = [];

    const collides = (x: number, y: number, r: number): boolean => {
      for (const p of placed) {
        const dx = x - p.cx;
        const dy = y - p.cy;
        const minDist = r + p.r + PADDING;
        if (dx * dx + dy * dy < minDist * minDist) return true;
      }
      return false;
    };

    const result: Bubble[] = [];
    valid.forEach((entry, order) => {
      const r = radiusOf(entry.value);
      let x = cx;
      let y = cy;

      if (placed.length > 0) {
        const step = Math.max(r * 0.5, 2);
        let angle = order * 2.399963;
        let radius = step;
        let found = false;
        for (let i = 0; i < 4000; i += 1) {
          x = cx + radius * Math.cos(angle);
          y = cy + radius * Math.sin(angle);
          if (!collides(x, y, r)) {
            found = true;
            break;
          }
          angle += 0.5;
          radius += step * 0.06;
        }
        if (!found) {
          x = cx + radius * Math.cos(angle);
          y = cy + radius * Math.sin(angle);
        }
      }

      placed.push({ cx: x, cy: y, r });
      const tone = entry.datum.tone ?? TONES[entry.index % TONES.length];
      result.push({
        label: entry.datum.label,
        value: entry.value,
        tone,
        textColor: contrastTextForTone(tone),
        cx: x,
        cy: y,
        r,
        index: entry.index,
      });
    });

    return result;
  }, [data, width, height]);

  const dataValueItems = React.useMemo(
    () => data.filter((datum) => magnitude(datum.value) > 0).map((datum) => `${datum.label}: ${datum.value}`),
    [data],
  );

  function handleVisualPointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredIndex(null);
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    setHoveredIndex(Number.isInteger(index) ? index : null);
  }

  const hovered = hoveredIndex !== null ? bubbles.find((b) => b.index === hoveredIndex) : undefined;

  return (
    <div {...rest} className={classNames("st-packedBubblesChart", className)}>
      <div
        className="st-packedBubblesChart__visual"
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
          {bubbles.map((bubble) => (
            <g key={bubble.index} className="st-packedBubblesChart__bubble" data-chart-index={bubble.index}>
              <circle
                className={classNames(
                  "st-packedBubblesChart__circle",
                  `st-packedBubblesChart__circle--${bubble.tone}`,
                  hoveredIndex !== null && hoveredIndex !== bubble.index
                    ? "st-packedBubblesChart__circle--dim"
                    : undefined,
                )}
                cx={bubble.cx}
                cy={bubble.cy}
                r={bubble.r}
                data-chart-index={bubble.index}
              />
              {bubble.r >= LABEL_MIN_RADIUS ? (
                <text
                  className="st-packedBubblesChart__label"
                  x={bubble.cx}
                  y={bubble.cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={bubble.textColor}
                  data-chart-index={bubble.index}
                >
                  {bubble.label}
                </text>
              ) : null}
            </g>
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hovered ? (
        <div
          className="st-packedBubblesChart__tooltip"
          role="presentation"
          style={{ left: `${(hovered.cx / width) * 100}%`, top: `${((hovered.cy - hovered.r) / height) * 100}%` }}
        >
          <span className="st-packedBubblesChart__tooltipLabel">{hovered.label}</span>
          <span className="st-packedBubblesChart__tooltipValue">{hovered.value}</span>
        </div>
      ) : null}
    </div>
  );
}
