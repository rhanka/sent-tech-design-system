/**
 * Vue 3 adapter for the framework-agnostic dataviz-core store. Exposes
 * `useDashboard`, which mirrors the store state into a `shallowRef` (the whole
 * state object is replaced on each mutation, so a shallow ref is exactly right
 * and avoids deep reactivity overhead), plus provide/inject helpers for sharing
 * one store across a component tree. Presentation comes from
 * `@sentropic/design-system-vue`; this module only wires state.
 */

import {
  inject,
  onScopeDispose,
  provide,
  shallowRef,
  type InjectionKey,
  type ShallowRef,
} from 'vue';
import { type DashboardState, type DashboardStore } from '@sentropic/dataviz-core';

// Re-export the full core surface so consumers need a single import.
export * from '@sentropic/dataviz-core';

// Prove design-system resolution: re-export real types from the DS.
export type { ButtonProps } from '@sentropic/design-system-vue';
export type { TenantTheme } from '@sentropic/design-system-themes';

/**
 * Subscribe the current Vue scope to a dashboard store.
 *
 * Returns a read-only `ShallowRef<DashboardState>` updated on every store
 * notification. The subscription is torn down automatically via
 * `onScopeDispose`, so it is safe in `setup()` and in standalone effect scopes.
 */
export function useDashboard(store: DashboardStore): Readonly<ShallowRef<DashboardState>> {
  const state = shallowRef<DashboardState>(store.getState());
  const off = store.subscribe(() => {
    state.value = store.getState();
  });
  onScopeDispose(off);
  return state;
}

/** Injection key carrying a {@link DashboardStore} down a component tree. */
export const DashboardKey: InjectionKey<DashboardStore> = Symbol('dataviz-dashboard');

/** Provide a dashboard store to descendant components. */
export function provideDashboard(store: DashboardStore): DashboardStore {
  provide(DashboardKey, store);
  return store;
}

/**
 * Inject the dashboard store provided by an ancestor.
 * Throws if no store was provided (fail fast rather than silently no-op).
 */
export function injectDashboard(): DashboardStore {
  const store = inject(DashboardKey);
  if (!store) {
    throw new Error('injectDashboard: no DashboardStore provided. Call provideDashboard() first.');
  }
  return store;
}
