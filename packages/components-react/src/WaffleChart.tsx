import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";

export type WaffleTone =
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

export type WaffleChartDatum = {
  label: string;
  value: number;
  tone?: WaffleTone;
};

export type WaffleChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: WaffleChartDatum[];
  totalCells?: number;
  columns?: number;
  label?: string;
  size?: number;
  className?: string;
};

const GAP = 2;

export function WaffleChart({
  data = [],
  totalCells = 100,
  columns = 10,
  label,
  size = 240,
  className,
  ...rest
}: WaffleChartProps) {
  const safeTotalCells = Math.max(Math.round(totalCells), 1);
  const safeColumns = Math.max(Math.round(columns), 1);
  const rowsCount = Math.ceil(safeTotalCells / safeColumns);

  // Normalise: drop unlabeled categories and non-finite/≤0 values.
  const validData = data.filter(
    (d) => typeof d.label === "string" && d.label.length > 0 && Number.isFinite(d.value) && d.value > 0,
  );

  const total = validData.reduce((sum, d) => sum + d.value, 0);

  const toneOf = (datum: WaffleChartDatum, index: number): WaffleTone =>
    datum.tone ?? (`category${(index % 8) + 1}` as WaffleTone);

  // Allocate safeTotalCells cells: each category occupies
  // round(value / total * safeTotalCells) consecutive cells.
  const allocation: { datum: WaffleChartDatum; tone: WaffleTone; cells: number; index: number }[] = [];
  if (total > 0) {
    let used = 0;
    for (let index = 0; index < validData.length; index++) {
      const datum = validData[index];
      const cells = Math.round((datum.value / total) * safeTotalCells);
      allocation.push({ datum, tone: toneOf(datum, index), cells, index });
      used += cells;
    }
    const overflow = used - safeTotalCells;
    if (overflow !== 0 && allocation.length > 0) {
      const last = allocation[allocation.length - 1];
      last.cells = Math.max(0, last.cells - overflow);
    }
  }

  // Flatten into a per-cell tone sequence (neutral track beyond the data).
  const cellTones: (WaffleTone | null)[] = [];
  for (const a of allocation) {
    for (let i = 0; i < a.cells && cellTones.length < safeTotalCells; i++) {
      cellTones.push(a.tone);
    }
  }
  while (cellTones.length < safeTotalCells) cellTones.push(null);

  const cellSize = (size - GAP * (safeColumns - 1)) / safeColumns;
  const cells = cellTones.map((tone, index) => {
    const col = index % safeColumns;
    // Fill from the bottom up (row 0 = bottom).
    const rowFromTop = rowsCount - 1 - Math.floor(index / safeColumns);
    return {
      index,
      tone,
      x: col * (cellSize + GAP),
      y: rowFromTop * (cellSize + GAP),
      size: Math.max(cellSize, 1),
    };
  });

  const svgHeight = rowsCount > 0 ? rowsCount * cellSize + GAP * (rowsCount - 1) : size;

  const legendItems = allocation.map((a) => ({
    label: a.datum.label,
    tone: a.tone,
    percent: total > 0 ? Math.round((a.datum.value / total) * 100) : 0,
  }));
  const hasLegend = allocation.length > 0;

  const dataValueItems = allocation.map(
    (a) => `${a.datum.label}: ${a.datum.value} (${total > 0 ? Math.round((a.datum.value / total) * 100) : 0}%)`,
  );

  return (
    <div {...rest} className={classNames("st-waffleChart", className)}>
      <div className="st-waffleChart__visual" role="img" aria-label={label}>
        <svg
          viewBox={`0 0 ${size} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          {cells.map((cell) => (
            <rect
              key={cell.index}
              className={
                cell.tone
                  ? `st-waffleChart__cell st-waffleChart__cell--${cell.tone}`
                  : "st-waffleChart__cell st-waffleChart__cell--track"
              }
              x={cell.x}
              y={cell.y}
              width={cell.size}
              height={cell.size}
              rx="2"
            />
          ))}
        </svg>
      </div>

      {hasLegend ? (
        <ul className="st-waffleChart__legend" aria-label={`Catégories de ${label ?? "waffle"}`}>
          {legendItems.map((item) => (
            <li key={item.label} className="st-waffleChart__legendItem">
              <span
                className={`st-waffleChart__legendSwatch st-waffleChart__legendSwatch--${item.tone}`}
                aria-hidden="true"
              />
              {item.label} · {item.percent}%
            </li>
          ))}
        </ul>
      ) : null}

      <ChartDataList label={label ?? "waffle"} items={dataValueItems} />
    </div>
  );
}
