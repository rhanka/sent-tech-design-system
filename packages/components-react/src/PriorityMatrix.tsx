import React from "react";
import { placePriorityLabels } from "@sentropic/dataviz-core";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";

export type PriorityMatrixTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type PriorityMatrixDatum = {
  /** Complexité, 0–100 (bornée à l'affichage). */
  x: number;
  /** Valeur, 0–100 (bornée à l'affichage). */
  y: number;
  /** Étiquette affichée (une ou deux lignes). */
  label: string;
  tone?: PriorityMatrixTone;
};

export type PriorityMatrixProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: PriorityMatrixDatum[];
  /** Titre visible au-dessus du cadre. */
  title?: string;
  xLabel?: string;
  yLabel?: string;
  /** Seuils de quadrants (0–100). */
  xThreshold?: number;
  yThreshold?: number;
  width?: number;
  height?: number;
  radius?: number;
  label: string;
  className?: string;
};

const MARGIN = { top: 26, right: 18, bottom: 36, left: 48 } as const;
const TICKS = [0, 20, 40, 60, 80, 100];
const TONES: PriorityMatrixTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];
const QUADRANT_NAMES: Record<string, string> = {
  "quick-wins": "Gains rapides",
  "major-projects": "Projets majeurs",
  wait: "Attendre",
  drop: "Ne pas faire",
};

function splitLabel(value: string): string[] {
  const chars = [...value];
  if (chars.length <= 12) return [value];
  const mid = Math.ceil(chars.length / 2);
  const space = value.lastIndexOf(" ", mid + 4);
  if (space > 2 && space < value.length - 2) return [value.slice(0, space), value.slice(space + 1)];
  return [value.slice(0, mid), value.slice(mid)];
}

export function PriorityMatrix({
  data,
  title = "Matrice de priorisation",
  xLabel = "Complexité (0-100 pts)",
  yLabel = "Valeur (0-100 pts)",
  xThreshold = 50,
  yThreshold = 50,
  width = 640,
  height = 400,
  radius = 5,
  label,
  className,
  ...rest
}: PriorityMatrixProps) {
  const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotH = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
  const scaleX = (v: number) => MARGIN.left + (Math.min(Math.max(v, 0), 100) / 100) * plotW;
  const scaleY = (v: number) => MARGIN.top + (1 - Math.min(Math.max(v, 0), 100) / 100) * plotH;
  const tx = scaleX(xThreshold);
  const ty = scaleY(yThreshold);

  const quads = [
    { id: "quick-wins", x: MARGIN.left, y: MARGIN.top, w: tx - MARGIN.left, h: ty - MARGIN.top },
    { id: "major-projects", x: tx, y: MARGIN.top, w: MARGIN.left + plotW - tx, h: ty - MARGIN.top },
    { id: "wait", x: MARGIN.left, y: ty, w: tx - MARGIN.left, h: MARGIN.top + plotH - ty },
    { id: "drop", x: tx, y: ty, w: MARGIN.left + plotW - tx, h: MARGIN.top + plotH - ty },
  ];
  const quadNames = [
    { id: "quick-wins", x: MARGIN.left + 6, y: MARGIN.top + 14, anchor: "start" as const },
    { id: "major-projects", x: MARGIN.left + plotW - 6, y: MARGIN.top + 14, anchor: "end" as const },
    { id: "wait", x: MARGIN.left + 6, y: MARGIN.top + plotH - 8, anchor: "start" as const },
    { id: "drop", x: MARGIN.left + plotW - 6, y: MARGIN.top + plotH - 8, anchor: "end" as const },
  ];

  const points = data.map((d, i) => ({
    cx: scaleX(d.x),
    cy: scaleY(d.y),
    datum: d,
    index: i,
    tone: (d.tone ?? TONES[i % TONES.length]) as PriorityMatrixTone,
  }));

  const boxes = data.map((d) => {
    const lines = splitLabel(d.label);
    const longest = Math.max(...lines.map((l) => [...l].length));
    return { w: Math.min(120, 12 + 7 * longest), h: lines.length > 1 ? 34 : 20, lines };
  });
  const placed = placePriorityLabels(
    data.map((d) => ({ x: d.x, y: d.y, label: d.label })),
    boxes,
    { width, height, marginLeft: MARGIN.left, marginTop: MARGIN.top, plotWidth: plotW, plotHeight: plotH },
    { xThreshold, yThreshold },
  ).map((p) => ({ ...p, lines: boxes[p.index]!.lines as string[] }));

  const dataValueItems = data.map((d) => `${d.label} : complexité ${d.x}, valeur ${d.y}`);

  return (
    <div {...rest} className={classNames("st-priorityMatrix", className)}>
      <div className="st-priorityMatrix__visual" role="img" aria-label={label}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          {title ? (
            <text className="st-priorityMatrix__title" x={MARGIN.left} y={15} textAnchor="start">
              {title}
            </text>
          ) : null}

          {quads.map((q) => (
            <rect
              key={q.id}
              className={`st-priorityMatrix__quad st-priorityMatrix__quad--${q.id}`}
              x={q.x}
              y={q.y}
              width={q.w}
              height={q.h}
            />
          ))}

          {TICKS.map((t) => {
            const y = scaleY(t);
            return (
              <React.Fragment key={`y${t}`}>
                <line className="st-priorityMatrix__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={y} y2={y} />
                <text className="st-priorityMatrix__tick" x={MARGIN.left - 6} y={y} textAnchor="end" dominantBaseline="middle">
                  {t}
                </text>
              </React.Fragment>
            );
          })}
          {TICKS.map((t) => {
            const x = scaleX(t);
            return (
              <text key={`x${t}`} className="st-priorityMatrix__tick" x={x} y={height - MARGIN.bottom + 16} textAnchor="middle">
                {t}
              </text>
            );
          })}

          <line className="st-priorityMatrix__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={height - MARGIN.bottom} />
          <line
            className="st-priorityMatrix__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={height - MARGIN.bottom}
            y2={height - MARGIN.bottom}
          />

          <line className="st-priorityMatrix__threshold" x1={tx} x2={tx} y1={MARGIN.top} y2={MARGIN.top + plotH} />
          <line className="st-priorityMatrix__threshold" x1={MARGIN.left} x2={MARGIN.left + plotW} y1={ty} y2={ty} />

          {quadNames.map((q) => (
            <text key={q.id} className="st-priorityMatrix__quadName" x={q.x} y={q.y} textAnchor={q.anchor}>
              {QUADRANT_NAMES[q.id]}
            </text>
          ))}

          {xLabel ? (
            <text className="st-priorityMatrix__axisLabel" x={MARGIN.left + plotW / 2} y={height - 4} textAnchor="middle">
              {xLabel}
            </text>
          ) : null}
          {yLabel ? (
            <text
              className="st-priorityMatrix__axisLabel"
              x={12}
              y={MARGIN.top + plotH / 2}
              textAnchor="middle"
              transform={`rotate(-90 12 ${MARGIN.top + plotH / 2})`}
            >
              {yLabel}
            </text>
          ) : null}

          {points.map((p) => (
            <circle key={p.index} className={`st-priorityMatrix__point st-priorityMatrix__point--${p.tone}`} cx={p.cx} cy={p.cy} r={radius} />
          ))}

          {placed.map((p) => (
            <React.Fragment key={p.index}>
              <line className="st-priorityMatrix__leader" x1={p.leaderX1} y1={p.leaderY1} x2={p.leaderX2} y2={p.leaderY2} />
              <rect className="st-priorityMatrix__labelBox" x={p.x} y={p.y} width={p.w} height={p.h} rx={3} />
              {p.lines.map((line, li) => (
                <text key={li} className="st-priorityMatrix__labelText" x={p.x + p.w / 2} y={p.y + 13 + li * 13} textAnchor="middle">
                  {line}
                </text>
              ))}
            </React.Fragment>
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />
    </div>
  );
}
