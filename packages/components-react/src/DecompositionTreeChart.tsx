import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";

export type DecompositionTreeNode = {
  label: string;
  value: number;
  parent?: string;
};

export type DecompositionTreeLevel = {
  dimension: string;
  nodes: DecompositionTreeNode[];
};

export type DecompositionTreeData = {
  measure: string;
  levels: DecompositionTreeLevel[];
};

export type DecompositionTreeChartProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> & {
  data: DecompositionTreeData;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  className?: string;
};

const MARGIN = { top: 16, right: 16, bottom: 16, left: 16 };
const BAR_H = 22;
const BAR_GAP = 10;
const COL_GAP = 36;
const BAR_W = 110;

const toneForLevel = (level: number): string => `category${(level % 8) + 1}`;

// Truncate a label to the bar width (approx. by char count).
function ellipsize(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  if (maxChars <= 1) return "…";
  return `${text.slice(0, maxChars - 1)}…`;
}

function formatValue(v: number): string {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

const charsFor = (w: number) => Math.max(0, Math.floor((w - 8) / 6.6));

type Cell = {
  key: string;
  label: string;
  dimension: string;
  value: number;
  level: number;
  x: number;
  y: number;
  barWidth: number;
  tone: string;
  cx: number;
  cy: number;
  parentKey: string | null;
};

type Link = {
  key: string;
  from: Cell;
  to: Cell;
};

function linkPath(link: Link): string {
  const x1 = link.from.x + link.from.barWidth;
  const y1 = link.from.cy;
  const x2 = link.to.x;
  const y2 = link.to.cy;
  const mid = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
}

export function DecompositionTreeChart({
  data,
  label,
  width,
  height = 320,
  size,
  className,
  ...rest
}: DecompositionTreeChartProps) {
  const [hoveredKey, setHoveredKey] = React.useState<string | null>(null);

  const resolvedWidth = width ?? size ?? 640;
  const colX = (level: number) => MARGIN.left + level * (BAR_W + COL_GAP);

  // Build the columns: root (column 0 = total measure), then one column per
  // level; a bar width is ∝ value relative to its level max.
  const cells: Cell[] = [];
  const links: Link[] = [];
  if (data && typeof data.measure === "string") {
    const plotTop = MARGIN.top;
    const levels = (data.levels ?? []).filter(
      (lvl) => lvl && typeof lvl.dimension === "string",
    );
    const firstLevelTotal = levels[0]
      ? levels[0].nodes
          .filter((n) => n && Number.isFinite(n.value))
          .reduce((s, n) => s + Math.max(n.value, 0), 0)
      : 0;
    const rootValue = firstLevelTotal > 0 ? firstLevelTotal : 1;

    const rootCell: Cell = {
      key: "root",
      label: data.measure,
      dimension: data.measure,
      value: rootValue,
      level: 0,
      x: colX(0),
      y: plotTop,
      barWidth: BAR_W,
      tone: toneForLevel(0),
      cx: colX(0) + BAR_W / 2,
      cy: plotTop + BAR_H / 2,
      parentKey: null,
    };
    cells.push(rootCell);

    let prevColumn: Cell[] = [rootCell];
    levels.forEach((lvl, li) => {
      const level = li + 1;
      const nodes = (lvl.nodes ?? []).filter(
        (n) => n && typeof n.label === "string" && Number.isFinite(n.value),
      );
      const levelMax = nodes.reduce((m, n) => Math.max(m, Math.max(n.value, 0)), 0) || 1;
      const x = colX(level);
      const column: Cell[] = [];
      nodes.forEach((n, ni) => {
        const y = plotTop + ni * (BAR_H + BAR_GAP);
        const barWidth = Math.max((Math.max(n.value, 0) / levelMax) * BAR_W, 2);
        const parentCell =
          (n.parent !== undefined && prevColumn.find((p) => p.label === n.parent)) ||
          prevColumn[0] ||
          null;
        const cell: Cell = {
          key: `${level}-${ni}`,
          label: n.label,
          dimension: lvl.dimension,
          value: n.value,
          level,
          x,
          y,
          barWidth,
          tone: toneForLevel(level),
          cx: x + barWidth / 2,
          cy: y + BAR_H / 2,
          parentKey: parentCell ? parentCell.key : null,
        };
        cells.push(cell);
        column.push(cell);
        if (parentCell) {
          links.push({ key: `${parentCell.key}>${cell.key}`, from: parentCell, to: cell });
        }
      });
      if (column.length > 0) prevColumn = column;
    });
  }

  const computedHeight =
    cells.length === 0
      ? height
      : Math.max(height, cells.reduce((m, c) => Math.max(m, c.y + BAR_H), MARGIN.top) + MARGIN.bottom);
  const computedWidth =
    cells.length === 0
      ? resolvedWidth
      : Math.max(resolvedWidth, cells.reduce((m, c) => Math.max(m, c.x + BAR_W), MARGIN.left) + MARGIN.right);

  const dataValueItems = cells.map((c) => `${"·".repeat(c.level)}${c.label}: ${c.value}`);

  function handlePointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredKey(null);
      return;
    }
    setHoveredKey(target.getAttribute("data-chart-key"));
  }

  const hoveredCell = hoveredKey !== null ? cells.find((c) => c.key === hoveredKey) ?? null : null;

  return (
    <div {...rest} className={classNames("st-decompositionTreeChart", className)}>
      <div
        className="st-decompositionTreeChart__visual"
        role="img"
        aria-label={label}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoveredKey(null)}
      >
        <svg
          viewBox={`0 0 ${computedWidth} ${computedHeight}`}
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          {/* smoothed parent→child links */}
          {links.map((link) => (
            <path
              key={link.key}
              className={classNames(
                "st-decompositionTreeChart__link",
                hoveredKey !== null && hoveredKey !== link.from.key && hoveredKey !== link.to.key
                  ? "st-decompositionTreeChart__link--dim"
                  : undefined,
              )}
              d={linkPath(link)}
            />
          ))}

          {/* one column per level: horizontal bar whose width ∝ value */}
          {cells.map((cell) => {
            const chars = charsFor(cell.barWidth);
            return (
              <g key={cell.key} className="st-decompositionTreeChart__node">
                <rect
                  className={classNames(
                    "st-decompositionTreeChart__bar",
                    `st-decompositionTreeChart__bar--${cell.tone}`,
                    hoveredKey !== null && hoveredKey !== cell.key
                      ? "st-decompositionTreeChart__bar--dim"
                      : undefined,
                  )}
                  x={cell.x}
                  y={cell.y}
                  width={Math.max(cell.barWidth, 2)}
                  height={BAR_H}
                  rx="2"
                  data-chart-key={cell.key}
                />
                {chars >= 2 ? (
                  <text
                    className="st-decompositionTreeChart__label"
                    x={cell.x + 4}
                    y={cell.y + BAR_H / 2}
                    dominantBaseline="central"
                  >
                    {ellipsize(cell.label, chars)}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      <ChartDataList label={label ?? "decomposition tree"} items={dataValueItems} />

      {hoveredCell ? (
        <div
          className="st-decompositionTreeChart__tooltip"
          role="presentation"
          style={{
            left: `${(hoveredCell.cx / computedWidth) * 100}%`,
            top: `${(hoveredCell.cy / computedHeight) * 100}%`,
          }}
        >
          <span className="st-decompositionTreeChart__tooltipLabel">
            {hoveredCell.dimension} · {hoveredCell.label}
          </span>
          <span className="st-decompositionTreeChart__tooltipValue">
            {formatValue(hoveredCell.value)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
