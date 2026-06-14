import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";

export type StateTimelineTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type StateTimelineSegment = {
  start: number;
  end: number;
  state: string | number;
  tone?: StateTimelineTone;
};

export type StateTimelineSeries = {
  series: string;
  segments: StateTimelineSegment[];
};

export type StateTimelineChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: StateTimelineSeries[];
  label?: string;
  width?: number;
  height?: number;
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

export function StateTimelineChart({
  data = [],
  label,
  width = 640,
  height = 320,
  className,
  ...rest
}: StateTimelineChartProps) {
  const [hoveredKey, setHoveredKey] = React.useState<string | null>(null);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  // Normalise start ≤ end, drop non-finite segments and unlabeled lanes.
  const validData = data
    .filter((d) => typeof d.series === "string" && d.series.length > 0)
    .map((d) => ({
      series: d.series,
      segments: (d.segments ?? [])
        .filter((s) => Number.isFinite(s.start) && Number.isFinite(s.end))
        .map((s) => ({
          start: Math.min(s.start, s.end),
          end: Math.max(s.start, s.end),
          state: s.state,
          tone: s.tone,
        })),
    }));

  // Distinct states (first-seen order) → categoryN index (1..8, cycled) when no
  // explicit `tone`. An explicit `tone` on a segment wins over derivation.
  const stateOrder: string[] = [];
  const explicitToneByState = new Map<string, StateTimelineTone>();
  for (const d of validData) {
    for (const s of d.segments) {
      const key = String(s.state);
      if (!stateOrder.includes(key)) stateOrder.push(key);
      if (s.tone) explicitToneByState.set(key, s.tone);
    }
  }
  const toneOf = (segment: { state: string | number; tone?: StateTimelineTone }): StateTimelineTone => {
    if (segment.tone) return segment.tone;
    const key = String(segment.state);
    const explicit = explicitToneByState.get(key);
    if (explicit) return explicit;
    const idx = stateOrder.indexOf(key);
    return `category${((idx < 0 ? 0 : idx) % 8) + 1}` as StateTimelineTone;
  };
  const legendItems = stateOrder.map((state) => ({ state, tone: toneOf({ state }) }));
  const hasLegend = stateOrder.length > 0;

  const vals: number[] = [];
  for (const d of validData) {
    for (const s of d.segments) vals.push(s.start, s.end);
  }
  const rawMin = vals.length === 0 ? 0 : Math.min(...vals);
  const rawMaxBase = vals.length === 0 ? 1 : Math.max(...vals);
  const rawMax = rawMaxBase === rawMin ? rawMin + 1 : rawMaxBase;

  const ticks = niceTicks(rawMin, rawMax, 5);
  const domainMin = ticks[0] ?? rawMin;
  const domainMax = ticks[ticks.length - 1] ?? rawMax;

  const xOf = (v: number) => MARGIN.left + scaleLinear(v, domainMin, domainMax, 0, plotWidth);

  type LaneSegment = {
    key: string;
    datum: (typeof validData)[number]["segments"][number];
    x: number;
    width: number;
    cx: number;
    tone: StateTimelineTone;
  };
  type Lane = {
    datum: (typeof validData)[number];
    index: number;
    y: number;
    height: number;
    rowCenterY: number;
    segments: LaneSegment[];
  };

  const lanes: Lane[] = (() => {
    if (validData.length === 0) return [];
    const band = plotHeight / validData.length;
    const laneHeight = Math.min(band * 0.62, 28);
    return validData.map((d, i) => {
      const y = MARGIN.top + band * i + (band - laneHeight) / 2;
      const segments = d.segments.map((s, j) => {
        const x0 = xOf(s.start);
        const x1 = xOf(s.end);
        const x = Math.min(x0, x1);
        const w = Math.max(Math.abs(x1 - x0), 1);
        return {
          key: `${i}-${j}`,
          datum: s,
          x,
          width: w,
          cx: x + w / 2,
          tone: toneOf(s),
        };
      });
      return {
        datum: d,
        index: i,
        y,
        height: laneHeight,
        rowCenterY: MARGIN.top + band * (i + 0.5),
        segments,
      };
    });
  })();

  const dataValueItems = validData.map(
    (d) => `${d.series}: ${d.segments.map((s) => `${s.state} [${s.start} → ${s.end}]`).join(", ")}`,
  );

  function handlePointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredKey(null);
      return;
    }
    setHoveredKey(target.getAttribute("data-chart-key"));
  }

  let hovered: { lane: Lane; seg: LaneSegment } | null = null;
  if (hoveredKey !== null) {
    for (const lane of lanes) {
      for (const seg of lane.segments) {
        if (seg.key === hoveredKey) hovered = { lane, seg };
      }
    }
  }

  return (
    <div {...rest} className={classNames("st-stateTimelineChart", className)}>
      <div
        className="st-stateTimelineChart__visual"
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
          {/* gridlines + tick labels (time axis) */}
          {ticks.map((tick) => {
            const tx = xOf(tick);
            return (
              <React.Fragment key={tick}>
                <line
                  className="st-stateTimelineChart__grid"
                  x1={tx}
                  x2={tx}
                  y1={MARGIN.top}
                  y2={height - MARGIN.bottom}
                />
                <text
                  className="st-stateTimelineChart__tickLabel"
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
            className="st-stateTimelineChart__axis"
            x1={MARGIN.left}
            x2={MARGIN.left}
            y1={MARGIN.top}
            y2={height - MARGIN.bottom}
          />
          <line
            className="st-stateTimelineChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {/* one lane per series: left label + contiguous state segments */}
          {lanes.map((lane) => (
            <React.Fragment key={`${lane.index}-${lane.datum.series}`}>
              <text
                className="st-stateTimelineChart__seriesLabel"
                x={MARGIN.left - 8}
                y={lane.rowCenterY}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {ellipsize(lane.datum.series, 18)}
              </text>
              {lane.segments.map((seg) => (
                <rect
                  key={seg.key}
                  className={classNames(
                    "st-stateTimelineChart__segment",
                    `st-stateTimelineChart__segment--${seg.tone}`,
                    hoveredKey !== null && hoveredKey !== seg.key
                      ? "st-stateTimelineChart__segment--dim"
                      : undefined,
                  )}
                  x={seg.x}
                  y={lane.y}
                  width={seg.width}
                  height={lane.height}
                  rx="2"
                  data-chart-key={seg.key}
                />
              ))}
            </React.Fragment>
          ))}
        </svg>
      </div>

      {hasLegend ? (
        <ul className="st-stateTimelineChart__legend" aria-label={`États de ${label ?? "timeline"}`}>
          {legendItems.map((item) => (
            <li key={item.state} className="st-stateTimelineChart__legendItem">
              <span
                className={`st-stateTimelineChart__legendSwatch st-stateTimelineChart__legendSwatch--${item.tone}`}
                aria-hidden="true"
              />
              {item.state}
            </li>
          ))}
        </ul>
      ) : null}

      <ChartDataList label={label ?? "state timeline"} items={dataValueItems} />

      {hovered ? (
        <div
          className="st-stateTimelineChart__tooltip"
          role="presentation"
          style={{
            left: `${(hovered.seg.cx / width) * 100}%`,
            top: `${(hovered.lane.rowCenterY / height) * 100}%`,
          }}
        >
          <span className="st-stateTimelineChart__tooltipLabel">
            {hovered.lane.datum.series} · {hovered.seg.datum.state}
          </span>
          <span className="st-stateTimelineChart__tooltipValue">
            {hovered.seg.datum.start} → {hovered.seg.datum.end}
          </span>
        </div>
      ) : null}
    </div>
  );
}
