import {
  movePanel,
  normalizeLayout,
  resizePanel,
  type DashboardLayout,
  type PanelLayout,
} from '@sentropic/dataviz-core';
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

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
  /** Optional panel content renderer. */
  renderPanel?: (meta: DashboardGridPanel, panel: PanelLayout) => ReactNode;
  children?: (meta: DashboardGridPanel, panel: PanelLayout) => ReactNode;
  ariaLabel?: string;
  className?: string;
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

const panelStyle: CSSProperties = {
  background: 'var(--st-semantic-surface-raised, #ffffff)',
  border: '1px solid var(--st-semantic-border-subtle, #d8dee8)',
  borderRadius: 'var(--st-radius-md, 0.5rem)',
  overflow: 'hidden',
  padding: 'var(--st-spacing-4, 1rem)',
  position: 'relative',
};

const editButtonStyle: CSSProperties = {
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
export function DashboardGrid({
  layout,
  panels = [],
  editable = false,
  rowHeight = 112,
  minPanelHeight = 96,
  onLayoutChange,
  renderPanel,
  children,
  ariaLabel = 'Dashboard layout',
  className,
}: DashboardGridProps) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const [editedLayout, setEditedLayout] = useState<DashboardLayout | null>(null);
  const current = editedLayout ?? layout;
  const columns = Math.max(1, current.columns);
  const panelById = useMemo(() => new Map(panels.map((panel) => [panel.id, panel])), [panels]);
  const displayPanels = useMemo(() => normalizeLayout(current).panels, [current]);

  useEffect(() => {
    setEditedLayout(null);
  }, [layout]);

  const commit = (next: DashboardLayout) => {
    const normalized = normalizeLayout(next);
    setEditedLayout(normalized);
    onLayoutChange?.(normalized);
  };

  const metaFor = (panel: PanelLayout): DashboardGridPanel =>
    panelById.get(panel.id) ?? { id: panel.id };
  const titleFor = (panel: PanelLayout): string => metaFor(panel).title ?? panel.id;
  const moveBy = (panel: PanelLayout, dx: number, dy: number) =>
    commit(movePanel(current, panel.id, panel.x + dx, panel.y + dy));
  const resizeBy = (panel: PanelLayout, dw: number, dh: number) =>
    commit(resizePanel(current, panel.id, panel.w + dw, panel.h + dh));

  const startPointer = (
    event: ReactPointerEvent<HTMLButtonElement>,
    panel: PanelLayout,
    kind: DragKind,
  ) => {
    if (!editable) return;
    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = {
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
  };

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = Math.round((event.clientX - drag.startClientX) / drag.cellWidth);
      const dy = Math.round((event.clientY - drag.startClientY) / drag.rowHeight);
      if (drag.kind === 'move') {
        commit(movePanel(current, drag.id, drag.startX + dx, drag.startY + dy));
        return;
      }
      commit(resizePanel(current, drag.id, drag.startW + dx, drag.startH + dy));
    };
    const stopPointer = () => {
      dragRef.current = null;
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', stopPointer);
    window.addEventListener('pointercancel', stopPointer);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', stopPointer);
      window.removeEventListener('pointercancel', stopPointer);
    };
  }, [current, rowHeight]);

  const gridStyle = {
    alignItems: 'stretch',
    display: 'grid',
    gap: 'var(--st-spacing-4, 1rem)',
    gridAutoRows: `${Math.max(32, rowHeight)}px`,
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    width: '100%',
  } satisfies CSSProperties;

  const render = renderPanel ?? children;

  return (
    <div ref={gridRef} role="list" aria-label={ariaLabel} className={className} style={gridStyle}>
      {displayPanels.map((panel) => {
        const meta = metaFor(panel);
        const title = titleFor(panel);
        return (
          <section
            key={panel.id}
            role="listitem"
            aria-label={title}
            style={{
              ...panelStyle,
              gridColumn: `${panel.x + 1} / span ${panel.w}`,
              gridRow: `${panel.y + 1} / span ${panel.h}`,
              minHeight: `${Math.max(32, minPanelHeight)}px`,
              paddingTop: editable ? '3.25rem' : panelStyle.padding,
            }}
          >
            {editable ? (
              <>
                <button
                  type="button"
                  aria-label={`Drag ${title}`}
                  onPointerDown={(event) => startPointer(event, panel, 'move')}
                  style={{
                    ...editButtonStyle,
                    cursor: 'grab',
                    left: 'var(--st-spacing-3, 0.75rem)',
                    position: 'absolute',
                    top: 'var(--st-spacing-3, 0.75rem)',
                    touchAction: 'none',
                  }}
                >
                  Move
                </button>
                <div
                  aria-label={`Edit ${title}`}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--st-spacing-1, 0.25rem)',
                    position: 'absolute',
                    right: 'var(--st-spacing-3, 0.75rem)',
                    top: 'var(--st-spacing-3, 0.75rem)',
                  }}
                >
                  <button type="button" aria-label={`Move ${title} left`} onClick={() => moveBy(panel, -1, 0)} style={editButtonStyle}>L</button>
                  <button type="button" aria-label={`Move ${title} right`} onClick={() => moveBy(panel, 1, 0)} style={editButtonStyle}>R</button>
                  <button type="button" aria-label={`Move ${title} up`} onClick={() => moveBy(panel, 0, -1)} style={editButtonStyle}>U</button>
                  <button type="button" aria-label={`Move ${title} down`} onClick={() => moveBy(panel, 0, 1)} style={editButtonStyle}>D</button>
                  <button type="button" aria-label={`Narrow ${title}`} onClick={() => resizeBy(panel, -1, 0)} style={editButtonStyle}>-W</button>
                  <button type="button" aria-label={`Widen ${title}`} onClick={() => resizeBy(panel, 1, 0)} style={editButtonStyle}>+W</button>
                  <button type="button" aria-label={`Shorten ${title}`} onClick={() => resizeBy(panel, 0, -1)} style={editButtonStyle}>-H</button>
                  <button type="button" aria-label={`Heighten ${title}`} onClick={() => resizeBy(panel, 0, 1)} style={editButtonStyle}>+H</button>
                </div>
              </>
            ) : null}

            <div style={{ height: '100%', minWidth: 0 }}>
              {render ? (
                render(meta, panel)
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <strong>{title}</strong>
                  {meta.description ? <span>{meta.description}</span> : null}
                </div>
              )}
            </div>

            {editable ? (
              <button
                type="button"
                aria-label={`Resize ${title}`}
                onPointerDown={(event) => startPointer(event, panel, 'resize')}
                style={{
                  ...editButtonStyle,
                  bottom: 'var(--st-spacing-3, 0.75rem)',
                  cursor: 'nwse-resize',
                  position: 'absolute',
                  right: 'var(--st-spacing-3, 0.75rem)',
                  touchAction: 'none',
                }}
              >
                Resize
              </button>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
