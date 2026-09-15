import { describe, it, expect } from 'vitest';
import {
  type CrossfilterGraph,
  type DataModel,
  type Row,
  createDashboardStore,
  applyCrossfilter,
  rangeSelectionKey,
  sourcesFor,
} from './index.js';

const model: DataModel = {
  dimensions: [
    { id: 'country', label: 'Country', type: 'discrete' },
    { id: 'category', label: 'Category', type: 'discrete' },
  ],
  measures: [{ id: 'revenue', label: 'Revenue', aggregation: 'sum' }],
};

const data: Row[] = [
  { country: 'FR', category: 'A', revenue: 10 },
  { country: 'FR', category: 'B', revenue: 20 },
  { country: 'US', category: 'A', revenue: 30 },
  { country: 'US', category: 'B', revenue: 40 },
];

// Fully linked by default: countryChart selects on country, catChart on category.
const graph: CrossfilterGraph = {
  views: {
    countryChart: { field: 'country' },
    catChart: { field: 'category' },
  },
};

describe('sourcesFor', () => {
  it('excludes the target itself (self-exclusion)', () => {
    expect(sourcesFor(graph, 'countryChart')).toEqual(['catChart']);
    expect(sourcesFor(graph, 'catChart')).toEqual(['countryChart']);
  });
  it('honours an explicit affects scope', () => {
    const scoped: CrossfilterGraph = {
      views: {
        a: { field: 'country', affects: ['b'] },
        b: { field: 'category' },
        c: { field: 'category' },
      },
    };
    // a affects only b
    expect(sourcesFor(scoped, 'b')).toEqual(expect.arrayContaining(['a', 'c']));
    // a does not affect c, so c's sources should not include a
    expect(sourcesFor(scoped, 'c')).not.toContain('a');
  });
  it('an empty affects array means the view filters nobody', () => {
    const scoped: CrossfilterGraph = {
      views: {
        a: { field: 'country', affects: [] },
        b: { field: 'category' },
      },
    };
    expect(sourcesFor(scoped, 'b')).not.toContain('a');
  });
});

describe('applyCrossfilter', () => {
  it('returns all rows when no state and no view', () => {
    const store = createDashboardStore({ model, data, crossfilter: graph });
    expect(applyCrossfilter(store.getState(), store.data)).toHaveLength(4);
  });

  it('a view is NOT filtered by its own selection (auto-exclusion)', () => {
    const store = createDashboardStore({ model, data, crossfilter: graph });
    store.toggleSelection('countryChart', 'FR');
    // countryChart should still see all 4 rows: its own selection does not narrow itself
    const own = applyCrossfilter(store.getState(), store.data, 'countryChart', graph);
    expect(own).toHaveLength(4);
  });

  it("a view IS filtered by another view's selection (brushing-and-linking)", () => {
    const store = createDashboardStore({ model, data, crossfilter: graph });
    store.toggleSelection('countryChart', 'FR');
    // catChart is affected by countryChart -> only FR rows
    const cat = applyCrossfilter(store.getState(), store.data, 'catChart', graph);
    expect(cat).toHaveLength(2);
    expect(cat.every((r) => r.country === 'FR')).toBe(true);
  });

  it('respects an explicit scope (out-of-scope view unaffected)', () => {
    const scoped: CrossfilterGraph = {
      views: {
        countryChart: { field: 'country', affects: ['catChart'] },
        catChart: { field: 'category', affects: [] },
        sideChart: { field: 'category', affects: [] },
      },
    };
    const store = createDashboardStore({ model, data, crossfilter: scoped });
    store.toggleSelection('countryChart', 'FR');
    // catChart in scope -> filtered to FR
    expect(applyCrossfilter(store.getState(), store.data, 'catChart', scoped)).toHaveLength(2);
    // sideChart out of scope -> unaffected
    expect(applyCrossfilter(store.getState(), store.data, 'sideChart', scoped)).toHaveLength(4);
  });

  it('combines a global dimension filter with cross-filter', () => {
    const store = createDashboardStore({ model, data, crossfilter: graph });
    store.setFilter('category', { kind: 'include', values: ['A'] }); // global slicer
    store.toggleSelection('countryChart', 'US'); // brush US
    const cat = applyCrossfilter(store.getState(), store.data, 'catChart', graph);
    expect(cat).toEqual([{ country: 'US', category: 'A', revenue: 30 }]);
  });

  it('multiple selected keys widen the brush (OR within a source)', () => {
    const store = createDashboardStore({ model, data, crossfilter: graph });
    store.toggleSelection('countryChart', 'FR');
    store.toggleSelection('countryChart', 'US');
    const cat = applyCrossfilter(store.getState(), store.data, 'catChart', graph);
    expect(cat).toHaveLength(4);
  });

  it('intersects selections from two distinct source views (AND across sources)', () => {
    const tri: CrossfilterGraph = {
      views: {
        a: { field: 'country' },
        b: { field: 'category' },
        target: { field: 'revenue' },
      },
    };
    const store = createDashboardStore({ model, data, crossfilter: tri });
    store.toggleSelection('a', 'FR');
    store.toggleSelection('b', 'B');
    const out = applyCrossfilter(store.getState(), store.data, 'target', tri);
    expect(out).toEqual([{ country: 'FR', category: 'B', revenue: 20 }]);
  });

  it('applies range selections from bucketed views while preserving self-exclusion', () => {
    const start = Date.UTC(2026, 0, 1);
    const datedModel: DataModel = {
      dimensions: [
        { id: 'ts', label: 'Timestamp', type: 'continuous' },
        { id: 'service', label: 'Service', type: 'discrete' },
      ],
      measures: [{ id: 'events', label: 'Events', aggregation: 'sum' }],
    };
    const datedRows: Row[] = [
      { ts: start + 1_000, service: 'api', events: 1 },
      { ts: start + 2_000, service: 'worker', events: 1 },
      { ts: start + 24 * 60 * 60 * 1000 + 1_000, service: 'api', events: 1 },
    ];
    const datedGraph: CrossfilterGraph = {
      views: {
        eventHistogram: { field: 'ts', selection: 'range' },
        serviceChart: { field: 'service' },
      },
    };
    const store = createDashboardStore({ model: datedModel, data: datedRows, crossfilter: datedGraph });
    store.toggleSelection('eventHistogram', rangeSelectionKey(start, start + 24 * 60 * 60 * 1000 - 1));

    expect(applyCrossfilter(store.getState(), store.data, 'eventHistogram', datedGraph).map((row) => row.ts)).toEqual([
      start + 1_000,
      start + 2_000,
      start + 24 * 60 * 60 * 1000 + 1_000,
    ]);
    expect(applyCrossfilter(store.getState(), store.data, 'serviceChart', datedGraph).map((row) => row.ts)).toEqual([
      start + 1_000,
      start + 2_000,
    ]);
  });

  it('only global filters apply when graph omitted', () => {
    const store = createDashboardStore({ model, data, crossfilter: graph });
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    expect(applyCrossfilter(store.getState(), store.data)).toHaveLength(2);
  });

  it('empty selection on a source does not filter the target', () => {
    const store = createDashboardStore({ model, data, crossfilter: graph });
    store.toggleSelection('countryChart', 'FR');
    store.toggleSelection('countryChart', 'FR'); // toggled off -> empty
    expect(applyCrossfilter(store.getState(), store.data, 'catChart', graph)).toHaveLength(4);
  });

  it('terminates on a cyclic graph and applies each source once', () => {
    const cyclic: CrossfilterGraph = {
      views: {
        countryChart: { field: 'country', affects: ['catChart'] },
        catChart: { field: 'category', affects: ['countryChart'] },
      },
    };
    const store = createDashboardStore({ model, data, crossfilter: cyclic });
    store.toggleSelection('countryChart', 'FR');
    store.toggleSelection('catChart', 'A');
    expect(applyCrossfilter(store.getState(), store.data, 'countryChart', cyclic)).toEqual([
      { country: 'FR', category: 'A', revenue: 10 },
      { country: 'US', category: 'A', revenue: 30 },
    ]);
  });

  it('returns frozen row copies rather than source aliases', () => {
    const store = createDashboardStore({ model, data, crossfilter: graph });
    store.toggleSelection('countryChart', 'FR');
    const out = applyCrossfilter(store.getState(), store.data, 'catChart', graph);
    expect(out[0]).not.toBe(store.data[0]);
    expect(Object.isFrozen(out[0])).toBe(true);
    expect(() => {
      out[0]!.country = 'HACKED';
    }).toThrow(TypeError);
    expect(store.data[0]!.country).toBe('FR');
  });
});
