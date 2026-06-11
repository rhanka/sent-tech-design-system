import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";
import { GraphLegend } from "./ForceGraph.js";

export type ArcDiagramChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ArcDiagramChartLink = {
  from: string;
  to: string;
  weight: number;
};

export type ArcDiagramChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: ArcDiagramChartLink[];
  /** Libellés d'affichage par identifiant de nœud. */
  labels?: Record<string, string>;
  /** Largeur du viewBox (défaut 480). */
  width?: number;
  /** Hauteur du viewBox (défaut 240). */
  height?: number;
  label: string;
  className?: string;
};

const TONES: ArcDiagramChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

const MARGIN_X = 24;
const BASELINE_PAD = 28;
const MIN_NODE_R = 4;
const MAX_NODE_R = 9;

function magnitude(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

type NodeDatum = {
  id: string;
  tone: ArcDiagramChartTone;
  x: number;
  r: number;
  value: number;
};

type ArcDatum = {
  index: number;
  from: string;
  to: string;
  weight: number;
  tone: ArcDiagramChartTone;
  strokeWidth: number;
  path: string;
  midX: number;
  midY: number;
};

type LegendDatum = { label: string; shape: "circle"; tone: ArcDiagramChartTone };

export function ArcDiagramChart({
  data,
  labels,
  width = 480,
  height = 240,
  label,
  className,
  ...rest
}: ArcDiagramChartProps) {
  const [hoveredLinkIndex, setHoveredLinkIndex] = React.useState<number | null>(null);

  const displayLabel = React.useCallback((id: string) => labels?.[id] ?? id, [labels]);

  const { baselineY, nodes, arcs, legend } = React.useMemo(() => {
    const baseline = height - BASELINE_PAD;

    const links = data
      .map((link, index) => ({ link, index, weight: magnitude(link.weight) }))
      .filter((entry) => entry.weight > 0);

    const order: string[] = [];
    const degree = new Map<string, number>();
    for (const { link, weight } of links) {
      for (const id of [link.from, link.to]) {
        if (!degree.has(id)) {
          degree.set(id, 0);
          order.push(id);
        }
      }
      degree.set(link.from, (degree.get(link.from) ?? 0) + weight);
      degree.set(link.to, (degree.get(link.to) ?? 0) + weight);
    }

    if (order.length === 0) {
      return {
        baselineY: baseline,
        nodes: [] as NodeDatum[],
        arcs: [] as ArcDatum[],
        legend: [] as LegendDatum[],
      };
    }

    const usable = Math.max(width - MARGIN_X * 2, 1);
    const step = order.length > 1 ? usable / (order.length - 1) : 0;
    const startX = order.length > 1 ? MARGIN_X : width / 2;

    const maxDegree = Math.max(1, ...order.map((id) => degree.get(id) ?? 0));

    const nodeX = new Map<string, number>();
    const nodeTone = new Map<string, ArcDiagramChartTone>();
    const nodesOut: NodeDatum[] = order.map((id, index) => {
      const x = startX + step * index;
      const tone = TONES[index % TONES.length];
      const value = degree.get(id) ?? 0;
      const r = MIN_NODE_R + (MAX_NODE_R - MIN_NODE_R) * (value / maxDegree);
      nodeX.set(id, x);
      nodeTone.set(id, tone);
      return { id, tone, x, r, value };
    });

    const maxWeight = Math.max(1, ...links.map((entry) => entry.weight));
    const arcsOut: ArcDatum[] = links.map(({ link, weight, index }) => {
      const x1 = nodeX.get(link.from)!;
      const x2 = nodeX.get(link.to)!;
      const left = Math.min(x1, x2);
      const right = Math.max(x1, x2);
      const radius = (right - left) / 2;
      const sweep = x1 <= x2 ? 1 : 0;
      const path = `M ${x1} ${baseline} A ${radius} ${radius} 0 0 ${sweep} ${x2} ${baseline}`;
      const tone = nodeTone.get(link.from)!;
      return {
        index,
        from: link.from,
        to: link.to,
        weight,
        tone,
        strokeWidth: Math.max(1.5, (weight / maxWeight) * 6),
        path,
        midX: (left + right) / 2,
        midY: baseline - radius,
      };
    });

    const legendOut: LegendDatum[] = nodesOut.map((node) => ({
      label: displayLabel(node.id),
      shape: "circle",
      tone: node.tone,
    }));

    return { baselineY: baseline, nodes: nodesOut, arcs: arcsOut, legend: legendOut };
  }, [data, width, height, displayLabel]);

  const dataValueItems = React.useMemo(
    () =>
      data
        .filter((link) => magnitude(link.weight) > 0)
        .map((link) => `${displayLabel(link.from)} -> ${displayLabel(link.to)}: ${link.weight}`),
    [data, displayLabel],
  );

  function handleVisualPointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredLinkIndex(null);
      return;
    }
    const index = Number(target.getAttribute("data-link-index"));
    setHoveredLinkIndex(Number.isInteger(index) ? index : null);
  }

  const hoveredArc =
    hoveredLinkIndex !== null ? arcs.find((a) => a.index === hoveredLinkIndex) : undefined;

  return (
    <div {...rest} className={classNames("st-arcDiagramChart", className)}>
      <div
        className="st-arcDiagramChart__visual"
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
          <line
            className="st-arcDiagramChart__axis"
            x1={MARGIN_X}
            y1={baselineY}
            x2={width - MARGIN_X}
            y2={baselineY}
          />

          <g className="st-arcDiagramChart__arcs">
            {arcs.map((arc) => (
              <path
                key={arc.index}
                className={classNames(
                  "st-arcDiagramChart__arc",
                  `st-arcDiagramChart__arc--${arc.tone}`,
                  hoveredLinkIndex !== null && hoveredLinkIndex !== arc.index
                    ? "st-arcDiagramChart__arc--dim"
                    : undefined,
                )}
                d={arc.path}
                strokeWidth={arc.strokeWidth}
                data-link-index={arc.index}
              />
            ))}
          </g>

          <g className="st-arcDiagramChart__nodes">
            {nodes.map((node) => (
              <circle
                key={node.id}
                className={classNames("st-arcDiagramChart__node", `st-arcDiagramChart__node--${node.tone}`)}
                cx={node.x}
                cy={baselineY}
                r={node.r}
              />
            ))}
          </g>
        </svg>

        {legend.length > 0 ? (
          <GraphLegend className="st-arcDiagramChart__legend" entries={legend} />
        ) : null}
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hoveredArc ? (
        <div
          className="st-arcDiagramChart__tooltip"
          role="presentation"
          style={{ left: `${(hoveredArc.midX / width) * 100}%`, top: `${(hoveredArc.midY / height) * 100}%` }}
        >
          <span className="st-arcDiagramChart__tooltipLabel">
            {displayLabel(hoveredArc.from)} -&gt; {displayLabel(hoveredArc.to)}
          </span>
          <span className="st-arcDiagramChart__tooltipValue">{hoveredArc.weight}</span>
        </div>
      ) : null}
    </div>
  );
}
