import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type WaterfallType = "increase" | "decrease" | "total";

export type WaterfallChartDatum = {
  label: string;
  value: number;
  type?: WaterfallType;
};

export type WaterfallChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: WaterfallChartDatum[];
  width?: number;
  height?: number;
  connectors?: boolean;
  format?: (value: number) => string;
  label: string;
  className?: string;
};

const MARGIN = { top: 12, right: 16, bottom: 32, left: 44 };

const LEGEND_ITEMS: { type: WaterfallType; label: string }[] = [
  { type: "increase", label: "Hausse" },
  { type: "decrease", label: "Baisse" },
  { type: "total", label: "Total" },
];

export function WaterfallChart({
  data = [],
  width = 480,
  height = 240,
  connectors = true,
  format,
  label,
  className,
  ...rest
}: WaterfallChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  function formatValue(v: number): string {
    return format ? format(v) : formatTick(v);
  }

  // Resolve the floating start/end of each bar, accumulating running totals.
  // - increase: la barre monte de +|value| depuis le cumul courant.
  // - decrease: la barre descend de -|value| depuis le cumul courant.
  // - total: barre repère ancrée à zéro montrant la valeur saisie ; elle
  //   recale le cumul courant (point de contrôle), de sorte que les connecteurs
  //   et les étapes suivantes repartent du total affiché.
  const computed = (() => {
    let cumulative = 0;
    return data.map((d) => {
      // Valeur non finie → traitée comme 0 (jamais de NaN dans la géométrie/ARIA).
      const raw = Number.isFinite(d.value) ? d.value : 0;
      const inferred: WaterfallType = d.type ?? (raw >= 0 ? "increase" : "decrease");
      let start: number;
      let end: number;
      let displayValue: number;
      if (inferred === "total") {
        start = 0;
        end = raw;
        cumulative = raw;
        displayValue = raw;
      } else {
        // Le signe est imposé par le type pour rester cohérent avec la légende.
        const signed = inferred === "decrease" ? -Math.abs(raw) : Math.abs(raw);
        start = cumulative;
        end = cumulative + signed;
        cumulative = end;
        displayValue = signed;
      }
      const resolvedType: WaterfallType =
        inferred === "total" ? "total" : end >= start ? "increase" : "decrease";
      return { datum: d, type: resolvedType, start, end, displayValue, cumulative };
    });
  })();

  const scales = (() => {
    const bounds = computed.flatMap((c) => [c.start, c.end]);
    const minRaw = Math.min(0, ...bounds);
    const maxRaw = Math.max(0, ...bounds);
    const ticks = niceTicks(minRaw, maxRaw, 5);
    const domainMin = ticks[0];
    const domainMax = ticks[ticks.length - 1];
    const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
    const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
    return { ticks, domainMin, domainMax, plotWidth, plotHeight };
  })();

  const bars = (() => {
    const { domainMin, domainMax, plotWidth, plotHeight } = scales;
    if (computed.length === 0)
      return [] as Array<{
        x: number;
        y: number;
        width: number;
        height: number;
        topY: number;
        bottomY: number;
        cx: number;
        cy: number;
        type: WaterfallType;
        datum: WaterfallChartDatum;
        displayValue: number;
        cumulative: number;
        index: number;
      }>;
    const band = plotWidth / computed.length;
    const barWidth = band * 0.62;
    return computed.map((c, i) => {
      const startY = scaleLinear(c.start, domainMin, domainMax, plotHeight, 0);
      const endY = scaleLinear(c.end, domainMin, domainMax, plotHeight, 0);
      const y = Math.min(startY, endY);
      const h = Math.abs(endY - startY);
      const x = MARGIN.left + band * i + (band - barWidth) / 2;
      return {
        x,
        y: MARGIN.top + y,
        width: barWidth,
        height: Math.max(h, 0.5),
        topY: MARGIN.top + Math.min(startY, endY),
        bottomY: MARGIN.top + Math.max(startY, endY),
        cx: MARGIN.left + band * (i + 0.5),
        cy: MARGIN.top + Math.min(startY, endY),
        type: c.type,
        datum: c.datum,
        displayValue: c.displayValue,
        cumulative: c.cumulative,
        index: i,
      };
    });
  })();

  // Connector lines join the top edge of each bar to the next, tracing the running total.
  const connectorLines = (() => {
    if (!connectors || bars.length < 2) return [] as { x1: number; x2: number; y: number }[];
    const { domainMin, domainMax, plotHeight } = scales;
    const lines: { x1: number; x2: number; y: number }[] = [];
    for (let i = 0; i < computed.length - 1; i++) {
      const level = computed[i].end;
      const y = MARGIN.top + scaleLinear(level, domainMin, domainMax, plotHeight, 0);
      // Le connecteur relie le bord droit de la barre i au bord gauche de i+1,
      // au niveau du cumul courant.
      lines.push({ x1: bars[i].x + bars[i].width, x2: bars[i + 1].x, y });
    }
    return lines;
  })();

  const valueAxisTicks = (() => {
    const { ticks, domainMin, domainMax, plotWidth, plotHeight } = scales;
    return ticks.map((tick) => ({
      value: tick,
      x1: MARGIN.left,
      x2: MARGIN.left + plotWidth,
      y: MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0),
    }));
  })();

  const zeroY = (() => {
    const { domainMin, domainMax, plotHeight } = scales;
    return MARGIN.top + scaleLinear(0, domainMin, domainMax, plotHeight, 0);
  })();

  const dataValueItems = computed.map((c) => `${c.datum.label}: ${formatValue(c.displayValue)}`);

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

  const hoveredBar = hoveredIndex !== null ? bars[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-waterfallChart", className)}>
      <div
        className="st-waterfallChart__visual"
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
          {/* gridlines + value axis ticks */}
          {valueAxisTicks.map((tick) => (
            <React.Fragment key={tick.value}>
              <line className="st-waterfallChart__grid" x1={tick.x1} x2={tick.x2} y1={tick.y} y2={tick.y} />
              <text
                className="st-waterfallChart__tickLabel"
                x={MARGIN.left - 6}
                y={tick.y}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {formatTick(tick.value)}
              </text>
            </React.Fragment>
          ))}

          {/* axes */}
          <line className="st-waterfallChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
          <line
            className="st-waterfallChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />
          {/* zero baseline */}
          <line className="st-waterfallChart__zero" x1={MARGIN.left} x2={width - MARGIN.right} y1={zeroY} y2={zeroY} />

          {/* connector lines */}
          {connectorLines.map((line, i) => (
            <line
              key={i}
              className="st-waterfallChart__connector"
              x1={line.x1}
              x2={line.x2}
              y1={line.y}
              y2={line.y}
            />
          ))}

          {/* category labels */}
          {bars.map((bar) => (
            <text
              key={bar.datum.label}
              className="st-waterfallChart__categoryLabel"
              x={bar.x + bar.width / 2}
              y={height - MARGIN.bottom + 16}
              textAnchor="middle"
            >
              {bar.datum.label}
            </text>
          ))}

          {/* bars */}
          {bars.map((bar, i) => (
            <rect
              key={bar.datum.label}
              className={`st-waterfallChart__bar st-waterfallChart__bar--${bar.type}`}
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              rx="2"
              data-chart-index={i}
            />
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      <ul className="st-waterfallChart__legend" aria-hidden="true">
        {LEGEND_ITEMS.map((item) => (
          <li key={item.type} className="st-waterfallChart__legendItem">
            <span className={`st-waterfallChart__legendSwatch st-waterfallChart__legendSwatch--${item.type}`} />
            {item.label}
          </li>
        ))}
      </ul>

      {hoveredBar ? (
        <div
          className="st-waterfallChart__tooltip"
          role="presentation"
          style={{ left: `${(hoveredBar.cx / width) * 100}%`, top: `${(hoveredBar.cy / height) * 100}%` }}
        >
          <span className="st-waterfallChart__tooltipLabel">{hoveredBar.datum.label}</span>
          <span className="st-waterfallChart__tooltipValue">{formatValue(hoveredBar.displayValue)}</span>
        </div>
      ) : null}
    </div>
  );
}
