import {
  movePanel,
  normalizeLayout,
  resizePanel,
  type DashboardLayout,
  type PanelLayout,
} from '@sentropic/dataviz-core';
import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  watch,
  type PropType,
} from 'vue';

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

const panelStyle = {
  background: 'var(--st-semantic-surface-raised, #ffffff)',
  border: '1px solid var(--st-semantic-border-subtle, #d8dee8)',
  borderRadius: 'var(--st-radius-md, 0.5rem)',
  overflow: 'hidden',
  padding: 'var(--st-spacing-4, 1rem)',
  position: 'relative',
};

const editButtonStyle = {
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

/**
 * Serializable dashboard layout renderer with optional edit controls.
 */
export const DashboardGrid = defineComponent({
  name: 'DashboardGrid',
  props: {
    layout: { type: Object as PropType<DashboardLayout>, required: true },
    panels: { type: Array as PropType<DashboardGridPanel[]>, default: () => [] },
    editable: { type: Boolean, default: false },
    rowHeight: { type: Number, default: 112 },
    minPanelHeight: { type: Number, default: 96 },
    onLayoutChange: { type: Function as PropType<(layout: DashboardLayout) => void>, default: undefined },
    ariaLabel: { type: String, default: 'Dashboard layout' },
    class: { type: String, default: undefined },
  },
  emits: ['layoutChange'],
  setup(props, { emit, slots }) {
    const gridEl = shallowRef<HTMLElement | null>(null);
    const editedLayout = shallowRef<DashboardLayout | null>(null);
    const drag = shallowRef<DragState | null>(null);
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
      props.onLayoutChange?.(normalized);
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

    return () =>
      h(
        'div',
        {
          ref: gridEl,
          role: 'list',
          'aria-label': props.ariaLabel,
          class: props.class,
          style: {
            alignItems: 'stretch',
            display: 'grid',
            gap: 'var(--st-spacing-4, 1rem)',
            gridAutoRows: `${Math.max(32, props.rowHeight)}px`,
            gridTemplateColumns: `repeat(${columns.value}, minmax(0, 1fr))`,
            width: '100%',
          },
        },
        displayPanels.value.map((panel) => {
          const meta = metaFor(panel);
          const title = titleFor(panel);
          const children =
            slots.default?.({ meta, panel }) ??
            h('div', { style: { display: 'flex', flexDirection: 'column', gap: '0.25rem' } }, [
              h('strong', title),
              meta.description ? h('span', meta.description) : null,
            ]);
          return h(
            'section',
            {
              key: panel.id,
              role: 'listitem',
              'aria-label': title,
              style: {
                ...panelStyle,
                gridColumn: `${panel.x + 1} / span ${panel.w}`,
                gridRow: `${panel.y + 1} / span ${panel.h}`,
                minHeight: `${Math.max(32, props.minPanelHeight)}px`,
                paddingTop: props.editable ? '3.25rem' : panelStyle.padding,
              },
            },
            [
              props.editable
                ? h(
                    'button',
                    {
                      type: 'button',
                      'aria-label': `Drag ${title}`,
                      onPointerdown: (event: PointerEvent) => startPointer(event, panel, 'move'),
                      style: {
                        ...editButtonStyle,
                        cursor: 'grab',
                        left: 'var(--st-spacing-3, 0.75rem)',
                        position: 'absolute',
                        top: 'var(--st-spacing-3, 0.75rem)',
                        touchAction: 'none',
                      },
                    },
                    'Move',
                  )
                : null,
              props.editable
                ? h(
                    'div',
                    {
                      'aria-label': `Edit ${title}`,
                      style: {
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 'var(--st-spacing-1, 0.25rem)',
                        position: 'absolute',
                        right: 'var(--st-spacing-3, 0.75rem)',
                        top: 'var(--st-spacing-3, 0.75rem)',
                      },
                    },
                    [
                      h('button', { type: 'button', 'aria-label': `Move ${title} left`, onClick: () => moveBy(panel, -1, 0), style: editButtonStyle }, 'L'),
                      h('button', { type: 'button', 'aria-label': `Move ${title} right`, onClick: () => moveBy(panel, 1, 0), style: editButtonStyle }, 'R'),
                      h('button', { type: 'button', 'aria-label': `Move ${title} up`, onClick: () => moveBy(panel, 0, -1), style: editButtonStyle }, 'U'),
                      h('button', { type: 'button', 'aria-label': `Move ${title} down`, onClick: () => moveBy(panel, 0, 1), style: editButtonStyle }, 'D'),
                      h('button', { type: 'button', 'aria-label': `Narrow ${title}`, onClick: () => resizeBy(panel, -1, 0), style: editButtonStyle }, '-W'),
                      h('button', { type: 'button', 'aria-label': `Widen ${title}`, onClick: () => resizeBy(panel, 1, 0), style: editButtonStyle }, '+W'),
                      h('button', { type: 'button', 'aria-label': `Shorten ${title}`, onClick: () => resizeBy(panel, 0, -1), style: editButtonStyle }, '-H'),
                      h('button', { type: 'button', 'aria-label': `Heighten ${title}`, onClick: () => resizeBy(panel, 0, 1), style: editButtonStyle }, '+H'),
                    ],
                  )
                : null,
              h('div', { style: { height: '100%', minWidth: 0 } }, children),
              props.editable
                ? h(
                    'button',
                    {
                      type: 'button',
                      'aria-label': `Resize ${title}`,
                      onPointerdown: (event: PointerEvent) => startPointer(event, panel, 'resize'),
                      style: {
                        ...editButtonStyle,
                        bottom: 'var(--st-spacing-3, 0.75rem)',
                        cursor: 'nwse-resize',
                        position: 'absolute',
                        right: 'var(--st-spacing-3, 0.75rem)',
                        touchAction: 'none',
                      },
                    },
                    'Resize',
                  )
                : null,
            ],
          );
        }),
      );
  },
});
