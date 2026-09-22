<script lang="ts" module>
  import type { DashboardLayout, PanelLayout } from '@sentropic/dataviz-core';
  import type { Snippet } from 'svelte';

  export type DashboardGridPanel = {
    id: string;
    title?: string;
    description?: string;
  };

  export type DashboardGridProps = {
    /** Serializable dashboard layout from `@sentropic/dataviz-core/layout`. */
    layout: DashboardLayout;
    /** Optional display metadata for layout panel ids. */
    panels?: DashboardGridPanel[];
    /** Enables move/resize affordances and pointer drag handles. */
    editable?: boolean;
    /** Grid row height in px. */
    rowHeight?: number;
    /** Minimum visual height for a panel in px. */
    minPanelHeight?: number;
    /** Called with a normalized layout after every edit. */
    onLayoutChange?: (layout: DashboardLayout) => void;
    /** Optional panel content renderer: `(meta, panel) => Snippet`. */
    children?: Snippet<[DashboardGridPanel, PanelLayout]>;
    /** Accessible label for the panel list. */
    ariaLabel?: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { movePanel, normalizeLayout, resizePanel } from '@sentropic/dataviz-core';

  type DragKind = 'move' | 'resize';
  type DragState = {
    kind: DragKind;
    id: string;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    cellWidth: number;
    rowHeight: number;
  };

  let {
    layout,
    panels = [],
    editable = false,
    rowHeight = 112,
    minPanelHeight = 96,
    onLayoutChange,
    children,
    ariaLabel = 'Dashboard layout',
    class: className,
  }: DashboardGridProps = $props();

  let gridEl = $state<HTMLElement | null>(null);
  let editedLayout = $state<DashboardLayout | null>(null);
  let drag = $state<DragState | null>(null);

  const current = $derived(editedLayout ?? layout);

  $effect(() => {
    layout;
    editedLayout = null;
  });

  const panelById = $derived(new Map(panels.map((panel) => [panel.id, panel])));
  const displayPanels = $derived(normalizeLayout(current).panels);
  const columns = $derived(Math.max(1, current.columns));
  const gridStyle = $derived(
    `grid-template-columns: repeat(${columns}, minmax(0, 1fr)); --dv-dashboard-grid-row: ${Math.max(32, rowHeight)}px; --dv-dashboard-grid-min-panel: ${Math.max(32, minPanelHeight)}px;`,
  );

  function metaFor(panel: PanelLayout): DashboardGridPanel {
    return panelById.get(panel.id) ?? { id: panel.id };
  }

  function titleFor(panel: PanelLayout): string {
    return metaFor(panel).title ?? panel.id;
  }

  function commit(next: DashboardLayout): void {
    const normalized = normalizeLayout(next);
    editedLayout = normalized;
    onLayoutChange?.(normalized);
  }

  function moveBy(panel: PanelLayout, dx: number, dy: number): void {
    commit(movePanel(current, panel.id, panel.x + dx, panel.y + dy));
  }

  function resizeBy(panel: PanelLayout, dw: number, dh: number): void {
    commit(resizePanel(current, panel.id, panel.w + dw, panel.h + dh));
  }

  function startPointer(event: PointerEvent, panel: PanelLayout, kind: DragKind): void {
    if (!editable) return;
    const rect = gridEl?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    drag = {
      kind,
      id: panel.id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: panel.x,
      startY: panel.y,
      startW: panel.w,
      startH: panel.h,
      cellWidth: rect.width / columns,
      rowHeight: Math.max(32, rowHeight),
    };
  }

  function handlePointerMove(event: PointerEvent): void {
    if (!drag) return;
    const dx = Math.round((event.clientX - drag.startClientX) / drag.cellWidth);
    const dy = Math.round((event.clientY - drag.startClientY) / drag.rowHeight);
    if (drag.kind === 'move') {
      commit(movePanel(current, drag.id, drag.startX + dx, drag.startY + dy));
      return;
    }
    commit(resizePanel(current, drag.id, drag.startW + dx, drag.startH + dy));
  }

  function stopPointer(): void {
    drag = null;
  }
</script>

<svelte:window
  onpointermove={handlePointerMove}
  onpointerup={stopPointer}
  onpointercancel={stopPointer}
/>

<div
  bind:this={gridEl}
  role="list"
  aria-label={ariaLabel}
  class={['dv-dashboard-grid', className].filter(Boolean).join(' ')}
  class:dv-dashboard-grid--editable={editable}
  class:dv-dashboard-grid--dragging={drag !== null}
  style={gridStyle}
>
  {#each displayPanels as panel (panel.id)}
    {@const meta = metaFor(panel)}
    {@const title = titleFor(panel)}
    <section
      role="listitem"
      aria-label={title}
      class="dv-dashboard-grid__panel"
      style={`grid-column: ${panel.x + 1} / span ${panel.w}; grid-row: ${panel.y + 1} / span ${panel.h};`}
    >
      {#if editable}
        <button
          type="button"
          class="dv-dashboard-grid__dragHandle"
          aria-label={`Drag ${title}`}
          onpointerdown={(event) => startPointer(event, panel, 'move')}
        >
          Move
        </button>

        <div class="dv-dashboard-grid__toolbar" aria-label={`Edit ${title}`}>
          <button type="button" aria-label={`Move ${title} left`} onclick={() => moveBy(panel, -1, 0)}>L</button>
          <button type="button" aria-label={`Move ${title} right`} onclick={() => moveBy(panel, 1, 0)}>R</button>
          <button type="button" aria-label={`Move ${title} up`} onclick={() => moveBy(panel, 0, -1)}>U</button>
          <button type="button" aria-label={`Move ${title} down`} onclick={() => moveBy(panel, 0, 1)}>D</button>
          <button type="button" aria-label={`Narrow ${title}`} onclick={() => resizeBy(panel, -1, 0)}>-W</button>
          <button type="button" aria-label={`Widen ${title}`} onclick={() => resizeBy(panel, 1, 0)}>+W</button>
          <button type="button" aria-label={`Shorten ${title}`} onclick={() => resizeBy(panel, 0, -1)}>-H</button>
          <button type="button" aria-label={`Heighten ${title}`} onclick={() => resizeBy(panel, 0, 1)}>+H</button>
        </div>
      {/if}

      <div class="dv-dashboard-grid__content">
        {#if children}
          {@render children(meta, panel)}
        {:else}
          <div class="dv-dashboard-grid__fallback">
            <strong>{title}</strong>
            {#if meta.description}
              <span>{meta.description}</span>
            {/if}
          </div>
        {/if}
      </div>

      {#if editable}
        <button
          type="button"
          class="dv-dashboard-grid__resizeHandle"
          aria-label={`Resize ${title}`}
          onpointerdown={(event) => startPointer(event, panel, 'resize')}
        >
          Resize
        </button>
      {/if}
    </section>
  {/each}
</div>

<style>
  .dv-dashboard-grid {
    align-items: stretch;
    display: grid;
    gap: var(--st-spacing-4, 1rem);
    grid-auto-rows: var(--dv-dashboard-grid-row);
    width: 100%;
  }

  .dv-dashboard-grid__panel {
    background: var(--st-semantic-surface-raised, #ffffff);
    border: 1px solid var(--st-semantic-border-subtle, #d8dee8);
    border-radius: var(--st-radius-md, 0.5rem);
    min-height: var(--dv-dashboard-grid-min-panel);
    overflow: hidden;
    padding: var(--st-spacing-4, 1rem);
    position: relative;
  }

  .dv-dashboard-grid--editable .dv-dashboard-grid__panel {
    padding-top: 3.25rem;
  }

  .dv-dashboard-grid__content {
    height: 100%;
    min-width: 0;
  }

  .dv-dashboard-grid__fallback {
    color: var(--st-semantic-text-muted, #475569);
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-1, 0.25rem);
  }

  .dv-dashboard-grid__dragHandle,
  .dv-dashboard-grid__resizeHandle,
  .dv-dashboard-grid__toolbar button {
    align-items: center;
    background: var(--st-semantic-surface, #f8fafc);
    border: 1px solid var(--st-semantic-border-subtle, #d8dee8);
    border-radius: var(--st-radius-sm, 0.375rem);
    color: var(--st-semantic-text, #0f172a);
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-size: 0.75rem;
    height: 1.75rem;
    justify-content: center;
    min-width: 1.75rem;
    padding: 0 var(--st-spacing-2, 0.5rem);
    user-select: none;
  }

  .dv-dashboard-grid__dragHandle {
    cursor: grab;
    left: var(--st-spacing-3, 0.75rem);
    position: absolute;
    top: var(--st-spacing-3, 0.75rem);
    touch-action: none;
  }

  .dv-dashboard-grid--dragging .dv-dashboard-grid__dragHandle {
    cursor: grabbing;
  }

  .dv-dashboard-grid__toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-1, 0.25rem);
    position: absolute;
    right: var(--st-spacing-3, 0.75rem);
    top: var(--st-spacing-3, 0.75rem);
  }

  .dv-dashboard-grid__resizeHandle {
    bottom: var(--st-spacing-3, 0.75rem);
    cursor: nwse-resize;
    position: absolute;
    right: var(--st-spacing-3, 0.75rem);
    touch-action: none;
  }

  @media (max-width: 860px) {
    .dv-dashboard-grid {
      grid-template-columns: 1fr !important;
    }

    .dv-dashboard-grid__panel {
      grid-column: 1 / -1 !important;
      grid-row: auto !important;
    }
  }
</style>
