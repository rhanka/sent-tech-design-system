<script lang="ts" module>
  export type TreemapChartTone =
    | "category1" | "category2" | "category3" | "category4"
    | "category5" | "category6" | "category7" | "category8";

  export type TreemapChartDatum = {
    label: string;
    value: number;
    tone?: TreemapChartTone;
    children?: TreemapChartDatum[];
  };

  export type TreemapTiling = "squarified";
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";
  import { contrastTextForTone } from "./chartContrast";

  type TreemapChartProps = {
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
    class?: string;
  };

  let {
    data,
    tiling = "squarified",
    showLabels = true,
    legend = false,
    width = 480,
    height = 300,
    label,
    class: className
  }: TreemapChartProps = $props();

  const TONES = [
    "category1", "category2", "category3", "category4",
    "category5", "category6", "category7", "category8"
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

  /** Valeur d'une feuille : seulement les nombres finis et positifs comptent. */
  const leafValue = (v: number): number => (Number.isFinite(v) && v > 0 ? v : 0);

  const sumValue = (d: TreemapChartDatum): number => {
    if (d.children && d.children.length > 0) {
      return d.children.reduce((s, c) => s + sumValue(c), 0);
    }
    return leafValue(d.value);
  };

  // Squarified treemap (Bruls, Huizing, van Wijk 2000).
  // Pave `rect` avec des nœuds proportionnels à leur valeur en minimisant
  // le ratio d'aspect des rectangles produits.
  function squarify(
    nodes: Array<{ datum: TreemapChartDatum; value: number }>,
    rect: Rect
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

  const cells = $derived.by<Cell[]>(() => {
    if (!data || data.length === 0) return [];
    // Squarify suppose une entrée triée par valeur décroissante pour produire
    // des ratios d'aspect corrects.
    const roots = data
      .map((d, i) => ({ datum: d, value: sumValue(d), tone: d.tone ?? TONES[i % TONES.length] }))
      .filter((n) => n.value > 0)
      .sort((a, b) => b.value - a.value);
    if (roots.length === 0) return [];

    const topRects = squarify(
      roots.map((r) => ({ datum: r.datum, value: r.value })),
      { x: 0, y: 0, w: width, h: height }
    );

    const result: Cell[] = [];
    topRects.forEach((tr) => {
      const root = roots.find((r) => r.datum === tr.datum)!;
      const children = (tr.datum.children ?? [])
        .filter((c) => leafValue(c.value) > 0)
        .sort((a, b) => leafValue(b.value) - leafValue(a.value));
      if (children.length > 0) {
        // Niveau 2 : subdiviser l'intérieur du rectangle parent.
        const innerRect = inset(tr.rect, PADDING);
        const childRects = squarify(
          children.map((c) => ({ datum: c, value: leafValue(c.value) })),
          innerRect
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
            depth: 1
          });
        });
      } else {
        result.push({
          datum: tr.datum,
          value: tr.value,
          tone: root.tone,
          textColor: contrastTextForTone(root.tone),
          rect: inset(tr.rect, PADDING / 2),
          depth: 0
        });
      }
    });
    return result;
  });

  // Légende : un swatch par catégorie de premier niveau.
  const legendItems = $derived.by(() => {
    if (!data) return [] as Array<{ label: string; tone: TreemapChartTone }>;
    return data
      .map((d, i) => ({ label: d.label, tone: d.tone ?? TONES[i % TONES.length] }))
      .filter((_, i) => sumValue(data[i]) > 0);
  });

  const dataValueItems = $derived(
    cells.map((c) =>
      c.parentLabel ? `${c.parentLabel}, ${c.datum.label}: ${c.value}` : `${c.datum.label}: ${c.value}`
    )
  );

  // Seuils (en unités SVG) pour décider quand afficher un label.
  const LABEL_MIN_W = 44;
  const LABEL_MIN_H = 22;
  const VALUE_MIN_H = 38;

  // Préfixe d'id unique pour les clip-paths (évite les collisions entre instances).
  const clipPrefix = `st-treemap-clip-${Math.random().toString(36).slice(2, 9)}`;

  let hoveredIndex: number | null = $state(null);

  function handleVisualPointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredIndex = null;
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    hoveredIndex = Number.isInteger(index) ? index : null;
  }

  const classes = () => ["st-treemapChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-treemapChart__visual"
    role="img"
    aria-label={label}
    onpointermove={handleVisualPointerMove}
    onpointerleave={() => (hoveredIndex = null)}
  >
    <svg
      viewBox="0 0 {width} {height}"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      focusable="false"
      aria-hidden="true"
    >
      <defs>
        {#each cells as cell, i (cell.parentLabel ? `${cell.parentLabel}/${cell.datum.label}` : cell.datum.label)}
          <clipPath id="{clipPrefix}-{i}">
            <rect x={cell.rect.x} y={cell.rect.y} width={cell.rect.w} height={cell.rect.h} rx="2" />
          </clipPath>
        {/each}
      </defs>

      {#each cells as cell, i (cell.parentLabel ? `${cell.parentLabel}/${cell.datum.label}` : cell.datum.label)}
        <g class="st-treemapChart__cell" data-chart-index={i}>
          <rect
            class="st-treemapChart__rect st-treemapChart__rect--{cell.tone}"
            class:st-treemapChart__rect--dim={hoveredIndex !== null && hoveredIndex !== i}
            x={cell.rect.x}
            y={cell.rect.y}
            width={cell.rect.w}
            height={cell.rect.h}
            rx="2"
            data-chart-index={i}
          />
          {#if showLabels && cell.rect.w >= LABEL_MIN_W && cell.rect.h >= LABEL_MIN_H}
            <g clip-path="url(#{clipPrefix}-{i})">
              <text
                class="st-treemapChart__label"
                x={cell.rect.x + 6}
                y={cell.rect.y + 15}
                data-chart-index={i}
                style="fill: {cell.textColor}"
              >
                {cell.datum.label}
              </text>
              {#if cell.rect.h >= VALUE_MIN_H}
                <text
                  class="st-treemapChart__value"
                  x={cell.rect.x + 6}
                  y={cell.rect.y + 30}
                  data-chart-index={i}
                  style="fill: {cell.textColor}"
                >
                  {cell.value}
                </text>
              {/if}
            </g>
          {/if}
        </g>
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredIndex !== null && cells[hoveredIndex]}
    {@const cell = cells[hoveredIndex]}
    <div
      class="st-treemapChart__tooltip"
      role="presentation"
      style="left: {((cell.rect.x + cell.rect.w / 2) / width) * 100}%; top: {(cell.rect.y / height) * 100}%"
    >
      <span class="st-treemapChart__tooltipLabel">
        {cell.parentLabel ? `${cell.parentLabel} · ${cell.datum.label}` : cell.datum.label}
      </span>
      <span class="st-treemapChart__tooltipValue">{cell.value}</span>
    </div>
  {/if}

  {#if legend && legendItems.length > 0}
    <ul class="st-treemapChart__legend" aria-hidden="true">
      {#each legendItems as item (item.label)}
        <li class="st-treemapChart__legendItem">
          <span
            class="st-treemapChart__legendSwatch st-treemapChart__legendSwatch--{item.tone}"
            aria-hidden="true"
          ></span>
          {item.label}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .st-treemapChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-treemapChart svg,
  .st-treemapChart__visual {
    display: block;
    overflow: visible;
  }

  .st-treemapChart__rect {
    cursor: pointer;
    stroke: var(--st-semantic-surface-default, #fff);
    stroke-width: 1.5;
    transition: opacity 120ms ease;
  }

  .st-treemapChart__rect--dim {
    opacity: 0.45;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-treemapChart__rect {
      transition: none;
    }
  }

  .st-treemapChart__rect--category1 { fill: var(--st-semantic-data-category1); }
  .st-treemapChart__rect--category2 { fill: var(--st-semantic-data-category2); }
  .st-treemapChart__rect--category3 { fill: var(--st-semantic-data-category3); }
  .st-treemapChart__rect--category4 { fill: var(--st-semantic-data-category4); }
  .st-treemapChart__rect--category5 { fill: var(--st-semantic-data-category5); }
  .st-treemapChart__rect--category6 { fill: var(--st-semantic-data-category6); }
  .st-treemapChart__rect--category7 { fill: var(--st-semantic-data-category7); }
  .st-treemapChart__rect--category8 { fill: var(--st-semantic-data-category8); }

  .st-treemapChart__label {
    fill: var(--st-component-treemapChart-labelColor, #fff);
    font-size: 0.75rem;
    font-weight: 600;
    pointer-events: none;
  }

  .st-treemapChart__value {
    fill: var(--st-component-treemapChart-valueColor, #fff);
    font-size: 0.6875rem;
    opacity: 0.85;
    pointer-events: none;
  }

  .st-treemapChart__tooltip {
    background: var(--st-semantic-surface-inverse);
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-semantic-text-inverse);
    display: inline-flex;
    flex-direction: column;
    font-size: 0.75rem;
    gap: 0.125rem;
    line-height: 1.2;
    padding: 0.375rem 0.5rem;
    pointer-events: none;
    position: absolute;
    transform: translate(-50%, calc(-100% - 8px));
    white-space: nowrap;
    z-index: 1;
  }

  .st-treemapChart__tooltipLabel { font-weight: 600; }
  .st-treemapChart__tooltipValue { opacity: 0.85; }

  .st-treemapChart__legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-3, 0.75rem);
    list-style: none;
    margin: var(--st-spacing-2, 0.5rem) 0 0;
    padding: 0;
  }

  .st-treemapChart__legendItem {
    align-items: center;
    color: var(--st-semantic-text-secondary);
    display: inline-flex;
    font-size: 0.75rem;
    gap: var(--st-spacing-1, 0.25rem);
  }

  .st-treemapChart__legendSwatch {
    border-radius: 2px;
    height: 0.7rem;
    width: 0.7rem;
  }

  .st-treemapChart__legendSwatch--category1 { background: var(--st-semantic-data-category1); }
  .st-treemapChart__legendSwatch--category2 { background: var(--st-semantic-data-category2); }
  .st-treemapChart__legendSwatch--category3 { background: var(--st-semantic-data-category3); }
  .st-treemapChart__legendSwatch--category4 { background: var(--st-semantic-data-category4); }
  .st-treemapChart__legendSwatch--category5 { background: var(--st-semantic-data-category5); }
  .st-treemapChart__legendSwatch--category6 { background: var(--st-semantic-data-category6); }
  .st-treemapChart__legendSwatch--category7 { background: var(--st-semantic-data-category7); }
  .st-treemapChart__legendSwatch--category8 { background: var(--st-semantic-data-category8); }
</style>
