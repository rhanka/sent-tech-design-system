<script setup lang="ts">
import { movePanel, normalizeLayout, resizePanel, type DashboardLayout, type PanelLayout } from '@sentropic/dataviz-core';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
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
  ariaLabel?: string;
  class?: string;
};
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
const panelStyle: Record<string, string> = {
  background: 'var(--st-semantic-surface-raised, #ffffff)',
  border: '1px solid var(--st-semantic-border-subtle, #d8dee8)',
  borderRadius: 'var(--st-radius-md, 0.5rem)',
  overflow: 'hidden',
  padding: 'var(--st-spacing-4, 1rem)',
  position: 'relative',
};
const editButtonStyle: Record<string, string> = {
  alignItems: 'center',
  background: 'var(--st-semantic-surface, #f8fafc)',
  border: '1px solid var(--st-semantic-border-subtle, #d8dee8)',
  borderRadius: 'var(--st-radius-sm, 0.375rem)',
  color: 'var(--st-semantic-text, #0f172a)',
  cursor: 'pointer',
  display: 'inline-flex',
  font: 'inherit',
  fontSize: '0.75rem',
  height: '1.75rem',
  justifyContent: 'center',
  minWidth: '1.75rem',
  padding: '0 var(--st-spacing-2, 0.5rem)',
  userSelect: 'none',
};
defineOptions({ name: 'DashboardGrid' });
const props = withDefaults(defineProps<DashboardGridProps>(), {
  panels: () => [], editable: false, rowHeight: 112, minPanelHeight: 96,
  onLayoutChange: undefined, ariaLabel: 'Dashboard layout', class: undefined,
});
const emit = defineEmits<{ layoutChange: [layout: DashboardLayout] }>();
defineSlots<{ default?: (scope: { meta: DashboardGridPanel; panel: PanelLayout }) => unknown }>();
const gridEl = ref<HTMLElement | null>(null);
const editedLayout = ref<DashboardLayout | null>(null);
const drag = ref<DragState | null>(null);
const current = computed(() => editedLayout.value ?? props.layout);
const columns = computed(() => Math.max(1, current.value.columns));
const panelById = computed(() => new Map(props.panels.map((panel) => [panel.id, panel])));
const displayPanels = computed(() => normalizeLayout(current.value).panels);
watch(
  () => props.layout,
  () => {
    editedLayout.value = null;
  },
);
function metaFor(panel: PanelLayout): DashboardGridPanel {
  return panelById.value.get(panel.id) ?? { id: panel.id };
}
function titleFor(panel: PanelLayout): string {
  return metaFor(panel).title ?? panel.id;
}
function commit(next: DashboardLayout): void {
  const normalized = normalizeLayout(next);
  editedLayout.value = normalized;
  emit('layoutChange', normalized);
}
function moveBy(panel: PanelLayout, dx: number, dy: number): void {
  commit(movePanel(current.value, panel.id, panel.x + dx, panel.y + dy));
}
function resizeBy(panel: PanelLayout, dw: number, dh: number): void {
  commit(resizePanel(current.value, panel.id, panel.w + dw, panel.h + dh));
}
function startPointer(event: PointerEvent, panel: PanelLayout, kind: DragKind): void {
  if (!props.editable) return;
  const rect = gridEl.value?.getBoundingClientRect();
  if (!rect || rect.width <= 0) return;
  event.preventDefault();
  (event.currentTarget as HTMLElement | null)?.setPointerCapture?.(event.pointerId);
  drag.value = {
    kind,
    id: panel.id,
    startClientX: event.clientX,
    startClientY: event.clientY,
    startX: panel.x,
    startY: panel.y,
    startW: panel.w,
    startH: panel.h,
    cellWidth: rect.width / columns.value,
    rowHeight: Math.max(32, props.rowHeight),
  };
}
function onPointerMove(event: PointerEvent): void {
  const active = drag.value;
  if (!active) return;
  const dx = Math.round((event.clientX - active.startClientX) / active.cellWidth);
  const dy = Math.round((event.clientY - active.startClientY) / active.rowHeight);
  if (active.kind === 'move') {
    commit(movePanel(current.value, active.id, active.startX + dx, active.startY + dy));
    return;
  }
  commit(resizePanel(current.value, active.id, active.startW + dx, active.startH + dy));
}
function stopPointer(): void {
  drag.value = null;
}
onMounted(() => {
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', stopPointer);
  window.addEventListener('pointercancel', stopPointer);
});
onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', stopPointer);
  window.removeEventListener('pointercancel', stopPointer);
});
</script>

<template>
  <div ref="gridEl" role="list" :aria-label="props.ariaLabel" :class="props.class"
    :style="{ alignItems: 'stretch', display: 'grid', gap: 'var(--st-spacing-4, 1rem)', gridAutoRows: `${Math.max(32, props.rowHeight)}px`, gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, width: '100%' }">
    <section v-for="panel in displayPanels" :key="panel.id" role="listitem" :aria-label="titleFor(panel)"
      :style="{ ...panelStyle, gridColumn: `${panel.x + 1} / span ${panel.w}`, gridRow: `${panel.y + 1} / span ${panel.h}`, minHeight: `${Math.max(32, props.minPanelHeight)}px`, paddingTop: props.editable ? '3.25rem' : panelStyle.padding }">
      <button v-if="props.editable" type="button" :aria-label="`Drag ${titleFor(panel)}`"
        :style="{ ...editButtonStyle, cursor: 'grab', left: 'var(--st-spacing-3, 0.75rem)', position: 'absolute', top: 'var(--st-spacing-3, 0.75rem)', touchAction: 'none' }"
        @pointerdown="(event: PointerEvent) => startPointer(event, panel, 'move')">Move</button>
      <div v-if="props.editable" :aria-label="`Edit ${titleFor(panel)}`"
        :style="{ display: 'flex', flexWrap: 'wrap', gap: 'var(--st-spacing-1, 0.25rem)', position: 'absolute', right: 'var(--st-spacing-3, 0.75rem)', top: 'var(--st-spacing-3, 0.75rem)' }">
        <button type="button" :aria-label="`Move ${titleFor(panel)} left`" :style="editButtonStyle" @click="moveBy(panel, -1, 0)">L</button>
        <button type="button" :aria-label="`Move ${titleFor(panel)} right`" :style="editButtonStyle" @click="moveBy(panel, 1, 0)">R</button>
        <button type="button" :aria-label="`Move ${titleFor(panel)} up`" :style="editButtonStyle" @click="moveBy(panel, 0, -1)">U</button>
        <button type="button" :aria-label="`Move ${titleFor(panel)} down`" :style="editButtonStyle" @click="moveBy(panel, 0, 1)">D</button>
        <button type="button" :aria-label="`Narrow ${titleFor(panel)}`" :style="editButtonStyle" @click="resizeBy(panel, -1, 0)">-W</button>
        <button type="button" :aria-label="`Widen ${titleFor(panel)}`" :style="editButtonStyle" @click="resizeBy(panel, 1, 0)">+W</button>
        <button type="button" :aria-label="`Shorten ${titleFor(panel)}`" :style="editButtonStyle" @click="resizeBy(panel, 0, -1)">-H</button>
        <button type="button" :aria-label="`Heighten ${titleFor(panel)}`" :style="editButtonStyle" @click="resizeBy(panel, 0, 1)">+H</button>
      </div>
      <div :style="{ height: '100%', minWidth: 0 }">
        <slot v-if="$slots.default" :meta="metaFor(panel)" :panel="panel" />
        <div v-else :style="{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }">
          <strong>{{ titleFor(panel) }}</strong>
          <span v-if="metaFor(panel).description">{{ metaFor(panel).description }}</span>
        </div>
      </div>
      <button v-if="props.editable" type="button" :aria-label="`Resize ${titleFor(panel)}`"
        :style="{ ...editButtonStyle, bottom: 'var(--st-spacing-3, 0.75rem)', cursor: 'nwse-resize', position: 'absolute', right: 'var(--st-spacing-3, 0.75rem)', touchAction: 'none' }"
        @pointerdown="(event: PointerEvent) => startPointer(event, panel, 'resize')">Resize</button>
    </section>
  </div>
</template>
