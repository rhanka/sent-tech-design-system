<script lang="ts" module>
  export type DashboardGridTile = {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    title?: string;
    description?: string;
    value?: string;
  };

  export type DashboardGridProps = {
    tiles: DashboardGridTile[];
    columns?: number;
    rowHeight?: number;
    gap?: number;
    editable?: boolean;
    label?: string;
    onLayout?: (tiles: DashboardGridTile[]) => void;
    class?: string;
  };
</script>

<script lang="ts">
  let {
    tiles,
    columns = 12,
    rowHeight = 88,
    gap = 16,
    editable = false,
    label = "Dashboard grid",
    onLayout,
    class: className
  }: DashboardGridProps = $props();

  const safeColumns = $derived(Math.max(1, Math.floor(columns || 12)));
  const safeRowHeight = $derived(Math.max(32, Math.floor(rowHeight || 88)));
  const safeGap = $derived(Math.max(0, Math.floor(gap || 0)));
  let localTiles = $state<DashboardGridTile[]>([]);
  let lastInputKey = $state("");

  function cloneTile(tile: DashboardGridTile): DashboardGridTile {
    return { ...tile };
  }

  function normalizeTile(tile: DashboardGridTile, colCount: number): DashboardGridTile {
    const w = Math.max(1, Math.min(colCount, Math.floor(tile.w || 1)));
    const x = Math.max(0, Math.min(colCount - w, Math.floor(tile.x || 0)));
    return {
      ...tile,
      id: String(tile.id),
      x,
      y: Math.max(0, Math.floor(tile.y || 0)),
      w,
      h: Math.max(1, Math.floor(tile.h || 1))
    };
  }

  function normalizeTiles(nextTiles: DashboardGridTile[], colCount = safeColumns): DashboardGridTile[] {
    return nextTiles.map((tile) => normalizeTile(cloneTile(tile), colCount));
  }

  $effect(() => {
    const key = JSON.stringify({ tiles, columns: safeColumns });
    if (key !== lastInputKey) {
      lastInputKey = key;
      localTiles = normalizeTiles(tiles, safeColumns);
    }
  });

  const layout = $derived(normalizeTiles(localTiles, safeColumns));

  function commit(nextTiles: DashboardGridTile[]) {
    const normalized = normalizeTiles(nextTiles, safeColumns);
    localTiles = normalized;
    onLayout?.(normalized.map(cloneTile));
  }

  function changeTile(id: string, patch: Partial<DashboardGridTile>) {
    commit(layout.map((tile) => (tile.id === id ? { ...tile, ...patch } : tile)));
  }

  function moveTile(id: string, dx: number, dy: number) {
    const tile = layout.find((candidate) => candidate.id === id);
    if (!tile) return;
    changeTile(id, { x: tile.x + dx, y: tile.y + dy });
  }

  function resizeTile(id: string, dw: number, dh: number) {
    const tile = layout.find((candidate) => candidate.id === id);
    if (!tile) return;
    changeTile(id, { w: tile.w + dw, h: tile.h + dh });
  }

  function tileStyle(tile: DashboardGridTile): string {
    return `grid-column: ${tile.x + 1} / span ${tile.w}; grid-row: ${tile.y + 1} / span ${tile.h};`;
  }

  const rootStyle = $derived(`--st-dashboardGrid-columns: ${safeColumns}; --st-dashboardGrid-row-height: ${safeRowHeight}px; --st-dashboardGrid-gap: ${safeGap}px;`);
  const classes = () => ["st-dashboardGrid", editable ? "st-dashboardGrid--editable" : undefined, className].filter(Boolean).join(" ");
</script>

<section class={classes()} style={rootStyle} aria-label={label}>
  {#each layout as tile (tile.id)}
    <article class="st-dashboardGrid__tile" style={tileStyle(tile)}>
      <div class="st-dashboardGrid__content">
        {#if tile.title}
          <h3 class="st-dashboardGrid__title">{tile.title}</h3>
        {/if}
        {#if tile.value}
          <p class="st-dashboardGrid__value">{tile.value}</p>
        {/if}
        {#if tile.description}
          <p class="st-dashboardGrid__description">{tile.description}</p>
        {/if}
      </div>

      {#if editable}
        <div class="st-dashboardGrid__controls" aria-label="Layout controls for {tile.title ?? tile.id}">
          <button type="button" onclick={() => moveTile(tile.id, 0, -1)} aria-label="Move {tile.title ?? tile.id} up">↑</button>
          <button type="button" onclick={() => moveTile(tile.id, -1, 0)} aria-label="Move {tile.title ?? tile.id} left">←</button>
          <button type="button" onclick={() => moveTile(tile.id, 1, 0)} aria-label="Move {tile.title ?? tile.id} right">→</button>
          <button type="button" onclick={() => moveTile(tile.id, 0, 1)} aria-label="Move {tile.title ?? tile.id} down">↓</button>
          <button type="button" onclick={() => resizeTile(tile.id, 1, 0)} aria-label="Widen {tile.title ?? tile.id}">W+</button>
          <button type="button" onclick={() => resizeTile(tile.id, -1, 0)} aria-label="Narrow {tile.title ?? tile.id}">W-</button>
          <button type="button" onclick={() => resizeTile(tile.id, 0, 1)} aria-label="Taller {tile.title ?? tile.id}">H+</button>
          <button type="button" onclick={() => resizeTile(tile.id, 0, -1)} aria-label="Shorter {tile.title ?? tile.id}">H-</button>
        </div>
      {/if}
    </article>
  {/each}
</section>

<style>
  .st-dashboardGrid {
    --st-component-dashboardGrid-tile-background: var(--st-semantic-surface-default);
    --st-component-dashboardGrid-tile-border-color: var(--st-semantic-border-subtle);
    --st-component-dashboardGrid-tile-border-width: var(--st-component-card-anatomy-shape-borderWidth);
    --st-component-dashboardGrid-tile-radius: var(--st-radius-lg);
    --st-component-dashboardGrid-tile-shadow: var(--st-shadow-sm);
    --st-component-dashboardGrid-title-fontSize: var(--st-component-field-labelTypography-size);
    --st-component-dashboardGrid-title-fontWeight: var(--st-component-field-labelTypography-weight);
    --st-component-dashboardGrid-title-letterSpacing: var(--st-component-field-labelTypography-letterSpacing);
    --st-component-dashboardGrid-value-fontSize: var(--st-component-button-anatomy-density-lg-fontSize);
    --st-component-dashboardGrid-value-fontWeight: var(--st-component-button-anatomy-typography-weight);
    --st-component-dashboardGrid-value-lineHeight: var(--st-component-field-labelTypography-lineHeight);
    --st-component-dashboardGrid-description-fontSize: var(--st-component-field-labelTypography-size);
    --st-component-dashboardGrid-control-fontSize: var(--st-component-button-anatomy-density-sm-fontSize);
    --st-component-dashboardGrid-control-fontWeight: var(--st-component-button-anatomy-typography-weight);
    --st-component-dashboardGrid-control-size: var(--st-component-button-anatomy-density-sm-controlHeight);
    --st-component-dashboardGrid-control-paddingInline: var(--st-spacing-2);
    --st-component-dashboardGrid-control-focusWidth: var(--st-component-card-anatomy-shape-borderWidth);
    display: grid;
    gap: var(--st-dashboardGrid-gap);
    grid-auto-rows: var(--st-dashboardGrid-row-height);
    grid-template-columns: repeat(var(--st-dashboardGrid-columns), minmax(0, 1fr));
    width: 100%;
  }

  .st-dashboardGrid__tile {
    background: var(--st-component-dashboardGrid-tile-background);
    border: var(--st-component-dashboardGrid-tile-border-width) solid var(--st-component-dashboardGrid-tile-border-color);
    border-radius: var(--st-component-dashboardGrid-tile-radius);
    box-shadow: var(--st-component-dashboardGrid-tile-shadow);
    color: var(--st-semantic-text-primary);
    min-width: 0;
    overflow: hidden;
    padding: var(--st-spacing-4);
    position: relative;
  }

  .st-dashboardGrid--editable .st-dashboardGrid__tile {
    outline: var(--st-component-dashboardGrid-tile-border-width) dashed var(--st-semantic-border-strong);
    outline-offset: calc(-1 * var(--st-spacing-2));
  }

  .st-dashboardGrid__content {
    display: grid;
    gap: var(--st-spacing-2);
  }

  .st-dashboardGrid__title {
    color: var(--st-semantic-text-secondary);
    font-size: var(--st-component-dashboardGrid-title-fontSize);
    font-weight: var(--st-component-dashboardGrid-title-fontWeight);
    letter-spacing: var(--st-component-dashboardGrid-title-letterSpacing);
    margin: 0;
    text-transform: uppercase;
  }

  .st-dashboardGrid__value {
    color: var(--st-semantic-text-primary);
    font-size: var(--st-component-dashboardGrid-value-fontSize);
    font-weight: var(--st-component-dashboardGrid-value-fontWeight);
    line-height: var(--st-component-dashboardGrid-value-lineHeight);
    margin: 0;
  }

  .st-dashboardGrid__description {
    color: var(--st-semantic-text-secondary);
    font-size: var(--st-component-dashboardGrid-description-fontSize);
    margin: 0;
  }

  .st-dashboardGrid__controls {
    align-items: center;
    bottom: var(--st-spacing-2);
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-1);
    position: absolute;
    right: var(--st-spacing-2);
  }

  .st-dashboardGrid__controls button {
    align-items: center;
    background: var(--st-semantic-surface-raised);
    border: var(--st-component-dashboardGrid-tile-border-width) solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-sm);
    color: var(--st-semantic-text-primary);
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-size: var(--st-component-dashboardGrid-control-fontSize);
    font-weight: var(--st-component-dashboardGrid-control-fontWeight);
    justify-content: center;
    min-height: var(--st-component-dashboardGrid-control-size);
    min-width: var(--st-component-dashboardGrid-control-size);
    padding: 0 var(--st-component-dashboardGrid-control-paddingInline);
  }

  .st-dashboardGrid__controls button:focus-visible {
    outline: var(--st-component-dashboardGrid-control-focusWidth) solid var(--st-semantic-border-interactive);
    outline-offset: var(--st-component-control-anatomy-focus-offset);
  }
</style>
