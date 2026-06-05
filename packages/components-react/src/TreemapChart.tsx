import React from "react";
import { classNames } from "./classNames.js";
import { ChartDataList } from "./chartScale.js";
import { contrastTextForTone } from "./chartContrast.js";

export type TreemapChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type TreemapChartDatum = {
  label: string;
  value: number;
  tone?: TreemapChartTone;
  children?: TreemapChartDatum[];
};

export type TreemapTiling = "squarified";

export type TreemapChartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  /** Données hiérarchiques : 1 ou 2 niveaux. Un nœud avec `children` est subdivisé. */
  data: TreemapChartDatum[];
  /** Algorithme de pavage (squarified uniquement pour l'instant). */
  tiling?: TreemapTiling;
  /** Affiche les labels dans les rectangles suffisamment grands. */
  showLabels?: boolean;
  /** Affiche une légende sous le graphique. */
  legend?: boolean;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

const TONES = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
] as const;

const PADDING = 2;

type Rect = { x: number; y: number; w: number; h: number };
type Cell = {
  datum: TreemapChartDatum;
  value: number;
  tone: TreemapChartTone;
  textColor: string;
  rect: Rect;
  parentLabel?: string;
  depth: number;
};

const sumValue = (d: TreemapChartDatum): number => {
  if (d.children && d.children.length > 0) {
    return d.children.reduce((s, c) => s + sumValue(c), 0);
  }
  return Math.max(d.value, 0);
};

// Squarified treemap (Bruls, Huizing, van Wijk 2000).
function squarify(
  nodes: Array<{ datum: TreemapChartDatum; value: number }>,
  rect: Rect,
): Array<{ datum: TreemapChartDatum; value: number; rect: Rect }> {
  const out: Array<{ datum: TreemapChartDatum; value: number; rect: Rect }> = [];
  const total = nodes.reduce((s, n) => s + n.value, 0);
  if (total <= 0 || nodes.length === 0) return out;

  // Échelle valeur → aire disponible.
  const area = rect.w * rect.h;
  const scale = area / total;
  const items = nodes.map((n) => ({ datum: n.datum, value: n.value, area: n.value * scale }));

  let free: Rect = { ...rect };
  let row: typeof items = [];

  const worst = (r: typeof items, side: number): number => {
    if (r.length === 0 || side <= 0) return Infinity;
    const s = r.reduce((acc, it) => acc + it.area, 0);
    let max = -Infinity;
    let min = Infinity;
    for (const it of r) {
      if (it.area > max) max = it.area;
      if (it.area < min) min = it.area;
    }
    const s2 = s * s;
    const side2 = side * side;
    return Math.max((side2 * max) / s2, s2 / (side2 * min));
  };

  const layoutRow = (r: typeof items, side: number, area2: Rect): Rect => {
    const s = r.reduce((acc, it) => acc + it.area, 0);
    if (side <= 0) return area2;
    // Largeur (ou hauteur) de la bande consommée.
    const thickness = s / side;
    if (area2.w >= area2.h) {
      // Bande verticale à gauche, items empilés verticalement.
      let oy = area2.y;
      for (const it of r) {
        const h = it.area / thickness;
        out.push({ datum: it.datum, value: it.value, rect: { x: area2.x, y: oy, w: thickness, h } });
        oy += h;
      }
      return { x: area2.x + thickness, y: area2.y, w: area2.w - thickness, h: area2.h };
    } else {
      // Bande horizontale en haut, items côte à côte.
      let ox = area2.x;
      for (const it of r) {
        const w = it.area / thickness;
        out.push({ datum: it.datum, value: it.value, rect: { x: ox, y: area2.y, w, h: thickness } });
        ox += w;
      }
      return { x: area2.x, y: area2.y + thickness, w: area2.w, h: area2.h - thickness };
    }
  };

  for (const it of items) {
    const side = Math.min(free.w, free.h);
    const next = [...row, it];
    if (row.length === 0 || worst(next, side) <= worst(row, side)) {
      row = next;
    } else {
      free = layoutRow(row, side, free);
      row = [it];
    }
  }
  if (row.length > 0) {
    free = layoutRow(row, Math.min(free.w, free.h), free);
  }
  return out;
}

function inset(r: Rect, pad: number): Rect {
  const w = Math.max(r.w - pad * 2, 0);
  const h = Math.max(r.h - pad * 2, 0);
  return { x: r.x + pad, y: r.y + pad, w, h };
}

// Seuils (en unités SVG) pour décider quand afficher un label.
const LABEL_MIN_W = 44;
const LABEL_MIN_H = 22;
const VALUE_MIN_H = 38;

export function TreemapChart({
  data,
  tiling = "squarified",
  showLabels = true,
  legend = false,
  width = 480,
  height = 300,
  label,
  className,
  ...rest
}: TreemapChartProps) {
  void tiling;
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const cells = ((): Cell[] => {
    if (!data || data.length === 0) return [];
    // Squarify suppose une entrée triée par valeur décroissante pour des ratios d'aspect corrects.
    const roots = data
      .map((d, i) => ({ datum: d, value: sumValue(d), tone: d.tone ?? TONES[i % TONES.length] }))
      .filter((n) => n.value > 0)
      .sort((a, b) => b.value - a.value);
    if (roots.length === 0) return [];

    const topRects = squarify(
      roots.map((r) => ({ datum: r.datum, value: r.value })),
      { x: 0, y: 0, w: width, h: height },
    );

    const result: Cell[] = [];
    topRects.forEach((tr) => {
      const root = roots.find((r) => r.datum === tr.datum)!;
      const children = (tr.datum.children?.filter((c) => Math.max(c.value, 0) > 0) ?? [])
        .slice()
        .sort((a, b) => Math.max(b.value, 0) - Math.max(a.value, 0));
      if (children.length > 0) {
        // Niveau 2 : subdiviser l'intérieur du rectangle parent.
        const innerRect = inset(tr.rect, PADDING);
        const childRects = squarify(
          children.map((c) => ({ datum: c, value: Math.max(c.value, 0) })),
          innerRect,
        );
        childRects.forEach((cr, ci) => {
          const tone = cr.datum.tone ?? root.tone ?? TONES[ci % TONES.length];
          result.push({
            datum: cr.datum,
            value: cr.value,
            tone,
            textColor: contrastTextForTone(tone),
            rect: inset(cr.rect, PADDING / 2),
            parentLabel: tr.datum.label,
            depth: 1,
          });
        });
      } else {
        result.push({
          datum: tr.datum,
          value: tr.value,
          tone: root.tone,
          textColor: contrastTextForTone(root.tone),
          rect: inset(tr.rect, PADDING / 2),
          depth: 0,
        });
      }
    });
    return result;
  })();

  // Légende : un swatch par catégorie de premier niveau.
  const legendItems = (() => {
    if (!data) return [] as Array<{ label: string; tone: TreemapChartTone }>;
    return data
      .map((d, i) => ({ label: d.label, tone: d.tone ?? TONES[i % TONES.length] }))
      .filter((_, i) => sumValue(data[i]) > 0);
  })();

  const dataValueItems = cells.map((c) =>
    c.parentLabel ? `${c.parentLabel}, ${c.datum.label}: ${c.value}` : `${c.datum.label}: ${c.value}`,
  );

  function handleVisualPointerMove(event: React.PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      setHoveredIndex(null);
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    setHoveredIndex(Number.isInteger(index) ? index : null);
  }

  const hoveredCell = hoveredIndex !== null ? cells[hoveredIndex] : undefined;

  return (
    <div {...rest} className={classNames("st-treemapChart", className)}>
      <div
        className="st-treemapChart__visual"
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
          {cells.map((cell, i) => (
            <g
              key={cell.parentLabel ? `${cell.parentLabel}/${cell.datum.label}` : cell.datum.label}
              className="st-treemapChart__cell"
              data-chart-index={i}
            >
              <rect
                className={classNames(
                  "st-treemapChart__rect",
                  `st-treemapChart__rect--${cell.tone}`,
                  hoveredIndex !== null && hoveredIndex !== i && "st-treemapChart__rect--dim",
                )}
                x={cell.rect.x}
                y={cell.rect.y}
                width={cell.rect.w}
                height={cell.rect.h}
                rx="2"
                data-chart-index={i}
              />
              {showLabels && cell.rect.w >= LABEL_MIN_W && cell.rect.h >= LABEL_MIN_H ? (
                <>
                  <text
                    className="st-treemapChart__label"
                    x={cell.rect.x + 6}
                    y={cell.rect.y + 15}
                    data-chart-index={i}
                    style={{ fill: cell.textColor }}
                  >
                    {cell.datum.label}
                  </text>
                  {cell.rect.h >= VALUE_MIN_H ? (
                    <text
                      className="st-treemapChart__value"
                      x={cell.rect.x + 6}
                      y={cell.rect.y + 30}
                      data-chart-index={i}
                      style={{ fill: cell.textColor }}
                    >
                      {cell.value}
                    </text>
                  ) : null}
                </>
              ) : null}
            </g>
          ))}
        </svg>
      </div>

      <ChartDataList label={label} items={dataValueItems} />

      {hoveredCell ? (
        <div
          className="st-treemapChart__tooltip"
          role="presentation"
          style={{
            left: `${((hoveredCell.rect.x + hoveredCell.rect.w / 2) / width) * 100}%`,
            top: `${(hoveredCell.rect.y / height) * 100}%`,
          }}
        >
          <span className="st-treemapChart__tooltipLabel">
            {hoveredCell.parentLabel
              ? `${hoveredCell.parentLabel} · ${hoveredCell.datum.label}`
              : hoveredCell.datum.label}
          </span>
          <span className="st-treemapChart__tooltipValue">{hoveredCell.value}</span>
        </div>
      ) : null}

      {legend && legendItems.length > 0 ? (
        <ul className="st-treemapChart__legend" aria-hidden="true">
          {legendItems.map((item) => (
            <li key={item.label} className="st-treemapChart__legendItem">
              <span
                className={`st-treemapChart__legendSwatch st-treemapChart__legendSwatch--${item.tone}`}
                aria-hidden="true"
              />
              {item.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
