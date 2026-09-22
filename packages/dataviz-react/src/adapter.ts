/**
 * React adapter for the framework-agnostic dataviz-core store. Exposes
 * `useDashboard`, which subscribes a component to the store via React's
 * `useSyncExternalStore` (concurrent-safe, SSR-safe). All presentation comes
 * from `@sentropic/design-system-react`; this module only wires state.
 */

import { useSyncExternalStore } from 'react';
import { type DashboardState, type DashboardStore } from '@sentropic/dataviz-core';

// Re-export the full core surface so consumers need a single import.
export * from '@sentropic/dataviz-core';

// Prove design-system resolution: re-export real types from the DS.
export type { ButtonProps } from '@sentropic/design-system-react';
export type { TenantTheme } from '@sentropic/design-system-themes';

/**
 * Subscribe a React component to a dashboard store.
 *
 * Without a selector it returns the whole {@link DashboardState} snapshot.
 * With a `selector` it returns a derived value; the component re-renders only
 * when that derived value changes by `Object.is` (the standard
 * `useSyncExternalStore` semantics). Because the core hands out a new frozen
 * state object on every mutation, identity comparison is reliable.
 *
 * The same `subscribe` reference is used for the server snapshot, so this is
 * SSR/hydration safe.
 */
export function useDashboard(store: DashboardStore): DashboardState;
export function useDashboard<T>(store: DashboardStore, selector: (state: DashboardState) => T): T;
export function useDashboard<T>(
  store: DashboardStore,
  selector?: (state: DashboardState) => T,
): DashboardState | T {
  const getSnapshot = () => {
    const state = store.getState();
    return selector ? selector(state) : state;
  };
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
