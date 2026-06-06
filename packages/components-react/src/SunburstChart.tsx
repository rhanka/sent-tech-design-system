import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";
import { contrastTextForTone } from "./chartContrast.js";

export type SunburstChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type SunburstChartDatum = {
  label: string;
  value?: number;
  tone?: SunburstChartTone;
  children?: SunburstChartDatum[];
};

export type SunburstChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: SunburstChartDatum;
  /** Largeur du viewBox (défaut 320). */
  width?: number;
  /** Hauteur du viewBox (défaut 320). */
  height?: number;
  legend?: boolean;
  label: string;
  className?: string;
};

const TONES: SunburstChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

type ArcDatum = {
  datum: SunburstChartDatum;
  pathLabel: string[];
  value: number;
  tone: SunburstChartTone;
  depth: number;
  start: number;
  end: number;
  path: string;
  labelX: number;
  labelY: number;
};

function leafValue(value: number | undefined): number {
  return Number.isFinite(value) && (value ?? 0) > 0 ? (value as number) : 0;
}

function sumValue(node: SunburstChartDatum): number {
  if (node.children && node.children.length > 0) {
    return node.children.reduce((sum, child) => sum + sumValue(child), 0);
  }
  return leafValue(node.value);
}

function maxDepth(node: SunburstChartDatum, depth = 0): number {
  if (!node.children || node.children.length === 0) return depth;
  return Math.max(depth, ...node.children.map((child) => maxDepth(child, depth + 1)));
}

function point(cx: number, cy: number, radius: number, angle: number) {
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
}

function arcPath(cx: number, cy: number, innerRadius: number, outerRadius: number, start: number, end: number): string {
  const safeEnd = Math.min(end, start + Math.PI * 2 - 0.0001);
  const large = safeEnd - start > Math.PI ? 1 : 0;
  const outerStart = point(cx, cy, outerRadius, start);
  const outerEnd = point(cx, cy, outerRadius, safeEnd);

  if (innerRadius <= 0) {
    return `M ${cx} ${cy} L ${outerStart.x} ${outerStart.y} A ${outerRadius} ${outerRadius} 0 ${large} 1 ${outerEnd.x} ${outerEnd.y} Z`;
  }

  const innerEnd = point(cx, cy, innerRadius, safeEnd);
  const innerStart = point(cx, cy, innerRadius, start);
  return `M ${outerStart.x} ${outerStart.y} A ${outerRadius} ${outerRadius} 0 ${large} 1 ${outerEnd.x} ${outerEnd.y} L ${innerEnd.x} ${innerEnd.y} A ${innerRadius} ${innerRadius} 0 ${large} 0 ${innerStart.x} ${innerStart.y} Z`;
}

export function SunburstChart({
  data,
  width = 320,
  height = 320,
  legend = false,
  label,
  className,
  ...rest
}: SunburstChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const cx = width / 2;
  const cy = height / 2;
  const total = sumValue(data);
  const ringCount = Math.max(1, maxDepth(data));
  const outerLimit = Math.max(Math.min(width, height) / 2 - 6, 1);
  const ring = outerLimit / ringCount;

  const arcs: ArcDatum[] = React.useMemo(() => {
    if (total <= 0 || !data.children || data.children.length === 0) return [];
    const out: ArcDatum[] = [];

    function visit(
      node: SunburstChartDatum,
      depth: number,
      start: number,
      end: number,
      pathLabel: string[],
      inheritedTone: SunburstChartTone,
      siblingIndex: number,
    ) {
      if (depth > 0) {
        const tone = node.tone ?? inheritedTone ?? TONES[siblingIndex % TONES.length];
        const innerRadius = (depth - 1) * ring;
        const outerRadius = depth * ring;
        const midAngle = (start + end) / 2;
        const midRadius = (innerRadius + outerRadius) / 2;
        const labelPoint = point(cx, cy, midRadius, midAngle);
        out.push({
          datum: node,
          pathLabel,
          value: sumValue(node),
          tone,
          depth,
          start,
          end,
          path: arcPath(cx, cy, innerRadius, outerRadius, start, end),
          labelX: labelPoint.x,
          labelY: labelPoint.y,
        });
      }

      const children = node.children ?? [];
      const nodeTotal = children.reduce((sum, child) => sum + sumValue(child), 0);
      if (children.length === 0 || nodeTotal <= 0) return;

      let cursor = start;
      children.forEach((child, childIndex) => {
        const value = sumValue(child);
        if (value <= 0) return;
        const span = ((end - start) * value) / nodeTotal;
        const tone = child.tone ?? (depth === 0 ? TONES[childIndex % TONES.length] : inheritedTone);
        visit(child, depth + 1, cursor, cursor + span, [...pathLabel, child.label], tone, childIndex);
        cursor += span;
      });
    }

    visit(data, 0, -Math.PI / 2, Math.PI * 1.5, [data.label], "category1", 0);
    return out;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, width, height]);

  const leafItems: string[] = React.useMemo(() => {
    const items: string[] = [];
    function collect(node: SunburstChartDatum, path: string[]) {
      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => collect(child, [...path, child.label]));
        return;
      }
      items.push(`${path.join(", ")}: ${leafValue(node.value)}`);
    }
    collect(data, [data.label]);
    return items.filter((item) => !item.endsWith(": 0"));
  }, [data]);

  const legendItems = (data.children ?? []).map((child, index) => ({
    label: child.label,
    tone: child.tone ?? TONES[index % TONES.length],
  }));

  function handleVisualPointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredIndex(null);
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    setHoveredIndex(Number.isInteger(index) ? index : null);
  }

  const hoveredArc = hoveredIndex !== null ? arcs[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-sunburstChart", className)}>
      <div
        className="st-sunburstChart__visual"
        role="img"
        aria-label={label}
        onPointerMove={handleVisualPointerMove}
        onPointerLeave={() => setHoveredIndex(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          {arcs.map((arc, i) => (
            <path
              key={`${arc.pathLabel.join("/")}-${i}`}
              className={classNames(
                "st-sunburstChart__arc",
                `st-sunburstChart__arc--${arc.tone}`,
                hoveredIndex !== null && hoveredIndex !== i ? "st-sunburstChart__arc--dim" : undefined,
              )}
              d={arc.path}
              data-chart-index={i}
            />
          ))}
          {arcs.map((arc) =>
            arc.end - arc.start > 0.28 ? (
              <text
                key={`label-${arc.pathLabel.join("/")}`}
                className="st-sunburstChart__label"
                x={arc.labelX}
                y={arc.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={contrastTextForTone(arc.tone)}
              >
                {arc.datum.label}
              </text>
            ) : null,
          )}
        </svg>
      </div>

      <ChartDataList label={label} items={leafItems} />

      {hoveredArc ? (
        <div
          className="st-sunburstChart__tooltip"
          role="presentation"
          style={{ left: `${(hoveredArc.labelX / width) * 100}%`, top: `${(hoveredArc.labelY / height) * 100}%` }}
        >
          <span className="st-sunburstChart__tooltipLabel">{hoveredArc.pathLabel.join(", ")}</span>
          <span className="st-sunburstChart__tooltipValue">{hoveredArc.value}</span>
        </div>
      ) : null}

      {legend && legendItems.length > 0 ? (
        <ul className="st-sunburstChart__legend" aria-hidden="true">
          {legendItems.map((item) => (
            <li key={item.label} className="st-sunburstChart__legendItem">
              <span className={`st-sunburstChart__legendSwatch st-sunburstChart__legendSwatch--${item.tone}`} />
              {item.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
