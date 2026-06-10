import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type TimelineChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type TimelineChartEvent = {
  /** Point on the axis (year, day index, ordinal step…). */
  position: number;
  /** Required short label, shown above/below the marker (alternated). */
  label: string;
  /** Optional longer description, surfaced in the accessible list + tooltip. */
  description?: string;
  /** Optional explicit categorical tone; otherwise cycles category1..8. */
  tone?: TimelineChartTone;
};

export type TimelineChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: TimelineChartEvent[];
  label: string;
  width?: number;
  height?: number;
  className?: string;
};

const MARGIN = { top: 12, right: 24, bottom: 32, left: 24 } as const;
const CATEGORY_COUNT = 8;
// Max characters before the label is ellipsised (keeps connectors readable).
const LABEL_MAX = 18;

function toneClass(tone: TimelineChartTone | undefined, index: number): TimelineChartTone {
  if (tone) return tone;
  return `category${(index % CATEGORY_COUNT) + 1}` as TimelineChartTone;
}

function truncate(text: string): string {
  return text.length > LABEL_MAX ? `${text.slice(0, LABEL_MAX - 1)}…` : text;
}

export function TimelineChart({
  data,
  label,
  width = 640,
  height = 240,
  className,
  ...rest
}: TimelineChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const axisY = MARGIN.top + Math.max(height - MARGIN.top - MARGIN.bottom, 1) / 2;

  // Sorted, finite-position events. `label` is required so missing labels drop.
  const events = data
    .filter((e) => Number.isFinite(e.position) && typeof e.label === "string")
    .slice()
    .sort((a, b) => a.position - b.position);

  const positionDomain = (() => {
    if (events.length === 0) return { min: 0, max: 1 };
    const xs = events.map((e) => e.position);
    const min = Math.min(...xs);
    const max = Math.max(...xs);
    return min === max ? { min: min - 1, max: max + 1 } : { min, max };
  })();

  const ticks = niceTicks(positionDomain.min, positionDomain.max, 5);

  // Domain extended to the tick range so markers + axis share a frame.
  const frame = {
    min: Math.min(positionDomain.min, ticks[0]),
    max: Math.max(positionDomain.max, ticks[ticks.length - 1]),
  };

  const markers = events.map((e, i) => {
    const x = MARGIN.left + scaleLinear(e.position, frame.min, frame.max, 0, plotWidth);
    const above = i % 2 === 0;
    return {
      index: i,
      x,
      above,
      tone: toneClass(e.tone, i),
      label: truncate(e.label),
      fullLabel: e.label,
      description: e.description,
      position: e.position,
    };
  });

  const tickEntries = ticks.map((tick) => ({
    value: tick,
    x: MARGIN.left + scaleLinear(tick, frame.min, frame.max, 0, plotWidth),
  }));

  const dataValueItems = events.map((e) =>
    e.description ? `${e.position}: ${e.label} — ${e.description}` : `${e.position}: ${e.label}`,
  );

  function handleLeave() {
    setHoveredIndex(null);
  }
  function handleVisualPointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredIndex(null);
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    setHoveredIndex(Number.isInteger(index) ? index : null);
  }

  const hovered = hoveredIndex !== null ? markers[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-timelineChart", className)}>
      <div
        className="st-timelineChart__visual"
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
          {/* central timeline */}
          <line
            className="st-timelineChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={axisY}
            y2={axisY}
          />

          {/* graduated ticks */}
          {tickEntries.map((tick) => (
            <React.Fragment key={tick.value}>
              <line
                className="st-timelineChart__tick"
                x1={tick.x}
                x2={tick.x}
                y1={axisY}
                y2={axisY + 5}
              />
              <text
                className="st-timelineChart__tickLabel"
                x={tick.x}
                y={height - MARGIN.bottom + 18}
                textAnchor="middle"
              >
                {formatTick(tick.value)}
              </text>
            </React.Fragment>
          ))}

          {/* events: connector + marker + alternated label */}
          {markers.map((m) => {
            const labelY = m.above ? axisY - 26 : axisY + 26;
            const connectorY = m.above ? axisY - 12 : axisY + 12;
            return (
              <React.Fragment key={m.index}>
                <line
                  className={classNames(
                    "st-timelineChart__connector",
                    `st-timelineChart__connector--${m.tone}`,
                  )}
                  x1={m.x}
                  x2={m.x}
                  y1={axisY}
                  y2={connectorY}
                />
                <text
                  className="st-timelineChart__eventLabel"
                  x={m.x}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline={m.above ? "auto" : "hanging"}
                >
                  {m.label}
                </text>
                <circle
                  className={classNames(
                    "st-timelineChart__marker",
                    `st-timelineChart__marker--${m.tone}`,
                  )}
                  cx={m.x}
                  cy={axisY}
                  r="6"
                  data-chart-index={m.index}
                />
              </React.Fragment>
            );
          })}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hovered ? (
        <div
          className="st-timelineChart__tooltip"
          role="presentation"
          style={{ left: `${(hovered.x / width) * 100}%`, top: `${(axisY / height) * 100}%` }}
        >
          <span className="st-timelineChart__tooltipLabel">{hovered.fullLabel}</span>
          <span className="st-timelineChart__tooltipValue">{hovered.position}</span>
          {hovered.description ? (
            <span className="st-timelineChart__tooltipDesc">{hovered.description}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
