import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";

export type SankeyChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type SankeyChartNode = {
  id: string;
  label: string;
  tone?: SankeyChartTone;
};

export type SankeyChartLink = {
  source: string;
  target: string;
  value: number;
  tone?: SankeyChartTone;
};

export type SankeyChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  nodes: SankeyChartNode[];
  links: SankeyChartLink[];
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

const MARGIN = { top: 18, right: 26, bottom: 18, left: 26 } as const;
const NODE_WIDTH = 14;
const TONES: SankeyChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

function magnitude(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function buildDepths(nodes: SankeyChartNode[], links: SankeyChartLink[]): Map<string, number> {
  const depths = new Map(nodes.map((node) => [node.id, 0]));
  for (let pass = 0; pass < nodes.length; pass += 1) {
    let changed = false;
    for (const link of links) {
      const sourceDepth = depths.get(link.source) ?? 0;
      const targetDepth = depths.get(link.target) ?? 0;
      if (sourceDepth + 1 > targetDepth) {
        depths.set(link.target, sourceDepth + 1);
        changed = true;
      }
    }
    if (!changed) break;
  }
  return depths;
}

export function SankeyChart({ nodes, links, width = 560, height = 280, label, className, ...rest }: SankeyChartProps) {
  const [hoveredLinkIndex, setHoveredLinkIndex] = React.useState<number | null>(null);

  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  // Conservation de flux : hauteur nœud = max(Σ flux sortants, Σ flux entrants)
  const valueOut = new Map<string, number>();
  const valueIn = new Map<string, number>();
  nodes.forEach((node) => {
    valueOut.set(node.id, 0);
    valueIn.set(node.id, 0);
  });
  links.forEach((link) => {
    const v = magnitude(link.value);
    valueOut.set(link.source, (valueOut.get(link.source) ?? 0) + v);
    valueIn.set(link.target, (valueIn.get(link.target) ?? 0) + v);
  });
  const nodeValues = new Map<string, number>();
  nodes.forEach((node) => {
    nodeValues.set(node.id, Math.max(valueOut.get(node.id) ?? 0, valueIn.get(node.id) ?? 0));
  });

  const depths = buildDepths(nodes, links);
  const maxDepth = Math.max(0, ...nodes.map((node) => depths.get(node.id) ?? 0));
  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right - NODE_WIDTH, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
  const maxNodeValue = Math.max(1, ...Array.from(nodeValues.values()));

  const byDepth = new Map<number, SankeyChartNode[]>();
  nodes.forEach((node) => {
    const depth = depths.get(node.id) ?? 0;
    const bucket = byDepth.get(depth) ?? [];
    bucket.push(node);
    byDepth.set(depth, bucket);
  });

  const positionedNodes = nodes.map((node, index) => {
    const depth = depths.get(node.id) ?? 0;
    const bucket = byDepth.get(depth) ?? [node];
    const row = Math.max(0, bucket.findIndex((entry) => entry.id === node.id));
    const slot = plotHeight / Math.max(bucket.length, 1);
    const nodeHeight = Math.max(24, Math.min(slot * 0.72, 18 + ((nodeValues.get(node.id) ?? 0) / maxNodeValue) * 54));
    const x = MARGIN.left + (maxDepth === 0 ? plotWidth / 2 : (plotWidth * depth) / maxDepth);
    const y = MARGIN.top + slot * row + (slot - nodeHeight) / 2;
    const tone = node.tone ?? TONES[index % TONES.length];
    return {
      node,
      tone,
      x,
      y,
      width: NODE_WIDTH,
      height: nodeHeight,
      centerY: y + nodeHeight / 2,
    };
  });

  const positionedById = new Map(positionedNodes.map((pn) => [pn.node.id, pn]));
  const maxLinkValue = Math.max(1, ...links.map((link) => magnitude(link.value)));

  const positionedLinks = links.map((link, index) => {
    const source = positionedById.get(link.source);
    const target = positionedById.get(link.target);
    const fallbackY = MARGIN.top + plotHeight / 2;
    const x1 = (source?.x ?? MARGIN.left) + NODE_WIDTH;
    const y1 = source?.centerY ?? fallbackY;
    const x2 = target?.x ?? width - MARGIN.right;
    const y2 = target?.centerY ?? fallbackY;
    const c = Math.max(32, Math.abs(x2 - x1) * 0.5);
    return {
      link,
      source,
      target,
      tone: link.tone ?? source?.tone ?? TONES[index % TONES.length],
      strokeWidth: Math.max(2, (magnitude(link.value) / maxLinkValue) * 18),
      path: `M ${x1} ${y1} C ${x1 + c} ${y1}, ${x2 - c} ${y2}, ${x2} ${y2}`,
      midX: (x1 + x2) / 2,
      midY: (y1 + y2) / 2,
    };
  });

  const dataValueItems = links.map((link) => {
    const sourceLabel = nodeById.get(link.source)?.label ?? link.source;
    const targetLabel = nodeById.get(link.target)?.label ?? link.target;
    return `${sourceLabel} -> ${targetLabel}: ${link.value}`;
  });

  function handleVisualPointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredLinkIndex(null);
      return;
    }
    const index = Number(target.getAttribute("data-link-index"));
    setHoveredLinkIndex(Number.isInteger(index) ? index : null);
  }

  const hoveredFlow = hoveredLinkIndex !== null ? positionedLinks[hoveredLinkIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-sankeyChart", className)}>
      <div
        className="st-sankeyChart__visual"
        role="img"
        aria-label={label}
        onPointerMove={handleVisualPointerMove}
        onPointerLeave={() => setHoveredLinkIndex(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          <g className="st-sankeyChart__links">
            {positionedLinks.map((flow, i) => (
              <path
                key={`${flow.link.source}-${flow.link.target}-${i}`}
                className={classNames(
                  "st-sankeyChart__link",
                  `st-sankeyChart__link--${flow.tone}`,
                  hoveredLinkIndex !== null && hoveredLinkIndex !== i ? "st-sankeyChart__link--dim" : undefined,
                )}
                d={flow.path}
                strokeWidth={flow.strokeWidth}
                data-link-index={i}
              />
            ))}
          </g>
          <g className="st-sankeyChart__nodes">
            {positionedNodes.map((entry) => (
              <React.Fragment key={entry.node.id}>
                <rect
                  className={classNames("st-sankeyChart__node", `st-sankeyChart__node--${entry.tone}`)}
                  x={entry.x}
                  y={entry.y}
                  width={entry.width}
                  height={entry.height}
                  rx="2"
                />
                <text
                  className="st-sankeyChart__nodeLabel"
                  x={entry.x + entry.width + 6}
                  y={entry.centerY}
                  dominantBaseline="middle"
                >
                  {entry.node.label}
                </text>
              </React.Fragment>
            ))}
          </g>
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hoveredFlow ? (
        <div
          className="st-sankeyChart__tooltip"
          role="presentation"
          style={{ left: `${(hoveredFlow.midX / width) * 100}%`, top: `${(hoveredFlow.midY / height) * 100}%` }}
        >
          <span className="st-sankeyChart__tooltipLabel">
            {hoveredFlow.source?.node.label ?? hoveredFlow.link.source}
            {" -> "}
            {hoveredFlow.target?.node.label ?? hoveredFlow.link.target}
          </span>
          <span className="st-sankeyChart__tooltipValue">{hoveredFlow.link.value}</span>
        </div>
      ) : null}
    </div>
  );
}
