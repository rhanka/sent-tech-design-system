<script lang="ts" module>
  /**
   * DecompositionTreeChart - arbre de décomposition hiérarchique (façon Power BI
   * decomposition tree). Une mesure TOTALE se décompose en niveaux successifs
   * selon des dimensions : chaque niveau = une COLONNE de nœuds (barres
   * horizontales dont la largeur est ∝ `value` relative au niveau), reliés au
   * parent du niveau précédent par des liens lissés.
   * API canonique (référence Svelte, React/Vue doivent s'aligner).
   *
   * Modèle : une racine = la mesure totale (colonne 0), puis N niveaux de nœuds ;
   * chaque nœud (sauf la racine) référence son `parent` par libellé. La couleur
   * suit le NIVEAU (cycle sur category1..8). Survol d'un nœud → infobulle
   * dimension/libellé + valeur. Statique (pas de drill) — montre tous les niveaux.
   *
   * Props obligatoires :
   *   data   DecompositionTreeData  - { measure, levels[] }
   *
   * Props optionnelles :
   *   label   string
   *   width   number  (défaut 640)
   *   height  number  (défaut 320)
   *   size    number  (alias de width)
   *   class   string
   */
  export type DecompositionTreeNode = {
    label: string;
    value: number;
    parent?: string;
  };

  export type DecompositionTreeLevel = {
    dimension: string;
    nodes: DecompositionTreeNode[];
  };

  export type DecompositionTreeData = {
    measure: string;
    levels: DecompositionTreeLevel[];
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type DecompositionTreeChartProps = {
    data: DecompositionTreeData;
    label?: string;
    width?: number;
    height?: number;
    size?: number;
    class?: string;
  };

  let {
    data,
    label,
    width,
    height = 320,
    size,
    class: className
  }: DecompositionTreeChartProps = $props();

  const resolvedWidth = $derived(width ?? size ?? 640);

  const MARGIN = { top: 16, right: 16, bottom: 16, left: 16 };
  const BAR_H = 22;
  const BAR_GAP = 10;
  const COL_GAP = 36;
  const BAR_W = 110;

  let hoveredKey: string | null = $state(null);

  // Couleur par niveau (colonne), 1..8 cyclé.
  const toneForLevel = (level: number): string => `category${(level % 8) + 1}`;

  // Tronque une étiquette à la largeur de la barre (approx. par char).
  function ellipsize(text: string, maxChars: number): string {
    if (text.length <= maxChars) return text;
    if (maxChars <= 1) return "…";
    return `${text.slice(0, maxChars - 1)}…`;
  }

  function formatValue(v: number): string {
    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(1);
  }

  type Cell = {
    key: string;
    label: string;
    dimension: string;
    value: number;
    level: number;
    x: number;
    y: number;
    barWidth: number;
    tone: string;
    cx: number;
    cy: number;
    parentKey: string | null;
  };

  type Link = {
    key: string;
    from: Cell;
    to: Cell;
  };

  // Normalise : une colonne par niveau, plus la racine (colonne 0 = mesure
  // totale). La largeur d'une barre est ∝ value relative au max de SON niveau.
  const layout = $derived.by(() => {
    const cells: Cell[] = [];
    const links: Link[] = [];
    if (!data || typeof data.measure !== "string") return { cells, links };

    const plotTop = MARGIN.top;
    const colX = (level: number) => MARGIN.left + level * (BAR_W + COL_GAP);

    // Colonne 0 : la racine (mesure totale). Sa valeur = somme du 1er niveau si
    // disponible, sinon 1 (barre pleine).
    const levels = (data.levels ?? []).filter(
      (lvl) => lvl && typeof lvl.dimension === "string"
    );
    const firstLevelTotal = levels[0]
      ? levels[0].nodes
          .filter((n) => n && Number.isFinite(n.value))
          .reduce((s, n) => s + Math.max(n.value, 0), 0)
      : 0;
    const rootValue = firstLevelTotal > 0 ? firstLevelTotal : 1;

    const rootCell: Cell = {
      key: "root",
      label: data.measure,
      dimension: data.measure,
      value: rootValue,
      level: 0,
      x: colX(0),
      y: plotTop,
      barWidth: BAR_W,
      tone: toneForLevel(0),
      cx: colX(0) + BAR_W / 2,
      cy: plotTop + BAR_H / 2,
      parentKey: null
    };
    cells.push(rootCell);

    // Niveaux 1..N : une colonne chacun.
    let prevColumn: Cell[] = [rootCell];
    levels.forEach((lvl, li) => {
      const level = li + 1;
      const nodes = (lvl.nodes ?? []).filter(
        (n) => n && typeof n.label === "string" && Number.isFinite(n.value)
      );
      const levelMax = nodes.reduce((m, n) => Math.max(m, Math.max(n.value, 0)), 0) || 1;
      const x = colX(level);
      const column: Cell[] = [];
      nodes.forEach((n, ni) => {
        const y = plotTop + ni * (BAR_H + BAR_GAP);
        const barWidth = Math.max((Math.max(n.value, 0) / levelMax) * BAR_W, 2);
        const parentCell =
          (n.parent !== undefined &&
            prevColumn.find((p) => p.label === n.parent)) ||
          prevColumn[0] ||
          null;
        const cell: Cell = {
          key: `${level}-${ni}`,
          label: n.label,
          dimension: lvl.dimension,
          value: n.value,
          level,
          x,
          y,
          barWidth,
          tone: toneForLevel(level),
          cx: x + barWidth / 2,
          cy: y + BAR_H / 2,
          parentKey: parentCell ? parentCell.key : null
        };
        cells.push(cell);
        column.push(cell);
        if (parentCell) {
          links.push({ key: `${parentCell.key}>${cell.key}`, from: parentCell, to: cell });
        }
      });
      if (column.length > 0) prevColumn = column;
    });

    return { cells, links };
  });

  const cells = $derived(layout.cells);
  const links = $derived(layout.links);

  const computedHeight = $derived.by(() => {
    if (cells.length === 0) return height;
    const maxBottom = cells.reduce((m, c) => Math.max(m, c.y + BAR_H), MARGIN.top);
    return Math.max(height, maxBottom + MARGIN.bottom);
  });

  const computedWidth = $derived.by(() => {
    if (cells.length === 0) return resolvedWidth;
    const maxRight = cells.reduce((m, c) => Math.max(m, c.x + BAR_W), MARGIN.left);
    return Math.max(resolvedWidth, maxRight + MARGIN.right);
  });

  // Nombre de caractères affichables avant ellipsis (approx. largeur de glyphe).
  const charsFor = (w: number) => Math.max(0, Math.floor((w - 8) / 6.6));

  // Lien lissé parent→enfant (courbe de Bézier horizontale).
  function linkPath(link: Link): string {
    const x1 = link.from.x + link.from.barWidth;
    const y1 = link.from.cy;
    const x2 = link.to.x;
    const y2 = link.to.cy;
    const mid = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
  }

  const dataValueItems = $derived(
    cells.map((c) => `${"·".repeat(c.level)}${c.label}: ${c.value}`)
  );

  function handlePointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredKey = null;
      return;
    }
    const key = target.getAttribute("data-chart-key");
    hoveredKey = key ?? null;
  }

  const hoveredCell = $derived.by(() => {
    if (hoveredKey === null) return null;
    return cells.find((c) => c.key === hoveredKey) ?? null;
  });

  const classes = () => ["st-decompositionTreeChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-decompositionTreeChart__visual"
    role="img"
    aria-label={label}
    onpointermove={handlePointerMove}
    onpointerleave={() => (hoveredKey = null)}
  >
    <svg
      viewBox="0 0 {computedWidth} {computedHeight}"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      focusable="false"
      aria-hidden="true"
    >
      <!-- liens lissés parent→enfant -->
      {#each links as link (link.key)}
        <path
          class="st-decompositionTreeChart__link"
          class:st-decompositionTreeChart__link--dim={hoveredKey !== null &&
            hoveredKey !== link.from.key &&
            hoveredKey !== link.to.key}
          d={linkPath(link)}
        />
      {/each}

      <!-- une colonne par niveau : barre horizontale dont la largeur ∝ value -->
      {#each cells as cell (cell.key)}
        {@const chars = charsFor(cell.barWidth)}
        <g class="st-decompositionTreeChart__node">
          <rect
            class="st-decompositionTreeChart__bar st-decompositionTreeChart__bar--{cell.tone}"
            class:st-decompositionTreeChart__bar--dim={hoveredKey !== null && hoveredKey !== cell.key}
            x={cell.x}
            y={cell.y}
            width={Math.max(cell.barWidth, 2)}
            height={BAR_H}
            rx="2"
            data-chart-key={cell.key}
          />
          {#if chars >= 2}
            <text
              class="st-decompositionTreeChart__label"
              x={cell.x + 4}
              y={cell.y + BAR_H / 2}
              dominant-baseline="central"
            >
              {ellipsize(cell.label, chars)}
            </text>
          {/if}
        </g>
      {/each}
    </svg>
  </div>

  <ChartDataList label={label ?? "decomposition tree"} items={dataValueItems} />

  {#if hoveredCell}
    {@const cell = hoveredCell}
    <div
      class="st-decompositionTreeChart__tooltip"
      role="presentation"
      style="left: {(cell.cx / computedWidth) * 100}%; top: {(cell.cy / computedHeight) * 100}%"
    >
      <span class="st-decompositionTreeChart__tooltipLabel">{cell.dimension} · {cell.label}</span>
      <span class="st-decompositionTreeChart__tooltipValue">{formatValue(cell.value)}</span>
    </div>
  {/if}
</div>

<style>
  .st-decompositionTreeChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-decompositionTreeChart svg {
    display: block;
    overflow: visible;
  }

  .st-decompositionTreeChart__visual {
    display: block;
  }

  .st-decompositionTreeChart__link {
    fill: none;
    stroke: var(--st-semantic-border-subtle);
    stroke-width: 1.5;
    transition: opacity 120ms ease;
  }

  .st-decompositionTreeChart__link--dim {
    opacity: 0.3;
  }

  .st-decompositionTreeChart__bar {
    cursor: pointer;
    stroke: var(--st-semantic-surface-default, Canvas);
    stroke-width: 1;
    transition: opacity 120ms ease;
  }

  .st-decompositionTreeChart__bar--dim {
    opacity: 0.4;
  }

  .st-decompositionTreeChart__bar--category1 { fill: var(--st-semantic-data-category1); }
  .st-decompositionTreeChart__bar--category2 { fill: var(--st-semantic-data-category2); }
  .st-decompositionTreeChart__bar--category3 { fill: var(--st-semantic-data-category3); }
  .st-decompositionTreeChart__bar--category4 { fill: var(--st-semantic-data-category4); }
  .st-decompositionTreeChart__bar--category5 { fill: var(--st-semantic-data-category5); }
  .st-decompositionTreeChart__bar--category6 { fill: var(--st-semantic-data-category6); }
  .st-decompositionTreeChart__bar--category7 { fill: var(--st-semantic-data-category7); }
  .st-decompositionTreeChart__bar--category8 { fill: var(--st-semantic-data-category8); }

  .st-decompositionTreeChart__label {
    fill: var(--st-semantic-text-inverse, #fff);
    font-size: 0.6875rem;
    pointer-events: none;
  }

  .st-decompositionTreeChart__tooltip {
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

  .st-decompositionTreeChart__tooltipLabel {
    font-weight: 600;
  }

  .st-decompositionTreeChart__tooltipValue {
    opacity: 0.85;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-decompositionTreeChart__bar,
    .st-decompositionTreeChart__link {
      transition: none;
    }
  }
</style>
