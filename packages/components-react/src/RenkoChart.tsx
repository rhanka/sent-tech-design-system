import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type RenkoChartDirection = "up" | "down";

export type RenkoChartDatum = {
  /** Position temporelle (timestamp ou index) — ignorée pour l'empilement. */
  date: number;
  /** Prix de clôture : pilote la formation des briques. */
  close: number;
};

export type RenkoChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: RenkoChartDatum[];
  boxSize?: number;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  className?: string;
};

const MARGIN = { top: 16, right: 18, bottom: 36, left: 52 } as const;

export function RenkoChart({
  data,
  boxSize,
  label,
  width = 640,
  height = 320,
  size,
  className,
  ...rest
}: RenkoChartProps) {
  const [hoveredKey, setHoveredKey] = React.useState<string | null>(null);

  // Points valides : date et close finis.
  const validData = data.filter((d) => d && Number.isFinite(d.date) && Number.isFinite(d.close));

  // Taille de brique effective : `boxSize` fini > 0, sinon auto ~ (max-min)/20.
  const closes = validData.map((d) => d.close);
  const effectiveBox =
    Number.isFinite(boxSize) && (boxSize as number) > 0
      ? (boxSize as number)
      : closes.length
        ? Math.max(...closes) - Math.min(...closes) > 0
          ? (Math.max(...closes) - Math.min(...closes)) / 20
          : 1
        : 1;

  // Construit les briques Renko. Une brique par franchissement de `box` ;
  // l'inversion exige 2×box (la première brique d'un nouveau sens repart décalée).
  const bricks: { bottom: number; top: number; direction: RenkoChartDirection }[] = [];
  if (validData.length > 0 && effectiveBox > 0) {
    let base = validData[0].close;
    for (let i = 1; i < validData.length; i++) {
      const price = validData[i].close;
      while (price >= base + effectiveBox) {
        bricks.push({ bottom: base, top: base + effectiveBox, direction: "up" });
        base += effectiveBox;
      }
      while (price <= base - effectiveBox) {
        bricks.push({ bottom: base - effectiveBox, top: base, direction: "down" });
        base -= effectiveBox;
      }
    }
  }

  let priceMin: number;
  let priceMax: number;
  if (bricks.length === 0) {
    priceMin = closes.length ? Math.min(...closes) : 0;
    priceMax = closes.length ? Math.max(...closes) : 0;
  } else {
    priceMin = Infinity;
    priceMax = -Infinity;
    for (const b of bricks) {
      if (b.bottom < priceMin) priceMin = b.bottom;
      if (b.top > priceMax) priceMax = b.top;
    }
  }

  const yTicks = niceTicks(priceMin, priceMax);
  const yMin = yTicks[0];
  const yMax = yTicks[yTicks.length - 1];
  const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotH = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  // Colonnes de briques côte à côte (équidistantes) : pas d'axe temps régulier.
  const colW = bricks.length > 0 ? plotW / bricks.length : plotW;
  const brickW = colW * 0.86;
  const columns = bricks.map((b, i) => {
    const cx = MARGIN.left + colW * i + colW / 2;
    const top = MARGIN.top + scaleLinear(b.top, yMin, yMax, plotH, 0);
    const bottom = MARGIN.top + scaleLinear(b.bottom, yMin, yMax, plotH, 0);
    return {
      key: `${i}`,
      brick: b,
      x: cx - brickW / 2,
      y: Math.min(top, bottom),
      width: brickW,
      height: Math.max(Math.abs(bottom - top), 0.5),
      cx,
      cy: (top + bottom) / 2,
      direction: b.direction,
    };
  });

  const dataValueItems = columns.map(
    (c) => `${c.direction === "up" ? "▲" : "▼"} ${formatTick(c.brick.bottom)} → ${formatTick(c.brick.top)}`,
  );

  function handlePointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredKey(null);
      return;
    }
    setHoveredKey(target.getAttribute("data-chart-key"));
  }

  const hoveredColumn = hoveredKey === null ? null : columns.find((c) => c.key === hoveredKey) ?? null;

  return (
    <div {...rest} className={classNames("st-renkoChart", className)}>
      <div
        className="st-renkoChart__visual"
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
                <line className="st-renkoChart__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={y} y2={y} />
                <text className="st-renkoChart__tick" x={MARGIN.left - 6} y={y} textAnchor="end" dominantBaseline="middle">
                  {formatTick(t)}
                </text>
              </React.Fragment>
            );
          })}

          <line className="st-renkoChart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
          <line
            className="st-renkoChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {columns.map((c) => (
            <rect
              key={c.key}
              className={classNames(
                "st-renkoChart__brick",
                `st-renkoChart__brick--${c.direction}`,
                hoveredKey !== null && hoveredKey !== c.key ? "st-renkoChart__brick--dim" : undefined,
              )}
              x={c.x}
              y={c.y}
              width={c.width}
              height={c.height}
              data-chart-key={c.key}
            />
          ))}
        </svg>
      </div>

      <ChartDataList label={label ?? "renko"} items={dataValueItems} />

      {hoveredColumn ? (
        <div
          className="st-renkoChart__tooltip"
          role="presentation"
          style={{ left: `${(hoveredColumn.cx / width) * 100}%`, top: `${(hoveredColumn.cy / height) * 100}%` }}
        >
          <span className="st-renkoChart__tooltipLabel">{hoveredColumn.direction === "up" ? "▲" : "▼"}</span>
          <span className="st-renkoChart__tooltipValue">
            {formatTick(hoveredColumn.brick.bottom)} → {formatTick(hoveredColumn.brick.top)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
