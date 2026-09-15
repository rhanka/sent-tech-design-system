import { describe, it, expect } from 'vitest';
import {
  type Measure,
  type Row,
  groupBy,
  aggregate,
  aggregateValues,
  extractNumbers,
  groupAggregate,
} from './index.js';

const rows: Row[] = [
  { country: 'FR', revenue: 100, qty: 2 },
  { country: 'FR', revenue: 50, qty: 1 },
  { country: 'US', revenue: 200, qty: 4 },
  { country: 'US', revenue: 0, qty: 0 },
];

const sum: Measure = { id: 'revenue', label: 'Revenue', aggregation: 'sum' };
const avg: Measure = { id: 'revenue', label: 'Revenue', aggregation: 'avg' };
const min: Measure = { id: 'revenue', label: 'Revenue', aggregation: 'min' };
const max: Measure = { id: 'revenue', label: 'Revenue', aggregation: 'max' };
const count: Measure = { id: 'revenue', label: 'Revenue', aggregation: 'count' };

describe('groupBy', () => {
  it('partitions rows by dimension value', () => {
    const g = groupBy(rows, 'country');
    expect([...g.keys()]).toEqual(['FR', 'US']);
    expect(g.get('FR')).toHaveLength(2);
    expect(g.get('US')).toHaveLength(2);
  });
  it('preserves first-seen key order', () => {
    const g = groupBy([{ x: 'b' }, { x: 'a' }, { x: 'b' }], 'x');
    expect([...g.keys()]).toEqual(['b', 'a']);
  });
  it('groups null/undefined under "null"', () => {
    const g = groupBy([{ x: null }, {}], 'x');
    expect(g.get('null')).toHaveLength(2);
  });
  it('stringifies numeric and boolean keys', () => {
    const g = groupBy([{ x: 1 }, { x: true }], 'x');
    expect([...g.keys()]).toEqual(['1', 'true']);
  });
  it('returns empty map for empty input', () => {
    expect(groupBy([], 'x').size).toBe(0);
  });
});

describe('aggregate', () => {
  it('sum', () => {
    expect(aggregate(rows, sum)).toBe(350);
  });
  it('avg', () => {
    expect(aggregate(rows, avg)).toBe(350 / 4);
  });
  it('min', () => {
    expect(aggregate(rows, min)).toBe(0);
  });
  it('max', () => {
    expect(aggregate(rows, max)).toBe(200);
  });
  it('count counts rows, not values', () => {
    expect(aggregate(rows, count)).toBe(4);
  });
});

describe('aggregate edge cases', () => {
  it('empty input -> 0 for sum/count and NaN for avg/min/max', () => {
    expect(aggregate([], sum)).toBe(0);
    expect(aggregate([], avg)).toBeNaN();
    expect(aggregate([], min)).toBeNaN();
    expect(aggregate([], max)).toBeNaN();
    expect(aggregate([], count)).toBe(0);
  });
  it('count counts all rows even when value is non-numeric', () => {
    const r: Row[] = [{ revenue: 'x' }, { revenue: null }];
    expect(aggregate(r, count)).toBe(2);
  });
  it('ignores NaN / Infinity cells', () => {
    const r: Row[] = [
      { revenue: 10 },
      { revenue: NaN },
      { revenue: Infinity },
      { revenue: -Infinity },
      { revenue: 20 },
    ];
    expect(aggregate(r, sum)).toBe(30);
    expect(aggregate(r, avg)).toBe(15);
    expect(aggregate(r, max)).toBe(20);
    expect(aggregate(r, min)).toBe(10);
  });
  it('ignores non-numeric strings but accepts numeric strings', () => {
    const r: Row[] = [{ revenue: '10' }, { revenue: 'abc' }, { revenue: '5' }];
    expect(aggregate(r, sum)).toBe(15);
  });
  it('treats booleans as 1/0', () => {
    const r: Row[] = [{ revenue: true }, { revenue: false }, { revenue: true }];
    expect(aggregate(r, sum)).toBe(2);
  });
  it('all-non-numeric -> avg/min/max NaN', () => {
    const r: Row[] = [{ revenue: 'x' }, { revenue: null }];
    expect(aggregate(r, avg)).toBeNaN();
    expect(aggregate(r, min)).toBeNaN();
    expect(aggregate(r, max)).toBeNaN();
  });
});

describe('aggregateValues', () => {
  it('sum/avg/min/max over a raw array', () => {
    expect(aggregateValues([1, 2, 3], 'sum')).toBe(6);
    expect(aggregateValues([1, 2, 3], 'avg')).toBe(2);
    expect(aggregateValues([3, 1, 2], 'min')).toBe(1);
    expect(aggregateValues([3, 1, 2], 'max')).toBe(3);
  });
  it('count uses explicit rowCount', () => {
    expect(aggregateValues([1, 2], 'count', 5)).toBe(5);
  });
  it('count defaults to values length', () => {
    expect(aggregateValues([1, 2, 3], 'count')).toBe(3);
  });
  it('handles negatives', () => {
    expect(aggregateValues([-5, -1, -10], 'min')).toBe(-10);
    expect(aggregateValues([-5, -1, -10], 'max')).toBe(-1);
  });
});

describe('extractNumbers', () => {
  it('returns only finite numbers', () => {
    const r: Row[] = [{ v: 1 }, { v: NaN }, { v: '2' }, { v: 'x' }, { v: null }];
    expect(extractNumbers(r, 'v')).toEqual([1, 2]);
  });
});

describe('groupAggregate', () => {
  it('groups then aggregates each bucket', () => {
    const result = groupAggregate(rows, 'country', sum);
    expect(result).toEqual([
      { key: 'FR', value: 150 },
      { key: 'US', value: 200 },
    ]);
  });
  it('handles count per group', () => {
    const result = groupAggregate(rows, 'country', count);
    expect(result).toEqual([
      { key: 'FR', value: 2 },
      { key: 'US', value: 2 },
    ]);
  });
  it('empty input -> empty result', () => {
    expect(groupAggregate([], 'country', sum)).toEqual([]);
  });
});
