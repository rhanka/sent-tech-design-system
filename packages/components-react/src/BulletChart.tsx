import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";

export type BulletChartDatum = {
  label: string;
  value: number;
  target: number;
  ranges?: number[];
};

export type BulletChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: BulletChartDatum[];
  label: string;
  orientation?: "horizontal" | "vertical";
  width?: number;
  height?: number;
  className?: string;
};

const MARGIN = { top: 12, right: 24, bottom: 36, left: 80 };
const RANGE_OPACITIES = [0.18, 0.30, 0.44];

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

export function BulletChart({
  data = [],
  label,
  orientation = "horizontal",
  width = 480,
  height = 240,
  className,
  ...rest
}: BulletChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  // FIX: filter invalid data (non-finite value/target → skip)
  const validData = data.filter(
    (d) => Number.isFinite(d.value) && Number.isFinite(d.target)
  );

  // FIX: domain includes 0, values, targets AND ranges; negative domain supported
  const allDomainValues: number[] = [0];
  for (const d of validData) {
    allDomainValues.push(d.value, d.target);
    for (const r of d.ranges ?? []) {
      if (Number.isFinite(r)) allDomainValues.push(r);
    }
  }
  const rawMin = Math.min(...allDomainValues);
  const rawMax = Math.max(...allDomainValues);
  // Flat domain → fallback +1
  const domainMax = rawMax === rawMin ? rawMin + 1 : rawMax;
  const domainMin = rawMin;

  const ticks = niceTicks(domainMin, domainMax, 5);
  const tickDomainMin = ticks[0] ?? domainMin;
  const tickDomainMax = ticks[ticks.length - 1] ?? domainMax;

  // Position of baseline (value 0) in pixels
  const baselineX = MARGIN.left + scaleLinear(0, tickDomainMin, tickDomainMax, 0, plotWidth);
  const baselineY = MARGIN.top + scaleLinear(0, tickDomainMin, tickDomainMax, plotHeight, 0);

  const bullets = React.useMemo(() => {
    const bandCount = validData.length;
    if (bandCount === 0) return [];

    if (orientation === "horizontal") {
      const bandH = plotHeight / bandCount;
      const barH = bandH * 0.35;
      const rangeH = bandH * 0.65;

      return validData.map((d, i) => {
        const ranges = (d.ranges ?? [tickDomainMax]).filter(Number.isFinite).slice(0, 3);
        const sortedRanges = [...ranges].sort((a, b) => a - b);

        const bandY = MARGIN.top + i * bandH;
        const cx = MARGIN.left + scaleLinear(d.value, tickDomainMin, tickDomainMax, 0, plotWidth);
        const targetX = MARGIN.left + scaleLinear(d.target, tickDomainMin, tickDomainMax, 0, plotWidth);

        const rangeBands = sortedRanges.map((r, ri) => {
          const prevR = ri === 0 ? tickDomainMin : sortedRanges[ri - 1];
          return {
            x: MARGIN.left + scaleLinear(prevR, tickDomainMin, tickDomainMax, 0, plotWidth),
            width:
              scaleLinear(r, tickDomainMin, tickDomainMax, 0, plotWidth) -
              scaleLinear(prevR, tickDomainMin, tickDomainMax, 0, plotWidth),
            opacity: RANGE_OPACITIES[ri] ?? 0.44,
            y: bandY + (bandH - rangeH) / 2,
            height: rangeH,
          };
        });

        // FIX: bar starts from baseline (0), not from left edge
        const zeroX = baselineX;
        const barLeft = Math.min(zeroX, cx);
        const barRight = Math.max(zeroX, cx);

        return {
          datum: d,
          index: i,
          barX: barLeft,
          barY: bandY + (bandH - barH) / 2,
          barW: Math.max(barRight - barLeft, 0.5),
          barH,
          targetX,
          targetY: bandY + (bandH - rangeH) / 2,
          targetH: rangeH,
          labelY: bandY + bandH / 2,
          rangeBands,
          tooltipX: cx,
          tooltipY: bandY + bandH / 2,
        };
      });
    }

    // vertical
    const bandW = plotWidth / bandCount;
    const barW = bandW * 0.35;
    const rangeW = bandW * 0.65;

    return validData.map((d, i) => {
      const ranges = (d.ranges ?? [tickDomainMax]).filter(Number.isFinite).slice(0, 3);
      const sortedRanges = [...ranges].sort((a, b) => a - b);

      const bandX = MARGIN.left + i * bandW;
      const cy =
        MARGIN.top + scaleLinear(d.value, tickDomainMin, tickDomainMax, plotHeight, 0);
      const targetY =
        MARGIN.top + scaleLinear(d.target, tickDomainMin, tickDomainMax, plotHeight, 0);

      const rangeBands = sortedRanges.map((r, ri) => {
        const prevR = ri === 0 ? tickDomainMin : sortedRanges[ri - 1];
        return {
          y: MARGIN.top + scaleLinear(r, tickDomainMin, tickDomainMax, plotHeight, 0),
          height: Math.abs(
            scaleLinear(r, tickDomainMin, tickDomainMax, plotHeight, 0) -
              scaleLinear(prevR, tickDomainMin, tickDomainMax, plotHeight, 0)
          ),
          opacity: RANGE_OPACITIES[ri] ?? 0.44,
          x: bandX + (bandW - rangeW) / 2,
          width: rangeW,
        };
      });

      // FIX: bar starts from baseline (0)
      const zeroY = baselineY;
      const barTop = Math.min(zeroY, cy);
      const barBot = Math.max(zeroY, cy);

      return {
        datum: d,
        index: i,
        barX: bandX + (bandW - barW) / 2,
        barY: barTop,
        barW: barW,
        barH: Math.max(barBot - barTop, 0.5),
        targetY,
        targetX: bandX + (bandW - rangeW) / 2,
        targetH: rangeW,
        labelY: MARGIN.top + plotHeight + 18,
        labelX: bandX + bandW / 2,
        rangeBands,
        tooltipX: bandX + bandW / 2,
        tooltipY: cy,
      };
    });
  }, [validData, orientation, plotWidth, plotHeight, tickDomainMin, tickDomainMax, baselineX, baselineY]);

  const dataValueItems = validData.map(
    (d) => `${d.label}: value ${d.value}, target ${d.target}`
  );

  function handlePointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) { setHoveredIndex(null); return; }
    const idx = Number(target.getAttribute("data-chart-index"));
    setHoveredIndex(Number.isInteger(idx) ? idx : null);
  }

  const hoveredBullet = hoveredIndex !== null ? bullets[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-bulletChart", className)}>
      <div
        className="st-bulletChart__visual"
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
          {/* FIX: baseline at position 0 */}
          {orientation === "horizontal" ? (
            <line
              className="st-bulletChart__baseline"
              x1={baselineX}
              x2={baselineX}
              y1={MARGIN.top}
              y2={height - MARGIN.bottom}
            />
          ) : (
            <line
              className="st-bulletChart__baseline"
              x1={MARGIN.left}
              x2={width - MARGIN.right}
              y1={baselineY}
              y2={baselineY}
            />
          )}

          {/* axis lines */}
          <line
            className="st-bulletChart__axis"
            x1={MARGIN.left}
            x2={orientation === "horizontal" ? width - MARGIN.right : MARGIN.left}
            y1={MARGIN.top}
            y2={height - MARGIN.bottom}
          />
          <line
            className="st-bulletChart__axis"
            x1={MARGIN.left}
            x2={orientation === "horizontal" ? MARGIN.left : width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {/* tick lines + labels */}
          {ticks.map((tick) => {
            if (orientation === "horizontal") {
              const tx = MARGIN.left + scaleLinear(tick, tickDomainMin, tickDomainMax, 0, plotWidth);
              return (
                <React.Fragment key={tick}>
                  <line
                    className="st-bulletChart__grid"
                    x1={tx}
                    x2={tx}
                    y1={MARGIN.top}
                    y2={height - MARGIN.bottom}
                  />
                  <text
                    className="st-bulletChart__tickLabel"
                    x={tx}
                    y={height - MARGIN.bottom + 14}
                    textAnchor="middle"
                  >
                    {formatTick(tick)}
                  </text>
                </React.Fragment>
              );
            } else {
              const ty = MARGIN.top + scaleLinear(tick, tickDomainMin, tickDomainMax, plotHeight, 0);
              return (
                <React.Fragment key={tick}>
                  <line
                    className="st-bulletChart__grid"
                    x1={MARGIN.left}
                    x2={width - MARGIN.right}
                    y1={ty}
                    y2={ty}
                  />
                  <text
                    className="st-bulletChart__tickLabel"
                    x={MARGIN.left - 6}
                    y={ty}
                    textAnchor="end"
                    dominantBaseline="middle"
                  >
                    {formatTick(tick)}
                  </text>
                </React.Fragment>
              );
            }
          })}

          {/* FIX: composite key to avoid duplicates */}
          {bullets.map((b, i) => (
            <React.Fragment key={`${i}-${b.datum.label}`}>
              {/* qualitative range bands */}
              {b.rangeBands.map((rb, ri) => (
                <rect
                  key={ri}
                  className="st-bulletChart__range"
                  x={rb.x ?? b.barX}
                  y={rb.y ?? b.barY}
                  width={rb.width}
                  height={Math.abs(rb.height ?? 0)}
                  style={{ opacity: rb.opacity }}
                />
              ))}

              {/* measure bar */}
              <rect
                className="st-bulletChart__bar"
                x={b.barX}
                y={b.barY}
                width={b.barW}
                height={b.barH}
                rx={1}
                data-chart-index={i}
              />

              {/* target marker */}
              {orientation === "horizontal" ? (
                <line
                  className="st-bulletChart__target"
                  x1={b.targetX}
                  x2={b.targetX}
                  y1={b.targetY}
                  y2={b.targetY + b.targetH}
                />
              ) : (
                <line
                  className="st-bulletChart__target"
                  x1={b.targetX}
                  x2={(b.targetX ?? 0) + b.targetH}
                  y1={b.targetY}
                  y2={b.targetY}
                />
              )}

              {/* category label */}
              {orientation === "horizontal" ? (
                <text
                  className="st-bulletChart__categoryLabel"
                  x={MARGIN.left - 8}
                  y={b.labelY}
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {b.datum.label}
                </text>
              ) : (
                <text
                  className="st-bulletChart__categoryLabel"
                  x={(b as { labelX?: number }).labelX ?? 0}
                  y={b.labelY}
                  textAnchor="middle"
                >
                  {b.datum.label}
                </text>
              )}
            </React.Fragment>
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hoveredBullet ? (
        <div
          className="st-bulletChart__tooltip"
          role="presentation"
          style={{
            left: `${(hoveredBullet.tooltipX / width) * 100}%`,
            top: `${(hoveredBullet.tooltipY / height) * 100}%`,
          }}
        >
          <span className="st-bulletChart__tooltipLabel">{hoveredBullet.datum.label}</span>
          <span className="st-bulletChart__tooltipValue">
            value: {hoveredBullet.datum.value} / target: {hoveredBullet.datum.target}
          </span>
        </div>
      ) : null}
    </div>
  );
}
