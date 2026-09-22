import { describe, it, expect, vi } from 'vitest';
import {
  type DataModel,
  createDashboardStore,
  buildFieldPaneTree,
  toSvelteStore,
  createDashboard,
  useDashboard,
} from './index.js';

const model: DataModel = {
  dimensions: [{ id: 'country', label: 'Country', type: 'discrete' }],
  measures: [{ id: 'revenue', label: 'Revenue', aggregation: 'sum' }],
};

describe('toSvelteStore', () => {
  it('calls run immediately with the current state', () => {
    const store = createDashboardStore({ model, data: [] });
    const readable = toSvelteStore(store);
    const run = vi.fn();
    readable.subscribe(run);
    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenLastCalledWith({ filters: {}, selections: {}, drill: {} });
  });

  it('calls run again on each mutation with a new snapshot', () => {
    const store = createDashboardStore({ model, data: [] });
    const run = vi.fn();
    toSvelteStore(store).subscribe(run);
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    expect(run).toHaveBeenCalledTimes(2);
    expect(run).toHaveBeenLastCalledWith({
      filters: { country: { kind: 'include', values: ['FR'] } },
      selections: {},
      drill: {},
    });
  });

  it('unsubscribe stops updates', () => {
    const store = createDashboardStore({ model, data: [] });
    const run = vi.fn();
    const off = toSvelteStore(store).subscribe(run);
    off();
    store.setFilter('country', { kind: 'include', values: ['US'] });
    expect(run).toHaveBeenCalledTimes(1); // only the initial call
  });
});

describe('createDashboard', () => {
  it('returns a store and a svelte readable wired together', () => {
    const { store, state } = createDashboard({ model, data: [] });
    const run = vi.fn();
    state.subscribe(run);
    store.toggleSelection('chart', 'FR');
    expect(run).toHaveBeenLastCalledWith({
      filters: {},
      selections: { chart: ['FR'] },
      drill: {},
    });
  });
});

describe('useDashboard (canonical hook)', () => {
  it('returns a readable view of the store', () => {
    const store = createDashboardStore({ model, data: [] });
    const run = vi.fn();
    useDashboard(store).subscribe(run);
    expect(run).toHaveBeenCalledTimes(1);
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
