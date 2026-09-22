import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildVennData } from './venn.js';

const model: DataModel = {
  dimensions: [],
  measures: [],
};

const rows: Row[] = [];

describe('buildVennData', () => {
  it('returns the pre-built areas array from config unchanged', () => {
    const areas = [
      { sets: ['A'], value: 12 },
      { sets: ['B'], value: 9 },
      { sets: ['C'], value: 6 },
      { sets: ['A', 'B'], value: 4 },
      { sets: ['A', 'C'], value: 2 },
      { sets: ['B', 'C'], value: 3 },
      { sets: ['A', 'B', 'C'], value: 1 },
    ];
    const result = buildVennData(model, rows, { areas });
    expect(result).toBe(areas);
    expect(result).toHaveLength(7);
    expect(result[0]).toEqual({ sets: ['A'], value: 12 });
    expect(result[6]).toEqual({ sets: ['A', 'B', 'C'], value: 1 });
  });

  it('returns an empty array when config.areas is empty', () => {
    const result = buildVennData(model, rows, { areas: [] });
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });
});
