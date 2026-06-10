import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";
import { contrastTextForTone } from "./chartContrast.js";
import { GraphLegend } from "./ForceGraph.js";

export type DependencyWheelChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type DependencyWheelChartLink = {
  from: string;
  to: string;
  weight: number;
};

export type DependencyWheelChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: DependencyWheelChartLink[];
  /** Libellés d'affichage par identifiant de nœud. */
  labels?: Record<string, string>;
  /** Largeur du viewBox (défaut 480). */
  width?: number;
  /** Hauteur du viewBox (défaut 240). */
  height?: number;
  label: string;
  className?: string;
};

const TONES: DependencyWheelChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

const GAP = 0.04;
const ARC_WIDTH = 12;

function magnitude(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function polar(cx: number, cy: number, radius: number, angle: number) {
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
}

function arcPath(cx: number, cy: number, inner: number, outer: number, start: number, end: number): string {
  const large = end - start > Math.PI ? 1 : 0;
  const o0 = polar(cx, cy, outer, start);
  const o1 = polar(cx, cy, outer, end);
  const i1 = polar(cx, cy, inner, end);
  const i0 = polar(cx, cy, inner, start);
  return `M ${o0.x} ${o0.y} A ${outer} ${outer} 0 ${large} 1 ${o1.x} ${o1.y} L ${i1.x} ${i1.y} A ${inner} ${inner} 0 ${large} 0 ${i0.x} ${i0.y} Z`;
}

type ArcDatum = {
  id: string;
  tone: DependencyWheelChartTone;
  value: number;
  span: number;
  path: string;
  labelX: number;
  labelY: number;
  textColor: string;
};

type RibbonDatum = {
  index: number;
  from: string;
  to: string;
  weight: number;
  tone: DependencyWheelChartTone;
  strokeWidth: number;
  path: string;
  midX: number;
  midY: number;
};

type LegendDatum = { label: string; shape: "circle"; tone: DependencyWheelChartTone };

export function DependencyWheelChart({
  data,
  labels,
  width = 480,
  height = 240,
  label,
  className,
  ...rest
}: DependencyWheelChartProps) {
  const [hoveredLinkIndex, setHoveredLinkIndex] = React.useState<number | null>(null);

  const displayLabel = React.useCallback((id: string) => labels?.[id] ?? id, [labels]);

  const { arcs, ribbons, legend } = React.useMemo(() => {
    const cx = width / 2;
    const cy = height / 2;
    const outer = Math.max(Math.min(width, height) / 2 - 6, 1);
    const inner = Math.max(outer - ARC_WIDTH, 1);
    const ribbonRadius = Math.max(inner - 2, 0);

    const links = data
      .map((link, index) => ({ link, index, weight: magnitude(link.weight) }))
      .filter((entry) => entry.weight > 0);

    const order: string[] = [];
    const total = new Map<string, number>();
    for (const { link, weight } of links) {
      for (const id of [link.from, link.to]) {
        if (!total.has(id)) {
          total.set(id, 0);
          order.push(id);
        }
      }
      total.set(link.from, (total.get(link.from) ?? 0) + weight);
      total.set(link.to, (total.get(link.to) ?? 0) + weight);
    }

    const grandTotal = order.reduce((sum, id) => sum + (total.get(id) ?? 0), 0);
    if (order.length === 0 || grandTotal <= 0) {
      return { arcs: [] as ArcDatum[], ribbons: [] as RibbonDatum[], legend: [] as LegendDatum[] };
    }

    const totalGap = GAP * order.length;
    const usable = Math.max(Math.PI * 2 - totalGap, 0.0001);

    type ArcInfo = { tone: DependencyWheelChartTone; cursor: number };
    const arcMap = new Map<string, ArcInfo>();
    const arcsOut: ArcDatum[] = [];

    let angle = -Math.PI / 2;
    order.forEach((id, index) => {
      const span = (usable * (total.get(id) ?? 0)) / grandTotal;
      const start = angle + GAP / 2;
      const end = start + span;
      angle = end + GAP / 2;
      const tone = TONES[index % TONES.length];
      const mid = (start + end) / 2;
      arcMap.set(id, { tone, cursor: start });
      const labelRadius = (inner + outer) / 2;
      const labelPoint = polar(cx, cy, labelRadius, mid);
      arcsOut.push({
        id,
        tone,
        value: total.get(id) ?? 0,
        span,
        path: arcPath(cx, cy, inner, outer, start, end),
        labelX: labelPoint.x,
        labelY: labelPoint.y,
        textColor: contrastTextForTone(tone),
      });
    });

    const maxWeight = Math.max(1, ...links.map((entry) => entry.weight));
    const ribbonsOut: RibbonDatum[] = links.map(({ link, weight, index }) => {
      const source = arcMap.get(link.from)!;
      const target = arcMap.get(link.to)!;
      const sourceSpan = (usable * weight) / grandTotal;
      const targetSpan = (usable * weight) / grandTotal;
      const s0 = source.cursor;
      const s1 = source.cursor + sourceSpan;
      source.cursor = s1;
      const t0 = target.cursor;
      const t1 = target.cursor + targetSpan;
      target.cursor = t1;

      const ps0 = polar(cx, cy, ribbonRadius, s0);
      const ps1 = polar(cx, cy, ribbonRadius, s1);
      const pt0 = polar(cx, cy, ribbonRadius, t0);
      const pt1 = polar(cx, cy, ribbonRadius, t1);

      const path =
        `M ${ps0.x} ${ps0.y} ` +
        `Q ${cx} ${cy} ${pt1.x} ${pt1.y} ` +
        `A ${ribbonRadius} ${ribbonRadius} 0 0 1 ${pt0.x} ${pt0.y} ` +
        `Q ${cx} ${cy} ${ps1.x} ${ps1.y} ` +
        `A ${ribbonRadius} ${ribbonRadius} 0 0 0 ${ps0.x} ${ps0.y} Z`;

      return {
        index,
        from: link.from,
        to: link.to,
        weight,
        tone: source.tone,
        strokeWidth: Math.max(1, (weight / maxWeight) * 4),
        path,
        midX: cx,
        midY: cy,
      };
    });

    const legendOut: LegendDatum[] = arcsOut.map((arc) => ({
      label: displayLabel(arc.id),
      shape: "circle",
      tone: arc.tone,
    }));

    return { arcs: arcsOut, ribbons: ribbonsOut, legend: legendOut };
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

  const hoveredRibbon =
    hoveredLinkIndex !== null ? ribbons.find((r) => r.index === hoveredLinkIndex) : undefined;

  return (
    <div {...rest} className={classNames("st-dependencyWheelChart", className)}>
      <div
        className="st-dependencyWheelChart__visual"
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
          <g className="st-dependencyWheelChart__ribbons">
            {ribbons.map((ribbon) => (
              <path
                key={ribbon.index}
                className={classNames(
                  "st-dependencyWheelChart__ribbon",
                  `st-dependencyWheelChart__ribbon--${ribbon.tone}`,
                  hoveredLinkIndex !== null && hoveredLinkIndex !== ribbon.index
                    ? "st-dependencyWheelChart__ribbon--dim"
                    : undefined,
                )}
                d={ribbon.path}
                strokeWidth={ribbon.strokeWidth}
                data-link-index={ribbon.index}
              />
            ))}
          </g>

          <g className="st-dependencyWheelChart__arcs">
            {arcs.map((arc) => (
              <React.Fragment key={arc.id}>
                <path
                  className={classNames("st-dependencyWheelChart__arc", `st-dependencyWheelChart__arc--${arc.tone}`)}
                  d={arc.path}
                />
                {arc.span > 0.34 ? (
                  <text
                    className="st-dependencyWheelChart__arcLabel"
                    x={arc.labelX}
                    y={arc.labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={arc.textColor}
                  >
                    {displayLabel(arc.id)}
                  </text>
                ) : null}
              </React.Fragment>
            ))}
          </g>
        </svg>

        {legend.length > 0 ? (
          <GraphLegend className="st-dependencyWheelChart__legend" entries={legend} />
        ) : null}
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hoveredRibbon ? (
        <div
          className="st-dependencyWheelChart__tooltip"
          role="presentation"
          style={{ left: `${(hoveredRibbon.midX / width) * 100}%`, top: `${(hoveredRibbon.midY / height) * 100}%` }}
        >
          <span className="st-dependencyWheelChart__tooltipLabel">
            {displayLabel(hoveredRibbon.from)} -&gt; {displayLabel(hoveredRibbon.to)}
          </span>
          <span className="st-dependencyWheelChart__tooltipValue">{hoveredRibbon.weight}</span>
        </div>
      ) : null}
    </div>
  );
}
