import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";

export type VennChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type VennChartArea = {
  sets: string[];
  value: number;
};

export type VennChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  data: VennChartArea[];
  label: string;
  width?: number;
  height?: number;
  className?: string;
};

const TONES: VennChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

type VennCircle = {
  name: string;
  tone: VennChartTone;
  cx: number;
  cy: number;
  r: number;
  total: number;
  labelX: number;
  labelY: number;
  anchor: "start" | "middle" | "end";
};

type VennRegion = {
  sets: string[];
  value: number;
  x: number;
  y: number;
};

type VennLayout = {
  circles: VennCircle[];
  regions: VennRegion[];
  items: string[];
};

function safeValue(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function vennLayout(data: VennChartArea[], width: number, height: number): VennLayout {
  const areas = data
    .map((d) => ({
      sets: Array.isArray(d.sets) ? d.sets.filter((s) => typeof s === "string") : [],
      value: safeValue(d.value),
    }))
    .filter((d) => d.sets.length > 0 && d.value > 0);

  const order: string[] = [];
  for (const a of areas) {
    for (const s of a.sets) if (!order.includes(s)) order.push(s);
  }
  const names = order.slice(0, 3);

  if (names.length === 0) {
    return { circles: [], regions: [], items: [] };
  }

  const totals = new Map<string, number>();
  for (const name of names) {
    let sum = 0;
    for (const a of areas) if (a.sets.includes(name)) sum += a.value;
    totals.set(name, sum);
  }

  const cx = width / 2;
  const cy = height / 2;
  const span = Math.min(width, height);
  const rMax = span * 0.3;
  const rMin = span * 0.2;
  const roots = names.map((n) => Math.sqrt(totals.get(n) ?? 0));
  const rootMin = Math.min(...roots);
  const rootMax = Math.max(...roots);
  const rootSpan = rootMax - rootMin;
  const radiusFor = (root: number) => (rootSpan > 0 ? rMin + ((root - rootMin) / rootSpan) * (rMax - rMin) : rMax);

  let centers: Array<{ cx: number; cy: number }>;
  if (names.length === 1) {
    centers = [{ cx, cy }];
  } else if (names.length === 2) {
    const off = span * 0.16;
    centers = [
      { cx: cx - off, cy },
      { cx: cx + off, cy },
    ];
  } else {
    const off = span * 0.17;
    centers = [
      { cx: cx - off, cy: cy - off * 0.6 },
      { cx: cx + off, cy: cy - off * 0.6 },
      { cx, cy: cy + off * 0.85 },
    ];
  }

  const circles: VennCircle[] = names.map((name, i) => {
    const r = radiusFor(roots[i]);
    const c = centers[i];
    const dx = c.cx - cx;
    const dy = c.cy - cy;
    const len = Math.hypot(dx, dy) || 1;
    const ux = names.length === 1 ? 0 : dx / len;
    const uy = names.length === 1 ? -1 : dy / len;
    const labelX = c.cx + ux * (r + 6);
    const labelY = c.cy + uy * (r + 6);
    const anchor: "start" | "middle" | "end" = ux > 0.3 ? "start" : ux < -0.3 ? "end" : "middle";
    return {
      name,
      tone: TONES[i % TONES.length],
      cx: c.cx,
      cy: c.cy,
      r,
      total: totals.get(name) ?? 0,
      labelX,
      labelY,
      anchor,
    };
  });

  const centerByName = new Map(circles.map((c) => [c.name, c]));
  const regions: VennRegion[] = areas
    .filter((a) => a.sets.length >= 2)
    .map((a) => {
      const pts = a.sets.map((s) => centerByName.get(s)).filter((c): c is VennCircle => c !== undefined);
      const px = pts.length > 0 ? pts.reduce((s, c) => s + c.cx, 0) / pts.length : cx;
      const py = pts.length > 0 ? pts.reduce((s, c) => s + c.cy, 0) / pts.length : cy;
      return { sets: a.sets, value: a.value, x: px, y: py };
    });

  const items = areas.map((a) => `${a.sets.join(" ∩ ")}: ${a.value}`);

  return { circles, regions, items };
}

export function VennChart({ data, label, width = 420, height = 360, className, ...rest }: VennChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const layout = vennLayout(data, width, height);

  function handleVisualPointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredIndex(null);
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    setHoveredIndex(Number.isInteger(index) ? index : null);
  }

  const hovered = hoveredIndex !== null ? layout.circles[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-vennChart", className)}>
      <div
        className="st-vennChart__visual"
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
          {layout.circles.map((circle, i) => (
            <circle
              key={`c${circle.name}`}
              className={classNames(
                "st-vennChart__circle",
                `st-vennChart__circle--${circle.tone}`,
                hoveredIndex !== null && hoveredIndex !== i ? "st-vennChart__circle--dim" : undefined,
              )}
              cx={circle.cx}
              cy={circle.cy}
              r={circle.r}
              data-chart-index={i}
            />
          ))}

          {layout.regions.map((region) => (
            <text
              key={`v${region.sets.join("|")}`}
              className="st-vennChart__value"
              x={region.x}
              y={region.y}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {region.value}
            </text>
          ))}

          {layout.circles.map((circle) => (
            <text
              key={`l${circle.name}`}
              className="st-vennChart__label"
              x={circle.labelX}
              y={circle.labelY}
              textAnchor={circle.anchor}
              dominantBaseline="middle"
            >
              {circle.name}
            </text>
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={layout.items} />

      {hovered ? (
        <div
          className="st-vennChart__tooltip"
          role="presentation"
          style={{ left: `${(hovered.cx / width) * 100}%`, top: `${(hovered.cy / height) * 100}%` }}
        >
          <span className="st-vennChart__tooltipLabel">{hovered.name}</span>
          <span className="st-vennChart__tooltipValue">{hovered.total}</span>
        </div>
      ) : null}
    </div>
  );
}
