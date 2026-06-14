import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";

export type RibbonChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type RibbonChartDatum = {
  category: string;
  period: string | number;
  value: number;
  tone?: RibbonChartTone;
};

export type RibbonChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: RibbonChartDatum[];
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  className?: string;
};

const MARGIN = { top: 16, right: 16, bottom: 32, left: 16 };
const RIBBON_SMOOTH = 0.4;

const TONES: RibbonChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

type Segment = {
  key: string;
  category: string;
  value: number;
  tone: RibbonChartTone;
  x: number;
  width: number;
  yTop: number;
  yBottom: number;
  cx: number;
  cy: number;
};

type Column = {
  period: string | number;
  index: number;
  cx: number;
  segments: Segment[];
};

type Ribbon = { key: string; category: string; tone: RibbonChartTone; d: string };

export function RibbonChart({
  data = [],
  label,
  width,
  height = 300,
  size,
  className,
  ...rest
}: RibbonChartProps) {
  const [hoveredKey, setHoveredKey] = React.useState<string | null>(null);

  const resolvedWidth = width ?? size ?? 520;
  const plotWidth = Math.max(resolvedWidth - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

  // Normalise: drop unlabeled categories and non-finite / negative values.
  const validData = data.filter(
    (d) =>
      typeof d.category === "string" &&
      d.category.length > 0 &&
      Number.isFinite(d.value) &&
      d.value >= 0,
  );

  // Distinct periods (first-seen order), stacked columns left to right.
  const periodOrder: (string | number)[] = [];
  for (const d of validData) {
    if (!periodOrder.includes(d.period)) periodOrder.push(d.period);
  }

  // Distinct categories (first-seen order) → categoryN index (1..8, cycled) when
  // no explicit `tone`. An explicit `tone` on a datum wins over derivation.
  const categoryOrder: string[] = [];
  const explicitToneByCategory = new Map<string, RibbonChartTone>();
  for (const d of validData) {
    if (!categoryOrder.includes(d.category)) categoryOrder.push(d.category);
    if (d.tone) explicitToneByCategory.set(d.category, d.tone);
  }
  const toneOf = (category: string): RibbonChartTone => {
    const explicit = explicitToneByCategory.get(category);
    if (explicit) return explicit;
    const idx = categoryOrder.indexOf(category);
    return `category${((idx < 0 ? 0 : idx) % 8) + 1}` as RibbonChartTone;
  };

  // Per-period stacking: segments SORTED by descending value (rank), the largest
  // category at the foot. Each segment keeps its top/bottom y for ribbon paths.
  const columns: Column[] = (() => {
    if (validData.length === 0 || periodOrder.length === 0) return [];
    const band = plotWidth / periodOrder.length;
    const barWidth = Math.min(band * 0.5, 72);
    const totals = periodOrder.map((p) =>
      validData.filter((d) => d.period === p).reduce((s, d) => s + Math.max(d.value, 0), 0),
    );
    const domainMax = Math.max(1, ...totals);
    return periodOrder.map((period, pi) => {
      const x = MARGIN.left + band * pi + (band - barWidth) / 2;
      const rows = validData
        .filter((d) => d.period === period)
        .map((d) => ({ category: d.category, value: Math.max(d.value, 0) }))
        .sort((a, b) => b.value - a.value);
      let acc = 0;
      const segments: Segment[] = rows.map((row, ri) => {
        const h = (row.value / domainMax) * plotHeight;
        const yBottom = MARGIN.top + plotHeight - acc;
        const yTop = yBottom - h;
        acc += h;
        return {
          key: `${pi}-${ri}-${row.category}`,
          category: row.category,
          value: row.value,
          tone: toneOf(row.category),
          x,
          width: barWidth,
          yTop,
          yBottom,
          cx: x + barWidth / 2,
          cy: yTop + (yBottom - yTop) / 2,
        };
      });
      return { period, index: pi, cx: MARGIN.left + band * (pi + 0.5), segments };
    });
  })();

  // Ribbons: for each category present in two consecutive periods, a smoothed
  // band connecting the left segment (right edge) to the right one (left edge).
  const ribbons: Ribbon[] = (() => {
    const out: Ribbon[] = [];
    for (let ci = 0; ci < columns.length - 1; ci++) {
      const left = columns[ci];
      const right = columns[ci + 1];
      for (const ls of left.segments) {
        const rs = right.segments.find((s) => s.category === ls.category);
        if (!rs) continue;
        const x0 = ls.x + ls.width;
        const x1 = rs.x;
        const mid = x0 + (x1 - x0) * RIBBON_SMOOTH;
        const mid2 = x1 - (x1 - x0) * RIBBON_SMOOTH;
        const d =
          `M${x0.toFixed(2)},${ls.yTop.toFixed(2)} ` +
          `C${mid.toFixed(2)},${ls.yTop.toFixed(2)} ${mid2.toFixed(2)},${rs.yTop.toFixed(2)} ${x1.toFixed(2)},${rs.yTop.toFixed(2)} ` +
          `L${x1.toFixed(2)},${rs.yBottom.toFixed(2)} ` +
          `C${mid2.toFixed(2)},${rs.yBottom.toFixed(2)} ${mid.toFixed(2)},${ls.yBottom.toFixed(2)} ${x0.toFixed(2)},${ls.yBottom.toFixed(2)} Z`;
        out.push({ key: `${ci}-${ls.category}`, category: ls.category, tone: ls.tone, d });
      }
    }
    return out;
  })();

  const legendItems = categoryOrder.map((category) => ({ category, tone: toneOf(category) }));
  const hasLegend = categoryOrder.length > 0;

  const dataValueItems = categoryOrder.map(
    (category) =>
      `${category}: ${periodOrder
        .map((p) => {
          const found = validData.find((d) => d.category === category && d.period === p);
          return `${p} = ${found ? found.value : 0}`;
        })
        .join(", ")}`,
  );

  function handlePointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredKey(null);
      return;
    }
    setHoveredKey(target.getAttribute("data-chart-key"));
  }

  let hoveredSegment: Segment | null = null;
  if (hoveredKey !== null) {
    for (const col of columns) {
      for (const seg of col.segments) {
        if (seg.key === hoveredKey) hoveredSegment = seg;
      }
    }
  }

  return (
    <div {...rest} className={classNames("st-ribbonChart", className)}>
      <div
        className="st-ribbonChart__visual"
        role="img"
        aria-label={label}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoveredKey(null)}
      >
        <svg
          viewBox={`0 0 ${resolvedWidth} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          {/* inter-period ribbons (beneath the segments) */}
          {ribbons.map((ribbon) => (
            <path
              key={ribbon.key}
              className={classNames(
                "st-ribbonChart__ribbon",
                `st-ribbonChart__ribbon--${ribbon.tone}`,
                hoveredSegment !== null && hoveredSegment.category !== ribbon.category
                  ? "st-ribbonChart__ribbon--dim"
                  : undefined,
              )}
              d={ribbon.d}
            />
          ))}

          {/* per-period stacked segments */}
          {columns.map((col) => (
            <React.Fragment key={col.index}>
              <text
                className="st-ribbonChart__periodLabel"
                x={col.cx}
                y={height - MARGIN.bottom + 16}
                textAnchor="middle"
              >
                {col.period}
              </text>
              {col.segments.map((seg) => (
                <rect
                  key={seg.key}
                  className={classNames(
                    "st-ribbonChart__seg",
                    `st-ribbonChart__seg--${seg.tone}`,
                    hoveredSegment !== null && hoveredSegment.category !== seg.category
                      ? "st-ribbonChart__seg--dim"
                      : undefined,
                  )}
                  x={seg.x}
                  y={seg.yTop}
                  width={seg.width}
                  height={Math.max(seg.yBottom - seg.yTop, 0)}
                  rx="2"
                  data-chart-key={seg.key}
                />
              ))}
            </React.Fragment>
          ))}
        </svg>
      </div>

      {hasLegend ? (
        <ul className="st-ribbonChart__legend" aria-label={`Catégories de ${label ?? "ribbon"}`}>
          {legendItems.map((item) => (
            <li key={item.category} className="st-ribbonChart__legendItem">
              <span
                className={`st-ribbonChart__legendSwatch st-ribbonChart__legendSwatch--${item.tone}`}
                aria-hidden="true"
              />
              {item.category}
            </li>
          ))}
        </ul>
      ) : null}

      <ChartDataList label={label ?? "ribbon"} items={dataValueItems} />

      {hoveredSegment ? (
        <div
          className="st-ribbonChart__tooltip"
          role="presentation"
          style={{
            left: `${(hoveredSegment.cx / resolvedWidth) * 100}%`,
            top: `${(hoveredSegment.cy / height) * 100}%`,
          }}
        >
          <span className="st-ribbonChart__tooltipLabel">{hoveredSegment.category}</span>
          <span className="st-ribbonChart__tooltipValue">{hoveredSegment.value}</span>
        </div>
      ) : null}
    </div>
  );
}
