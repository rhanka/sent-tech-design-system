/**
 * Dashboard layout model — serialisable grid-based panel layout.
 *
 * A {@link DashboardLayout} is a presentation-free, serialisable description of
 * how panels are arranged on a dashboard grid. Positions and spans are expressed
 * in *grid cells* (column/row integers), never in pixels. No rendering, no drag-
 * resize, no framework concerns live here — the design-system consumer is the
 * rendering authority.
 *
 * This extends the existing bookmark capability (filters/selections/drill in
 * `serialize.ts`) with layout persistence. The two models are intentionally
 * standalone: compose them at call-site rather than merging the store internals.
 *
 * Design constraints:
 * - **Immutable helpers** — every mutation helper returns a *new* layout; the
 *   input is never modified.
 * - **Clamped coordinates** — x/y/w/h are always clamped to valid grid bounds
 *   before being stored; out-of-range inputs are silently clamped, not rejected.
 * - **Unknown id is a no-op** — `removePanel`, `movePanel`, `resizePanel` do
 *   nothing when the panel id is not found, returning the original layout.
 * - **Serialisation contract** — `serializeLayout` produces plain JSON (not
 *   URL-encoded); `deserializeLayout` never throws, returning `null` on any
 *   invalid input.
 */

// --- Types ------------------------------------------------------------------

/**
 * A single panel's position and size on the grid.
 *
 * All values are non-negative integers in grid-cell units:
 * - `x` / `y` — column / row origin (0-based).
 * - `w` / `h` — column / row span (≥ 1).
 */
export interface PanelLayout {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * The full layout state for a dashboard grid.
 *
 * - `columns` — total number of columns in the grid (e.g. 12).
 * - `panels`  — ordered list of panel layouts.
 */
export interface DashboardLayout {
  columns: number;
  panels: PanelLayout[];
}

// --- Runtime validation -----------------------------------------------------

function isNonNegativeInteger(v: unknown): boolean {
  return typeof v === 'number' && Number.isFinite(v) && Number.isInteger(v) && v >= 0;
}

function isPositiveInteger(v: unknown): boolean {
  return typeof v === 'number' && Number.isFinite(v) && Number.isInteger(v) && (v as number) > 0;
}

/**
 * Return `true` if `v` is a well-formed {@link PanelLayout}:
 * - `id` is a non-empty string.
 * - `x` and `y` are non-negative integers.
 * - `w` and `h` are positive integers (≥ 1).
 */
export function isPanelLayout(v: unknown): v is PanelLayout {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return false;
  const p = v as Record<string, unknown>;
  return (
    typeof p.id === 'string' &&
    p.id.length > 0 &&
    isNonNegativeInteger(p.x) &&
    isNonNegativeInteger(p.y) &&
    isPositiveInteger(p.w) &&
    isPositiveInteger(p.h)
  );
}

/**
 * Return `true` if `v` is a well-formed {@link DashboardLayout}:
 * - `columns` is a positive integer (≥ 1).
 * - `panels` is an array of valid {@link PanelLayout} objects.
 */
export function isDashboardLayout(v: unknown): v is DashboardLayout {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return false;
  const d = v as Record<string, unknown>;
  return isPositiveInteger(d.columns) && Array.isArray(d.panels) && d.panels.every(isPanelLayout);
}

// --- Internal helpers -------------------------------------------------------

const DEFAULT_COLUMNS = 12;

/** Clamp `x` to [0, columns - 1]. */
function clampX(x: number, columns: number): number {
  return Math.max(0, Math.min(Math.floor(x), columns - 1));
}

/** Clamp `y` to [0, ∞). */
function clampY(y: number): number {
  return Math.max(0, Math.floor(y));
}

/** Clamp `w` to [1, columns - x]. */
function clampW(w: number, x: number, columns: number): number {
  return Math.max(1, Math.min(Math.floor(w), columns - x));
}

/** Clamp `h` to [1, ∞). */
function clampH(h: number): number {
  return Math.max(1, Math.floor(h));
}

function clampPanel(panel: PanelLayout, columns: number): PanelLayout {
  const x = clampX(panel.x, columns);
  const y = clampY(panel.y);
  const w = clampW(panel.w, x, columns);
  const h = clampH(panel.h);
  return { id: panel.id, x, y, w, h };
}

// --- Public API -------------------------------------------------------------

/**
 * Create a new, empty {@link DashboardLayout}.
 *
 * @param columns  Number of grid columns (defaults to 12).
 */
export function createLayout(columns: number = DEFAULT_COLUMNS): DashboardLayout {
  const cols = Math.max(1, Math.floor(columns));
  return { columns: cols, panels: [] };
}

/**
 * Return a new layout with `panel` added.
 *
 * The panel's coordinates are clamped to the grid bounds before insertion.
 * If a panel with the same `id` already exists, it is replaced.
 */
export function addPanel(layout: DashboardLayout, panel: PanelLayout): DashboardLayout {
  const clamped = clampPanel(panel, layout.columns);
  const filtered = layout.panels.filter((p) => p.id !== clamped.id);
  return { columns: layout.columns, panels: [...filtered, clamped] };
}

/**
 * Return a new layout with the panel identified by `id` removed.
 *
 * If `id` is not found the original layout is returned unchanged.
 */
export function removePanel(layout: DashboardLayout, id: string): DashboardLayout {
  const panels = layout.panels.filter((p) => p.id !== id);
  if (panels.length === layout.panels.length) return layout;
  return { columns: layout.columns, panels };
}

/**
 * Return a new layout with the panel identified by `id` moved to (`x`, `y`).
 *
 * Coordinates are clamped to the grid. If `id` is not found the original
 * layout is returned unchanged.
 */
export function movePanel(layout: DashboardLayout, id: string, x: number, y: number): DashboardLayout {
  const idx = layout.panels.findIndex((p) => p.id === id);
  if (idx === -1) return layout;
  const panel = layout.panels[idx]!;
  const nx = clampX(x, layout.columns);
  const ny = clampY(y);
  const nw = clampW(panel.w, nx, layout.columns);
  const nh = clampH(panel.h);
  const updated: PanelLayout = { id: panel.id, x: nx, y: ny, w: nw, h: nh };
  const panels = [...layout.panels.slice(0, idx), updated, ...layout.panels.slice(idx + 1)];
  return { columns: layout.columns, panels };
}

/**
 * Return a new layout with the panel identified by `id` resized to (`w`, `h`).
 *
 * The span is clamped so the panel does not overflow the grid. If `id` is not
 * found the original layout is returned unchanged.
 */
export function resizePanel(layout: DashboardLayout, id: string, w: number, h: number): DashboardLayout {
  const idx = layout.panels.findIndex((p) => p.id === id);
  if (idx === -1) return layout;
  const panel = layout.panels[idx]!;
  const nw = clampW(w, panel.x, layout.columns);
  const nh = clampH(h);
  const updated: PanelLayout = { id: panel.id, x: panel.x, y: panel.y, w: nw, h: nh };
  const panels = [...layout.panels.slice(0, idx), updated, ...layout.panels.slice(idx + 1)];
  return { columns: layout.columns, panels };
}

/**
 * Normalise a layout:
 * 1. Clamp every panel's coordinates/spans within the grid.
 * 2. Deduplicate panels by id — last occurrence wins.
 * 3. Sort panels deterministically by (`y` asc, `x` asc, `id` asc).
 *
 * Returns a new layout; the input is not modified.
 */
export function normalizeLayout(layout: DashboardLayout): DashboardLayout {
  // Dedupe: last wins — iterate in order so later entries overwrite earlier ones.
  const seen = new Map<string, PanelLayout>();
  for (const panel of layout.panels) {
    seen.set(panel.id, clampPanel(panel, layout.columns));
  }
  const panels = [...seen.values()].sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    if (a.x !== b.x) return a.x - b.x;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
  return { columns: layout.columns, panels };
}

// --- Serialisation ----------------------------------------------------------

/**
 * Serialise a {@link DashboardLayout} to a plain JSON string.
 *
 * Throws a {@link TypeError} if `layout` is not a valid {@link DashboardLayout}.
 * The output is plain JSON (not URL-encoded) — callers that need URL-safety
 * should apply `encodeURIComponent` themselves.
 */
export function serializeLayout(layout: DashboardLayout): string {
  if (!isDashboardLayout(layout)) {
    throw new TypeError('Cannot serialize malformed DashboardLayout');
  }
  return JSON.stringify(layout);
}

/**
 * Parse a JSON string back into a {@link DashboardLayout}.
 *
 * Returns `null` on any error (empty input, invalid JSON, missing/invalid
 * fields, negative or non-integer values). **Never throws.**
 */
export function deserializeLayout(s: string): DashboardLayout | null {
  if (!s) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(s);
  } catch {
    return null;
  }
  if (!isDashboardLayout(raw)) return null;
  return raw;
}

// --- Reactive state holder --------------------------------------------------

/**
 * The public interface of a layout state container.
 *
 * Mirrors the pattern of {@link HoverChannel} in `hover.ts`: an ephemeral
 * reactive holder for a {@link DashboardLayout} value. Subscribers are
 * notified synchronously on every change; unchanged updates (same reference)
 * are no-ops.
 */
export interface LayoutState {
  /** Return the current layout. */
  get(): DashboardLayout;
  /**
   * Replace the current layout. Notifies all subscribers synchronously.
   * No-op if `layout` is strictly equal (same reference) to the current value.
   */
  set(layout: DashboardLayout): void;
  /**
   * Apply a transformation function to the current layout and store the result.
   * The update fn receives the current layout and must return a new layout.
   * Notifies subscribers only when the returned value differs by reference.
   */
  update(fn: (current: DashboardLayout) => DashboardLayout): void;
  /**
   * Subscribe to layout changes. The listener receives the new layout on every
   * change. Returns an unsubscribe function — safe to call more than once.
   */
  subscribe(listener: (layout: DashboardLayout) => void): () => void;
}

/**
 * Create a new, independent layout state holder.
 *
 * @param initial  Initial layout (defaults to `createLayout()`).
 */
export function createLayoutState(initial?: DashboardLayout): LayoutState {
  let current: DashboardLayout = initial ?? createLayout();
  const listeners: Array<(layout: DashboardLayout) => void> = [];

  return {
    get(): DashboardLayout {
      return current;
    },

    set(layout: DashboardLayout): void {
      if (layout === current) return;
      current = layout;
      for (const listener of listeners.slice()) {
        listener(current);
      }
    },

    update(fn: (c: DashboardLayout) => DashboardLayout): void {
      const next = fn(current);
      if (next === current) return;
      current = next;
      for (const listener of listeners.slice()) {
        listener(current);
      }
    },

    subscribe(listener: (layout: DashboardLayout) => void): () => void {
      listeners.push(listener);
      let removed = false;
      return (): void => {
        if (removed) return;
        removed = true;
        const idx = listeners.indexOf(listener);
        if (idx !== -1) listeners.splice(idx, 1);
      };
    },
  };
}
