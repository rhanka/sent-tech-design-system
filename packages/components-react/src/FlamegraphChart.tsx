import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";

export type FlamegraphNode = {
  name: string;
  value: number;
  children?: FlamegraphNode[];
};

export type FlamegraphChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: FlamegraphNode;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  className?: string;
};

const MARGIN = { top: 16, right: 16, bottom: 16, left: 16 };
const ROW_H = 26;
const ROW_GAP = 2;

const toneForDepth = (depth: number): string => `category${(depth % 8) + 1}`;

// Truncate a label to the rectangle width (approx. by char count).
function ellipsize(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  if (maxChars <= 1) return "…";
  return `${text.slice(0, maxChars - 1)}…`;
}

const charsFor = (w: number) => Math.max(0, Math.floor((w - 8) / 6.6));

type Cell = {
  key: string;
  name: string;
  value: number;
  depth: number;
  x: number;
  y: number;
  width: number;
  tone: string;
  cx: number;
  cy: number;
};

export function FlamegraphChart({
  data,
  label,
  width,
  height = 320,
  size,
  className,
  ...rest
}: FlamegraphChartProps) {
  const [hoveredKey, setHoveredKey] = React.useState<string | null>(null);

  const resolvedWidth = width ?? size ?? 640;
  const plotWidth = Math.max(resolvedWidth - MARGIN.left - MARGIN.right, 1);

  // Recursive icicle layout: the root spans `plotWidth`; each child occupies a
  // `value/sum(siblings)` fraction of its parent's width. y = depth × row pitch.
  const cells: Cell[] = [];
  if (data && typeof data.name === "string" && Number.isFinite(data.value)) {
    const walk = (node: FlamegraphNode, depth: number, x0: number, w: number, path: string) => {
      if (w <= 0) return;
      const y = MARGIN.top + depth * (ROW_H + ROW_GAP);
      cells.push({
        key: path,
        name: node.name,
        value: node.value,
        depth,
        x: x0,
        y,
        width: w,
        tone: toneForDepth(depth),
        cx: x0 + w / 2,
        cy: y + ROW_H / 2,
      });
      const kids = (node.children ?? []).filter(
        (c) => c && typeof c.name === "string" && Number.isFinite(c.value) && c.value > 0,
      );
      if (kids.length === 0) return;
      const total = kids.reduce((s, c) => s + Math.max(c.value, 0), 0);
      if (total <= 0) return;
      let cursor = x0;
      kids.forEach((child, ci) => {
        const cw = (Math.max(child.value, 0) / total) * w;
        walk(child, depth + 1, cursor, cw, `${path}.${ci}`);
        cursor += cw;
      });
    };
    walk(data, 0, MARGIN.left, plotWidth, "0");
  }

  const maxDepth = cells.reduce((m, c) => Math.max(m, c.depth), 0);
  const computedHeight =
    cells.length === 0
      ? height
      : Math.max(height, MARGIN.top + (maxDepth + 1) * (ROW_H + ROW_GAP) - ROW_GAP + MARGIN.bottom);

  const dataValueItems = cells.map((c) => `${"·".repeat(c.depth)}${c.name}: ${c.value}`);

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
    <div {...rest} className={classNames("st-flamegraphChart", className)}>
      <div
        className="st-flamegraphChart__visual"
        role="img"
        aria-label={label}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoveredKey(null)}
      >
        <svg
          viewBox={`0 0 ${resolvedWidth} ${computedHeight}`}
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          {/* one row per depth: rectangle whose width ∝ value */}
          {cells.map((cell) => {
            const chars = charsFor(cell.width);
            return (
              <g key={cell.key} className="st-flamegraphChart__node">
                <rect
                  className={classNames(
                    "st-flamegraphChart__frame",
                    `st-flamegraphChart__frame--${cell.tone}`,
                    hoveredKey !== null && hoveredKey !== cell.key
                      ? "st-flamegraphChart__frame--dim"
                      : undefined,
                  )}
                  x={cell.x}
                  y={cell.y}
                  width={Math.max(cell.width, 1)}
                  height={ROW_H}
                  rx="2"
                  data-chart-key={cell.key}
                />
                {chars >= 2 ? (
                  <text
                    className="st-flamegraphChart__label"
                    x={cell.x + 4}
                    y={cell.y + ROW_H / 2}
                    dominantBaseline="central"
                  >
                    {ellipsize(cell.name, chars)}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      <ChartDataList label={label ?? "flamegraph"} items={dataValueItems} />

      {hoveredCell ? (
        <div
          className="st-flamegraphChart__tooltip"
          role="presentation"
          style={{
            left: `${(hoveredCell.cx / resolvedWidth) * 100}%`,
            top: `${(hoveredCell.cy / computedHeight) * 100}%`,
          }}
        >
          <span className="st-flamegraphChart__tooltipLabel">{hoveredCell.name}</span>
          <span className="st-flamegraphChart__tooltipValue">{hoveredCell.value}</span>
        </div>
      ) : null}
    </div>
  );
}
