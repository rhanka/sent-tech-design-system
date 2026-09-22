/**
 * url-sync — deep-linking of dashboard state to/from the URL query string.
 *
 * Round-trips a {@link DashboardState} (filters + selections + drill) through a
 * single, compact, URL-safe query parameter so a dashboard is shareable and
 * survives reload + browser back/forward. Serialisation is delegated entirely to
 * the core `serializeState` / `deserializeState` helpers — this module only
 * frames that payload inside a query string and pushes it into the store.
 *
 * Every `window` / `history` / `location` access is guarded so the module is
 * safe to import and call under SSR / jsdom: the browser-only paths become
 * no-ops (never throw) when those globals are undefined.
 *
 * The framework-specific live binding (`useUrlSync`) lives alongside this file;
 * these helpers are framework-agnostic and unit-tested without a DOM.
 */

import {
  serializeState,
  deserializeState,
  type DashboardState,
  type DashboardStore,
} from '@sentropic/dataviz-core';

/** Default query-string key carrying the encoded dashboard state. */
export const DEFAULT_URL_SYNC_PARAM = 'dash';

/** Options shared by the pure helpers and the live binding. */
export interface UrlSyncOptions {
  /** Query parameter name to read/write. Defaults to {@link DEFAULT_URL_SYNC_PARAM}. */
  param?: string;
  /**
   * Debounce window (ms) for writing rapid store changes to the URL. `0`
   * (default) writes synchronously on every change.
   */
  debounceMs?: number;
  /**
   * History strategy when the URL is updated from a store change. `replace`
   * (default) uses `history.replaceState` so each keystroke does not spam the
   * back stack; `push` uses `history.pushState`.
   */
  history?: 'replace' | 'push';
}

/** True when a real `window` (and thus history/location) is available. */
function hasWindow(): boolean {
  return typeof window !== 'undefined';
}

/** True when the current state carries no filters, selections or drill. */
function isEmptyState(state: Pick<DashboardState, 'filters' | 'selections' | 'drill'>): boolean {
  return (
    Object.keys(state.filters ?? {}).length === 0 &&
    Object.keys(state.selections ?? {}).length === 0 &&
    Object.keys(state.drill ?? {}).length === 0
  );
}

/**
 * Encode a dashboard state to a query string (including the leading `?`).
 *
 * Returns `''` for an empty state so a pristine dashboard yields a clean URL.
 * The value is produced by the core `serializeState`, which is already
 * URL-safe; we wrap it in `URLSearchParams` so any other existing query params
 * the consumer manages are not our concern here.
 */
export function stateToQuery(
  state: Partial<DashboardState>,
  options: UrlSyncOptions = {},
): string {
  const param = options.param ?? DEFAULT_URL_SYNC_PARAM;
  const full: DashboardState = {
    filters: state.filters ?? {},
    selections: state.selections ?? {},
    drill: state.drill ?? {},
  };
  if (isEmptyState(full)) return '';
  const params = new URLSearchParams();
  params.set(param, serializeState(full));
  return `?${params.toString()}`;
}

/**
 * Parse a query string (with or without the leading `?`) back to a partial
 * dashboard state. Unknown params are ignored; a missing/empty/malformed value
 * yields an empty state. Never throws.
 *
 * When a `model` is supplied (via {@link UrlSyncOptions.model}) the core
 * deserialiser validates dimensions against it and drops unknown ones.
 */
export function queryToState(
  search: string,
  options: UrlSyncOptions & { model?: Parameters<typeof deserializeState>[1] } = {},
): Partial<DashboardState> {
  const param = options.param ?? DEFAULT_URL_SYNC_PARAM;
  const raw = typeof search === 'string' ? search : '';
  const params = new URLSearchParams(raw.startsWith('?') ? raw.slice(1) : raw);
  const encoded = params.get(param);
  if (!encoded) return {};
  try {
    return deserializeState(encoded, options.model);
  } catch {
    return {};
  }
}

/**
 * Push a parsed state into a store. Uses the store's atomic `restore` when
 * present (the canonical full-state path), otherwise falls back to the public
 * setters. The store starts from a clean slate so removed entries disappear.
 */
export function applyStateToStore(store: DashboardStore, state: Partial<DashboardState>): void {
  if (typeof store.restore === 'function') {
    store.restore(state);
    return;
  }
  // Fallback for stores without a full-state restore: rebuild via setters.
  store.clearAll();
  for (const [dimensionId, spec] of Object.entries(state.filters ?? {})) {
    store.setFilter(dimensionId, spec);
  }
  for (const [viewId, keys] of Object.entries(state.selections ?? {})) {
    for (const key of keys) store.toggleSelection(viewId, key);
  }
  for (const [viewId, path] of Object.entries(state.drill ?? {})) {
    for (const dimensionId of path) store.drillDown(viewId, dimensionId);
  }
}

/** Read the current `location.search` safely (returns `''` under SSR). */
export function readLocationSearch(): string {
  if (!hasWindow() || typeof window.location === 'undefined') return '';
  return window.location.search ?? '';
}

/**
 * Read the dashboard state encoded in the current URL. Safe under SSR (returns
 * `{}`). The store's model is used to validate dimensions.
 */
export function readStateFromUrl(
  store: DashboardStore,
  options: UrlSyncOptions = {},
): Partial<DashboardState> {
  return queryToState(readLocationSearch(), { ...options, model: store.model });
}

/**
 * Write a dashboard state into the current URL via the History API, preserving
 * the path/hash and any unrelated query params. No-op under SSR. Returns the
 * URL string that was written (or `null` when skipped).
 */
export function writeStateToUrl(
  state: Partial<DashboardState>,
  options: UrlSyncOptions = {},
): string | null {
  if (!hasWindow() || typeof window.history === 'undefined' || typeof window.location === 'undefined') {
    return null;
  }
  const param = options.param ?? DEFAULT_URL_SYNC_PARAM;
  const loc = window.location;
  const params = new URLSearchParams(loc.search ?? '');
  const full: DashboardState = {
    filters: state.filters ?? {},
    selections: state.selections ?? {},
    drill: state.drill ?? {},
  };
  if (isEmptyState(full)) {
    params.delete(param);
  } else {
    params.set(param, serializeState(full));
  }
  const query = params.toString();
  const url = `${loc.pathname}${query ? `?${query}` : ''}${loc.hash ?? ''}`;
  const method = options.history === 'push' ? 'pushState' : 'replaceState';
  const fn = window.history[method];
  if (typeof fn !== 'function') return null;
  fn.call(window.history, window.history.state, '', url);
  return url;
}
