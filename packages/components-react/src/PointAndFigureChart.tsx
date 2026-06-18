import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type PointAndFigureChartMark = "x" | "o";

export type PointAndFigureChartDatum = {
  /** Position temporelle (timestamp ou index) — ignorée pour l'empilement. */
  date: number;
  /** Prix de clôture : pilote la formation des colonnes. */
  close: number;
};

export type PointAndFigureChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: PointAndFigureChartDatum[];
  boxSize?: number;
  reversal?: number;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  className?: string;
};

const MARGIN = { top: 16, right: 18, bottom: 36, left: 52 } as const;

export function PointAndFigureChart({
  data,
  boxSize,
  reversal = 3,
  label,
  width = 640,
  height = 320,
  size,
  className,
  ...rest
}: PointAndFigureChartProps) {
  const [hoveredKey, setHoveredKey] = React.useState<string | null>(null);

  // Points valides : date et close finis.
  const validData = data.filter((d) => d && Number.isFinite(d.date) && Number.isFinite(d.close));

  // Taille de case effective : `boxSize` fini > 0, sinon auto ~ (max-min)/20.
  const closes = validData.map((d) => d.close);
  const baseMin = closes.length ? Math.min(...closes) : 0;
  const effectiveBox =
    Number.isFinite(boxSize) && (boxSize as number) > 0
      ? (boxSize as number)
      : closes.length
        ? Math.max(...closes) - Math.min(...closes) > 0
          ? (Math.max(...closes) - Math.min(...closes)) / 20
          : 1
        : 1;

  // Nombre de cases pour inverser : entier ≥ 1 (défaut 3).
  const reversalBoxes = Math.max(1, Math.floor(Number.isFinite(reversal) ? reversal : 3));

  // Colonnes P&F : suite de X (hausse) ou de O (baisse), indices de case [low..high].
  const rawCols: { mark: PointAndFigureChartMark; low: number; high: number }[] = [];
  if (validData.length > 0 && effectiveBox > 0) {
    const boxIndex = (price: number) => Math.floor((price - baseMin) / effectiveBox + 1e-9);
    const firstBoxIndex = boxIndex(closes[0]);
    let mark: PointAndFigureChartMark | null = null;
    let low = firstBoxIndex;
    let high = firstBoxIndex;
    for (let i = 1; i < closes.length; i++) {
      const idx = boxIndex(closes[i]);
      if (mark === null) {
        if (idx >= firstBoxIndex + 1) {
          mark = "x";
          low = firstBoxIndex;
          high = idx;
        } else if (idx <= firstBoxIndex - 1) {
          mark = "o";
          low = idx;
          high = firstBoxIndex;
        }
        continue;
      }
      if (mark === "x") {
        if (idx > high) {
          high = idx;
        } else if (idx <= high - reversalBoxes) {
          rawCols.push({ mark, low, high });
          mark = "o";
          high = high - 1;
          low = idx;
        }
      } else {
        if (idx < low) {
          low = idx;
        } else if (idx >= low + reversalBoxes) {
          rawCols.push({ mark, low, high });
          mark = "x";
          low = low + 1;
          high = idx;
        }
      }
    }
    if (mark !== null && high >= low) rawCols.push({ mark, low, high });
  }
  const pnfColumns = rawCols.map((c) => ({
    mark: c.mark,
    low: c.low,
    high: c.high,
    priceLow: baseMin + c.low * effectiveBox,
    priceHigh: baseMin + (c.high + 1) * effectiveBox,
  }));

  let priceMin: number;
  let priceMax: number;
  if (pnfColumns.length === 0) {
    priceMin = closes.length ? Math.min(...closes) : 0;
    priceMax = closes.length ? Math.max(...closes) : 0;
  } else {
    priceMin = Infinity;
    priceMax = -Infinity;
    for (const c of pnfColumns) {
      if (c.priceLow < priceMin) priceMin = c.priceLow;
      if (c.priceHigh > priceMax) priceMax = c.priceHigh;
    }
  }

  const yTicks = niceTicks(priceMin, priceMax);
  const yMin = yTicks[0];
  const yMax = yTicks[yTicks.length - 1];
  const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotH = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  // Grille prix × colonnes : un glyphe par case [low..high].
  const colW = pnfColumns.length > 0 ? plotW / pnfColumns.length : plotW;
  const glyph =
    Math.min(colW, scaleLinear(effectiveBox, 0, Math.max(yMax - yMin, effectiveBox), 0, plotH)) * 0.7;
  const marks: {
    key: string;
    mark: PointAndFigureChartMark;
    cx: number;
    cy: number;
    r: number;
    priceLow: number;
    priceHigh: number;
  }[] = [];
  pnfColumns.forEach((c, ci) => {
    const cx = MARGIN.left + colW * ci + colW / 2;
    for (let b = c.low; b <= c.high; b++) {
      const priceMid = baseMin + (b + 0.5) * effectiveBox;
      const cy = MARGIN.top + scaleLinear(priceMid, yMin, yMax, plotH, 0);
      marks.push({
        key: `${ci}-${b}`,
        mark: c.mark,
        cx,
        cy,
        r: Math.max(glyph / 2, 2),
        priceLow: c.priceLow,
        priceHigh: c.priceHigh,
      });
    }
  });

  const dataValueItems = pnfColumns.map(
    (c) => `${c.mark === "x" ? "X" : "O"} ${formatTick(c.priceLow)} → ${formatTick(c.priceHigh)}`,
  );

  function handlePointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredKey(null);
      return;
    }
    setHoveredKey(target.getAttribute("data-chart-key"));
  }

  const hoveredMark = hoveredKey === null ? null : marks.find((m) => m.key === hoveredKey) ?? null;

  return (
    <div {...rest} className={classNames("st-pointAndFigureChart", className)}>
      <div
        className="st-pointAndFigureChart__visual"
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
                <line
                  className="st-pointAndFigureChart__grid"
                  x1={MARGIN.left}
                  x2={width - MARGIN.right}
                  y1={y}
                  y2={y}
                />
                <text
                  className="st-pointAndFigureChart__tick"
                  x={MARGIN.left - 6}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {formatTick(t)}
                </text>
              </React.Fragment>
            );
          })}

          <line
            className="st-pointAndFigureChart__axis"
            x1={MARGIN.left}
            x2={MARGIN.left}
            y1={MARGIN.top}
            y2={height - MARGIN.bottom}
          />
          <line
            className="st-pointAndFigureChart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          {marks.map((m) =>
            m.mark === "x" ? (
              <g
                key={m.key}
                className={classNames(
                  "st-pointAndFigureChart__mark",
                  "st-pointAndFigureChart__mark--x",
                  hoveredKey !== null && hoveredKey !== m.key ? "st-pointAndFigureChart__mark--dim" : undefined,
                )}
                data-chart-key={m.key}
              >
                <line
                  className="st-pointAndFigureChart__glyph"
                  x1={m.cx - m.r}
                  y1={m.cy - m.r}
                  x2={m.cx + m.r}
                  y2={m.cy + m.r}
                  data-chart-key={m.key}
                />
                <line
                  className="st-pointAndFigureChart__glyph"
                  x1={m.cx - m.r}
                  y1={m.cy + m.r}
                  x2={m.cx + m.r}
                  y2={m.cy - m.r}
                  data-chart-key={m.key}
                />
              </g>
            ) : (
              <circle
                key={m.key}
                className={classNames(
                  "st-pointAndFigureChart__mark",
                  "st-pointAndFigureChart__mark--o",
                  "st-pointAndFigureChart__glyph",
                  hoveredKey !== null && hoveredKey !== m.key ? "st-pointAndFigureChart__mark--dim" : undefined,
                )}
                cx={m.cx}
                cy={m.cy}
                r={m.r}
                data-chart-key={m.key}
              />
            ),
          )}
        </svg>
      </div>

      <ChartDataList label={label ?? "point and figure"} items={dataValueItems} />

      {hoveredMark ? (
        <div
          className="st-pointAndFigureChart__tooltip"
          role="presentation"
          style={{ left: `${(hoveredMark.cx / width) * 100}%`, top: `${(hoveredMark.cy / height) * 100}%` }}
        >
          <span className="st-pointAndFigureChart__tooltipLabel">{hoveredMark.mark === "x" ? "X" : "O"}</span>
          <span className="st-pointAndFigureChart__tooltipValue">
            {formatTick(hoveredMark.priceLow)} → {formatTick(hoveredMark.priceHigh)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
