import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";
import { contrastTextForTone } from "./chartContrast.js";

export type ChordDiagramTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ChordDiagramFlow = {
  from: string;
  to: string;
  value: number;
};

export type ChordDiagramProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: ChordDiagramFlow[];
  /** Libellés d'affichage par identifiant de nœud. */
  labels?: Record<string, string>;
  /** Largeur du viewBox (défaut 360). */
  width?: number;
  /** Hauteur du viewBox (défaut 360). */
  height?: number;
  label: string;
  className?: string;
};

const TONES: ChordDiagramTone[] = [
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
const ARC_WIDTH = 14;

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
  tone: ChordDiagramTone;
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
  value: number;
  tone: ChordDiagramTone;
  strokeWidth: number;
  path: string;
  midX: number;
  midY: number;
};

export function ChordDiagram({
  data,
  labels,
  width = 360,
  height = 360,
  label,
  className,
  ...rest
}: ChordDiagramProps) {
  const [hoveredFlowIndex, setHoveredFlowIndex] = React.useState<number | null>(null);

  const displayLabel = React.useCallback((id: string) => labels?.[id] ?? id, [labels]);

  const { arcs, ribbons } = React.useMemo(() => {
    const cx = width / 2;
    const cy = height / 2;
    const outer = Math.max(Math.min(width, height) / 2 - 6, 1);
    const inner = Math.max(outer - ARC_WIDTH, 1);
    const ribbonRadius = Math.max(inner - 2, 0);

    const flows = data
      .map((flow, index) => ({ flow, index, value: magnitude(flow.value) }))
      .filter((entry) => entry.value > 0);

    const order: string[] = [];
    const total = new Map<string, number>();
    for (const { flow, value } of flows) {
      for (const id of [flow.from, flow.to]) {
        if (!total.has(id)) {
          total.set(id, 0);
          order.push(id);
        }
      }
      total.set(flow.from, (total.get(flow.from) ?? 0) + value);
      total.set(flow.to, (total.get(flow.to) ?? 0) + value);
    }

    const grandTotal = order.reduce((sum, id) => sum + (total.get(id) ?? 0), 0);
    if (order.length === 0 || grandTotal <= 0) {
      return { arcs: [] as ArcDatum[], ribbons: [] as RibbonDatum[] };
    }

    const totalGap = GAP * order.length;
    const usable = Math.max(Math.PI * 2 - totalGap, 0.0001);

    type ArcInfo = { tone: ChordDiagramTone; start: number; end: number; cursor: number };
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
      arcMap.set(id, { tone, start, end, cursor: start });
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

    const maxValue = Math.max(1, ...flows.map((entry) => entry.value));
    const ribbonsOut: RibbonDatum[] = flows.map(({ flow, value, index }) => {
      const source = arcMap.get(flow.from)!;
      const target = arcMap.get(flow.to)!;
      const sourceSpan = (usable * value) / grandTotal;
      const targetSpan = (usable * value) / grandTotal;
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
        from: flow.from,
        to: flow.to,
        value,
        tone: source.tone,
        strokeWidth: Math.max(1, (value / maxValue) * 4),
        path,
        midX: cx,
        midY: cy,
      };
    });

    return { arcs: arcsOut, ribbons: ribbonsOut };
  }, [data, width, height]);

  const dataValueItems = React.useMemo(
    () =>
      data
        .filter((flow) => magnitude(flow.value) > 0)
        .map((flow) => `${displayLabel(flow.from)} -> ${displayLabel(flow.to)}: ${flow.value}`),
    [data, displayLabel],
  );

  function handleVisualPointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredFlowIndex(null);
      return;
    }
    const index = Number(target.getAttribute("data-flow-index"));
    setHoveredFlowIndex(Number.isInteger(index) ? index : null);
  }

  const hoveredRibbon =
    hoveredFlowIndex !== null ? ribbons.find((r) => r.index === hoveredFlowIndex) : undefined;

  return (
    <div {...rest} className={classNames("st-chordDiagram", className)}>
      <div
        className="st-chordDiagram__visual"
        role="img"
        aria-label={label}
        onPointerMove={handleVisualPointerMove}
        onPointerLeave={() => setHoveredFlowIndex(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          <g className="st-chordDiagram__ribbons">
            {ribbons.map((ribbon) => (
              <path
                key={ribbon.index}
                className={classNames(
                  "st-chordDiagram__ribbon",
                  `st-chordDiagram__ribbon--${ribbon.tone}`,
                  hoveredFlowIndex !== null && hoveredFlowIndex !== ribbon.index
                    ? "st-chordDiagram__ribbon--dim"
                    : undefined,
                )}
                d={ribbon.path}
                strokeWidth={ribbon.strokeWidth}
                data-flow-index={ribbon.index}
              />
            ))}
          </g>

          <g className="st-chordDiagram__arcs">
            {arcs.map((arc) => (
              <React.Fragment key={arc.id}>
                <path className={classNames("st-chordDiagram__arc", `st-chordDiagram__arc--${arc.tone}`)} d={arc.path} />
                {arc.span > 0.34 ? (
                  <text
                    className="st-chordDiagram__arcLabel"
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
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hoveredRibbon ? (
        <div
          className="st-chordDiagram__tooltip"
          role="presentation"
          style={{ left: `${(hoveredRibbon.midX / width) * 100}%`, top: `${(hoveredRibbon.midY / height) * 100}%` }}
        >
          <span className="st-chordDiagram__tooltipLabel">
            {displayLabel(hoveredRibbon.from)} -&gt; {displayLabel(hoveredRibbon.to)}
          </span>
          <span className="st-chordDiagram__tooltipValue">{hoveredRibbon.value}</span>
        </div>
      ) : null}
    </div>
  );
}
