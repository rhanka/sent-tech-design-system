import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";

export type GanttChartTask = {
  task: string;
  start: number;
  end: number;
  category?: string;
};

export type GanttChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: GanttChartTask[];
  label: string;
  width?: number;
  height?: number;
  marker?: number;
  className?: string;
};

const MARGIN = { top: 16, right: 16, bottom: 32, left: 132 };

function scaleLinear(v: number, d0: number, d1: number, r0: number, r1: number): number {
  if (d1 === d0) return r0;
  return r0 + ((v - d0) * (r1 - r0)) / (d1 - d0);
}

function niceTicks(min: number, max: number, target = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    const base = Number.isFinite(max) ? max : 0;
    return [base];
  }
  const range = max - min;
  const rough = range / Math.max(target - 1, 1);
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / pow;
  let step: number;
  if (norm < 1.5) step = 1 * pow;
  else if (norm < 3) step = 2 * pow;
  else if (norm < 7) step = 5 * pow;
  else step = 10 * pow;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) {
    ticks.push(Number(v.toFixed(10)));
  }
  return ticks;
}

function formatTick(v: number): string {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

// Truncate a label to the left margin width (approx. by char count).
function ellipsize(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  if (maxChars <= 1) return "…";
  return `${text.slice(0, maxChars - 1)}…`;
}

export function GanttChart({
  data = [],
  label,
  width = 640,
  height = 320,
  marker,
  className,
  ...rest
}: GanttChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  // Normalise start ≤ end and drop non-finite (or unlabeled) tasks.
  const validData = data
    .filter(
      (d) =>
        typeof d.task === "string" &&
        d.task.length > 0 &&
        Number.isFinite(d.start) &&
        Number.isFinite(d.end),
    )
    .map((d) => ({
      task: d.task,
      start: Math.min(d.start, d.end),
      end: Math.max(d.start, d.end),
      category: d.category,
    }));

  // Distinct categories (first-seen order) → categoryN index (1..8, cycled).
  const categoryOrder: string[] = [];
  for (const d of validData) {
    if (d.category && !categoryOrder.includes(d.category)) categoryOrder.push(d.category);
  }
  const hasCategories = categoryOrder.length > 0;
  const toneOf = (category: string | undefined): string => {
    if (!category) return "category1";
    const idx = categoryOrder.indexOf(category);
    return `category${(idx % 8) + 1}`;
  };
  const legendItems = categoryOrder.map((category) => ({ category, tone: toneOf(category) }));

  const vals: number[] = [];
  for (const d of validData) vals.push(d.start, d.end);
  if (typeof marker === "number" && Number.isFinite(marker)) vals.push(marker);
  const rawMin = vals.length === 0 ? 0 : Math.min(...vals);
  const rawMaxBase = vals.length === 0 ? 1 : Math.max(...vals);
  const rawMax = rawMaxBase === rawMin ? rawMin + 1 : rawMaxBase;

  const ticks = niceTicks(rawMin, rawMax, 5);
  const domainMin = ticks[0] ?? rawMin;
  const domainMax = ticks[ticks.length - 1] ?? rawMax;

  const xOf = (v: number) => MARGIN.left + scaleLinear(v, domainMin, domainMax, 0, plotWidth);

  const bars = (() => {
    if (validData.length === 0) return [] as Array<{
      datum: (typeof validData)[number];
      index: number;
      x: number;
      y: number;
      width: number;
      height: number;
      rowCenterY: number;
      cx: number;
      tone: string;
    }>;
    const band = plotHeight / validData.length;
    const barHeight = Math.min(band * 0.62, 28);
    return validData.map((d, i) => {
      const x0 = xOf(d.start);
      const x1 = xOf(d.end);
      const x = Math.min(x0, x1);
      const w = Math.max(Math.abs(x1 - x0), 1);
      const y = MARGIN.top + band * i + (band - barHeight) / 2;
      return {
        datum: d,
        index: i,
        x,
        y,
        width: w,
        height: barHeight,
        rowCenterY: MARGIN.top + band * (i + 0.5),
        cx: x + w / 2,
        tone: toneOf(d.category),
      };
    });
  })();

  const markerGeom =
    typeof marker === "number" && Number.isFinite(marker) ? { x: xOf(marker), value: marker } : null;

  const dataValueItems = validData.map((d) => `${d.task}: ${d.start} → ${d.end}`);

  function handlePointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredIndex(null);
      return;
    }
    const idx = Number(target.getAttribute("data-chart-index"));
    setHoveredIndex(Number.isInteger(idx) ? idx : null);
  }

  const hoveredBar = hoveredIndex !== null ? bars[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-ganttChart", className)}>
      <div
        className="st-ganttChart__visual"
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
          {/* gridlines + tick labels (time axis) */}
          {ticks.map((tick) => {
            const tx = xOf(tick);
            return (
              <React.Fragment key={tick}>
                <line
                  className="st-ganttChart__grid"
                  x1={tx}
                  x2={tx}
                  y1={MARGIN.top}
                  y2={height - MARGIN.bottom}
                />
                <text
                  className="st-ganttChart__tickLabel"
                  x={tx}
                  y={height - MARGIN.bottom + 16}
                  textAnchor="middle"
                >
                  {formatTick(tick)}
                </text>
              </React.Fragment>
            );
          })}

          {/* axes */}
          <line
            className="st-ganttChart__axis"
            x1={MARGIN.left}
            x2={MARGIN.left}
            y1={MARGIN.top}
            y2={height - MARGIN.bottom}
          />
          <line
            className="st-ganttChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {/* one bar per task + left task label */}
          {bars.map((bar, i) => (
            <React.Fragment key={`${i}-${bar.datum.task}`}>
              <text
                className="st-ganttChart__taskLabel"
                x={MARGIN.left - 8}
                y={bar.rowCenterY}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {ellipsize(bar.datum.task, 18)}
              </text>
              <rect
                className={classNames(
                  "st-ganttChart__bar",
                  `st-ganttChart__bar--${bar.tone}`,
                  hoveredIndex !== null && hoveredIndex !== i ? "st-ganttChart__bar--dim" : undefined,
                )}
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                rx="2"
                data-chart-index={i}
              />
            </React.Fragment>
          ))}

          {/* "today" marker */}
          {markerGeom ? (
            <line
              className="st-ganttChart__marker"
              x1={markerGeom.x}
              x2={markerGeom.x}
              y1={MARGIN.top}
              y2={height - MARGIN.bottom}
            />
          ) : null}
        </svg>
      </div>

      {hasCategories ? (
        <ul className="st-ganttChart__legend" aria-label={`Catégories de ${label}`}>
          {legendItems.map((item) => (
            <li key={item.category} className="st-ganttChart__legendItem">
              <span
                className={`st-ganttChart__legendSwatch st-ganttChart__legendSwatch--${item.tone}`}
                aria-hidden="true"
              />
              {item.category}
            </li>
          ))}
        </ul>
      ) : null}

      <ChartDataList label={label} items={dataValueItems} />

      {hoveredBar ? (
        <div
          className="st-ganttChart__tooltip"
          role="presentation"
          style={{
            left: `${(hoveredBar.cx / width) * 100}%`,
            top: `${(hoveredBar.rowCenterY / height) * 100}%`,
          }}
        >
          <span className="st-ganttChart__tooltipLabel">{hoveredBar.datum.task}</span>
          <span className="st-ganttChart__tooltipValue">
            {hoveredBar.datum.start} → {hoveredBar.datum.end}
          </span>
        </div>
      ) : null}
    </div>
  );
}
