import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { type DataModel, createDashboardStore, buildFieldPaneTree, useDashboard } from './index.js';

const model: DataModel = {
  dimensions: [{ id: 'country', label: 'Country', type: 'discrete' }],
  measures: [{ id: 'revenue', label: 'Revenue', aggregation: 'sum' }],
};

describe('useDashboard', () => {
  it('returns the current state snapshot', () => {
    const store = createDashboardStore({ model, data: [] });
    const { result } = renderHook(() => useDashboard(store));
    expect(result.current).toEqual({ filters: {}, selections: {}, drill: {} });
  });

  it('re-renders with the new state on mutation', () => {
    const store = createDashboardStore({ model, data: [] });
    const { result } = renderHook(() => useDashboard(store));
    act(() => {
      store.setFilter('country', { kind: 'include', values: ['FR'] });
    });
    expect(result.current).toEqual({
      filters: { country: { kind: 'include', values: ['FR'] } },
      selections: {},
      drill: {},
    });
  });

  it('applies a selector and re-renders when the derived value changes', () => {
    const store = createDashboardStore({ model, data: [] });
    const { result } = renderHook(() =>
      useDashboard(store, (s) => Object.keys(s.filters).length),
    );
    expect(result.current).toBe(0);
    act(() => {
      store.setFilter('country', { kind: 'include', values: ['FR'] });
    });
    expect(result.current).toBe(1);
  });

  it('selector does not re-render when derived value is stable (Object.is)', () => {
    const store = createDashboardStore({ model, data: [] });
    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;
      return useDashboard(store, (s) => Object.keys(s.filters).length);
    });
    const initialRenders = renders;
    act(() => {
      // Mutating selections does not change the filter count -> selector stable.
      store.toggleSelection('chart', 'FR');
    });
    expect(result.current).toBe(0);
    // useSyncExternalStore bails out of re-render when snapshot is Object.is-equal.
    expect(renders).toBe(initialRenders);
  });

  it('stops updating after unmount', () => {
    const store = createDashboardStore({ model, data: [] });
    const { result, unmount } = renderHook(() => useDashboard(store));
    unmount();
    act(() => {
      store.setFilter('country', { kind: 'include', values: ['US'] });
    });
    // result.current is frozen at last render before unmount
    expect(result.current).toEqual({ filters: {}, selections: {}, drill: {} });
  });
});

describe('core field pane re-export', () => {
  it('exposes the core field pane view model helpers', () => {
    expect(buildFieldPaneTree(model).nodes.map((node) => node.id)).toEqual([
      'group:dimensions',
      'group:measures',
    ]);
  });
});
