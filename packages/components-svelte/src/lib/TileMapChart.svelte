<script lang="ts" module>
  /**
   * TileMapChart (carte en tuiles / cartogramme « tilemap ») - API canonique
   * (référence Svelte, React/Vue doivent s'aligner).
   *
   * Grille de tuiles carrées posées à des coordonnées (col, row) EXPLICITES
   * (pas une matrice dense : chaque entrée porte sa propre cellule). La couleur
   * de chaque tuile suit une échelle séquentielle de la valeur min→max, reprise
   * de l'approche HeatmapChart (8 tons catégoriels data-categoryN). Un libellé
   * court est posé au centre de chaque tuile. Une légende de gradient affiche le
   * sens min→max.
   *
   * Props obligatoires :
   *   data   TileMapChartTile[]  - {label, col, row, value}
   *   label  string              - aria-label du graphique (role=img)
   *
   * Props optionnelles :
   *   width   number  (défaut 480) - largeur du viewBox en px
   *   height  number  (défaut 360) - hauteur du viewBox en px
   *   class   string              - classe CSS supplémentaire
   *
   * Taille des tuiles : auto selon (colMax, rowMax). Chaque tuile est carrée ;
   * le côté est le minimum entre la largeur disponible / nb colonnes et la
   * hauteur disponible / nb lignes, pour ne jamais déborder.
   *
   * NaN/non-fini : les tuiles dont value est non-finie sont exclues du calcul
   *   min/max ET du rendu (Number.isFinite). Une tuile dont col/row est non-fini
   *   est ignorée. Tableau vide ou tout-NaN → rendu vide sans crash.
   */
  export type TileMapChartTile = {
    label: string;
    col: number;
    row: number;
    value: number;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  type TileMapChartProps = {
    data: TileMapChartTile[];
    label: string;
    width?: number;
    height?: number;
    class?: string;
  };

  let {
    data = [],
    label,
    width = 480,
    height = 360,
    class: className
  }: TileMapChartProps = $props();

  const MARGIN = { top: 16, right: 16, bottom: 44, left: 16 };
  const TONES = [
    "category1",
    "category2",
    "category3",
    "category4",
    "category5",
    "category6",
    "category7",
    "category8"
  ] as const;
  const GAP = 4;

  function toneForValue(value: number, min: number, max: number): (typeof TONES)[number] {
    if (!Number.isFinite(value) || max <= min) return "category1";
    const index = Math.max(0, Math.min(TONES.length - 1, Math.floor(((value - min) / (max - min)) * TONES.length)));
    return TONES[index];
  }

  function formatNumber(value: number): string {
    if (!Number.isFinite(value)) return "0";
    if (Number.isInteger(value)) return String(value);
    return value.toFixed(2).replace(/\.?0+$/, "");
  }

  let hoveredIndex: number | null = $state(null);

  const plotWidth = $derived(Math.max(width - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  const valid = $derived(
    data.filter(
      (tile) => Number.isFinite(tile.col) && Number.isFinite(tile.row) && Number.isFinite(tile.value)
    )
  );

  const tiles = $derived.by(() => {
    if (valid.length === 0) return [];

    const cols = Math.max(...valid.map((t) => t.col)) + 1;
    const rows = Math.max(...valid.map((t) => t.row)) + 1;
    const values = valid.map((t) => t.value);
    const min = Math.min(...values);
    const max = Math.max(...values);

    // tuile carrée, dimensionnée pour tenir dans le plot
    const side = Math.max(Math.min(plotWidth / cols, plotHeight / rows) - GAP, 1);
    // centre la grille dans la zone de plot
    const gridW = cols * (side + GAP) - GAP;
    const gridH = rows * (side + GAP) - GAP;
    const offsetX = MARGIN.left + Math.max((plotWidth - gridW) / 2, 0);
    const offsetY = MARGIN.top + Math.max((plotHeight - gridH) / 2, 0);

    return valid.map((tile, index) => {
      const x = offsetX + tile.col * (side + GAP);
      const y = offsetY + tile.row * (side + GAP);
      return {
        tile,
        index,
        tone: toneForValue(tile.value, min, max),
        x,
        y,
        side,
        cx: x + side / 2,
        cy: y + side / 2
      };
    });
  });

  const dataValueItems = $derived(valid.map((tile) => `${tile.label}: ${formatNumber(tile.value)}`));

  function handleVisualPointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredIndex = null;
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    hoveredIndex = Number.isInteger(index) ? index : null;
  }

  const classes = () => ["st-tileMapChart", className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-tileMapChart__visual"
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
      {#each tiles as tile, i (`${tile.tile.label}-${i}`)}
        <g>
          <rect
            class="st-tileMapChart__tile st-tileMapChart__tile--{tile.tone}"
            class:st-tileMapChart__tile--dim={hoveredIndex !== null && hoveredIndex !== i}
            x={tile.x}
            y={tile.y}
            width={tile.side}
            height={tile.side}
            rx="3"
            data-chart-index={i}
          />
          {#if tile.side > 18}
            <text
              class="st-tileMapChart__tileLabel"
              x={tile.cx}
              y={tile.cy}
              text-anchor="middle"
              dominant-baseline="middle"
              pointer-events="none"
            >
              {tile.tile.label}
            </text>
          {/if}
        </g>
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredIndex !== null && tiles[hoveredIndex]}
    {@const tile = tiles[hoveredIndex]}
    <div
      class="st-tileMapChart__tooltip"
      role="presentation"
      style="left: {(tile.cx / width) * 100}%; top: {(tile.cy / height) * 100}%"
    >
      <span class="st-tileMapChart__tooltipLabel">{tile.tile.label}</span>
      <span class="st-tileMapChart__tooltipValue">{formatNumber(tile.tile.value)}</span>
    </div>
  {/if}

  <div class="st-tileMapChart__legend" aria-hidden="true">
    <span class="st-tileMapChart__legendText">Low</span>
    <span class="st-tileMapChart__legendRamp">
      {#each TONES as tone (tone)}
        <span class="st-tileMapChart__legendSwatch st-tileMapChart__legendSwatch--{tone}"></span>
      {/each}
    </span>
    <span class="st-tileMapChart__legendText">High</span>
  </div>
</div>

<style>
  .st-tileMapChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    max-width: 100%;
    position: relative;
    width: 100%;
  }

  .st-tileMapChart svg,
  .st-tileMapChart__visual {
    display: block;
    overflow: visible;
  }

  .st-tileMapChart__tile {
    cursor: pointer;
    stroke: var(--st-semantic-surface-default, Canvas);
    stroke-width: 1;
    transition: opacity 120ms ease;
  }

  .st-tileMapChart__tile--dim {
    opacity: 0.4;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-tileMapChart__tile {
      transition: none;
    }
  }

  .st-tileMapChart__tile--category1,
  .st-tileMapChart__legendSwatch--category1 { fill: var(--st-semantic-data-category1); background: var(--st-semantic-data-category1); }
  .st-tileMapChart__tile--category2,
  .st-tileMapChart__legendSwatch--category2 { fill: var(--st-semantic-data-category2); background: var(--st-semantic-data-category2); }
  .st-tileMapChart__tile--category3,
  .st-tileMapChart__legendSwatch--category3 { fill: var(--st-semantic-data-category3); background: var(--st-semantic-data-category3); }
  .st-tileMapChart__tile--category4,
  .st-tileMapChart__legendSwatch--category4 { fill: var(--st-semantic-data-category4); background: var(--st-semantic-data-category4); }
  .st-tileMapChart__tile--category5,
  .st-tileMapChart__legendSwatch--category5 { fill: var(--st-semantic-data-category5); background: var(--st-semantic-data-category5); }
  .st-tileMapChart__tile--category6,
  .st-tileMapChart__legendSwatch--category6 { fill: var(--st-semantic-data-category6); background: var(--st-semantic-data-category6); }
  .st-tileMapChart__tile--category7,
  .st-tileMapChart__legendSwatch--category7 { fill: var(--st-semantic-data-category7); background: var(--st-semantic-data-category7); }
  .st-tileMapChart__tile--category8,
  .st-tileMapChart__legendSwatch--category8 { fill: var(--st-semantic-data-category8); background: var(--st-semantic-data-category8); }

  .st-tileMapChart__tileLabel {
    fill: var(--st-semantic-text-inverse);
    font-size: 0.6875rem;
    font-weight: 600;
  }

  .st-tileMapChart__legend {
    align-items: center;
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    margin-top: var(--st-spacing-2, 0.5rem);
  }

  .st-tileMapChart__legendRamp {
    display: inline-grid;
    grid-template-columns: repeat(8, minmax(0.75rem, 1fr));
    min-width: 8rem;
  }

  .st-tileMapChart__legendSwatch {
    display: block;
    height: 0.5rem;
  }

  .st-tileMapChart__legendText {
    color: var(--st-semantic-text-secondary);
    font-size: 0.75rem;
  }

  .st-tileMapChart__tooltip {
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
    transform: translate(-50%, -115%);
    white-space: nowrap;
    z-index: 1;
  }

  .st-tileMapChart__tooltipLabel {
    font-weight: 600;
  }

  .st-tileMapChart__tooltipValue {
    opacity: 0.85;
  }
</style>
