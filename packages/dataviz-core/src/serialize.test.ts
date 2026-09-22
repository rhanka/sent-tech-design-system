import { describe, it, expect } from 'vitest';
import {
  type DashboardState,
  type DataModel,
  type FilterState,
  isFilterSpec,
  serializeFilters,
  deserializeFilters,
  serializeDrill,
  deserializeDrill,
  serializeState,
  deserializeState,
} from './index.js';

const model: DataModel = {
  dimensions: [
    { id: 'country', label: 'Country', type: 'discrete' },
    { id: 'age', label: 'Age', type: 'continuous' },
  ],
  measures: [{ id: 'revenue', label: 'Revenue', aggregation: 'sum' }],
};

describe('isFilterSpec', () => {
  it('accepts include/exclude with string values', () => {
    expect(isFilterSpec({ kind: 'include', values: ['a'] })).toBe(true);
    expect(isFilterSpec({ kind: 'exclude', values: [] })).toBe(true);
  });
  it('accepts range with numeric or absent bounds', () => {
    expect(isFilterSpec({ kind: 'range' })).toBe(true);
    expect(isFilterSpec({ kind: 'range', min: 1, max: 2 })).toBe(true);
  });
  it('rejects unknown kinds', () => {
    expect(isFilterSpec({ kind: 'nope' })).toBe(false);
  });
  it('rejects include with non-string values', () => {
    expect(isFilterSpec({ kind: 'include', values: [1, 2] })).toBe(false);
  });
  it('rejects range with non-numeric bounds', () => {
    expect(isFilterSpec({ kind: 'range', min: 'x' })).toBe(false);
  });
  it('rejects range with non-finite bounds', () => {
    expect(isFilterSpec({ kind: 'range', min: Number.NaN })).toBe(false);
    expect(isFilterSpec({ kind: 'range', max: Number.POSITIVE_INFINITY })).toBe(false);
    expect(isFilterSpec({ kind: 'range', min: Number.NEGATIVE_INFINITY })).toBe(false);
  });
  it('rejects null / non-object', () => {
    expect(isFilterSpec(null)).toBe(false);
    expect(isFilterSpec('x')).toBe(false);
  });
});

describe('serialize / deserialize round-trip', () => {
  it('round-trips an include filter', () => {
    const filters: FilterState = { country: { kind: 'include', values: ['FR', 'US'] } };
    const encoded = serializeFilters({ filters });
    expect(deserializeFilters(encoded, model)).toEqual(filters);
  });

  it('round-trips a range filter', () => {
    const filters: FilterState = { age: { kind: 'range', min: 18, max: 65 } };
    const encoded = serializeFilters({ filters });
    expect(deserializeFilters(encoded, model)).toEqual(filters);
  });

  it('round-trips an exclude filter', () => {
    const filters: FilterState = { country: { kind: 'exclude', values: ['XX'] } };
    expect(deserializeFilters(serializeFilters({ filters }), model)).toEqual(filters);
  });

  it('round-trips multiple filters', () => {
    const filters: FilterState = {
      country: { kind: 'include', values: ['FR'] },
      age: { kind: 'range', min: 21 },
    };
    expect(deserializeFilters(serializeFilters({ filters }), model)).toEqual(filters);
  });

  it('round-trips an empty filter state', () => {
    expect(deserializeFilters(serializeFilters({ filters: {} }), model)).toEqual({});
  });

  it('produces a URL-safe string (no raw braces/quotes)', () => {
    const encoded = serializeFilters({
      filters: { country: { kind: 'include', values: ['FR'] } },
    });
    expect(encoded).not.toMatch(/[{}"]/);
    // and survives a query-string round-trip
    const url = new URL(`https://x.test/?f=${encoded}`);
    expect(deserializeFilters(url.searchParams.get('f')!, model)).toEqual({
      country: { kind: 'include', values: ['FR'] },
    });
  });

  it('is deterministic regardless of key insertion order', () => {
    const a = serializeFilters({
      filters: { age: { kind: 'range', min: 1 }, country: { kind: 'include', values: ['FR'] } },
    });
    const b = serializeFilters({
      filters: { country: { kind: 'include', values: ['FR'] }, age: { kind: 'range', min: 1 } },
    });
    expect(a).toBe(b);
  });

  it('throws rather than serialising malformed specs lossily', () => {
    const filters = {
      age: { kind: 'range', min: Number.NaN } as unknown as FilterState[string],
    };
    expect(() => serializeFilters({ filters })).toThrow(/Cannot serialize malformed filter spec/);
  });
});

describe('deserialize robustness', () => {
  it('returns {} for empty string', () => {
    expect(deserializeFilters('', model)).toEqual({});
  });
  it('returns {} for garbage', () => {
    expect(deserializeFilters('%%%not-json%%%', model)).toEqual({});
    expect(deserializeFilters(encodeURIComponent('not json'), model)).toEqual({});
  });
  it('returns {} for a non-object JSON payload', () => {
    expect(deserializeFilters(encodeURIComponent('[1,2,3]'), model)).toEqual({});
    expect(deserializeFilters(encodeURIComponent('42'), model)).toEqual({});
  });
  it('drops filters on unknown dimensions', () => {
    const payload = encodeURIComponent(
      JSON.stringify({ ghost: { kind: 'include', values: ['x'] } }),
    );
    expect(deserializeFilters(payload, model)).toEqual({});
  });
  it('drops malformed specs but keeps valid ones', () => {
    const payload = encodeURIComponent(
      JSON.stringify({
        country: { kind: 'include', values: ['FR'] },
        age: { kind: 'bogus' },
      }),
    );
    expect(deserializeFilters(payload, model)).toEqual({
      country: { kind: 'include', values: ['FR'] },
    });
  });
  it('drops non-finite numeric bounds from malicious JSON', () => {
    const payload = encodeURIComponent('{"age":{"kind":"range","min":1e309}}');
    expect(deserializeFilters(payload, model)).toEqual({});
  });
});

describe('serialize / deserialize drill state', () => {
  it('round-trips drill paths', () => {
    const drill = { chart: ['country', 'age'] };
    expect(deserializeDrill(serializeDrill({ drill }), model)).toEqual(drill);
  });

  it('round-trips empty drill state', () => {
    expect(deserializeDrill(serializeDrill({ drill: {} }), model)).toEqual({});
  });

  it('is deterministic regardless of view insertion order', () => {
    const a = serializeDrill({ drill: { b: ['age'], a: ['country'] } });
    const b = serializeDrill({ drill: { a: ['country'], b: ['age'] } });
    expect(a).toBe(b);
  });

  it('throws rather than serialising malformed drill paths lossily', () => {
    expect(() =>
      serializeDrill({ drill: { chart: ['country', 1] as unknown as string[] } }),
    ).toThrow(/Cannot serialize malformed drill path/);
  });

  it('drops unknown dimensions and malformed paths on deserialize', () => {
    const payload = encodeURIComponent(
      JSON.stringify({
        ok: ['country'],
        ghost: ['missing'],
        bad: 'country',
        empty: [],
      }),
    );
    expect(deserializeDrill(payload, model)).toEqual({ ok: ['country'] });
  });

  it('returns {} for invalid drill payloads', () => {
    expect(deserializeDrill('', model)).toEqual({});
    expect(deserializeDrill('%%%not-json%%%', model)).toEqual({});
    expect(deserializeDrill(encodeURIComponent('[1,2,3]'), model)).toEqual({});
  });
});

describe('serialize / deserialize dashboard state', () => {
  it('round-trips filters, selections and drill together', () => {
    const state: DashboardState = {
      filters: {
        country: { kind: 'include', values: ['FR', 'US'] },
        age: { kind: 'range', min: 21, max: 65 },
      },
      selections: { countryChart: ['FR'], ageChart: ['21-65'] },
      drill: { countryChart: ['country', 'age'] },
    };

    expect(deserializeState(serializeState(state), model)).toEqual(state);
  });

  it('defaults missing state sections to empty maps', () => {
    const payload = encodeURIComponent(
      JSON.stringify({
        filters: { country: { kind: 'exclude', values: ['XX'] } },
      }),
    );

    expect(deserializeState(payload, model)).toEqual({
      filters: { country: { kind: 'exclude', values: ['XX'] } },
      selections: {},
      drill: {},
    });
  });

  it('throws for invalid dashboard state JSON', () => {
    expect(() => deserializeState('%%%not-json%%%')).toThrow(
      /Invalid serialized dashboard state/,
    );
    expect(() => deserializeState(encodeURIComponent('[1,2,3]'))).toThrow(
      /Invalid serialized dashboard state/,
    );
  });

  it('drops malformed sections while keeping valid bookmark data', () => {
    const payload = encodeURIComponent(
      JSON.stringify({
        filters: {
          country: { kind: 'include', values: ['FR'] },
          ghost: { kind: 'include', values: ['XX'] },
          age: { kind: 'range', min: 1e309 },
        },
        selections: {
          chart: ['FR'],
          broken: [1],
        },
        drill: {
          ok: ['country'],
          missing: ['ghost'],
          bad: [],
        },
      }),
    );

    expect(deserializeState(payload, model)).toEqual({
      filters: { country: { kind: 'include', values: ['FR'] } },
      selections: { chart: ['FR'] },
      drill: { ok: ['country'] },
    });
  });

  it('does not alias serialized state arrays', () => {
    const state: DashboardState = {
      filters: { country: { kind: 'include', values: ['FR'] } },
      selections: { chart: ['FR'] },
      drill: { chart: ['country'] },
    };

    const decoded = deserializeState(serializeState(state), model);
    expect(decoded.filters.country).not.toBe(state.filters.country);
    expect(decoded.filters.country!.values).not.toBe(state.filters.country!.values);
    expect(decoded.selections.chart).not.toBe(state.selections.chart);
    expect(decoded.drill.chart).not.toBe(state.drill.chart);
  });

  it('is deterministic regardless of key insertion order', () => {
    const a = serializeState({
      filters: {
        age: { kind: 'range', min: 1 },
        country: { kind: 'include', values: ['FR'] },
      },
      selections: { b: ['2'], a: ['1'] },
      drill: { z: ['age'], a: ['country'] },
    });
    const b = serializeState({
      filters: {
        country: { kind: 'include', values: ['FR'] },
        age: { kind: 'range', min: 1 },
      },
      selections: { a: ['1'], b: ['2'] },
      drill: { a: ['country'], z: ['age'] },
    });

    expect(a).toBe(b);
  });
});
