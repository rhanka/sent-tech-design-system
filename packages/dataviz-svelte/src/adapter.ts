/**
 * Svelte 5 adapter for the framework-agnostic dataviz-core store. It bridges the
 * core's `getState`/`subscribe` contract onto Svelte's `Readable` store contract
 * so the dashboard state can be consumed with `$store` syntax. All presentation
 * comes from `@sentropic/design-system-svelte`; this module only wires state.
 */

import {
  createDashboardStore,
  type DashboardState,
  type DashboardStore,
  type DashboardStoreConfig,
} from '@sentropic/dataviz-core';

// Re-export the full core surface so consumers need a single import.
export * from '@sentropic/dataviz-core';

// Prove design-system resolution: re-export a real (pure) type from the DS.
// `BarChartTone` is a presentational type the dashboard charts consume.
export type { BarChartTone } from '@sentropic/design-system-svelte';
// And a theme type from the shared tokens/themes package.
export type { TenantTheme } from '@sentropic/design-system-themes';

/** Minimal Svelte `Readable` contract (avoids a hard dep on `svelte/store`). */
export interface SvelteReadable<T> {
  subscribe(run: (value: T) => void): () => void;
}

/**
 * Wrap a core {@link DashboardStore} as a Svelte `Readable<DashboardState>`.
 *
 * Following the Svelte store contract, `subscribe(run)` calls `run` immediately
 * with the current state, then again after every core notification, and returns
 * an unsubscribe function.
 */
export function toSvelteStore(store: DashboardStore): SvelteReadable<DashboardState> {
  return {
    subscribe(run: (value: DashboardState) => void): () => void {
      run(store.getState());
      const off = store.subscribe(() => run(store.getState()));
      return off;
    },
  };
}

/** Result of {@link createDashboard}: the core store plus its Svelte view. */
export interface SvelteDashboard {
  /** The underlying core store (use its mutators: setFilter, toggleSelection…). */
  store: DashboardStore;
  /** Svelte-readable snapshot, usable with `$state` in a component. */
  state: SvelteReadable<DashboardState>;
}

/**
 * Create a dashboard store and its Svelte-readable view in one call.
 */
export function createDashboard(config: DashboardStoreConfig): SvelteDashboard {
  const store = createDashboardStore(config);
  return { store, state: toSvelteStore(store) };
}

/**
 * Canonical adapter hook (parity with React/Vue `useDashboard`).
 * Returns the Svelte-readable state for a given core store.
 */
export function useDashboard(store: DashboardStore): SvelteReadable<DashboardState> {
  return toSvelteStore(store);
}
