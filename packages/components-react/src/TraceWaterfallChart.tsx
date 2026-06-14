import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";

export type TraceSpan = {
  spanId: string;
  parentSpanId?: string | null;
  service: string;
  start: number;
  duration: number;
};

export type TraceWaterfallChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: { spans: TraceSpan[] };
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  className?: string;
};

const MARGIN = { top: 16, right: 16, bottom: 32, left: 152 };
const INDENT = 10;

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

type OrderedSpan = { span: TraceSpan; depth: number };

export function TraceWaterfallChart({
  data = { spans: [] },
  label,
  width,
  height = 320,
  size,
  className,
  ...rest
}: TraceWaterfallChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const resolvedWidth = width ?? size ?? 640;
  const plotWidth = Math.max(resolvedWidth - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  // Normalise: drop spans missing id/service or with non-finite start/duration.
  const validSpans = (data?.spans ?? []).filter(
    (s) =>
      s &&
      typeof s.spanId === "string" &&
      s.spanId.length > 0 &&
      typeof s.service === "string" &&
      s.service.length > 0 &&
      Number.isFinite(s.start) &&
      Number.isFinite(s.duration),
  );

  // Hierarchical order: DFS from roots (missing/unknown parentSpanId). Each span
  // keeps its depth for the indented label.
  const ordered: OrderedSpan[] = (() => {
    if (validSpans.length === 0) return [];
    const byId = new Map<string, TraceSpan>();
    for (const s of validSpans) if (!byId.has(s.spanId)) byId.set(s.spanId, s);

    const childrenOf = new Map<string, TraceSpan[]>();
    const roots: TraceSpan[] = [];
    for (const s of validSpans) {
      const p = s.parentSpanId;
      if (p == null || !byId.has(p) || p === s.spanId) {
        roots.push(s);
      } else {
        const list = childrenOf.get(p) ?? [];
        list.push(s);
        childrenOf.set(p, list);
      }
    }

    const out: OrderedSpan[] = [];
    const seen = new Set<string>();
    const visit = (s: TraceSpan, depth: number) => {
      if (seen.has(s.spanId)) return;
      seen.add(s.spanId);
      out.push({ span: s, depth });
      for (const k of childrenOf.get(s.spanId) ?? []) visit(k, depth + 1);
    };
    for (const r of roots) visit(r, 0);
    for (const s of validSpans) if (!seen.has(s.spanId)) visit(s, 0);
    return out;
  })();

  // Distinct services (DFS first-seen order) → categoryN index (1..8, cycled).
  const serviceOrder: string[] = [];
  for (const o of ordered) {
    if (!serviceOrder.includes(o.span.service)) serviceOrder.push(o.span.service);
  }
  const toneOf = (service: string): string => {
    const idx = serviceOrder.indexOf(service);
    return `category${((idx < 0 ? 0 : idx) % 8) + 1}`;
  };
  const legendItems = serviceOrder.map((service) => ({ service, tone: toneOf(service) }));
  const hasLegend = serviceOrder.length > 0;

  const vals: number[] = [];
  for (const o of ordered) vals.push(o.span.start, o.span.start + Math.max(o.span.duration, 0));
  const rawMin = vals.length === 0 ? 0 : Math.min(...vals);
  const rawMaxBase = vals.length === 0 ? 1 : Math.max(...vals);
  const rawMax = rawMaxBase === rawMin ? rawMin + 1 : rawMaxBase;

  const ticks = niceTicks(rawMin, rawMax, 5);
  const domainMin = ticks[0] ?? rawMin;
  const domainMax = ticks[ticks.length - 1] ?? rawMax;

  const xOf = (v: number) => MARGIN.left + scaleLinear(v, domainMin, domainMax, 0, plotWidth);

  const bars = (() => {
    if (ordered.length === 0)
      return [] as Array<{
        span: TraceSpan;
        depth: number;
        index: number;
        x: number;
        y: number;
        width: number;
        height: number;
        rowCenterY: number;
        cx: number;
        tone: string;
      }>;
    const band = plotHeight / ordered.length;
    const barHeight = Math.min(band * 0.62, 24);
    return ordered.map((o, i) => {
      const x0 = xOf(o.span.start);
      const x1 = xOf(o.span.start + Math.max(o.span.duration, 0));
      const x = Math.min(x0, x1);
      const w = Math.max(Math.abs(x1 - x0), 1);
      const y = MARGIN.top + band * i + (band - barHeight) / 2;
      return {
        span: o.span,
        depth: o.depth,
        index: i,
        x,
        y,
        width: w,
        height: barHeight,
        rowCenterY: MARGIN.top + band * (i + 0.5),
        cx: x + w / 2,
        tone: toneOf(o.span.service),
      };
    });
  })();

  const dataValueItems = ordered.map(
    (o) =>
      `${"·".repeat(o.depth)}${o.span.service}: ${o.span.start} → ${o.span.start + Math.max(o.span.duration, 0)}`,
  );

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
    <div {...rest} className={classNames("st-traceWaterfallChart", className)}>
      <div
        className="st-traceWaterfallChart__visual"
        role="img"
        aria-label={label}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoveredIndex(null)}
      >
        <svg
          viewBox={`0 0 ${resolvedWidth} ${height}`}
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
                  className="st-traceWaterfallChart__grid"
                  x1={tx}
                  x2={tx}
                  y1={MARGIN.top}
                  y2={height - MARGIN.bottom}
                />
                <text
                  className="st-traceWaterfallChart__tickLabel"
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
            className="st-traceWaterfallChart__axis"
            x1={MARGIN.left}
            x2={MARGIN.left}
            y1={MARGIN.top}
            y2={height - MARGIN.bottom}
          />
          <line
            className="st-traceWaterfallChart__axis"
            x1={MARGIN.left}
            x2={resolvedWidth - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {/* one bar per span + indented service label on the left */}
          {bars.map((bar, i) => (
            <React.Fragment key={`${i}-${bar.span.spanId}`}>
              <text
                className="st-traceWaterfallChart__spanLabel"
                x={MARGIN.left - 8}
                y={bar.rowCenterY}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {ellipsize(bar.span.service, Math.max(2, 16 - bar.depth))}
              </text>
              <rect
                className={classNames(
                  "st-traceWaterfallChart__bar",
                  `st-traceWaterfallChart__bar--${bar.tone}`,
                  hoveredIndex !== null && hoveredIndex !== i
                    ? "st-traceWaterfallChart__bar--dim"
                    : undefined,
                )}
                x={bar.x + bar.depth * INDENT}
                y={bar.y}
                width={Math.max(bar.width - bar.depth * INDENT, 1)}
                height={bar.height}
                rx="2"
                data-chart-index={i}
              />
            </React.Fragment>
          ))}
        </svg>
      </div>

      {hasLegend ? (
        <ul className="st-traceWaterfallChart__legend" aria-label={`Services de ${label ?? "trace"}`}>
          {legendItems.map((item) => (
            <li key={item.service} className="st-traceWaterfallChart__legendItem">
              <span
                className={`st-traceWaterfallChart__legendSwatch st-traceWaterfallChart__legendSwatch--${item.tone}`}
                aria-hidden="true"
              />
              {item.service}
            </li>
          ))}
        </ul>
      ) : null}

      <ChartDataList label={label ?? "trace waterfall"} items={dataValueItems} />

      {hoveredBar ? (
        <div
          className="st-traceWaterfallChart__tooltip"
          role="presentation"
          style={{
            left: `${(hoveredBar.cx / resolvedWidth) * 100}%`,
            top: `${(hoveredBar.rowCenterY / height) * 100}%`,
          }}
        >
          <span className="st-traceWaterfallChart__tooltipLabel">{hoveredBar.span.service}</span>
          <span className="st-traceWaterfallChart__tooltipValue">
            {hoveredBar.span.start} → {hoveredBar.span.start + Math.max(hoveredBar.span.duration, 0)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
