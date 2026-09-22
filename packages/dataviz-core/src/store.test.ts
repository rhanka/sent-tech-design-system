import { describe, it, expect, vi } from 'vitest';
import {
  type CrossfilterGraph,
  type DataModel,
  type FilterSpec,
  type Row,
  createDashboardStore,
  specToPredicate,
  applyFilters,
} from './index.js';

const model: DataModel = {
  dimensions: [
    { id: 'country', label: 'Country', type: 'discrete' },
    { id: 'age', label: 'Age', type: 'continuous' },
  ],
  measures: [{ id: 'revenue', label: 'Revenue', aggregation: 'sum' }],
};

const data: Row[] = [
  { country: 'FR', age: 30, revenue: 100 },
  { country: 'US', age: 40, revenue: 200 },
  { country: 'FR', age: 50, revenue: 50 },
];

function makeStore() {
  return createDashboardStore({ model, data });
}

describe('initial state', () => {
  it('starts empty', () => {
    const store = makeStore();
    expect(store.getState()).toEqual({ filters: {}, selections: {}, drill: {} });
  });
  it('exposes model and a frozen data copy', () => {
    const store = makeStore();
    expect(store.model).toBe(model);
    expect(store.data).toHaveLength(3);
    expect(Object.isFrozen(store.data)).toBe(true);
  });
  it('does not alias or expose mutable row objects', () => {
    const input: Row[] = [{ country: 'FR', age: 30, revenue: 100 }];
    const store = createDashboardStore({ model, data: input });
    expect(store.data[0]).not.toBe(input[0]);
    expect(Object.isFrozen(store.data[0])).toBe(true);

    input[0]!.country = 'US';
    expect(store.data[0]!.country).toBe('FR');
    expect(() => {
      store.data[0]!.country = 'HACKED';
    }).toThrow(TypeError);
  });
  it('does not alias the input data array', () => {
    const input: Row[] = [{ country: 'FR' }];
    const store = createDashboardStore({ model, data: input });
    input.push({ country: 'US' });
    expect(store.data).toHaveLength(1);
  });
});

describe('immutability', () => {
  it('returns a frozen snapshot', () => {
    const store = makeStore();
    const snap = store.getState();
    expect(Object.isFrozen(snap)).toBe(true);
    expect(Object.isFrozen(snap.filters)).toBe(true);
    expect(Object.isFrozen(snap.selections)).toBe(true);
    expect(Object.isFrozen(snap.drill)).toBe(true);
  });
  it('each mutation yields a new state reference', () => {
    const store = makeStore();
    const s0 = store.getState();
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    const s1 = store.getState();
    expect(s1).not.toBe(s0);
    store.toggleSelection('chart', 'FR');
    const s2 = store.getState();
    expect(s2).not.toBe(s1);
  });
  it('old snapshots are unaffected by later mutations', () => {
    const store = makeStore();
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    const before = store.getState();
    store.setFilter('age', { kind: 'range', min: 30 });
    expect(before.filters).toEqual({ country: { kind: 'include', values: ['FR'] } });
    expect(Object.keys(store.getState().filters).sort()).toEqual(['age', 'country']);
  });
  it('frozen filter values cannot be mutated in place', () => {
    const store = makeStore();
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    const spec = store.getState().filters.country;
    expect(Object.isFrozen(spec)).toBe(true);
  });
});

describe('subscribe / notify / unsubscribe', () => {
  it('notifies on mutation', () => {
    const store = makeStore();
    const fn = vi.fn();
    store.subscribe(fn);
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it('notifies all subscribers', () => {
    const store = makeStore();
    const a = vi.fn();
    const b = vi.fn();
    store.subscribe(a);
    store.subscribe(b);
    store.toggleSelection('chart', 'FR');
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });
  it('unsubscribe stops notifications', () => {
    const store = makeStore();
    const fn = vi.fn();
    const off = store.subscribe(fn);
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    off();
    store.setFilter('country', { kind: 'include', values: ['US'] });
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it('unsubscribing one keeps others', () => {
    const store = makeStore();
    const a = vi.fn();
    const b = vi.fn();
    const offA = store.subscribe(a);
    store.subscribe(b);
    offA();
    store.toggleSelection('chart', 'FR');
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);
  });
  it('does not notify on no-op clearFilter', () => {
    const store = makeStore();
    const fn = vi.fn();
    store.subscribe(fn);
    store.clearFilter('ghost');
    expect(fn).not.toHaveBeenCalled();
  });
  it('does not notify on no-op clearSelection', () => {
    const store = makeStore();
    const fn = vi.fn();
    store.subscribe(fn);
    store.clearSelection('ghost');
    expect(fn).not.toHaveBeenCalled();
  });
  it('does not notify on no-op drillUp / clearDrill', () => {
    const store = makeStore();
    const fn = vi.fn();
    store.subscribe(fn);
    store.drillUp('chart');
    store.clearDrill('chart');
    expect(fn).not.toHaveBeenCalled();
  });
  it('does not notify on no-op clearAll', () => {
    const store = makeStore();
    const fn = vi.fn();
    store.subscribe(fn);
    store.clearAll();
    expect(fn).not.toHaveBeenCalled();
  });
  it('does not notify when setting an identical filter', () => {
    const store = makeStore();
    const fn = vi.fn();
    store.subscribe(fn);
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('setFilter / clearFilter', () => {
  it('sets and replaces a filter', () => {
    const store = makeStore();
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    expect(store.getState().filters.country).toEqual({ kind: 'include', values: ['FR'] });
    store.setFilter('country', { kind: 'include', values: ['US'] });
    expect(store.getState().filters.country).toEqual({ kind: 'include', values: ['US'] });
  });
  it('clears a filter', () => {
    const store = makeStore();
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    store.clearFilter('country');
    expect(store.getState().filters).toEqual({});
  });
  it('rejects unknown dimensions without changing state', () => {
    const store = makeStore();
    const fn = vi.fn();
    store.subscribe(fn);
    expect(() => {
      store.setFilter('ghost', { kind: 'include', values: ['x'] });
    }).toThrow(/Unknown dimension/);
    expect(store.getState().filters).toEqual({});
    expect(fn).not.toHaveBeenCalled();
  });
  it('rejects malformed runtime specs without changing state', () => {
    const store = makeStore();
    expect(() => {
      store.setFilter('age', { kind: 'range', min: Number.NaN } as unknown as FilterSpec);
    }).toThrow(/Invalid filter spec/);
    expect(() => {
      store.setFilter('country', (() => true) as unknown as FilterSpec);
    }).toThrow(/Invalid filter spec/);
    expect(store.getState().filters).toEqual({});
  });
});

describe('toggleSelection / clearSelection', () => {
  it('adds a key', () => {
    const store = makeStore();
    store.toggleSelection('chart', 'FR');
    expect(store.getState().selections.chart).toEqual(['FR']);
  });
  it('toggling the same key removes it (and prunes empty view)', () => {
    const store = makeStore();
    store.toggleSelection('chart', 'FR');
    store.toggleSelection('chart', 'FR');
    expect(store.getState().selections.chart).toBeUndefined();
    expect(store.getState().selections).toEqual({});
  });
  it('accumulates multiple keys', () => {
    const store = makeStore();
    store.toggleSelection('chart', 'FR');
    store.toggleSelection('chart', 'US');
    expect(store.getState().selections.chart).toEqual(['FR', 'US']);
  });
  it('clearSelection removes a view selection', () => {
    const store = makeStore();
    store.toggleSelection('chart', 'FR');
    store.clearSelection('chart');
    expect(store.getState().selections.chart).toBeUndefined();
  });
});

describe('drill state', () => {
  it('drills down by appending dimensions for a view', () => {
    const store = makeStore();
    store.drillDown('chart', 'country');
    store.drillDown('chart', 'age');
    expect(store.getState().drill.chart).toEqual(['country', 'age']);
  });

  it('drills up and prunes an empty path', () => {
    const store = makeStore();
    store.drillDown('chart', 'country');
    store.drillDown('chart', 'age');
    store.drillUp('chart');
    expect(store.getState().drill.chart).toEqual(['country']);
    store.drillUp('chart');
    expect(store.getState().drill).toEqual({});
  });

  it('clears one view drill path', () => {
    const store = makeStore();
    store.drillDown('a', 'country');
    store.drillDown('b', 'age');
    store.clearDrill('a');
    expect(store.getState().drill).toEqual({ b: ['age'] });
  });

  it('does not notify when drilling down to an already active dimension', () => {
    const store = makeStore();
    const fn = vi.fn();
    store.drillDown('chart', 'country');
    store.subscribe(fn);
    store.drillDown('chart', 'country');
    expect(store.getState().drill.chart).toEqual(['country']);
    expect(fn).not.toHaveBeenCalled();
  });

  it('rejects unknown drill dimensions without changing state', () => {
    const store = makeStore();
    const fn = vi.fn();
    store.subscribe(fn);
    expect(() => store.drillDown('chart', 'ghost')).toThrow(/Unknown dimension/);
    expect(store.getState().drill).toEqual({});
    expect(fn).not.toHaveBeenCalled();
  });

  it('freezes drill paths in snapshots', () => {
    const store = makeStore();
    store.drillDown('chart', 'country');
    const path = store.getState().drill.chart!;
    expect(Object.isFrozen(path)).toBe(true);
    expect(() => {
      path.push('age');
    }).toThrow(TypeError);
  });
});

describe('clearAll', () => {
  it('resets filters, selections and drill', () => {
    const store = makeStore();
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    store.toggleSelection('chart', 'FR');
    store.drillDown('chart', 'country');
    store.clearAll();
    expect(store.getState()).toEqual({ filters: {}, selections: {}, drill: {} });
  });
});

describe('restore', () => {
  it('restores filters, selections and drill in one atomic mutation', () => {
    const store = makeStore();
    const fn = vi.fn();
    store.subscribe(fn);

    store.restore({
      filters: { country: { kind: 'include', values: ['FR'] } },
      selections: { chart: ['FR'] },
      drill: { chart: ['country'] },
    });

    expect(store.getState()).toEqual({
      filters: { country: { kind: 'include', values: ['FR'] } },
      selections: { chart: ['FR'] },
      drill: { chart: ['country'] },
    });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('accepts a partial state and defaults missing sections to empty maps', () => {
    const store = makeStore();
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    store.toggleSelection('chart', 'FR');
    store.drillDown('chart', 'country');

    store.restore({ filters: { age: { kind: 'range', min: 40 } } });

    expect(store.getState()).toEqual({
      filters: { age: { kind: 'range', min: 40 } },
      selections: {},
      drill: {},
    });
  });

  it('does not alias the restored state and keeps snapshots frozen', () => {
    const store = makeStore();
    const restored = {
      filters: { country: { kind: 'include', values: ['FR'] } },
      selections: { chart: ['FR'] },
      drill: { chart: ['country'] },
    };

    store.restore(restored);
    restored.filters.country.values.push('US');
    restored.selections.chart.push('US');
    restored.drill.chart.push('age');

    const snapshot = store.getState();
    expect(snapshot).toEqual({
      filters: { country: { kind: 'include', values: ['FR'] } },
      selections: { chart: ['FR'] },
      drill: { chart: ['country'] },
    });
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.filters.country!.values)).toBe(true);
    expect(Object.isFrozen(snapshot.selections.chart)).toBe(true);
    expect(Object.isFrozen(snapshot.drill.chart)).toBe(true);
  });

  it('rejects unknown dimensions and malformed restored state without notifying', () => {
    const store = makeStore();
    const fn = vi.fn();
    store.subscribe(fn);

    expect(() =>
      store.restore({ filters: { ghost: { kind: 'include', values: ['x'] } } }),
    ).toThrow(/Unknown dimension/);
    expect(() =>
      store.restore({ selections: { chart: [1] as unknown as string[] } }),
    ).toThrow(/Invalid selection state/);
    expect(() =>
      store.restore({ drill: { chart: ['ghost'] } }),
    ).toThrow(/Unknown dimension/);
    expect(store.getState()).toEqual({ filters: {}, selections: {}, drill: {} });
    expect(fn).not.toHaveBeenCalled();
  });

  it('does not notify when restoring an identical state', () => {
    const store = makeStore();
    store.restore({
      filters: { country: { kind: 'include', values: ['FR'] } },
      selections: { chart: ['FR'] },
      drill: { chart: ['country'] },
    });
    const fn = vi.fn();
    store.subscribe(fn);

    store.restore({
      filters: { country: { kind: 'include', values: ['FR'] } },
      selections: { chart: ['FR'] },
      drill: { chart: ['country'] },
    });

    expect(fn).not.toHaveBeenCalled();
  });
});

describe('store API contract', () => {
  it('exposes clear as a filter clear alias', () => {
    const store = makeStore();
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    store.clear('country');
    expect(store.getState().filters).toEqual({});
  });
  it('exposes applyCrossfilter over its own state, data and graph', () => {
    const graph: CrossfilterGraph = {
      views: {
        countryChart: { field: 'country' },
        ageChart: { field: 'age' },
      },
    };
    const store = createDashboardStore({ model, data, crossfilter: graph });
    store.toggleSelection('countryChart', 'FR');
    const out = store.applyCrossfilter('ageChart');
    expect(out).toHaveLength(2);
    expect(out[0]).not.toBe(store.data[0]);
  });
});

describe('serialisability', () => {
  it('state JSON round-trips structurally', () => {
    const store = makeStore();
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    store.toggleSelection('chart', 'FR');
    store.drillDown('chart', 'country');
    const json = JSON.stringify(store.getState());
    expect(JSON.parse(json)).toEqual({
      filters: { country: { kind: 'include', values: ['FR'] } },
      selections: { chart: ['FR'] },
      drill: { chart: ['country'] },
    });
  });
});

describe('specToPredicate', () => {
  it('include keeps listed values', () => {
    const p = specToPredicate({ kind: 'include', values: ['FR'] });
    expect(p('FR')).toBe(true);
    expect(p('US')).toBe(false);
  });
  it('exclude drops listed values', () => {
    const p = specToPredicate({ kind: 'exclude', values: ['FR'] });
    expect(p('FR')).toBe(false);
    expect(p('US')).toBe(true);
  });
  it('range honours min/max inclusive', () => {
    const p = specToPredicate({ kind: 'range', min: 30, max: 40 });
    expect(p(30)).toBe(true);
    expect(p(40)).toBe(true);
    expect(p(29)).toBe(false);
    expect(p(41)).toBe(false);
  });
  it('range with only min', () => {
    const p = specToPredicate({ kind: 'range', min: 30 });
    expect(p(100)).toBe(true);
    expect(p(10)).toBe(false);
  });
  it('range rejects non-numeric', () => {
    const p = specToPredicate({ kind: 'range', min: 0 });
    expect(p('abc' as unknown as number)).toBe(false);
    expect(p(null)).toBe(false);
  });
  it('range rejects boolean cells', () => {
    const p = specToPredicate({ kind: 'range', min: 0, max: 1 });
    expect(p(true)).toBe(false);
    expect(p(false)).toBe(false);
  });
  it('include matches null cells via "null"', () => {
    const p = specToPredicate({ kind: 'include', values: ['null'] });
    expect(p(null)).toBe(true);
  });
});

describe('applyFilters', () => {
  it('returns all rows when no filter', () => {
    const store = makeStore();
    expect(applyFilters(store.getState(), store.data)).toHaveLength(3);
  });
  it('applies a single include filter', () => {
    const store = makeStore();
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    expect(applyFilters(store.getState(), store.data)).toHaveLength(2);
  });
  it('applies multiple filters conjunctively', () => {
    const store = makeStore();
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    store.setFilter('age', { kind: 'range', min: 40 });
    const out = applyFilters(store.getState(), store.data);
    expect(out).toEqual([{ country: 'FR', age: 50, revenue: 50 }]);
  });
  it('returns frozen row copies rather than source aliases', () => {
    const store = makeStore();
    const out = applyFilters(store.getState(), store.data);
    expect(out[0]).not.toBe(store.data[0]);
    expect(Object.isFrozen(out[0])).toBe(true);
    expect(() => {
      out[0]!.country = 'HACKED';
    }).toThrow(TypeError);
    expect(store.data[0]!.country).toBe('FR');
  });
});
