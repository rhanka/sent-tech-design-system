import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildContourData } from './contour.js';

const model: DataModel = {
  dimensions: [],
  measures: [
    { id: 'x', label: 'X', aggregation: 'avg' },
    { id: 'y', label: 'Y', aggregation: 'avg' },
    { id: 'v', label: 'Valeur', aggregation: 'avg' },
  ],
};

const config = { x: 'x', y: 'y', value: 'v' };

describe('buildContourData', () => {
  it('maps x, y and value fields per row', () => {
    const rows: Row[] = [
      { x: 1, y: 2, v: 10 },
      { x: 3, y: 4, v: 20 },
    ];
    const result = buildContourData(model, rows, config);
    expect(result).toEqual([
      { x: 1, y: 2, value: 10 },
      { x: 3, y: 4, value: 20 },
    ]);
  });

  it('drops rows where x, y or value is non-finite', () => {
    const rows: Row[] = [
      { x: 1, y: 2, v: 10 },
      { x: null, y: 5, v: 11 },
      { x: 6, y: NaN, v: 12 },
      { x: 7, y: 8, v: null },
      { x: 9, y: 10, v: Infinity },
      { x: undefined, y: undefined, v: undefined },
      { x: 11, y: 12, v: 13 },
    ];
    const result = buildContourData(model, rows, config);
    expect(result).toEqual([
      { x: 1, y: 2, value: 10 },
      { x: 11, y: 12, value: 13 },
    ]);
  });

  it('coerces boolean and numeric-string coordinates and values', () => {
    const rows: Row[] = [
      { x: '1.5', y: '2.5', v: '3.5' },
      { x: true, y: false, v: true },
    ];
    const result = buildContourData(model, rows, config);
    expect(result).toEqual([
      { x: 1.5, y: 2.5, value: 3.5 },
      { x: 1, y: 0, value: 1 },
    ]);
  });

  it('keeps a finite zero value', () => {
    const rows: Row[] = [{ x: 1, y: 2, v: 0 }];
    const result = buildContourData(model, rows, config);
    expect(result).toEqual([{ x: 1, y: 2, value: 0 }]);
  });

  it('returns an empty array for empty rows', () => {
    const result = buildContourData(model, [], config);
    expect(result).toEqual([]);
  });
});
