import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createDashboardStore, type DataModel, type DashboardState } from '@sentropic/dataviz-core';
import {
  stateToQuery,
  queryToState,
  applyStateToStore,
  writeStateToUrl,
  readStateFromUrl,
  DEFAULT_URL_SYNC_PARAM,
} from './url-sync.js';
import { useUrlSync } from './useUrlSync.js';

const model: DataModel = {
  dimensions: [
    { id: 'country', label: 'Country', type: 'discrete' },
    { id: 'category', label: 'Category', type: 'discrete' },
    { id: 'price', label: 'Price', type: 'continuous' },
  ],
  measures: [{ id: 'revenue', label: 'Revenue', aggregation: 'sum' }],
};

/** A representative state exercising filters (include/exclude/range), selections and drill. */
const sample: DashboardState = {
  filters: {
    country: { kind: 'include', values: ['FR', 'US'] },
    category: { kind: 'exclude', values: ['toys'] },
    price: { kind: 'range', min: 10, max: 200 },
  },
  selections: { chart: ['FR'], table: ['a', 'b'] },
  drill: { tree: ['country', 'category'] },
};

const newStore = () => createDashboardStore({ model, data: [{ country: 'FR', revenue: 1 }] });

describe('stateToQuery / queryToState (round-trip)', () => {
  it('round-trips a representative state', () => {
    const query = stateToQuery(sample);
    expect(query.startsWith('?')).toBe(true);
    expect(query).toContain(`${DEFAULT_URL_SYNC_PARAM}=`);
    expect(queryToState(query, { model })).toEqual(sample);
  });

  it('produces an empty query for an empty state', () => {
    expect(stateToQuery({ filters: {}, selections: {}, drill: {} })).toBe('');
    expect(stateToQuery({})).toBe('');
  });

  it('parses an empty / missing / malformed query to {}', () => {
    expect(queryToState('')).toEqual({});
    expect(queryToState('?other=1')).toEqual({});
    expect(queryToState(`?${DEFAULT_URL_SYNC_PARAM}=%zz-not-valid`, { model })).toEqual({});
  });

  it('honours a custom param name', () => {
    const query = stateToQuery(sample, { param: 'state' });
    expect(query).toContain('state=');
    expect(queryToState(query, { param: 'state', model })).toEqual(sample);
  });

  it('drops unknown dimensions when a model is given', () => {
    const withUnknown = stateToQuery({ filters: { ghost: { kind: 'include', values: ['x'] } } });
    expect(queryToState(withUnknown, { model }).filters).toEqual({});
  });
});

describe('applyStateToStore', () => {
  it('reproduces filters/selections/drill on a fresh store via restore', () => {
    const store = newStore();
    applyStateToStore(store, queryToState(stateToQuery(sample), { model }));
    expect(store.getState()).toEqual(sample);
  });

  it('clears prior state when applying a new one', () => {
    const store = newStore();
    store.setFilter('country', { kind: 'include', values: ['DE'] });
    applyStateToStore(store, { selections: { chart: ['FR'] } });
    expect(store.getState()).toEqual({ filters: {}, selections: { chart: ['FR'] }, drill: {} });
  });

  it('falls back to setters when the store has no restore', () => {
    const base = newStore();
    const noRestore = { ...base, restore: undefined } as unknown as typeof base;
    applyStateToStore(noRestore, sample);
    expect(base.getState()).toEqual(sample);
  });
});

describe('SSR safety (no window)', () => {
  it('writeStateToUrl / readStateFromUrl are no-ops without window', () => {
    const original = globalThis.window;
    // @ts-expect-error simulate SSR
    delete globalThis.window;
    try {
      expect(() => writeStateToUrl(sample)).not.toThrow();
      expect(writeStateToUrl(sample)).toBeNull();
      const store = newStore();
      expect(readStateFromUrl(store)).toEqual({});
    } finally {
      globalThis.window = original;
    }
  });
});

describe('useUrlSync (live binding)', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('writes store state into the URL on change', () => {
    const store = newStore();
    renderHook(() => useUrlSync(store));
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    expect(window.location.search).toContain(`${DEFAULT_URL_SYNC_PARAM}=`);
    expect(readStateFromUrl(store)).toEqual({
      filters: { country: { kind: 'include', values: ['FR'] } },
      selections: {},
      drill: {},
    });
  });

  it('hydrates the store from the URL on mount', () => {
    window.history.replaceState(null, '', stateToQuery(sample));
    const store = newStore();
    renderHook(() => useUrlSync(store));
    expect(store.getState()).toEqual(sample);
  });

  it('re-applies URL state on popstate', () => {
    const store = newStore();
    renderHook(() => useUrlSync(store));
    window.history.replaceState(null, '', stateToQuery(sample));
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(store.getState()).toEqual(sample);
  });

  it('does not throw and cleans up on unmount', () => {
    const store = newStore();
    const { unmount } = renderHook(() => useUrlSync(store));
    expect(() => unmount()).not.toThrow();
  });

  it('clears the param when the store returns to an empty state', () => {
    const store = newStore();
    renderHook(() => useUrlSync(store));
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    expect(window.location.search).toContain(DEFAULT_URL_SYNC_PARAM);
    store.clearAll();
    expect(window.location.search).not.toContain(DEFAULT_URL_SYNC_PARAM);
  });
});
